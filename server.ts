import express from 'express';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Neon PostgreSQL Connection Pool
// Keep credentials secure on server side
const NEON_DATABASE_URL = process.env.DATABASE_URL;
if (!NEON_DATABASE_URL) {
  console.error('❌ Falta la variable de entorno DATABASE_URL (configúrala en Vercel → Settings → Environment Variables).');
}

const pool = new Pool({
  connectionString: NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test connection on startup
pool.query('SELECT 1', (err) => {
  if (err) {
    console.error('❌ Error connecting to Neon PostgreSQL:', err.message);
  } else {
    console.log('✅ Connected successfully to Neon PostgreSQL database.');
  }
});

const app = express();
const port = 3000;

app.use(express.json());

// CORS and Preflight handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging for API routes
app.use((req, _res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API ${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.url}`);
  }
  next();
});

// Los registros de actividad se guardan en Neon (tabla preaching_activities).
// Vercel no permite guardar archivos de forma persistente, por eso ya no se usa un JSON local.
interface ActivityRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  minutes: number;
  publications: number;
  videos: number;
  returnVisits: number;
  bibleStudies: number;
  territoryId?: string | null;
  territoryNumber?: string | null;
  territoryName?: string | null;
  notes?: string;
  createdAt: string;
}

let activitiesTableReady: Promise<void> | null = null;
function ensureActivitiesTable(): Promise<void> {
  if (!activitiesTableReady) {
    activitiesTableReady = pool
      .query(`
        CREATE TABLE IF NOT EXISTS preaching_activities (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          date DATE NOT NULL,
          hours INTEGER NOT NULL DEFAULT 0,
          minutes INTEGER NOT NULL DEFAULT 0,
          publications INTEGER NOT NULL DEFAULT 0,
          videos INTEGER NOT NULL DEFAULT 0,
          return_visits INTEGER NOT NULL DEFAULT 0,
          bible_studies INTEGER NOT NULL DEFAULT 0,
          territory_id TEXT,
          territory_number TEXT,
          territory_name TEXT,
          notes TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)
      .then(() => undefined)
      .catch((err) => {
        activitiesTableReady = null; // permitir reintentar
        throw err;
      });
  }
  return activitiesTableReady;
}

const ACTIVITY_COLUMNS = `
  id,
  user_id AS "userId",
  to_char(date, 'YYYY-MM-DD') AS date,
  hours, minutes, publications, videos,
  return_visits AS "returnVisits",
  bible_studies AS "bibleStudies",
  territory_id AS "territoryId",
  territory_number AS "territoryNumber",
  territory_name AS "territoryName",
  notes,
  to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
`;

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check & DB connection status
app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as server_time');
    res.json({
      status: 'ok',
      database: 'connected',
      serverTime: result.rows[0].server_time,
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: err.message,
    });
  }
});

// 2. GET /api/territories - Consultar territorios oficiales de Neon PostgreSQL
app.get('/api/territories', async (_req, res) => {
  try {
    const query = `
      SELECT 
        id,
        congregation_id,
        number,
        name,
        description,
        status,
        polygon,
        active,
        observations,
        last_assigned_date,
        last_assigned_to_id,
        last_assigned_to_name,
        last_completed_date,
        last_progress,
        last_progress_date,
        last_progress_publisher,
        created_at
      FROM territories
      WHERE active IS NULL OR active = true
      ORDER BY number ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching territories from Neon:', err);
    res.status(500).json({
      error: 'Error al consultar territorios en la base de datos externa.',
      details: err.message,
    });
  }
});

// 3. GET /api/territories/:id - Detalle de un territorio
app.get('/api/territories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        id,
        congregation_id,
        number,
        name,
        description,
        status,
        polygon,
        active,
        observations,
        last_assigned_date,
        last_assigned_to_id,
        last_assigned_to_name,
        last_completed_date,
        last_progress,
        last_progress_date,
        last_progress_publisher,
        created_at
      FROM territories
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Territorio no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error fetching territory detail:', err);
    res.status(500).json({ error: 'Error al obtener detalle del territorio.', details: err.message });
  }
});

// 4. GET /api/congregation - Info de la congregación de Neon
app.get('/api/congregation', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, circuit, city, address, latitude, longitude, timezone,
        meeting_day_midweek, meeting_time_midweek,
        meeting_day_weekend, meeting_time_weekend
      FROM congregations
      LIMIT 1
    `);
    res.json(result.rows[0] || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. POST /api/auth/login - Autenticación con usuarios existentes en Neon Console
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrName, password } = req.body;
    if (!emailOrName || !password) {
      return res.status(400).json({ error: 'Por favor ingresa tu correo/nombre y contraseña.' });
    }

    const query = `
      SELECT id, uid, congregation_id, first_name, last_name, full_name, email, role,
             is_elder, is_ministerial_servant, is_regular_pioneer, is_auxiliary_pioneer,
             service_group, active, password_hash
      FROM users
      WHERE (LOWER(email) = LOWER($1) OR LOWER(full_name) = LOWER($1))
      LIMIT 1
    `;
    const result = await pool.query(query, [emailOrName.trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Publicador no encontrado en la base de datos de la congregación.',
      });
    }

    const user = result.rows[0];
    if (user.active === false) {
      return res.status(403).json({
        error: 'Este usuario se encuentra registrado como inactivo.',
      });
    }

    // Comparar con el password_hash existente en Neon
    if (!user.password_hash || user.password_hash.trim() !== password.trim()) {
      return res.status(401).json({
        error: 'Contraseña incorrecta. Verifica tu contraseña registrada en Neon.',
      });
    }

    // No retornar el hash al cliente por seguridad
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err: any) {
    console.error('Error in /api/auth/login:', err);
    res.status(500).json({
      error: `Error del servidor al autenticar el usuario en Neon${err?.code ? ` (${err.code})` : ''}.`,
    });
  }
});

// 6. GET /api/users - Lista completa de publicadores de Neon
app.get('/api/users', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, email, role, is_regular_pioneer, is_auxiliary_pioneer, is_elder, is_ministerial_servant, service_group
      FROM users
      WHERE active IS NULL OR active = true
      ORDER BY full_name ASC
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GET /api/activities - Historial de actividades
app.get('/api/activities', async (req, res) => {
  try {
    await ensureActivitiesTable();
    const { month, year, territoryId, userId } = req.query;
    const where: string[] = [];
    const params: any[] = [];
    if (year) { params.push(Number(year)); where.push(`EXTRACT(YEAR FROM date) = $${params.length}`); }
    if (month) { params.push(Number(month)); where.push(`EXTRACT(MONTH FROM date) = $${params.length}`); }
    if (territoryId) { params.push(String(territoryId)); where.push(`territory_id = $${params.length}`); }
    if (userId) { params.push(String(userId)); where.push(`user_id = $${params.length}`); }
    const result = await pool.query(
      `SELECT ${ACTIVITY_COLUMNS} FROM preaching_activities
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY date DESC, created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error listing activities:', err);
    res.status(500).json({ error: 'Error al leer las actividades', details: err.message });
  }
});

// 7. POST /api/activities - Registrar nueva actividad ministerial
app.post('/api/activities', async (req, res) => {
  try {
    await ensureActivitiesTable();
    const {
      userId = 'usr-default',
      date,
      hours = 0,
      minutes = 0,
      publications = 0,
      videos = 0,
      returnVisits = 0,
      bibleStudies = 0,
      territoryId = null,
      notes = '',
    } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'La fecha es requerida' });
    }

    let territoryNumber = null;
    let territoryName = null;

    if (territoryId) {
      const terrRes = await pool.query('SELECT id, number, name FROM territories WHERE id = $1', [territoryId]);
      if (terrRes.rows.length > 0) {
        territoryNumber = terrRes.rows[0].number;
        territoryName = terrRes.rows[0].name;
      }
    }

    const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const result = await pool.query(
      `INSERT INTO preaching_activities
         (id, user_id, date, hours, minutes, publications, videos, return_visits,
          bible_studies, territory_id, territory_number, territory_name, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING ${ACTIVITY_COLUMNS}`,
      [
        id,
        String(userId),
        date,
        Number(hours) || 0,
        Number(minutes) || 0,
        Number(publications) || 0,
        Number(videos) || 0,
        Number(returnVisits) || 0,
        Number(bibleStudies) || 0,
        territoryId ? String(territoryId) : null,
        territoryNumber != null ? String(territoryNumber) : null,
        territoryName,
        notes || '',
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating activity:', err);
    res.status(500).json({ error: 'Error al registrar actividad', details: err.message });
  }
});

// 8. DELETE /api/activities/:id - Eliminar registro de actividad
app.delete('/api/activities/:id', async (req, res) => {
  try {
    await ensureActivitiesTable();
    const result = await pool.query('DELETE FROM preaching_activities WHERE id = $1', [req.params.id]);
    if (result.rowCount) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Registro no encontrado' });
    }
  } catch (err: any) {
    console.error('Error deleting activity:', err);
    res.status(500).json({ error: 'Error al eliminar la actividad', details: err.message });
  }
});

// Fallback for any unhandled /api/* routes (Always return JSON, never HTML)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `Ruta de API no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// VITE DEV SERVER / STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

export default app;
export { app };

if (process.env.VERCEL !== '1') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

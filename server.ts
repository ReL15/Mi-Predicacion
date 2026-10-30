import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Neon PostgreSQL Connection Pool
// Keep credentials secure on server side
const NEON_DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_E4uZPoXML5Id@ep-muddy-hall-b7fi2xbd-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

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

// Persistent store for user preaching sessions & activity records
const DATA_FILE = path.resolve(process.cwd(), '.preaching_records.json');

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

function loadLocalActivities(): ActivityRecord[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading activities file:', err);
  }
  return [];
}

function saveLocalActivities(records: ActivityRecord[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving activities file:', err);
  }
}

let activitiesStore: ActivityRecord[] = loadLocalActivities();

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
    if (user.password_hash && user.password_hash.trim() !== password.trim()) {
      return res.status(401).json({
        error: 'Contraseña incorrecta. Verifica tu contraseña registrada en Neon.',
      });
    }

    // No retornar el hash al cliente por seguridad
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err: any) {
    console.error('Error in /api/auth/login:', err);
    res.status(500).json({ error: 'Error del servidor al autenticar el usuario en Neon.' });
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
app.get('/api/activities', (req, res) => {
  const { month, year, territoryId } = req.query;
  let filtered = [...activitiesStore];

  if (year) {
    filtered = filtered.filter((r) => r.date.startsWith(`${year}`));
  }
  if (month) {
    const padMonth = String(month).padStart(2, '0');
    filtered = filtered.filter((r) => {
      const parts = r.date.split('-');
      return parts[1] === padMonth;
    });
  }
  if (territoryId) {
    filtered = filtered.filter((r) => r.territoryId === territoryId);
  }

  // Ordenar por fecha descendente
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(filtered);
});

// 7. POST /api/activities - Registrar nueva actividad ministerial
app.post('/api/activities', async (req, res) => {
  try {
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
      // Validar contra Neon PostgreSQL
      const terrRes = await pool.query('SELECT id, number, name FROM territories WHERE id = $1', [territoryId]);
      if (terrRes.rows.length > 0) {
        territoryNumber = terrRes.rows[0].number;
        territoryName = terrRes.rows[0].name;
      }
    }

    const newRecord: ActivityRecord = {
      id: `act-${Date.now()}`,
      userId,
      date,
      hours: Number(hours) || 0,
      minutes: Number(minutes) || 0,
      publications: Number(publications) || 0,
      videos: Number(videos) || 0,
      returnVisits: Number(returnVisits) || 0,
      bibleStudies: Number(bibleStudies) || 0,
      territoryId: territoryId || null,
      territoryNumber,
      territoryName,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    activitiesStore.unshift(newRecord);
    saveLocalActivities(activitiesStore);

    res.status(201).json(newRecord);
  } catch (err: any) {
    console.error('Error creating activity:', err);
    res.status(500).json({ error: 'Error al registrar actividad', details: err.message });
  }
});

// 8. DELETE /api/activities/:id - Eliminar registro de actividad
app.delete('/api/activities/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = activitiesStore.length;
  activitiesStore = activitiesStore.filter((a) => a.id !== id);
  if (activitiesStore.length !== initialLen) {
    saveLocalActivities(activitiesStore);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Registro no encontrado' });
  }
});

// ==========================================
// VITE DEV SERVER / STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

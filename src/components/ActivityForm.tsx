import React, { useState, useEffect } from 'react';
import { Territory, ActivityRecord } from '../types';
import {
  Calendar,
  Clock,
  BookOpen,
  Video,
  Users,
  GraduationCap,
  MapPin,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
  Save,
} from 'lucide-react';

interface ActivityFormProps {
  territories: Territory[];
  initialTerritoryId?: string | null;
  initialHours?: number;
  initialMinutes?: number;
  fromSession?: boolean;
  onSave: (record: Partial<ActivityRecord>) => Promise<void>;
  onCancel?: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  territories,
  initialTerritoryId = null,
  initialHours = 0,
  initialMinutes = 0,
  fromSession = false,
  onSave,
  onCancel,
}) => {
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>(
    initialTerritoryId || ''
  );
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [hours, setHours] = useState<number>(initialHours);
  const [minutes, setMinutes] = useState<number>(initialMinutes);
  const [publications, setPublications] = useState<number>(0);
  const [videos, setVideos] = useState<number>(0);
  const [returnVisits, setReturnVisits] = useState<number>(0);
  const [bibleStudies, setBibleStudies] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTerritoryId) {
      setSelectedTerritoryId(initialTerritoryId);
    }
  }, [initialTerritoryId]);

  useEffect(() => {
    if (initialHours !== undefined) setHours(initialHours);
    if (initialMinutes !== undefined) setMinutes(initialMinutes);
  }, [initialHours, initialMinutes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hours === 0 && minutes === 0) {
      alert('Por favor ingresa al menos las horas o minutos dedicados.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        date,
        hours,
        minutes,
        publications,
        videos,
        returnVisits,
        bibleStudies,
        territoryId: selectedTerritoryId || null,
        notes,
      });
      setSuccessMsg('¡Registro guardado correctamente!');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable tactile stepper component
  const Stepper = ({
    label,
    value,
    onChange,
    min = 0,
    max = 999,
    step = 1,
    icon: Icon,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    icon: any;
  }) => (
    <div className="bg-white rounded-xl border border-[#E5EAF0] p-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#EDF4FF] text-[#245B85] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold text-[#202B36]">{label}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="w-11 h-11 rounded-lg border border-[#E5EAF0] bg-[#F5F7FA] text-[#202B36] disabled:opacity-30 disabled:pointer-events-none hover:bg-white active:bg-[#EDF4FF] flex items-center justify-center transition-colors"
          aria-label={`Disminuir ${label}`}
        >
          <Minus className="w-4 h-4 text-[#202B36]" />
        </button>

        <span className="w-10 text-center font-bold text-base text-[#202B36] tabular-nums">
          {value}
        </span>

        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="w-11 h-11 rounded-lg border border-[#E5EAF0] bg-[#F5F7FA] text-[#202B36] disabled:opacity-30 disabled:pointer-events-none hover:bg-white active:bg-[#EDF4FF] flex items-center justify-center transition-colors"
          aria-label={`Aumentar ${label}`}
        >
          <Plus className="w-4 h-4 text-[#202B36]" />
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#202B36] tracking-tight">Registrar actividad</h2>
        <p className="text-xs text-[#7A8794]">
          Anota tu servicio ministerial y vincúlalo a un territorio oficial
        </p>
      </div>

      {fromSession && (
        <div className="p-3 rounded-xl bg-[#EDF4FF] border border-[#245B85]/30 flex items-center gap-2.5 text-xs text-[#245B85] font-medium animate-in fade-in">
          <Sparkles className="w-4 h-4 shrink-0 text-[#245B85]" />
          <span>
            Territorio y tiempo completados automáticamente desde tu salida a predicar finalizada.
          </span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 flex items-center gap-2.5 text-xs text-[#2E7D32] font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* CAMPO REQUERIDO: Territorio trabajado                     */}
      {/* ======================================================== */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#7A8794] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#245B85]" />
          <span>Territorio trabajado</span>
        </label>
        <div className="relative">
          <select
            value={selectedTerritoryId}
            onChange={(e) => setSelectedTerritoryId(e.target.value)}
            className="w-full h-[52px] px-3.5 bg-white border border-[#E5EAF0] rounded-xl text-xs font-semibold text-[#202B36] focus:outline-none focus:border-[#245B85] focus:ring-1 focus:ring-[#245B85] transition-all"
          >
            <option value="">Seleccionar territorio oficial de Neon...</option>
            {territories.map((t) => (
              <option key={t.id} value={t.id}>
                N° {t.number} - {t.name || `Territorio ${t.number}`}{' '}
                {t.observations ? `(${t.observations})` : ''}
              </option>
            ))}
            <option value="none">Sin territorio específico / Predicación informal</option>
          </select>
        </div>
        <p className="text-[11px] text-[#7A8794] px-1">
          Guarda la referencia directa al territorio existente en Neon PostgreSQL.
        </p>
      </div>

      {/* Fecha */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#7A8794] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#245B85]" />
          <span>Fecha de la actividad</span>
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full h-[52px] px-3.5 bg-white border border-[#E5EAF0] rounded-xl text-xs font-semibold text-[#202B36] focus:outline-none focus:border-[#245B85] focus:ring-1 focus:ring-[#245B85] transition-all"
          required
        />
      </div>

      {/* Horas y Minutos dedicados */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#7A8794] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#245B85]" />
          <span>Tiempo dedicado</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-xl border border-[#E5EAF0] p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-[#7A8794] mb-1">Horas</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHours(Math.max(0, hours - 1))}
                className="w-9 h-9 rounded-lg border border-[#E5EAF0] bg-[#F5F7FA] text-[#202B36] flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="text-xl font-bold text-[#202B36] w-8 text-center tabular-nums">
                {hours}
              </span>
              <button
                type="button"
                onClick={() => setHours(hours + 1)}
                className="w-9 h-9 rounded-lg border border-[#E5EAF0] bg-[#F5F7FA] text-[#202B36] flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5EAF0] p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-[#7A8794] mb-1">Minutos</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMinutes(Math.max(0, minutes - 15))}
                className="w-9 h-9 rounded-lg border border-[#E5EAF0] bg-[#F5F7FA] text-[#202B36] flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="text-xl font-bold text-[#202B36] w-8 text-center tabular-nums">
                {minutes}
              </span>
              <button
                type="button"
                onClick={() => setMinutes(minutes + 15 < 60 ? minutes + 15 : 0)}
                className="w-9 h-9 rounded-lg border border-[#E5EAF0] bg-[#F5F7FA] text-[#202B36] flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Steppers for publications, videos, revisitas, bible studies */}
      <div className="space-y-2.5 pt-1">
        <label className="text-xs font-bold uppercase tracking-wider text-[#7A8794] block">
          Colocaciones y seguimiento
        </label>
        <Stepper
          label="Publicaciones entregadas"
          value={publications}
          onChange={setPublications}
          icon={BookOpen}
        />
        <Stepper
          label="Videos mostrados"
          value={videos}
          onChange={setVideos}
          icon={Video}
        />
        <Stepper
          label="Revisitas realizadas"
          value={returnVisits}
          onChange={setReturnVisits}
          icon={Users}
        />
        <Stepper
          label="Cursos bíblicos impartidos"
          value={bibleStudies}
          onChange={setBibleStudies}
          icon={GraduationCap}
        />
      </div>

      {/* Notas / Observaciones */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-bold uppercase tracking-wider text-[#7A8794] block">
          Notas u observaciones
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anota detalles sobre personas interesadas, direcciones o temas tratados..."
          className="w-full p-3 bg-white border border-[#E5EAF0] rounded-xl text-xs text-[#202B36] placeholder-[#7A8794] focus:outline-none focus:border-[#245B85] focus:ring-1 focus:ring-[#245B85] transition-all resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[48px] rounded-xl bg-[#245B85] text-white hover:bg-[#1B4463] font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#245B85]/20 active:scale-[0.99] transition-all disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Guardando registro...' : 'Guardar registro'}</span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full mt-2 min-h-[40px] text-xs font-medium text-[#7A8794] hover:text-[#202B36]"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

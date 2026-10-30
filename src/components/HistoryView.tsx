import React, { useState, useMemo } from 'react';
import { ActivityRecord, Territory } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Video,
  Users,
  GraduationCap,
  Filter,
  X,
  Trash2,
  Eye,
  FileText,
  Layers,
} from 'lucide-react';

interface HistoryViewProps {
  activities: ActivityRecord[];
  territories: Territory[];
  onDeleteRecord: (id: string) => Promise<void>;
  onInspectTerritory: (territory: Territory) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  activities,
  territories,
  onDeleteRecord,
  onInspectTerritory,
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('ALL');
  const [specificDate, setSpecificDate] = useState<string>('');

  const [activeDetailRecord, setActiveDetailRecord] = useState<ActivityRecord | null>(null);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const parts = act.date.split('-'); // [YYYY, MM, DD]
      const matchesYear = selectedYear === 'ALL' || parts[0] === selectedYear;
      const matchesMonth =
        selectedMonth === 'ALL' || parts[1] === String(selectedMonth).padStart(2, '0');
      const matchesTerritory =
        selectedTerritoryId === 'ALL' ||
        (selectedTerritoryId === 'NONE' ? !act.territoryId : act.territoryId === selectedTerritoryId);
      const matchesSpecificDate = !specificDate || act.date === specificDate;

      return matchesYear && matchesMonth && matchesTerritory && matchesSpecificDate;
    });
  }, [activities, selectedYear, selectedMonth, selectedTerritoryId, specificDate]);

  // Aggregate totals of filtered records
  const totalFilteredMinutes = useMemo(() => {
    return filteredActivities.reduce(
      (sum, a) => sum + (a.hours || 0) * 60 + (a.minutes || 0),
      0
    );
  }, [filteredActivities]);

  const totalFilteredHours = Math.floor(totalFilteredMinutes / 60);
  const remainingFilteredMinutes = totalFilteredMinutes % 60;

  // Month list in Spanish
  const months = [
    { value: 'ALL', label: 'Todos los meses' },
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  // Helper to format Spanish date
  const formatDateString = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return new Intl.DateTimeFormat('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Find linked territory object
  const getLinkedTerritory = (territoryId?: string | null) => {
    if (!territoryId) return null;
    return territories.find((t) => t.id === territoryId) || null;
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#202B36] tracking-tight">Historial de servicio</h2>
        <p className="text-xs text-[#7A8794]">
          Consulta y filtra todos tus informes y territorios trabajados
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold text-[#7A8794] uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#245B85]" />
            Filtros
          </span>
          {(selectedMonth !== 'ALL' ||
            selectedYear !== 'ALL' ||
            selectedTerritoryId !== 'ALL' ||
            specificDate) && (
            <button
              onClick={() => {
                setSelectedYear(String(currentYear));
                setSelectedMonth('ALL');
                setSelectedTerritoryId('ALL');
                setSpecificDate('');
              }}
              className="text-[#245B85] hover:underline normal-case font-semibold text-[11px]"
            >
              Restablecer
            </button>
          )}
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Año */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-10 px-2.5 bg-[#F5F7FA] border border-[#E5EAF0] rounded-lg text-xs font-medium text-[#202B36] focus:outline-none focus:border-[#245B85]"
          >
            <option value="ALL">Todos los años</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          {/* Mes */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-10 px-2.5 bg-[#F5F7FA] border border-[#E5EAF0] rounded-lg text-xs font-medium text-[#202B36] focus:outline-none focus:border-[#245B85]"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Territorio Filter */}
        <div>
          <select
            value={selectedTerritoryId}
            onChange={(e) => setSelectedTerritoryId(e.target.value)}
            className="w-full h-10 px-2.5 bg-[#F5F7FA] border border-[#E5EAF0] rounded-lg text-xs font-medium text-[#202B36] focus:outline-none focus:border-[#245B85]"
          >
            <option value="ALL">Todos los territorios</option>
            {territories.map((t) => (
              <option key={t.id} value={t.id}>
                N° {t.number} - {t.name || `Territorio ${t.number}`}
              </option>
            ))}
            <option value="NONE">Sin territorio específico</option>
          </select>
        </div>

        {/* Specific Date input (Optional) */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#E5EAF0]/60">
          <Calendar className="w-3.5 h-3.5 text-[#7A8794]" />
          <input
            type="date"
            value={specificDate}
            onChange={(e) => setSpecificDate(e.target.value)}
            className="w-full bg-transparent text-xs text-[#202B36] focus:outline-none"
            placeholder="Filtrar por día exacto..."
          />
          {specificDate && (
            <button
              onClick={() => setSpecificDate('')}
              className="text-xs text-[#7A8794] hover:text-[#202B36] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip for this filtered view */}
      <div className="p-3 bg-[#EDF4FF] rounded-xl border border-[#397DAA]/25 flex items-center justify-between text-xs">
        <span className="font-semibold text-[#245B85]">
          Total en este filtro ({filteredActivities.length} salidas):
        </span>
        <span className="font-bold text-[#202B36] text-sm tabular-nums">
          {totalFilteredHours}h {remainingFilteredMinutes > 0 ? `${remainingFilteredMinutes}m` : ''}
        </span>
      </div>

      {/* Activity List */}
      <div className="space-y-2.5">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5EAF0] space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#EDF4FF] flex items-center justify-center text-[#7A8794] mx-auto">
              <Calendar className="w-6 h-6 text-[#7A8794]" />
            </div>
            <h4 className="text-sm font-semibold text-[#202B36]">
              No hay actividades registradas
            </h4>
            <p className="text-xs text-[#7A8794]">
              No se encontraron registros para los filtros seleccionados.
            </p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const linkedTerr = getLinkedTerritory(act.territoryId);
            return (
              <div
                key={act.id}
                onClick={() => setActiveDetailRecord(act)}
                className="bg-white rounded-2xl border border-[#E5EAF0] p-4 shadow-[0_2px_6px_rgba(32,43,54,0.02)] hover:border-[#397DAA]/40 transition-all cursor-pointer space-y-2.5"
              >
                {/* Top Row: Date & Hours */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#202B36]">
                      {formatDateString(act.date)}
                    </span>
                    {/* Territorio trabajado */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#245B85]" />
                      <span className="text-xs font-semibold text-[#245B85]">
                        {act.territoryNumber
                          ? `Territorio ${act.territoryNumber}`
                          : linkedTerr
                          ? `Territorio ${linkedTerr.number}`
                          : 'Sin territorio específico'}
                      </span>
                      {act.territoryName && (
                        <span className="text-xs text-[#7A8794]">· {act.territoryName}</span>
                      )}
                    </div>
                  </div>

                  {/* Hours badge */}
                  <div className="px-2.5 py-1 rounded-lg bg-[#EDF4FF] text-[#245B85] font-bold text-xs tabular-nums shrink-0">
                    {act.hours}h {act.minutes > 0 ? `${act.minutes}m` : ''}
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="flex items-center gap-3 text-xs text-[#41474E] pt-1 border-t border-[#E5EAF0]/80">
                  {act.publications > 0 && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#7A8794]" />
                      <strong className="tabular-nums">{act.publications}</strong> pub
                    </span>
                  )}
                  {act.videos > 0 && (
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3 text-[#7A8794]" />
                      <strong className="tabular-nums">{act.videos}</strong> vid
                    </span>
                  )}
                  {act.returnVisits > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#7A8794]" />
                      <strong className="tabular-nums">{act.returnVisits}</strong> rev
                    </span>
                  )}
                  {act.bibleStudies > 0 && (
                    <span className="flex items-center gap-1 text-[#2E7D32]">
                      <GraduationCap className="w-3 h-3 text-[#2E7D32]" />
                      <strong className="tabular-nums">{act.bibleStudies}</strong> curso
                    </span>
                  )}
                  {act.publications === 0 &&
                    act.videos === 0 &&
                    act.returnVisits === 0 &&
                    act.bibleStudies === 0 && (
                      <span className="text-[#7A8794] text-[11px]">Solo horas de servicio</span>
                    )}
                </div>

                {/* Brief notes preview if exists */}
                {act.notes && (
                  <p className="text-xs text-[#7A8794] line-clamp-1 italic">
                    "{act.notes}"
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* DETALLE DEL REGISTRO (MODAL / SHEET)                     */}
      {/* ======================================================== */}
      {activeDetailRecord && (
        <div className="fixed inset-0 z-50 bg-[#202B36]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-[#E5EAF0]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF0]">
              <h3 className="text-base font-bold text-[#202B36]">Detalle de actividad</h3>
              <button
                onClick={() => setActiveDetailRecord(null)}
                className="p-1.5 rounded-full text-[#7A8794] hover:bg-[#F5F7FA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Date & Service Time */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#EDF4FF]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7A8794] block">Fecha</span>
                <span className="text-xs font-bold text-[#202B36]">
                  {formatDateString(activeDetailRecord.date)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#7A8794] block">Tiempo</span>
                <span className="text-base font-extrabold text-[#245B85] tabular-nums">
                  {activeDetailRecord.hours}h{' '}
                  {activeDetailRecord.minutes > 0 ? `${activeDetailRecord.minutes}m` : ''}
                </span>
              </div>
            </div>

            {/* Territorio relacionado */}
            <div className="p-3.5 rounded-xl border border-[#E5EAF0] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#7A8794] block">
                Territorio trabajado
              </span>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#202B36]">
                    {activeDetailRecord.territoryNumber
                      ? `Territorio N° ${activeDetailRecord.territoryNumber}`
                      : 'Sin territorio asignado'}
                  </h4>
                  {activeDetailRecord.territoryName && (
                    <p className="text-xs text-[#7A8794]">{activeDetailRecord.territoryName}</p>
                  )}
                </div>

                {/* Direct link to inspect territory if known */}
                {activeDetailRecord.territoryId && (
                  <button
                    onClick={() => {
                      const t = getLinkedTerritory(activeDetailRecord.territoryId);
                      if (t) {
                        setActiveDetailRecord(null);
                        onInspectTerritory(t);
                      }
                    }}
                    className="text-xs font-semibold text-[#245B85] hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver mapa</span>
                  </button>
                )}
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#E5EAF0]">
                <span className="text-[10px] text-[#7A8794] font-medium block">Publicaciones</span>
                <span className="text-base font-bold text-[#202B36] tabular-nums">
                  {activeDetailRecord.publications}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#E5EAF0]">
                <span className="text-[10px] text-[#7A8794] font-medium block">Videos</span>
                <span className="text-base font-bold text-[#202B36] tabular-nums">
                  {activeDetailRecord.videos}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#E5EAF0]">
                <span className="text-[10px] text-[#7A8794] font-medium block">Revisitas</span>
                <span className="text-base font-bold text-[#202B36] tabular-nums">
                  {activeDetailRecord.returnVisits}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#E8F5E9] border border-[#2E7D32]/20">
                <span className="text-[10px] text-[#2E7D32] font-semibold block">Cursos bíblicos</span>
                <span className="text-base font-bold text-[#2E7D32] tabular-nums">
                  {activeDetailRecord.bibleStudies}
                </span>
              </div>
            </div>

            {/* Notes if present */}
            {activeDetailRecord.notes && (
              <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E5EAF0]">
                <span className="text-[10px] uppercase font-bold text-[#7A8794] block mb-1">
                  Notas
                </span>
                <p className="text-xs text-[#202B36]">{activeDetailRecord.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-[#E5EAF0]">
              <button
                onClick={async () => {
                  if (confirm('¿Deseas eliminar este registro de actividad?')) {
                    await onDeleteRecord(activeDetailRecord.id);
                    setActiveDetailRecord(null);
                  }
                }}
                className="text-xs font-semibold text-[#D9534F] hover:bg-[#FFDAD6]/30 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>

              <button
                onClick={() => setActiveDetailRecord(null)}
                className="px-4 py-2 rounded-xl bg-[#245B85] text-white text-xs font-semibold hover:bg-[#1B4463] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

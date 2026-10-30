import React, { useState, useEffect } from 'react';
import { PreachingSession, Territory } from '../types';
import {
  MapPin,
  Compass,
  Play,
  Square,
  ChevronRight,
  Clock,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PreachingSessionCardProps {
  session: PreachingSession;
  territory: Territory | null;
  onSelectTerritoryClick: () => void;
  onStartSession: (startTime: string) => void;
  onEndSession: () => void;
  onChangeTerritory: () => void;
}

export const PreachingSessionCard: React.FC<PreachingSessionCardProps> = ({
  session,
  territory,
  onSelectTerritoryClick,
  onStartSession,
  onEndSession,
  onChangeTerritory,
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const [elapsedDisplay, setElapsedDisplay] = useState<string>('00:00:00');

  // Live timer for State C (Predicación iniciada)
  useEffect(() => {
    if (session.status !== 'in_progress' || !session.startTimestamp) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - session.startTimestamp!) / 1000));
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      setElapsedDisplay(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [session.status, session.startTimestamp]);

  // Format Spanish date
  const todayFormatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-[0_2px_8px_rgba(32,43,54,0.04)] relative overflow-hidden">
      {/* Decorative calm background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#245B85]/5 to-transparent rounded-bl-full pointer-events-none" />

      {/* Header of the Card */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EDF4FF] text-[#245B85] flex items-center justify-center">
            <Compass className="w-4 h-4 text-[#245B85]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#202B36]">Salida a predicar</h2>
            <div className="flex items-center gap-1.5 text-xs text-[#7A8794]">
              <Calendar className="w-3 h-3" />
              <span>{capitalizedDate}</span>
            </div>
          </div>
        </div>

        {/* Status chip */}
        {session.status === 'in_progress' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/20">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-ping" />
            En curso
          </span>
        )}
      </div>

      {/* ======================================================== */}
      {/* ESTADO A: Sin territorio seleccionado                    */}
      {/* ======================================================== */}
      {session.status === 'idle' && (
        <div className="pt-2 pb-1 space-y-4">
          <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E5EAF0] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#397DAA] shrink-0 mt-0.5" />
            <p className="text-xs text-[#41474E] leading-relaxed">
              Todavía no has seleccionado un territorio para tu salida de hoy. Consulta los
              territorios oficiales de la congregación para comenzar.
            </p>
          </div>

          <button
            onClick={onSelectTerritoryClick}
            className="w-full min-h-[48px] rounded-xl bg-[#245B85] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#245B85]/20 hover:bg-[#1B4463] active:scale-[0.99] transition-all"
          >
            <MapPin className="w-4 h-4" />
            <span>Seleccionar territorio</span>
            <ChevronRight className="w-4 h-4 ml-0.5 text-white/70" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* ESTADO B: Territorio seleccionado                        */}
      {/* ======================================================== */}
      {session.status === 'territory_selected' && territory && (
        <div className="space-y-4 pt-1">
          {/* Selected Territory Summary */}
          <div className="p-3.5 rounded-xl bg-[#EDF4FF] border border-[#397DAA]/25 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#245B85] text-white text-xs font-bold tracking-tight">
                    N° {territory.number}
                  </span>
                  <span className="text-xs font-semibold text-[#397DAA] uppercase tracking-wider">
                    {territory.status || 'Oficial'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#202B36] pt-0.5">
                  {territory.name || `Territorio ${territory.number}`}
                </h3>
                {territory.observations && (
                  <p className="text-xs text-[#41474E] line-clamp-1">
                    {territory.observations}
                  </p>
                )}
              </div>

              <button
                onClick={onChangeTerritory}
                className="text-xs font-semibold text-[#245B85] hover:underline px-2 py-1"
              >
                Cambiar
              </button>
            </div>

            {/* Polygon info */}
            {territory.polygon && Array.isArray(territory.polygon) && (
              <div className="mt-2.5 pt-2 border-t border-[#397DAA]/15 flex items-center gap-2 text-[11px] text-[#7A8794]">
                <MapPin className="w-3 h-3 text-[#245B85]" />
                <span>Delimitación geográfica cargada desde Neon</span>
              </div>
            )}
          </div>

          {/* Start Time Config (Optional) */}
          <div className="flex items-center justify-between px-1 py-1 text-xs">
            <div className="flex items-center gap-1.5 text-[#7A8794]">
              <Clock className="w-3.5 h-3.5" />
              <span>Hora de inicio programada:</span>
            </div>
            <input
              type="time"
              value={currentTimeStr}
              onChange={(e) => setCurrentTimeStr(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold text-[#202B36] bg-[#F5F7FA] border border-[#E5EAF0] rounded-lg focus:outline-none focus:border-[#245B85]"
            />
          </div>

          {/* Action button: Iniciar predicación */}
          <button
            onClick={() => onStartSession(currentTimeStr)}
            className="w-full min-h-[48px] rounded-xl bg-[#245B85] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#245B85]/25 hover:bg-[#1B4463] active:scale-[0.99] transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Iniciar predicación</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* ESTADO C: Predicación iniciada                           */}
      {/* ======================================================== */}
      {session.status === 'in_progress' && (
        <div className="space-y-4 pt-1">
          {/* Active Territory Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#EDF4FF] to-[#E3EFFE] border border-[#245B85]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#245B85] uppercase tracking-wider">
                Predicación en curso
              </span>
              <span className="text-xs text-[#7A8794] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#397DAA]" />
                Inicio: {session.startTime || 'Ahora'}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#7A8794] font-medium">Territorio</span>
                <h3 className="text-base font-bold text-[#202B36]">
                  N° {session.territoryNumber} - {session.territoryName || 'Territorio'}
                </h3>
              </div>

              {/* Big Stopwatch Timer */}
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-[#7A8794] font-medium block">
                  Tiempo transcurrido
                </span>
                <span className="text-2xl font-bold font-mono tracking-tight text-[#202B36] tabular-nums">
                  {elapsedDisplay}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#7A8794] px-1">
            <Sparkles className="w-3.5 h-3.5 text-[#397DAA]" />
            <span>Al finalizar, se pasará automáticamente al registro de actividad.</span>
          </div>

          {/* Action button: Finalizar predicación */}
          <button
            onClick={onEndSession}
            className="w-full min-h-[48px] rounded-xl bg-[#D9534F] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#D9534F]/20 hover:bg-[#b83b38] active:scale-[0.99] transition-all"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>Finalizar predicación</span>
          </button>
        </div>
      )}
    </div>
  );
};

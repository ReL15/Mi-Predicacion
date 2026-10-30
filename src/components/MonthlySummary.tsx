import React from 'react';
import { ActivityRecord } from '../types';
import { BookOpen, Video, Users, GraduationCap, Clock } from 'lucide-react';

interface MonthlySummaryProps {
  activities: ActivityRecord[];
  monthlyGoalHours?: number;
  onViewHistory: () => void;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  activities,
  monthlyGoalHours = 50,
  onViewHistory,
}) => {
  // Current month and year
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const padMonth = String(currentMonth).padStart(2, '0');

  // Filter activities for this month
  const currentMonthActivities = activities.filter((act) => {
    const parts = act.date.split('-');
    return Number(parts[0]) === currentYear && parts[1] === padMonth;
  });

  // Calculate totals
  let totalMinutes = 0;
  let totalPubs = 0;
  let totalVideos = 0;
  let totalRevisits = 0;
  let totalCourses = 0;

  currentMonthActivities.forEach((act) => {
    totalMinutes += (act.hours || 0) * 60 + (act.minutes || 0);
    totalPubs += act.publications || 0;
    totalVideos += act.videos || 0;
    totalRevisits += act.returnVisits || 0;
    totalCourses += act.bibleStudies || 0;
  });

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const decimalHours = (totalMinutes / 60).toFixed(1);

  // Percentage towards goal
  const progressPercent = Math.min(100, Math.round((totalMinutes / 60 / monthlyGoalHours) * 100));

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(now);
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-[#202B36]">
          Resumen de {capitalizedMonth} {currentYear}
        </h3>
        <button
          onClick={onViewHistory}
          className="text-xs font-semibold text-[#245B85] hover:text-[#1B4463] flex items-center gap-1"
        >
          Ver historial ({currentMonthActivities.length})
        </button>
      </div>

      {/* Primary KPI Card: Total Hours */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-4 shadow-[0_2px_8px_rgba(32,43,54,0.04)]">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#7A8794]">
              Horas de servicio
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-extrabold text-[#202B36] tracking-tight tabular-nums">
                {totalHours}
              </span>
              <span className="text-xs font-semibold text-[#7A8794]">
                h {remainingMinutes > 0 ? `${remainingMinutes}m` : ''}
              </span>
              <span className="text-xs text-[#7A8794] ml-2">
                / {monthlyGoalHours}h meta
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-bold text-[#245B85] tabular-nums">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-[#EDF4FF] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#245B85] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4 Secondary Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Publicaciones */}
        <div className="bg-white rounded-xl border border-[#E5EAF0] p-3 shadow-[0_2px_6px_rgba(32,43,54,0.02)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-[#EDF4FF] text-[#245B85] flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#7A8794]">
              Publicaciones
            </span>
          </div>
          <span className="text-xl font-bold text-[#202B36] tabular-nums">{totalPubs}</span>
        </div>

        {/* Videos */}
        <div className="bg-white rounded-xl border border-[#E5EAF0] p-3 shadow-[0_2px_6px_rgba(32,43,54,0.02)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-[#EDF4FF] text-[#397DAA] flex items-center justify-center">
              <Video className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#7A8794]">
              Videos
            </span>
          </div>
          <span className="text-xl font-bold text-[#202B36] tabular-nums">{totalVideos}</span>
        </div>

        {/* Revisitas */}
        <div className="bg-white rounded-xl border border-[#E5EAF0] p-3 shadow-[0_2px_6px_rgba(32,43,54,0.02)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-[#EDF4FF] text-[#245B85] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#7A8794]">
              Revisitas
            </span>
          </div>
          <span className="text-xl font-bold text-[#202B36] tabular-nums">{totalRevisits}</span>
        </div>

        {/* Cursos bíblicos */}
        <div className="bg-white rounded-xl border border-[#E5EAF0] p-3 shadow-[0_2px_6px_rgba(32,43,54,0.02)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#7A8794]">
              Cursos
            </span>
          </div>
          <span className="text-xl font-bold text-[#2E7D32] tabular-nums">{totalCourses}</span>
        </div>
      </div>
    </div>
  );
};

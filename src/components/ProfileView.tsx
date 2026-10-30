import React, { useState } from 'react';
import { UserProfile, Congregation } from '../types';
import {
  User,
  CheckCircle2,
  Database,
  Building,
  Target,
  Clock,
  Shield,
  LogOut,
  LogIn,
  KeyRound,
  Users,
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: UserProfile | null;
  congregation: Congregation | null;
  monthlyGoalHours: number;
  onUpdateGoal: (newGoal: number) => void;
  onLogout: () => void;
  dbStatus: { status: string; database: string };
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  congregation,
  monthlyGoalHours,
  onUpdateGoal,
  onLogout,
  dbStatus,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(monthlyGoalHours));

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val > 0 && val <= 140) {
      onUpdateGoal(val);
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#202B36] tracking-tight">Perfil de publicador</h2>
        <p className="text-xs text-[#7A8794]">
          Datos de usuario autenticados desde Neon Console
        </p>
      </div>

      {/* Account / User Card */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-4 shadow-[0_2px_8px_rgba(32,43,54,0.04)] space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF4FF] border border-[#245B85]/20 flex items-center justify-center text-[#245B85] font-bold text-base overflow-hidden shrink-0">
              {currentUser ? (
                currentUser.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
              ) : (
                <User className="w-6 h-6 text-[#245B85]" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202B36]">
                {currentUser?.full_name || 'Sin sesión iniciada'}
              </h3>
              <p className="text-xs text-[#7A8794]">{currentUser?.email || 'Inicia sesión con tu cuenta de Neon'}</p>
              {currentUser && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-semibold text-[#245B85] bg-[#EDF4FF] px-2 py-0.5 rounded-md">
                    {currentUser.role.replace(/_/g, ' ')}
                  </span>
                  {currentUser.service_group && (
                    <span className="text-[10px] font-semibold text-[#7A8794] bg-[#F5F7FA] border border-[#E5EAF0] px-2 py-0.5 rounded-md">
                      Grupo {currentUser.service_group}
                    </span>
                  )}
                  {currentUser.is_regular_pioneer && (
                    <span className="text-[10px] font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                      Precursor Regular
                    </span>
                  )}
                  {currentUser.is_elder && (
                    <span className="text-[10px] font-semibold text-[#245B85] bg-[#E3EFFE] px-2 py-0.5 rounded-md">
                      Anciano
                    </span>
                  )}
                  {currentUser.is_ministerial_servant && (
                    <span className="text-[10px] font-semibold text-[#397DAA] bg-[#EDF4FF] px-2 py-0.5 rounded-md">
                      Siervo Ministerial
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Authentication State & Action */}
        <div className="pt-2 border-t border-[#E5EAF0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#245B85]" />
            <span className="text-xs text-[#202B36] font-medium">
              {currentUser ? 'Sesión activa en Neon' : 'No autenticado'}
            </span>
          </div>

          <div>
            <button
              onClick={onLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#D9534F]/30 text-[#D9534F] hover:bg-[#FFDAD6]/30 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Goal Card */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-4 shadow-[0_2px_8px_rgba(32,43,54,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EDF4FF] text-[#245B85] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#202B36]">Meta mensual de horas</h4>
              <p className="text-xs text-[#7A8794]">Objetivo de predicación personal</p>
            </div>
          </div>

          <span className="text-lg font-extrabold text-[#245B85] tabular-nums">
            {monthlyGoalHours} h
          </span>
        </div>

        {!isEditingGoal ? (
          <button
            onClick={() => setIsEditingGoal(true)}
            className="w-full py-2 rounded-xl border border-[#E5EAF0] text-xs font-semibold text-[#245B85] hover:bg-[#F5F7FA] transition-colors"
          >
            Modificar meta mensual
          </button>
        ) : (
          <form onSubmit={handleSaveGoal} className="flex items-center gap-2 pt-2">
            <input
              type="number"
              min="1"
              max="140"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="w-24 h-10 px-3 bg-[#F5F7FA] border border-[#E5EAF0] rounded-lg text-xs font-bold text-[#202B36] focus:outline-none focus:border-[#245B85]"
            />
            <button
              type="submit"
              className="px-4 h-10 rounded-lg bg-[#245B85] text-white text-xs font-semibold hover:bg-[#1B4463]"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setIsEditingGoal(false)}
              className="px-3 h-10 rounded-lg border border-[#E5EAF0] text-xs text-[#7A8794]"
            >
              Cancelar
            </button>
          </form>
        )}
      </div>

      {/* Congregation Info from Neon */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-4 shadow-[0_2px_8px_rgba(32,43,54,0.04)] space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EDF4FF] text-[#245B85] flex items-center justify-center">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#202B36]">
              Congregación {congregation?.name || 'La Unión'}
            </h4>
            <p className="text-xs text-[#7A8794]">{congregation?.city || 'La Unión, El Salvador'}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-1 border-t border-[#E5EAF0]">
          <div className="flex items-center justify-between text-[#41474E]">
            <span className="flex items-center gap-1.5 text-[#7A8794]">
              <Clock className="w-3.5 h-3.5" />
              Reunión fin de semana:
            </span>
            <span className="font-semibold text-[#202B36]">
              {congregation?.meeting_day_weekend || 'Domingo'} {congregation?.meeting_time_weekend || '09:00'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#41474E]">
            <span className="flex items-center gap-1.5 text-[#7A8794]">
              <Clock className="w-3.5 h-3.5" />
              Reunión entre semana:
            </span>
            <span className="font-semibold text-[#202B36]">
              {congregation?.meeting_day_midweek || 'Miércoles'} {congregation?.meeting_time_midweek || '19:00'}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Architecture & Neon Security Badge */}
      <div className="bg-[#EDF4FF]/60 rounded-2xl border border-[#397DAA]/20 p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#245B85] flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[#245B85]" />
            Base de datos Neon PostgreSQL
          </span>
          <span className="inline-flex items-center text-[10px] text-[#2E7D32] font-bold bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#2E7D32]/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Conectado
          </span>
        </div>
        <p className="text-[#41474E] text-[11px] leading-relaxed">
          Autenticación directa contra la tabla de publicadores de Neon PostgreSQL. Cada salida y
          registro queda asociado a tu usuario oficial.
        </p>
      </div>
    </div>
  );
};

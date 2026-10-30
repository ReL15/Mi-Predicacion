import React from 'react';
import { Home, Plus, Clock, Map, User } from 'lucide-react';

export type TabType = 'inicio' | 'registrar' | 'historial' | 'territorios' | 'perfil';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasActiveSession?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  hasActiveSession = false,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5EAF0] shadow-[0_-2px_12px_rgba(32,43,54,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto h-16 flex items-center justify-between px-3 relative">
        {/* Tab 1: Inicio */}
        <button
          onClick={() => onTabChange('inicio')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            activeTab === 'inicio' ? 'text-[#245B85]' : 'text-[#7A8794] hover:text-[#202B36]'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" strokeWidth={activeTab === 'inicio' ? 2.4 : 1.8} />
            {hasActiveSession && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#2E7D32] ring-2 ring-white" />
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-1">Inicio</span>
        </button>

        {/* Tab 2: Historial */}
        <button
          onClick={() => onTabChange('historial')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            activeTab === 'historial' ? 'text-[#245B85]' : 'text-[#7A8794] hover:text-[#202B36]'
          }`}
        >
          <Clock className="w-5 h-5" strokeWidth={activeTab === 'historial' ? 2.4 : 1.8} />
          <span className="text-[11px] font-medium tracking-tight mt-1">Historial</span>
        </button>

        {/* Center Floating Action Tab: Registrar */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={() => onTabChange('registrar')}
            className={`w-[52px] h-[52px] rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 shadow-[0_6px_16px_rgba(36,91,133,0.35)] ${
              activeTab === 'registrar'
                ? 'bg-[#1B4463] ring-4 ring-[#245B85]/20 scale-105'
                : 'bg-[#245B85] hover:bg-[#1B4463]'
            }`}
            aria-label="Registrar actividad ministerial"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: Territorios */}
        <button
          onClick={() => onTabChange('territorios')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            activeTab === 'territorios' ? 'text-[#245B85]' : 'text-[#7A8794] hover:text-[#202B36]'
          }`}
        >
          <Map className="w-5 h-5" strokeWidth={activeTab === 'territorios' ? 2.4 : 1.8} />
          <span className="text-[11px] font-medium tracking-tight mt-1">Territorios</span>
        </button>

        {/* Tab 5: Perfil */}
        <button
          onClick={() => onTabChange('perfil')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            activeTab === 'perfil' ? 'text-[#245B85]' : 'text-[#7A8794] hover:text-[#202B36]'
          }`}
        >
          <User className="w-5 h-5" strokeWidth={activeTab === 'perfil' ? 2.4 : 1.8} />
          <span className="text-[11px] font-medium tracking-tight mt-1">Perfil</span>
        </button>
      </div>
    </nav>
  );
};

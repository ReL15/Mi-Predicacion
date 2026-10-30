import React from 'react';
import { Congregation, UserProfile } from '../types';
import { MapPin, CheckCircle2, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  congregation: Congregation | null;
  currentUser: UserProfile | null;
  onOpenProfile: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  congregation,
  currentUser,
  onOpenProfile,
  isOnline,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAF0] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#245B85] flex items-center justify-center text-white shadow-sm shadow-[#245B85]/20">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
              <path d="M6 14h7" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-[#202B36] tracking-tight leading-tight">
              Mi Predicación
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-[#7A8794]">
              <MapPin className="w-3 h-3 text-[#397DAA]" />
              <span className="truncate max-w-[140px] font-medium">
                {congregation ? congregation.name : 'Congregación'}
              </span>
              {isOnline && (
                <span className="inline-flex items-center text-[10px] text-[#2E7D32] font-medium ml-1">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Neon
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User avatar & Neon Account status */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-[#E5EAF0] hover:bg-[#F5F7FA] active:bg-[#EDF4FF] transition-colors"
          title="Ver perfil de publicador"
        >
          <div className="w-7 h-7 rounded-full bg-[#EDF4FF] border border-[#397DAA]/20 flex items-center justify-center text-[#245B85] font-semibold text-xs overflow-hidden">
            {currentUser ? (
              currentUser.full_name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
            ) : (
              <UserIcon className="w-4 h-4 text-[#245B85]" />
            )}
          </div>
          <span className="text-xs font-semibold text-[#202B36] max-w-[80px] truncate hidden sm:inline">
            {currentUser ? currentUser.full_name.split(' ')[0] : 'Perfil'}
          </span>
        </button>
      </div>
    </header>
  );
};

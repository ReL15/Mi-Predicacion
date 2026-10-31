import React, { useState, useEffect, useCallback } from 'react';
import {
  Territory,
  PreachingSession,
  ActivityRecord,
  Congregation,
  UserProfile,
} from './types';
import {
  fetchTerritories,
  fetchActivities,
  createActivity,
  deleteActivity,
  fetchCongregation,
  fetchPublishers,
  fetchHealth,
} from './services/api';

import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { PreachingSessionCard } from './components/PreachingSessionCard';
import { MonthlySummary } from './components/MonthlySummary';
import { TerritoriesList } from './components/TerritoriesList';
import { TerritoryDetailModal } from './components/TerritoryDetailModal';
import { ActivityForm } from './components/ActivityForm';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { LoginScreen } from './components/LoginScreen';

import { Map, Clock, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');

  // Neon Database State
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoadingTerritories, setIsLoadingTerritories] = useState<boolean>(true);
  const [territoriesError, setTerritoriesError] = useState<string | null>(null);

  // Congregation & Publisher State
  const [congregation, setCongregation] = useState<Congregation | null>(null);
  const [, setPublishers] = useState<UserProfile[]>([]);

  // Authenticated Neon User (stored in localStorage)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mi_predicacion_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [dbStatus, setDbStatus] = useState<{ status: string; database: string }>({
    status: 'connecting',
    database: 'connecting',
  });

  // Activities State
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [monthlyGoalHours, setMonthlyGoalHours] = useState<number>(50);

  // Salida a predicar (Preaching Session) State
  const [preachingSession, setPreachingSession] = useState<PreachingSession>(() => {
    try {
      const saved = localStorage.getItem('mi_predicacion_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      status: 'idle',
      territoryId: null,
      territoryNumber: null,
      territoryName: null,
      date: new Date().toISOString().split('T')[0],
      startTime: null,
      startTimestamp: null,
      elapsedSeconds: 0,
    };
  });

  // Territory Detail Modal state
  const [inspectingTerritory, setInspectingTerritory] = useState<Territory | null>(null);

  // Preloaded data for Activity Form (e.g. when session ends)
  const [formPreload, setFormPreload] = useState<{
    territoryId: string | null;
    hours: number;
    minutes: number;
    fromSession: boolean;
  }>({
    territoryId: null,
    hours: 0,
    minutes: 0,
    fromSession: false,
  });

  // 1. Fetch territories and initial data from Neon API
  const loadData = useCallback(async () => {
    setIsLoadingTerritories(true);
    setTerritoriesError(null);
    try {
      const [terrList, actsList, congData, usersList, healthRes] = await Promise.all([
        fetchTerritories().catch((e) => {
          console.warn('Territories fetch notice:', e.message);
          return [] as Territory[];
        }),
        fetchActivities({ userId: currentUser?.id }).catch(() => [] as ActivityRecord[]),
        fetchCongregation().catch(() => null),
        fetchPublishers().catch(() => [] as UserProfile[]),
        fetchHealth(),
      ]);

      setTerritories(terrList);
      setActivities(actsList);
      setCongregation(congData);
      setPublishers(usersList);
      setDbStatus(healthRes);

      if (terrList.length === 0 && healthRes.database !== 'connected') {
        setTerritoriesError('Reconectando con la base de datos de Neon...');
      }
    } catch (err: any) {
      console.error('Error loading data from Neon API:', err);
      setTerritoriesError(err.message || 'Error al conectar con la base de datos externa.');
    } finally {
      setIsLoadingTerritories(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save session state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mi_predicacion_session', JSON.stringify(preachingSession));
    } catch {}
  }, [preachingSession]);

  // Handle successful login with Neon Console
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('mi_predicacion_user', JSON.stringify(user));
    } catch {}
    loadData();
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('mi_predicacion_user');
    } catch {}
  };

  // If user is not authenticated, strictly show the Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Selected territory object for preaching session
  const selectedTerritoryForSession = territories.find(
    (t) => t.id === preachingSession.territoryId
  ) || null;

  // Handle selecting a territory from List or Map
  const handleSelectTerritory = (territory: Territory) => {
    setPreachingSession((prev) => ({
      ...prev,
      status: 'territory_selected',
      territoryId: territory.id,
      territoryNumber: territory.number,
      territoryName: territory.name || `Territorio ${territory.number}`,
      date: new Date().toISOString().split('T')[0],
      startTime: null,
      startTimestamp: null,
      elapsedSeconds: 0,
    }));

    // Close detail modal if open
    setInspectingTerritory(null);

    // Return to Inicio tab
    setActiveTab('inicio');
  };

  // Start preaching session (State C)
  const handleStartSession = (startTime: string) => {
    setPreachingSession((prev) => ({
      ...prev,
      status: 'in_progress',
      startTime,
      startTimestamp: Date.now(),
      elapsedSeconds: 0,
    }));
  };

  // End preaching session
  const handleEndSession = () => {
    let finalHours = 0;
    let finalMinutes = 0;

    if (preachingSession.startTimestamp) {
      const diffSec = Math.max(0, Math.floor((Date.now() - preachingSession.startTimestamp) / 1000));
      finalHours = Math.floor(diffSec / 3600);
      finalMinutes = Math.floor((diffSec % 3600) / 60);

      if (finalHours === 0 && finalMinutes < 5) {
        finalMinutes = Math.max(1, finalMinutes);
      }
    }

    const linkedTerritoryId = preachingSession.territoryId;

    // Reset preaching session to idle
    setPreachingSession({
      status: 'idle',
      territoryId: null,
      territoryNumber: null,
      territoryName: null,
      date: new Date().toISOString().split('T')[0],
      startTime: null,
      startTimestamp: null,
      elapsedSeconds: 0,
    });

    // Preload Form and navigate to Registrar tab
    setFormPreload({
      territoryId: linkedTerritoryId,
      hours: finalHours,
      minutes: finalMinutes,
      fromSession: true,
    });

    setActiveTab('registrar');
  };

  // Save new activity record
  const handleSaveActivity = async (record: Partial<ActivityRecord>) => {
    const saved = await createActivity({
      ...record,
      userId: currentUser?.id || 'usr-default',
    });
    setActivities((prev) => [saved, ...prev]);

    // Clear form preload
    setFormPreload({
      territoryId: null,
      hours: 0,
      minutes: 0,
      fromSession: false,
    });

    // Navigate to Historial to see the newly saved record
    setTimeout(() => {
      setActiveTab('historial');
    }, 500);
  };

  // Delete activity record
  const handleDeleteActivity = async (id: string) => {
    const ok = await deleteActivity(id);
    if (ok) {
      setActivities((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#202B36] flex flex-col font-sans pb-24">
      {/* Top Header */}
      <Header
        congregation={congregation}
        currentUser={currentUser}
        onOpenProfile={() => setActiveTab('perfil')}
        isOnline={dbStatus.database === 'connected'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4">
        {/* ======================================================== */}
        {/* MODAL / PANTALLA DE DETALLE DEL TERRITORIO               */}
        {/* ======================================================== */}
        {inspectingTerritory ? (
          <TerritoryDetailModal
            territory={inspectingTerritory}
            onBack={() => setInspectingTerritory(null)}
            onSelectForPreaching={handleSelectTerritory}
          />
        ) : (
          <>
            {/* ======================================================== */}
            {/* TAB 1: INICIO (Dashboard con Salida a predicar)          */}
            {/* ======================================================== */}
            {activeTab === 'inicio' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* 1. Tarjeta destacada: Salida a predicar (elemento principal) */}
                <PreachingSessionCard
                  session={preachingSession}
                  territory={selectedTerritoryForSession}
                  onSelectTerritoryClick={() => setActiveTab('territorios')}
                  onStartSession={handleStartSession}
                  onEndSession={handleEndSession}
                  onChangeTerritory={() => setActiveTab('territorios')}
                />

                {/* 2. Resumen mensual de actividad */}
                <MonthlySummary
                  activities={activities}
                  monthlyGoalHours={monthlyGoalHours}
                  onViewHistory={() => setActiveTab('historial')}
                />

                {/* 3. Accesos rápidos */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => setActiveTab('territorios')}
                    className="p-3.5 bg-white rounded-xl border border-[#E5EAF0] shadow-sm hover:border-[#245B85]/40 flex items-center justify-between transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#EDF4FF] text-[#245B85] flex items-center justify-center">
                        <Map className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#202B36] block">Territorios</span>
                        <span className="text-[11px] text-[#7A8794]">
                          {territories.length} disponibles
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7A8794]" />
                  </button>

                  <button
                    onClick={() => setActiveTab('historial')}
                    className="p-3.5 bg-white rounded-xl border border-[#E5EAF0] shadow-sm hover:border-[#245B85]/40 flex items-center justify-between transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#EDF4FF] text-[#245B85] flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#202B36] block">Historial</span>
                        <span className="text-[11px] text-[#7A8794]">
                          {activities.length} informes
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7A8794]" />
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: REGISTRAR ACTIVIDAD                              */}
            {/* ======================================================== */}
            {activeTab === 'registrar' && (
              <div className="animate-in fade-in duration-150">
                <ActivityForm
                  territories={territories}
                  initialTerritoryId={formPreload.territoryId}
                  initialHours={formPreload.hours}
                  initialMinutes={formPreload.minutes}
                  fromSession={formPreload.fromSession}
                  onSave={handleSaveActivity}
                  onCancel={() => setActiveTab('inicio')}
                />
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: HISTORIAL                                         */}
            {/* ======================================================== */}
            {activeTab === 'historial' && (
              <div className="animate-in fade-in duration-150">
                <HistoryView
                  activities={activities}
                  territories={territories}
                  onDeleteRecord={handleDeleteActivity}
                  onInspectTerritory={(territory) => {
                    setInspectingTerritory(territory);
                  }}
                />
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: TERRITORIOS (Lista y Mapa)                       */}
            {/* ======================================================== */}
            {activeTab === 'territorios' && (
              <div className="animate-in fade-in duration-150">
                <TerritoriesList
                  territories={territories}
                  isLoading={isLoadingTerritories}
                  error={territoriesError}
                  onRetry={loadData}
                  onSelectForPreaching={handleSelectTerritory}
                  onViewDetails={(territory) => setInspectingTerritory(territory)}
                />
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: PERFIL                                            */}
            {/* ======================================================== */}
            {activeTab === 'perfil' && (
              <div className="animate-in fade-in duration-150">
                <ProfileView
                  currentUser={currentUser}
                  congregation={congregation}
                  monthlyGoalHours={monthlyGoalHours}
                  onUpdateGoal={setMonthlyGoalHours}
                  onLogout={handleLogout}
                  dbStatus={dbStatus}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Fixed Bottom Navigation (5 tabs) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setInspectingTerritory(null);
          setActiveTab(tab);
        }}
        hasActiveSession={preachingSession.status === 'in_progress'}
      />
    </div>
  );
}

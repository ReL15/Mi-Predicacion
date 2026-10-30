import React, { useState, useMemo } from 'react';
import { Territory } from '../types';
import {
  Search,
  MapPin,
  Map as MapIcon,
  List,
  Eye,
  Check,
  AlertTriangle,
  RotateCw,
  Layers,
} from 'lucide-react';
import { TerritoryMapView } from './TerritoryMapView';

interface TerritoriesListProps {
  territories: Territory[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectForPreaching: (territory: Territory) => void;
  onViewDetails: (territory: Territory) => void;
}

export const TerritoriesList: React.FC<TerritoriesListProps> = ({
  territories,
  isLoading,
  error,
  onRetry,
  onSelectForPreaching,
  onViewDetails,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DISPONIBLE'>('ALL');

  // Filtered territories by number, code, name or observations
  const filteredTerritories = useMemo(() => {
    return territories.filter((t) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        t.number.toLowerCase().includes(query) ||
        (t.name && t.name.toLowerCase().includes(query)) ||
        (t.observations && t.observations.toLowerCase().includes(query)) ||
        (t.description && t.description.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === 'ALL' || (t.status && t.status.toUpperCase() === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [territories, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Top Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#202B36] tracking-tight">Territorios</h2>
          <p className="text-xs text-[#7A8794]">
            Consulta oficial de la congregación (Neon PostgreSQL)
          </p>
        </div>

        {/* View mode toggle button: Lista / Mapa */}
        <div className="flex items-center p-1 rounded-xl bg-white border border-[#E5EAF0] shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-[#245B85] text-white shadow-sm'
                : 'text-[#7A8794] hover:text-[#202B36]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Lista</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'map'
                ? 'bg-[#245B85] text-white shadow-sm'
                : 'text-[#7A8794] hover:text-[#202B36]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Mapa</span>
          </button>
        </div>
      </div>

      {/* Search bar and quick filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7A8794] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número (ej: 01) o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-xs text-[#202B36] placeholder-[#7A8794] bg-white border border-[#E5EAF0] rounded-xl focus:outline-none focus:border-[#245B85] focus:ring-1 focus:ring-[#245B85] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A8794] hover:text-[#202B36] px-1"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-[#245B85] text-white'
                : 'bg-white text-[#7A8794] border border-[#E5EAF0] hover:text-[#202B36]'
            }`}
          >
            Todos ({territories.length})
          </button>
          <button
            onClick={() => setStatusFilter('DISPONIBLE')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === 'DISPONIBLE'
                ? 'bg-[#245B85] text-white'
                : 'bg-white text-[#7A8794] border border-[#E5EAF0] hover:text-[#202B36]'
            }`}
          >
            Disponibles
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LOADING STATE                                            */}
      {/* ======================================================== */}
      {isLoading && (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#E5EAF0] space-y-3">
          <div className="w-10 h-10 border-3 border-[#245B85] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[#202B36]">Cargando territorios...</h4>
            <p className="text-xs text-[#7A8794]">
              Consultando la base de datos externa de Neon Console en tiempo real.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ERROR STATE                                              */}
      {/* ======================================================== */}
      {!isLoading && error && (
        <div className="p-5 rounded-2xl bg-[#FFDAD6]/30 border border-[#BA1A1A]/30 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#BA1A1A] mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-[#BA1A1A]">Error de conexión con el servidor</h4>
            <p className="text-xs text-[#41474E] mt-1">{error}</p>
          </div>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#245B85] text-white text-xs font-semibold hover:bg-[#1B4463] transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reintentar conexión</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONTENT: MAP VIEW OR LIST VIEW                           */}
      {/* ======================================================== */}
      {!isLoading && !error && (
        <>
          {viewMode === 'map' ? (
            <TerritoryMapView
              territories={filteredTerritories}
              selectedTerritoryId={null}
              onSelectForPreaching={onSelectForPreaching}
              onViewDetails={onViewDetails}
            />
          ) : (
            <div className="space-y-3">
              {/* Empty state */}
              {filteredTerritories.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E5EAF0] space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#EDF4FF] flex items-center justify-center text-[#7A8794] mx-auto">
                    <Layers className="w-6 h-6 text-[#7A8794]" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#202B36]">
                    No se encontraron territorios
                  </h4>
                  <p className="text-xs text-[#7A8794]">
                    {searchQuery
                      ? 'Ningún territorio coincide con los términos de búsqueda ingresados.'
                      : 'No hay territorios registrados en la base de datos actualmente.'}
                  </p>
                </div>
              ) : (
                filteredTerritories.map((territory) => (
                  <div
                    key={territory.id}
                    className="bg-white rounded-2xl border border-[#E5EAF0] p-4 shadow-[0_2px_8px_rgba(32,43,54,0.03)] hover:border-[#397DAA]/40 transition-all space-y-3"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#EDF4FF] border border-[#245B85]/20 flex flex-col items-center justify-center text-[#245B85]">
                          <span className="text-[10px] uppercase font-bold leading-none text-[#7A8794]">
                            N°
                          </span>
                          <span className="text-sm font-extrabold leading-none mt-0.5">
                            {territory.number}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#202B36]">
                            {territory.name || `Territorio ${territory.number}`}
                          </h3>
                          <span className="text-[11px] font-semibold text-[#2E7D32]">
                            {territory.status || 'DISPONIBLE'}
                          </span>
                        </div>
                      </div>

                      {/* Geographic info indicator */}
                      {territory.polygon && Array.isArray(territory.polygon) && (
                        <div className="flex items-center gap-1 text-[11px] text-[#7A8794] bg-[#F5F7FA] px-2 py-1 rounded-md border border-[#E5EAF0]">
                          <MapPin className="w-3 h-3 text-[#397DAA]" />
                          <span>{territory.polygon.length} vértices</span>
                        </div>
                      )}
                    </div>

                    {/* Zone or description (only if exists in DB) */}
                    {(territory.observations || territory.description) && (
                      <p className="text-xs text-[#41474E] line-clamp-2 bg-[#F5F7FA] p-2.5 rounded-lg border border-[#E5EAF0]">
                        {territory.observations || territory.description}
                      </p>
                    )}

                    {/* Strict rule: Only "Ver detalles" and "Seleccionar para predicar" (NO create/edit/delete) */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E5EAF0]/80">
                      <button
                        onClick={() => onViewDetails(territory)}
                        className="min-h-[40px] rounded-xl border border-[#397DAA] text-[#397DAA] hover:bg-[#EDF4FF] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver detalles</span>
                      </button>

                      <button
                        onClick={() => onSelectForPreaching(territory)}
                        className="min-h-[40px] rounded-xl bg-[#245B85] text-white hover:bg-[#1B4463] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-[#245B85]/20 active:scale-95 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Seleccionar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

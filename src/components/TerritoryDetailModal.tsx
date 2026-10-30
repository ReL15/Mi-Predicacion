import React, { useEffect, useRef } from 'react';
import { Territory } from '../types';
import L from 'leaflet';
import {
  ArrowLeft,
  MapPin,
  Check,
  Compass,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';

interface TerritoryDetailModalProps {
  territory: Territory;
  onBack: () => void;
  onSelectForPreaching: (territory: Territory) => void;
}

export const TerritoryDetailModal: React.FC<TerritoryDetailModalProps> = ({
  territory,
  onBack,
  onSelectForPreaching,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;
    if (!map) return;

    if (territory.polygon && Array.isArray(territory.polygon) && territory.polygon.length >= 3) {
      const latlngs: [number, number][] = territory.polygon.map((p) => [p.latitude, p.longitude]);

      const poly = L.polygon(latlngs, {
        color: '#245B85',
        weight: 3,
        fillColor: '#397DAA',
        fillOpacity: 0.35,
      }).addTo(map);

      map.fitBounds(poly.getBounds(), { padding: [40, 40] });

      // Add center marker
      const center = poly.getBounds().getCenter();
      const marker = L.divIcon({
        className: 'custom-detail-marker',
        html: `
          <div style="
            background: #245B85;
            color: #ffffff;
            font-weight: 700;
            font-size: 13px;
            padding: 4px 10px;
            border-radius: 9999px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            text-align: center;
            transform: translate(-50%, -50%);
          ">
            Territorio ${territory.number}
          </div>
        `,
        iconSize: [40, 24],
        iconAnchor: [20, 12],
      });
      L.marker(center, { icon: marker }).addTo(map);
    } else {
      map.setView([13.334, -87.838], 15);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [territory]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245B85] hover:text-[#1B4463] py-1 px-2 -ml-2 rounded-lg hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a territorios</span>
        </button>

        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
          {territory.status || 'DISPONIBLE'}
        </span>
      </div>

      {/* Main detail card */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-[0_2px_8px_rgba(32,43,54,0.04)] space-y-4">
        {/* Title & Code */}
        <div className="flex items-start gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#EDF4FF] border border-[#245B85]/20 flex flex-col items-center justify-center text-[#245B85] shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#7A8794]">NÚMERO</span>
            <span className="text-xl font-extrabold">{territory.number}</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#202B36]">
              {territory.name || `Territorio ${territory.number}`}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-[#7A8794]">
              <Compass className="w-3.5 h-3.5 text-[#397DAA]" />
              <span>Congregación La Unión (Neon PostgreSQL)</span>
            </div>
          </div>
        </div>

        {/* Focused Leaflet Map for this territory */}
        <div className="relative w-full h-56 rounded-xl overflow-hidden border border-[#E5EAF0] shadow-inner bg-[#EDF4FF]/30">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Observations & Description */}
        <div className="space-y-3 pt-1">
          {territory.description && (
            <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E5EAF0]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A8794] block mb-1">
                Descripción
              </span>
              <p className="text-xs text-[#202B36]">{territory.description}</p>
            </div>
          )}

          {territory.observations && (
            <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E5EAF0]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A8794] block mb-1">
                Dirección / Zona de referencia
              </span>
              <p className="text-xs text-[#202B36]">{territory.observations}</p>
            </div>
          )}

          {/* Geographic Metadata */}
          <div className="p-3 rounded-xl bg-[#EDF4FF] border border-[#397DAA]/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#245B85] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Información geográfica
              </span>
              <span className="text-[#7A8794]">
                {territory.polygon ? `${territory.polygon.length} vértices` : 'Sin polígono'}
              </span>
            </div>
            {territory.polygon && territory.polygon.length > 0 && (
              <p className="text-[11px] text-[#41474E]">
                Coordenadas de referencia: Lat {territory.polygon[0].latitude.toFixed(5)}, Long{' '}
                {territory.polygon[0].longitude.toFixed(5)}
              </p>
            )}
          </div>

          {/* Last activity if exists */}
          {territory.last_completed_date && (
            <div className="flex items-center gap-2 text-xs text-[#7A8794] px-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Última vez completado: {territory.last_completed_date}</span>
            </div>
          )}
        </div>

        {/* Only Allowed Actions: "Seleccionar para predicar" and "Volver a territorios" */}
        <div className="space-y-2 pt-2 border-t border-[#E5EAF0]">
          <button
            onClick={() => onSelectForPreaching(territory)}
            className="w-full min-h-[48px] rounded-xl bg-[#245B85] text-white hover:bg-[#1B4463] font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#245B85]/20 active:scale-[0.99] transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Seleccionar para predicar</span>
          </button>

          <button
            onClick={onBack}
            className="w-full min-h-[44px] rounded-xl border border-[#E5EAF0] bg-white text-[#202B36] hover:bg-[#F5F7FA] font-medium text-xs flex items-center justify-center transition-colors"
          >
            Volver a territorios
          </button>
        </div>
      </div>
    </div>
  );
};

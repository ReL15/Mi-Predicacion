import React, { useEffect, useRef, useState } from 'react';
import { Territory } from '../types';
import L from 'leaflet';
import { MapPin, Navigation, Eye, Check, X, Layers } from 'lucide-react';

interface TerritoryMapViewProps {
  territories: Territory[];
  selectedTerritoryId: string | null;
  onSelectForPreaching: (territory: Territory) => void;
  onViewDetails: (territory: Territory) => void;
  onCloseSheet?: () => void;
}

export const TerritoryMapView: React.FC<TerritoryMapViewProps> = ({
  territories,
  selectedTerritoryId,
  onSelectForPreaching,
  onViewDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [id: string]: L.Polygon }>({});

  const [activeBottomSheetTerritory, setActiveBottomSheetTerritory] = useState<Territory | null>(null);

  // Initialize selected territory if provided
  useEffect(() => {
    if (selectedTerritoryId) {
      const match = territories.find((t) => t.id === selectedTerritoryId);
      if (match) setActiveBottomSheetTerritory(match);
    }
  }, [selectedTerritoryId, territories]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center for La Unión, El Salvador: 13.334, -87.838
    const defaultCenter: [number, number] = [13.334, -87.838];

    // If map is already initialized, just clean up layers
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old polygon layers
    Object.values(layersRef.current).forEach((layer) => layer.remove());
    layersRef.current = {};

    const allLatLngs: [number, number][] = [];

    // Render real polygons from Neon database
    territories.forEach((t) => {
      if (!t.polygon || !Array.isArray(t.polygon) || t.polygon.length < 3) {
        return;
      }

      const latlngs: [number, number][] = t.polygon.map((p) => [p.latitude, p.longitude]);
      allLatLngs.push(...latlngs);

      const isSelected = activeBottomSheetTerritory?.id === t.id;

      const poly = L.polygon(latlngs, {
        color: isSelected ? '#1B4463' : '#245B85',
        weight: isSelected ? 3 : 2,
        fillColor: isSelected ? '#397DAA' : '#245B85',
        fillOpacity: isSelected ? 0.45 : 0.22,
        dashArray: isSelected ? undefined : '4, 4',
      }).addTo(map);

      // Centroid calculation for badge marker
      let sumLat = 0;
      let sumLng = 0;
      t.polygon.forEach((p) => {
        sumLat += p.latitude;
        sumLng += p.longitude;
      });
      const centerLat = sumLat / t.polygon.length;
      const centerLng = sumLng / t.polygon.length;

      // Custom marker badge with territory number
      const customIcon = L.divIcon({
        className: 'custom-territory-marker',
        html: `
          <div style="
            background: ${isSelected ? '#1B4463' : '#245B85'};
            color: #ffffff;
            font-weight: 700;
            font-size: 11px;
            padding: 3px 7px;
            border-radius: 9999px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 1.5px solid #ffffff;
            text-align: center;
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            ${t.number}
          </div>
        `,
        iconSize: [28, 20],
        iconAnchor: [14, 10],
      });

      const marker = L.marker([centerLat, centerLng], { icon: customIcon }).addTo(map);

      // Tap handling
      const handleSelect = () => {
        setActiveBottomSheetTerritory(t);
        map.panTo([centerLat, centerLng]);
      };

      poly.on('click', handleSelect);
      marker.on('click', handleSelect);

      layersRef.current[t.id] = poly;
    });

    // Fit map bounds to encompass all territories
    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      // Keep map alive or clean up on full component unmount
    };
  }, [territories, activeBottomSheetTerritory?.id]);

  return (
    <div className="relative w-full h-[calc(100vh-210px)] min-h-[460px] rounded-2xl overflow-hidden border border-[#E5EAF0] shadow-[0_2px_8px_rgba(32,43,54,0.04)] bg-[#EDF4FF]/30">
      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Info Pill */}
      <div className="absolute top-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E5EAF0] shadow-sm text-xs font-semibold text-[#202B36] flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5 text-[#245B85]" />
        <span>{territories.length} territorios oficiales</span>
      </div>

      {/* Center map button */}
      <button
        onClick={() => {
          if (mapInstanceRef.current) {
            const allLatLngs: [number, number][] = [];
            territories.forEach((t) => {
              if (t.polygon) {
                t.polygon.forEach((p) => allLatLngs.push([p.latitude, p.longitude]));
              }
            });
            if (allLatLngs.length > 0) {
              mapInstanceRef.current.fitBounds(L.latLngBounds(allLatLngs), { padding: [30, 30] });
            }
          }
        }}
        className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md p-2 rounded-xl border border-[#E5EAF0] shadow-sm text-[#245B85] hover:bg-[#F5F7FA] active:scale-95 transition-transform"
        title="Centrar mapa"
      >
        <Navigation className="w-4 h-4" />
      </button>

      {/* ======================================================== */}
      {/* BOTTOM SHEET: Aparece al tocar un territorio en el mapa   */}
      {/* ======================================================== */}
      {activeBottomSheetTerritory && (
        <div className="absolute bottom-0 left-0 right-0 z-[500] bg-white rounded-t-3xl border-t border-[#E5EAF0] shadow-[0_-8px_24px_rgba(32,43,54,0.14)] p-4 pt-3 animate-in slide-in-from-bottom duration-200">
          {/* Drag Handle */}
          <div className="w-10 h-1 bg-[#cbd5e1] rounded-full mx-auto mb-3" />

          {/* Close button */}
          <button
            onClick={() => setActiveBottomSheetTerritory(null)}
            className="absolute top-3 right-3 p-1.5 rounded-full text-[#7A8794] hover:bg-[#F5F7FA]"
            aria-label="Cerrar tarjeta"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Territory summary */}
          <div className="space-y-1 mb-4 pr-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#245B85] text-white text-xs font-bold">
                Territorio {activeBottomSheetTerritory.number}
              </span>
              <span className="text-xs font-semibold text-[#397DAA]">
                {activeBottomSheetTerritory.status || 'DISPONIBLE'}
              </span>
            </div>
            <h4 className="text-base font-bold text-[#202B36] pt-1">
              {activeBottomSheetTerritory.name || `Territorio ${activeBottomSheetTerritory.number}`}
            </h4>
            {(activeBottomSheetTerritory.observations || activeBottomSheetTerritory.description) && (
              <p className="text-xs text-[#7A8794]">
                {activeBottomSheetTerritory.observations || activeBottomSheetTerritory.description}
              </p>
            )}
            {activeBottomSheetTerritory.polygon && (
              <p className="text-[11px] text-[#245B85] font-medium flex items-center gap-1 pt-0.5">
                <MapPin className="w-3 h-3" />
                <span>
                  Límites definidos por {activeBottomSheetTerritory.polygon.length} puntos
                  geográficos reales
                </span>
              </p>
            )}
          </div>

          {/* 2 Mandatory Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onViewDetails(activeBottomSheetTerritory)}
              className="min-h-[44px] rounded-xl border border-[#397DAA] bg-white text-[#397DAA] hover:bg-[#EDF4FF] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver detalles</span>
            </button>

            <button
              onClick={() => onSelectForPreaching(activeBottomSheetTerritory)}
              className="min-h-[44px] rounded-xl bg-[#245B85] text-white hover:bg-[#1B4463] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-[#245B85]/25 active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Seleccionar para predicar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

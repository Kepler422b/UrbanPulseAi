import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { PublicReport, AdminReport } from '../../types';
import { createCustomMarkerIcon } from './mapIcons';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { getCategoryLabel } from '../../utils/formatters';
import { MapPin, Filter, Layers, ExternalLink } from 'lucide-react';

interface HotspotMapProps {
  reports: (PublicReport | AdminReport)[];
  className?: string;
  initialCenter?: [number, number];
  zoom?: number;
  showFilters?: boolean;
}

const LOCALITY_FALLBACKS: Record<string, [number, number]> = {
  'Mira Road East': [19.2812, 72.8561],
  'Bhayandar West': [19.3082, 72.8465],
  'Bhayandar East': [19.311, 72.859],
  'Shanti Nagar': [19.2845, 72.8612],
  'Kanakia Park': [19.2864, 72.8688],
  'Poonam Sagar': [19.2891, 72.8611],
  'Silver Park': [19.2882, 72.8643],
  'Beverly Park': [19.2825, 72.867],
  'Kashimira': [19.2785, 72.8715],
  'Golden Nest': [19.2985, 72.856],
  'Deepak Hospital Area': [19.292, 72.858],
  'Maxus Mall Area': [19.3015, 72.851],
  'Uttan Road': [19.28, 72.805],
  'Jesal Park': [19.304, 72.842],
};

const DEFAULT_CENTER: [number, number] = [19.2952, 72.8544];

export const HotspotMap: React.FC<HotspotMapProps> = ({
  reports,
  className = 'h-96',
  initialCenter = DEFAULT_CENTER,
  zoom = 13,
  showFilters = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredReports = useMemo(() => {
    if (selectedCategory === 'all') return reports;
    return reports.filter((r) => r.category === selectedCategory);
  }, [reports, selectedCategory]);

  const getMarkerColor = (category: string) => {
    switch (category) {
      case 'potholes_damaged_roads':
        return '#F59E0B'; // Amber
      case 'garbage_overflow':
        return '#10B981'; // Green
      case 'broken_streetlights':
        return '#22D3EE'; // Cyan
      default:
        return '#38BDF8';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2">
      {showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map Layers:</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: 'All Issues' },
              { id: 'potholes_damaged_roads', label: 'Potholes' },
              { id: 'garbage_overflow', label: 'Garbage' },
              { id: 'broken_streetlights', label: 'Streetlights' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leaflet Map Container */}
      <div className={`relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl ${className}`}>
        <MapContainer
          center={initialCenter}
          zoom={zoom}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredReports.map((r) => {
            let lat = r.latitude;
            let lng = r.longitude;

            // Safe fallback to locality coordinates if GPS is missing
            if (lat === null || lat === undefined || lng === null || lng === undefined) {
              const fallback = LOCALITY_FALLBACKS[r.locality] || DEFAULT_CENTER;
              lat = fallback[0];
              lng = fallback[1];
            }

            const markerColor = getMarkerColor(r.category);

            return (
              <Marker
                key={r.public_report_id || r.id}
                position={[lat, lng]}
                icon={createCustomMarkerIcon(markerColor)}
              >
                <Popup className="urban-popup">
                  <div className="p-1 space-y-2 text-slate-100 max-w-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                      <span className="font-mono text-xs text-cyan-400 font-semibold">
                        {r.public_report_id}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{r.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{r.locality}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">{r.description}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                      <PriorityBadge level={r.priority_level} score={r.priority_score} showScore />
                      <Link
                        to={`/issues/${r.public_report_id}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-3 right-3 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg shadow-xl text-[11px] text-slate-300 space-y-1.5">
          <div className="font-semibold text-slate-100 text-[10px] uppercase tracking-wider">Issue Type</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Potholes & Roads</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Garbage Overflow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Streetlights</span>
          </div>
        </div>
      </div>
    </div>
  );
};

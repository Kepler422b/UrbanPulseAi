import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createPickerMarkerIcon } from './mapIcons';
import { Navigation, MapPin, AlertCircle } from 'lucide-react';

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [19.2952, 72.8544]; // Mira-Bhayandar

const MapClickHandler: React.FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapCenterUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  className = 'h-72',
}) => {
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const markerPosition: [number, number] | null =
    latitude !== null && longitude !== null ? [latitude, longitude] : null;

  const currentCenter: [number, number] = markerPosition || DEFAULT_CENTER;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please click on the map to pinpoint.');
      return;
    }
    setGeoError(null);
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onLocationChange(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission was denied. You can manually tap anywhere on the map to place the pin.');
        } else {
          setGeoError('Could not determine accurate GPS coordinates. Please select your position on the map.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300 font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          Tap map or drag pin to pinpoint location
        </span>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors text-[11px] font-medium disabled:opacity-50"
        >
          <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Use My GPS Location'}</span>
        </button>
      </div>

      {geoError && (
        <div className="flex items-center gap-1.5 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      <div className={`relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-inner ${className}`}>
        <MapContainer
          center={currentCenter}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPick={onLocationChange} />
          {markerPosition && <MapCenterUpdater center={markerPosition} />}
          {markerPosition && (
            <Marker
              position={markerPosition}
              icon={createPickerMarkerIcon()}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target as L.Marker;
                  const pos = m.getLatLng();
                  onLocationChange(pos.lat, pos.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        {markerPosition ? (
          <span>Selected: {markerPosition[0].toFixed(5)}°N, {markerPosition[1].toFixed(5)}°E</span>
        ) : (
          <span className="text-slate-500 italic">No coordinates picked yet (will default to locality center)</span>
        )}
      </div>
    </div>
  );
};

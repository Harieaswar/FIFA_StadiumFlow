import React, { useEffect, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Navigation, Filter, Info, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { StadiumPOI, RouteResult } from '../types';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import clsx from 'clsx';

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const POI_ICONS: Record<string, { emoji: string; color: string }> = {
  gate: { emoji: '🚪', color: '#6366f1' },
  restroom: { emoji: '🚻', color: '#64748b' },
  accessible_restroom: { emoji: '♿', color: '#0ea5e9' },
  food: { emoji: '🍽️', color: '#f59e0b' },
  first_aid: { emoji: '🏥', color: '#ef4444' },
  security: { emoji: '🛡️', color: '#8b5cf6' },
  lost_found: { emoji: '📦', color: '#f97316' },
  merchandise: { emoji: '🛍️', color: '#ec4899' },
  elevator: { emoji: '🔼', color: '#14b8a6' },
  ramp: { emoji: '📐', color: '#14b8a6' },
  quiet_room: { emoji: '🕌', color: '#8b5cf6' },
  transport: { emoji: '🚇', color: '#0ea5e9' },
  emergency_exit: { emoji: '🚨', color: '#ef4444' },
  water: { emoji: '💧', color: '#0ea5e9' },
};

const POI_TYPES = ['all', 'gate', 'restroom', 'accessible_restroom', 'food', 'first_aid', 'security', 'elevator', 'emergency_exit'];

function createPOIIcon(type: string) {
  const config = POI_ICONS[type] || { emoji: '📍', color: '#6366f1' };
  return L.divIcon({
    html: `<div style="background:${config.color}20;border:2px solid ${config.color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;backdrop-filter:blur(4px)">${config.emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    className: '',
  });
}

// Leaflet uses [lat, lng] format for bounds. These are approximate coordinates corresponding to the demo POIs.
const STADIUM_BOUNDS: [[number, number], [number, number]] = [
  [40.7580, -73.9855],
  [40.7595, -73.9840],
];
const STADIUM_CENTER: [number, number] = [
  (STADIUM_BOUNDS[0][0] + STADIUM_BOUNDS[1][0]) / 2,
  (STADIUM_BOUNDS[0][1] + STADIUM_BOUNDS[1][1]) / 2,
];

export default function SmartNavigation() {
  const [pois, setPois] = useState<StadiumPOI[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [accessibility, setAccessibility] = useState(false);
  const [preference, setPreference] = useState('shortest');
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedPOI, setSelectedPOI] = useState<StadiumPOI | null>(null);

  useEffect(() => {
    api.get<StadiumPOI[]>('/navigation/pois').then(res => {
      if (res.success) setPois(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const calculateRoute = async () => {
    if (!from || !to) return;
    setRouteLoading(true);
    try {
      const res = await api.post<RouteResult>('/navigation/route', { from, to, accessibility, preference });
      if (res.success) setRoute(res.data);
    } finally { setRouteLoading(false); }
  };

  const filteredPOIs = filter === 'all' ? pois : pois.filter(p => p.type === filter);

  // Mock route coordinates between two gates
  const routeCoords: [number, number][] = route ? [
    [40.7589, -73.9851],
    [40.7590, -73.9849],
    [40.7591, -73.9847],
    [40.7592, -73.9845],
    [40.7591, -73.9843],
  ] : [];

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="section-header">Smart Navigation</h1>
        <p className="section-subheader">Interactive stadium map with AI-powered route planning • Demo Data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Controls */}
        <div className="space-y-4">
          {/* Route Planner */}
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Navigation size={16} className="text-indigo-400" /> Route Planner
            </h2>
            <div className="space-y-3">
              <div>
                <label className="input-label text-xs">From</label>
                <select value={from} onChange={e => setFrom(e.target.value)} className="input-field text-sm py-2">
                  <option value="">Select start...</option>
                  {pois.filter(p => p.type === 'gate').map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label text-xs">To</label>
                <input value={to} onChange={e => setTo(e.target.value)} className="input-field text-sm py-2" placeholder="e.g. Section B Row 12" />
              </div>
              <div>
                <label className="input-label text-xs">Route Preference</label>
                <select value={preference} onChange={e => setPreference(e.target.value)} className="input-field text-sm py-2">
                  <option value="shortest">Shortest Route</option>
                  <option value="quietest">Quietest Route</option>
                  <option value="accessible">Accessible Route</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={accessibility} onChange={e => setAccessibility(e.target.checked)} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500" />
                <span className="text-xs text-slate-300">Wheelchair accessible route</span>
              </label>
              <button onClick={calculateRoute} disabled={!from || !to || routeLoading} className="btn-primary w-full text-sm py-2">
                {routeLoading ? 'Calculating...' : '🗺️ Find Route'}
              </button>
            </div>
          </div>

          {/* POI Filter */}
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Filter size={16} className="text-teal-400" /> Filter Locations
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {POI_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={clsx(
                    'text-xs px-2.5 py-1 rounded-lg capitalize transition-colors',
                    filter === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  )}
                >
                  {t === 'accessible_restroom' ? '♿ Restroom' : (POI_ICONS[t]?.emoji || '') + ' ' + t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Route Result */}
          {route && (
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">Route Details</h2>
              {route.isDemoData && (
                <p className="text-xs text-amber-400 mb-2 flex items-center gap-1"><AlertCircle size={10} /> Demo route data</p>
              )}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-800/60 rounded-lg p-2">
                  <p className="text-xs text-slate-500">Distance</p>
                  <p className="text-sm font-semibold text-slate-200">{route.distance}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2">
                  <p className="text-xs text-slate-500">Time</p>
                  <p className="text-sm font-semibold text-slate-200">{route.estimatedTime}</p>
                </div>
              </div>
              <div className="space-y-2">
                {route.steps.map(step => (
                  <div key={step.step} className="flex gap-2">
                    <span className="w-5 h-5 bg-indigo-600/30 text-indigo-400 text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{step.step}</span>
                    <p className="text-xs text-slate-300">{step.instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected POI info */}
          {selectedPOI && (
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Info size={14} className="text-indigo-400" /> {selectedPOI.name}
              </h2>
              <p className="text-xs text-slate-400 capitalize mb-2">{selectedPOI.type.replace('_', ' ')}</p>
              {selectedPOI.accessible && <p className="text-xs text-blue-400">♿ Wheelchair accessible</p>}
              {selectedPOI.crowdLevel && (
                <p className="text-xs mt-1">
                  Crowd: <span className={clsx(selectedPOI.crowdLevel === 'critical' ? 'text-red-400' : selectedPOI.crowdLevel === 'high' ? 'text-orange-400' : 'text-emerald-400')}>{selectedPOI.crowdLevel}</span>
                </p>
              )}
              <button onClick={() => { setFrom(selectedPOI.name); }} className="btn-secondary text-xs mt-3 py-1">Set as Start</button>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-2 card overflow-hidden" style={{ height: '600px' }}>
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Map size={40} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Loading map...</p>
              </div>
            </div>
          ) : (
            <MapContainer center={STADIUM_CENTER} zoom={17} style={{ height: '100%', width: '100%' }} zoomControl={true}>
              <ImageOverlay url="/stadium_map.png" bounds={STADIUM_BOUNDS} />

              {filteredPOIs.map(poi => (
                <Marker
                  key={poi.id}
                  position={[poi.lat, poi.lng]}
                  icon={createPOIIcon(poi.type)}
                  eventHandlers={{ click: () => setSelectedPOI(poi) }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{poi.name}</strong>
                      <br /><span className="text-gray-500 capitalize">{poi.type.replace('_', ' ')}</span>
                      {poi.accessible && <><br /><span className="text-blue-500">♿ Accessible</span></>}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {routeCoords.length > 0 && (
                <Polyline positions={routeCoords} color="#6366f1" weight={4} dashArray="8,4" />
              )}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4">
        <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Map Legend</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {Object.entries(POI_ICONS).slice(0, 8).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>{config.emoji}</span>
              <span className="capitalize">{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-amber-400 mt-3 flex items-center gap-1">
          <AlertCircle size={10} /> Demo Data — Map uses placeholder stadium coordinates
        </p>
      </div>
    </div>
  );
}

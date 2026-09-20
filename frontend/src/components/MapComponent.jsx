import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STATIONS, TRACK_PATH, MINERAL_CORRIDOR_PATH, BYPASS_PATH, SOUTHERN_LOOPS_PATH, BHILAI_YARD_PATHS, RESTRICTIONS } from '../data/corridorData';
import { ALL_MAIN_TRACKS, ALL_YARD_TRACKS } from '../data/allTracksData';

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // ── Initialize Map ──────────────────────────────────────
    const map = L.map(mapRef.current, {
      center: [21.365, 81.670], // Mandhar (approx middle)
      zoom: 11,
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark satellite tile layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map);

    // ── Draw Track Polylines ─────────────────────────────────
    // The invisible baseline track for the simulator
    L.polyline(TRACK_PATH, {
      color: 'transparent',
      weight: 1,
    }).addTo(map);

    // Draw ALL exact main tracks from OSM (Up, Down, Middle, etc)
    if (ALL_MAIN_TRACKS && ALL_MAIN_TRACKS.length > 0) {
      ALL_MAIN_TRACKS.forEach(track => {
        L.polyline(track, {
          color: '#ffcba4', // Peach color
          weight: 2,
          opacity: 0.8,
        }).addTo(map);
      });
    }

    // Draw ALL yard, siding, and loop tracks from OSM
    if (ALL_YARD_TRACKS && ALL_YARD_TRACKS.length > 0) {
      ALL_YARD_TRACKS.forEach(track => {
        L.polyline(track, {
          color: '#fff44f', // Lemon yellow
          weight: 1.2,
          opacity: 0.6,
        }).addTo(map);
      });
    }

    // ── Draw TSR/PSR Zones ──────────────────────────────────
    RESTRICTIONS.forEach(r => {
      const startFrac = r.fromKm / 40;
      const endFrac = r.toKm / 40;
      const startIdx = Math.floor(startFrac * (TRACK_PATH.length - 1));
      const endIdx = Math.ceil(endFrac * (TRACK_PATH.length - 1));
      const segment = TRACK_PATH.slice(
        Math.max(0, startIdx),
        Math.min(TRACK_PATH.length, endIdx + 1)
      );
      if (segment.length >= 2) {
        L.polyline(segment, {
          color: r.type === 'TSR' ? '#f59e0b' : '#3b82f6',
          weight: 6,
          opacity: 0.7,
          dashArray: '12, 8',
        }).addTo(map);

        // TSR label
        const midIdx = Math.floor(segment.length / 2);
        L.marker(segment[midIdx], {
          icon: L.divIcon({
            className: '',
            html: `<div style="background:${r.type === 'TSR' ? '#f59e0b' : '#3b82f6'};color:#000;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;white-space:nowrap;">${r.speedLimit} km/h ${r.type}</div>`,
            iconSize: [80, 20],
            iconAnchor: [40, 30],
          }),
        }).addTo(map);
      }
    });

    // ── Draw Station Markers ────────────────────────────────
    STATIONS.forEach(station => {
      const isJunction = station.isJunction;
      const size = isJunction ? 14 : 10;
      const borderColor = isJunction ? '#f59e0b' : '#ffffff';

      // Station dot
      L.circleMarker([station.lat, station.lng], {
        radius: size / 2,
        color: borderColor,
        fillColor: '#1e293b',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);

      // Station label
      const labelHtml = `
        <div style="
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid ${isJunction ? '#f59e0b' : '#475569'};
          border-radius: 6px;
          padding: 4px 8px;
          color: ${isJunction ? '#f59e0b' : '#e2e8f0'};
          font-size: ${isJunction ? '12px' : '10px'};
          font-weight: ${isJunction ? '700' : '500'};
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        ">
          ${station.code} · ${station.name}
          <span style="display:block;font-size:9px;color:#94a3b8;font-weight:400;">
            km ${station.km} · ${station.platforms} PF${isJunction ? ' · Jn' : ''}
          </span>
        </div>
      `;
      L.marker([station.lat, station.lng], {
        icon: L.divIcon({
          className: '',
          html: labelHtml,
          iconSize: [140, 40],
          iconAnchor: [-12, 20],
        }),
      }).addTo(map);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);


  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        .leaflet-container { background: #0f172a !important; }
        .leaflet-control-zoom { border: none !important; }
        .leaflet-control-zoom a {
          background: #1e293b !important;
          color: #e2e8f0 !important;
          border-color: #334155 !important;
        }
        .leaflet-control-zoom a:hover { background: #334155 !important; }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25) !important;
        }
      `}</style>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />
    </div>
  );
};

export default MapComponent;

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STATIONS, TRACK_PATH, RESTRICTIONS } from '../data/corridorData';
import { getSimulator } from '../services/telemetrySimulator';

// Signal aspect colors
const SIGNAL_COLORS = {
  GREEN: '#10b981',
  DOUBLE_YELLOW: '#f59e0b',
  YELLOW: '#eab308',
  RED: '#ef4444',
};

// Train delay → color
function getDelayColor(delay) {
  if (delay <= 0) return '#10b981'; // On time - green
  if (delay <= 10) return '#eab308'; // Slight delay - yellow
  if (delay <= 20) return '#f97316'; // Moderate - orange
  return '#ef4444'; // Heavy delay - red
}

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trainMarkersRef = useRef({});
  const signalMarkersRef = useRef({});
  const trainPopupRef = useRef(null);
  const [selectedTrain, setSelectedTrain] = useState(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // ── Initialize Map ──────────────────────────────────────
    const map = L.map(mapRef.current, {
      center: [21.23, 81.45],
      zoom: 11,
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark satellite tile layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map);

    // ── Draw Track Polyline ─────────────────────────────────
    L.polyline(TRACK_PATH, {
      color: '#ffffff',
      weight: 3,
      opacity: 0.6,
      dashArray: '8, 6',
    }).addTo(map);

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

    // ── Subscribe to Simulator ──────────────────────────────
    const sim = getSimulator();
    sim.start();

    const unsubscribe = sim.subscribe((state) => {
      updateTrainMarkers(map, state);
      updateSignalMarkers(map, state);
    });

    return () => {
      unsubscribe();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ── Update Train Markers ────────────────────────────────────
  function updateTrainMarkers(map, state) {
    const activeTrains = state.trains.filter(
      t => t.status === 'RUNNING' || t.status === 'AT_STATION'
    );

    // Remove markers for trains no longer active
    Object.keys(trainMarkersRef.current).forEach(tn => {
      if (!activeTrains.find(t => t.trainNumber === tn)) {
        map.removeLayer(trainMarkersRef.current[tn]);
        delete trainMarkersRef.current[tn];
      }
    });

    // Update or create markers
    activeTrains.forEach(train => {
      if (train.currentLat === 0 && train.currentLng === 0) return;
      const delayColor = getDelayColor(train.delayMinutes);
      const dirArrow = train.direction === 'DN' ? '▶' : '◀';
      
      const html = `
        <div style="position:relative;cursor:pointer;" title="${train.trainNumber} ${train.trainName}">
          <div style="
            width: 28px; height: 28px;
            background: ${train.color};
            border: 3px solid ${delayColor};
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; font-weight: bold; color: #fff;
            box-shadow: 0 0 12px ${delayColor}88, 0 0 24px ${train.color}44;
            animation: pulse 2s infinite;
          ">${dirArrow}</div>
          <div style="
            position: absolute; top: -22px; left: 50%; transform: translateX(-50%);
            background: ${train.color}; color: #fff;
            font-size: 9px; font-weight: bold; padding: 1px 5px;
            border-radius: 3px; white-space: nowrap;
            font-family: monospace;
          ">${train.trainNumber}</div>
        </div>
      `;

      if (trainMarkersRef.current[train.trainNumber]) {
        trainMarkersRef.current[train.trainNumber].setLatLng([train.currentLat, train.currentLng]);
        trainMarkersRef.current[train.trainNumber].setIcon(
          L.divIcon({ className: '', html, iconSize: [28, 28], iconAnchor: [14, 14] })
        );
      } else {
        const marker = L.marker([train.currentLat, train.currentLng], {
          icon: L.divIcon({ className: '', html, iconSize: [28, 28], iconAnchor: [14, 14] }),
          zIndexOffset: 1000,
        }).addTo(map);

        // Click popup
        marker.on('click', () => {
          const nextEta = Object.values(train.etas)[0];
          const popupHtml = `
            <div style="font-family:'Inter',sans-serif;min-width:220px;padding:4px;">
              <div style="font-weight:700;font-size:14px;color:${train.color};margin-bottom:4px;">
                ${train.trainNumber} · ${train.trainName}
              </div>
              <div style="font-size:11px;color:#666;margin-bottom:8px;">${train.origin} → ${train.destination} · ${train.trainType}</div>
              <table style="width:100%;font-size:11px;border-collapse:collapse;">
                <tr><td style="color:#888;">Speed</td><td style="font-weight:600;">${Math.round(train.currentSpeed)} km/h</td></tr>
                <tr><td style="color:#888;">Delay</td><td style="font-weight:600;color:${delayColor};">${train.delayMinutes > 0 ? '+' + train.delayMinutes + ' min' : 'On Time'}</td></tr>
                <tr><td style="color:#888;">Block</td><td style="font-weight:600;">${train.blockSection}</td></tr>
                <tr><td style="color:#888;">Status</td><td style="font-weight:600;">${train.status === 'AT_STATION' ? '🛑 At Station' : '🚂 Running'}</td></tr>
                ${nextEta ? `
                  <tr><td colspan="2" style="padding-top:6px;border-top:1px solid #eee;"></td></tr>
                  <tr><td style="color:#888;">Next Station</td><td style="font-weight:600;">${nextEta.stationName}</td></tr>
                  <tr><td style="color:#888;">ML ETA</td><td style="font-weight:600;">${nextEta.mlStr}</td></tr>
                  <tr><td style="color:#888;">Confidence</td><td style="font-weight:600;">${nextEta.confidencePercent}% ±${nextEta.uncertainty}m</td></tr>
                  <tr><td style="color:#888;">Platform</td><td style="font-weight:600;">PF ${nextEta.platform || '—'}</td></tr>
                ` : ''}
              </table>
            </div>
          `;
          marker.bindPopup(popupHtml, { maxWidth: 280 }).openPopup();
        });

        trainMarkersRef.current[train.trainNumber] = marker;
      }
    });
  }

  // ── Update Signal Markers ───────────────────────────────────
  function updateSignalMarkers(map, state) {
    state.signals.forEach(sig => {
      const color = SIGNAL_COLORS[sig.aspect] || SIGNAL_COLORS.GREEN;
      const glowColor = sig.aspect === 'RED' ? '#ef444488' : sig.aspect === 'YELLOW' ? '#eab30888' : '#10b98144';

      if (signalMarkersRef.current[sig.id]) {
        signalMarkersRef.current[sig.id].setIcon(
          L.divIcon({
            className: '',
            html: `<div style="width:10px;height:10px;background:${color};border-radius:50%;border:1.5px solid #fff;box-shadow:0 0 8px ${glowColor};"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          })
        );
      } else {
        const marker = L.marker([sig.lat, sig.lng], {
          icon: L.divIcon({
            className: '',
            html: `<div style="width:10px;height:10px;background:${color};border-radius:50%;border:1.5px solid #fff;box-shadow:0 0 8px ${glowColor};"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          }),
          zIndexOffset: 500,
        }).addTo(map);

        marker.bindTooltip(`${sig.id} (km ${sig.km})`, {
          direction: 'top',
          offset: [0, -8],
          opacity: 0.9,
        });

        signalMarkersRef.current[sig.id] = marker;
      }
    });
  }

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

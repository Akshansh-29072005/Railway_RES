import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STATIONS, TRACK_PATH, MINERAL_CORRIDOR_PATH, BYPASS_PATH, SOUTHERN_LOOPS_PATH, BHILAI_YARD_PATHS, RESTRICTIONS } from '../data/corridorData';
import { ALL_MAIN_TRACKS, ALL_YARD_TRACKS } from '../data/allTracksData';

const MapComponent = ({ onPredictionUpdate }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trainMarkersRef = useRef({});
  const signalMarkersRef = useRef({});
  const blockPolylinesRef = useRef({});
  const tsrPolylinesRef = useRef({});
  const incidentMarkersRef = useRef({});

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // ── Initialize Map ──────────────────────────────────────
    const map = L.map(mapRef.current, {
      center: [21.256, 81.628], // Raipur Junction
      zoom: 15,
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

  // ── WebSocket Connection & Real-time Updates ─────────────────
  useEffect(() => {
    // Small delay to ensure mapInstanceRef is set before WS connects
    const connectWS = () => {
      if (!mapInstanceRef.current) {
        setTimeout(connectWS, 100);
        return;
      }

      const map = mapInstanceRef.current;
      const ws = new WebSocket('ws://localhost:8080/ws');

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Update Trains
          data.trains?.forEach(train => {
            if (!trainMarkersRef.current[train.id]) {
              const icon = L.divIcon({
                className: '',
                html: `<div style="background:#3b82f6;border:2px solid #fff;border-radius:50%;width:12px;height:12px;box-shadow:0 0 10px #3b82f6; transition: all 0.3s ease;"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              });
              const marker = L.marker(train.pos, { icon }).addTo(map);
              marker.bindTooltip(`<b>Train ${train.id}</b><br/>Speed: ${train.speed} km/h`, { direction: 'top', offset: [0, -10] });
              trainMarkersRef.current[train.id] = marker;
            } else {
              trainMarkersRef.current[train.id].setLatLng(train.pos);
              trainMarkersRef.current[train.id].setTooltipContent(`<b>Train ${train.id}</b><br/>Speed: ${train.speed} km/h`);
            }
          });

          // Update Signals
          data.signals?.forEach(signal => {
            const color = signal.aspect === 'Green' ? '#10b981' : '#ef4444';
            const iconHtml = `<div style="background:${color};border:2px solid #fff;border-radius:50%;width:14px;height:14px;box-shadow:0 0 10px ${color};"></div>`;
            
            if (!signalMarkersRef.current[signal.id]) {
              const icon = L.divIcon({ className: '', html: iconHtml, iconSize: [18, 18], iconAnchor: [9, 9] });
              const marker = L.marker(signal.pos, { icon }).addTo(map);
              marker.bindTooltip(`<b>Signal ${signal.id}</b><br/>Aspect: ${signal.aspect}`, { direction: 'right', offset: [10, 0] });
              signalMarkersRef.current[signal.id] = marker;
            } else {
              const icon = L.divIcon({ className: '', html: iconHtml, iconSize: [18, 18], iconAnchor: [9, 9] });
              signalMarkersRef.current[signal.id].setIcon(icon);
              signalMarkersRef.current[signal.id].setTooltipContent(`<b>Signal ${signal.id}</b><br/>Aspect: ${signal.aspect}`);
            }
          });

          // Glowing Blocks (Dummy paths for demo)
          const blockPaths = {
            'BLK-A1': [[21.256, 81.628], [21.257, 81.629], [21.258, 81.630]],
            'BLK-A2': [[21.258, 81.630], [21.259, 81.631]],
            'BLK-B1': [[21.258, 81.632], [21.257, 81.631], [21.256, 81.630]],
          };

          data.blocks?.forEach(block => {
            if (!blockPolylinesRef.current[block.id] && blockPaths[block.id]) {
              const polyline = L.polyline(blockPaths[block.id], {
                color: 'transparent',
                weight: 6,
              }).addTo(map);
              blockPolylinesRef.current[block.id] = polyline;
            }
            
            if (blockPolylinesRef.current[block.id]) {
              if (block.occupied) {
                 blockPolylinesRef.current[block.id].setStyle({
                   color: '#06b6d4',
                   opacity: 0.9,
                   weight: 8,
                   className: 'glowing-path'
                 });
              } else {
                 blockPolylinesRef.current[block.id].setStyle({
                   color: 'transparent'
                 });
              }
            }
          });

          // Dynamic TSRs
          data.tsrs?.forEach(tsr => {
            if (!tsrPolylinesRef.current[tsr.id]) {
              const polyline = L.polyline(tsr.path, {
                color: '#f59e0b',
                weight: 8,
                opacity: 0.9,
                dashArray: '10, 10',
                className: 'glowing-path'
              }).addTo(map);
              
              const marker = L.marker(tsr.path[0], {
                icon: L.divIcon({
                  className: '',
                  html: `<div style="background:#f59e0b;color:#000;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;white-space:nowrap;box-shadow:0 0 10px #f59e0b; border:1px solid #fff;">${tsr.speedLimit} km/h - ${tsr.reason}</div>`,
                  iconSize: [120, 20],
                  iconAnchor: [60, 25],
                }),
              }).addTo(map);

              tsrPolylinesRef.current[tsr.id] = { polyline, marker };
            }
          });

          // Dynamic Incidents
          data.incidents?.forEach(inc => {
            if (!incidentMarkersRef.current[inc.id]) {
              const marker = L.marker(inc.pos, {
                icon: L.divIcon({
                  className: '',
                  html: `<div style="background:#ef4444;color:#fff;font-size:14px;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;box-shadow:0 0 15px #ef4444;animation:pulse 1.5s infinite;">🚨</div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                }),
              }).addTo(map);
              marker.bindTooltip(`<b>${inc.type}</b><br/>Status: ${inc.status}`, { direction: 'top', offset: [0, -15], permanent: true });
              incidentMarkersRef.current[inc.id] = marker;
            }
          });

          // Pass ML Prediction to parent
          if (data.mlPrediction && onPredictionUpdate) {
            onPredictionUpdate(data.mlPrediction);
          }

        } catch(e) { console.error('WS Data error', e); }
      };
      
      return ws;
    };

    let wsInstance = connectWS();

    return () => {
      if (wsInstance && wsInstance.close) wsInstance.close();
    };
  }, []);


  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        .glowing-path {
          filter: drop-shadow(0 0 10px #06b6d4);
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

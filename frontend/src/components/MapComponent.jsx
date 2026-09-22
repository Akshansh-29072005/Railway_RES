import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STATIONS, TRACK_PATH, MINERAL_CORRIDOR_PATH, BYPASS_PATH, SOUTHERN_LOOPS_PATH, BHILAI_YARD_PATHS, RESTRICTIONS, CORRIDOR_BLOCKS, interpolatePosition, getTrackSegment } from '../data/corridorData';
import { ALL_MAIN_TRACKS, ALL_YARD_TRACKS } from '../data/allTracksData';
import { getSimulator } from '../services/telemetrySimulator';

// Signal aspect colors
const SIGNAL_COLORS = {
  GREEN: '#10b981',
  YELLOW: '#eab308',
  DOUBLE_YELLOW: '#f59e0b',
  RED: '#ef4444'
};

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trainMarkersRef = useRef({});
  const signalMarkersRef = useRef({});
  const blockPolylinesRef = useRef({});

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // ── Initialize Map ──────────────────────────────────────
    const raipurBounds = L.latLngBounds(
      [21.240, 81.590], // Southwest (near Saraswati Nagar/Bhilai approach)
      [21.300, 81.650]  // Northeast (near Urkura)
    );

    const map = L.map(mapRef.current, {
      center: [21.2560, 81.6289], // Raipur Jn
      zoom: 14,
      minZoom: 13,
      maxZoom: 22,
      maxBounds: raipurBounds,
      maxBoundsViscosity: 1.0,
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark satellite tile layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 22,
      maxNativeZoom: 19,
    }).addTo(map);

    // ── Draw Track Polylines ─────────────────────────────────
    L.polyline(TRACK_PATH, {
      color: 'transparent',
      weight: 1,
    }).addTo(map);

    if (ALL_MAIN_TRACKS && ALL_MAIN_TRACKS.length > 0) {
      ALL_MAIN_TRACKS.forEach(track => {
        L.polyline(track, {
          color: '#ffcba4', 
          weight: 2,
          opacity: 0.8,
        }).addTo(map);
      });
    }

    if (ALL_YARD_TRACKS && ALL_YARD_TRACKS.length > 0) {
      ALL_YARD_TRACKS.forEach(track => {
        L.polyline(track, {
          color: '#fff44f',
          weight: 1.2,
          opacity: 0.6,
        }).addTo(map);
      });
    }

    // ── Draw PSRs (Permanent Speed Restrictions) ───────────────
    RESTRICTIONS.forEach(psr => {
      if (psr.type === 'PSR') {
        const segmentPts = getTrackSegment(psr.fromKm, psr.toKm);
        // Draw a thick orange line for the PSR
        const psrLine = L.polyline(segmentPts, {
          color: '#f97316', // Orange
          weight: 6,
          opacity: 0.8,
          dashArray: '5, 5'
        }).addTo(map);

        // Add a tooltip to the PSR line
        psrLine.bindTooltip(`<b>${psr.id}</b><br/>Speed Limit: ${psr.speedLimit} KMPH<br/>Reason: ${psr.reason}`, {
          direction: 'top',
          sticky: true,
          className: 'psr-tooltip'
        });
      }
    });

    // ── Draw Block Sections (Static Boundaries) ────────────────
    CORRIDOR_BLOCKS.forEach(block => {
      const segmentPts = getTrackSegment(block.startKm, block.endKm);
      const blockLine = L.polyline(segmentPts, {
        color: '#6366f1', // Indigo outline
        weight: 10,
        opacity: 0.4,
      }).addTo(map);
      
      blockLine.bindTooltip(`<b>${block.id}</b><br/>${block.name}<br/>${block.fromStation} to ${block.toStation}`, {
        direction: 'center',
        sticky: true,
      });
    });

    // ── Draw Station Markers ────────────────────────────────
    STATIONS.forEach(station => {
      const isJunction = station.isJunction;
      const size = isJunction ? 14 : 10;
      const borderColor = isJunction ? '#f59e0b' : '#ffffff';

      L.circleMarker([station.lat, station.lng], {
        radius: size / 2,
        color: borderColor,
        fillColor: '#1e293b',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);

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
      updateBlocks(map, state);
    });

    return () => {
      unsubscribe();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      trainMarkersRef.current = {};
      signalMarkersRef.current = {};
      blockPolylinesRef.current = {};
    };
  }, []); // End of useEffect

  // ── Update Blocks ───────────────────────────────────────────
  function updateBlocks(map, state) {
    if (!state.blocks) return;
    state.blocks.forEach(blk => {
      let isUnderMaintenance = false;
      if (state.activeMaintenance) {
         isUnderMaintenance = state.activeMaintenance.some(m => m.section_block === blk.id);
      }
      
      let color = blk.state === 'OCCUPIED' ? '#ef4444' : '#a855f7';
      if (isUnderMaintenance) {
         color = '#f97316'; // Flashing Orange/Warning for maintenance
      }
      
      if (blockPolylinesRef.current[blk.id]) {
        blockPolylinesRef.current[blk.id].setStyle({ color });
      } else {
        const startFrac = (blk.startKm - 828.687) / (960.309 - 828.687);
        const endFrac = (blk.endKm - 828.687) / (960.309 - 828.687);
        const startIdx = Math.floor(startFrac * (TRACK_PATH.length - 1));
        const endIdx = Math.ceil(endFrac * (TRACK_PATH.length - 1));
        
        const segment = TRACK_PATH.slice(
          Math.max(0, startIdx),
          Math.min(TRACK_PATH.length, endIdx + 1)
        );
        
        if (segment.length >= 2) {
          const polyline = L.polyline(segment, {
            color: color,
            weight: 8,
            opacity: 0.6,
          }).addTo(map);
          blockPolylinesRef.current[blk.id] = polyline;
        }
      }
    });
  }

  // ── Update Train Markers ────────────────────────────────────
  function updateTrainMarkers(map, state) {
    const activeTrains = state.trains.filter(t => t.status === 'RUNNING');

    // Remove old
    Object.keys(trainMarkersRef.current).forEach(tn => {
      if (!activeTrains.find(t => t.trainNumber === tn)) {
        map.removeLayer(trainMarkersRef.current[tn]);
        delete trainMarkersRef.current[tn];
      }
    });

    // Update new
    activeTrains.forEach(train => {
      if (!train.currentLat || isNaN(train.currentLat) || train.currentLat === 0) return;
      const html = `
        <div style="position:relative;cursor:pointer;" title="${train.trainNumber}">
          <div style="
            width: 16px; height: 16px;
            background: ${train.color};
            border: 2px solid #fff;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 8px; font-weight: bold; color: #fff;
            box-shadow: 0 0 12px ${train.color};
          "></div>
        </div>
      `;

      const [h, m] = train.scheduledTime ? train.scheduledTime.split(":").map(Number) : [0,0];
      const date = new Date();
      date.setHours(h, m, 0, 0);
      date.setMinutes(date.getMinutes() + Math.round(train.delayMinutes));
      const eta = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

      const popupContent = `
        <div style="font-family: sans-serif; color: #333;">
          <h4 style="margin: 0 0 4px 0; color: ${train.color}">${train.trainName}</h4>
          <p style="margin: 2px 0;"><strong>Train No:</strong> ${train.trainNumber}</p>
          <p style="margin: 2px 0;"><strong>Speed:</strong> ${train.currentSpeed || 0} km/h</p>
          <p style="margin: 2px 0;"><strong>Scheduled Time:</strong> ${train.scheduledTime || 'N/A'}</p>
          <p style="margin: 2px 0;"><strong>Predicted ETA:</strong> ${eta}</p>
          <p style="margin: 2px 0;"><strong>Delay:</strong> ${Math.round(train.delayMinutes)} mins</p>
          <p style="margin: 2px 0; color: #ef4444;"><strong>Status:</strong> ${train.delayMinutes > 0 ? 'Delayed due to Maintenance' : 'On Time'}</p>
        </div>
      `;

      if (trainMarkersRef.current[train.trainNumber]) {
        trainMarkersRef.current[train.trainNumber].setLatLng([train.currentLat, train.currentLng]);
      } else {
        const marker = L.marker([train.currentLat, train.currentLng], {
          icon: L.divIcon({ className: '', html, iconSize: [16, 16], iconAnchor: [8, 8] }),
          zIndexOffset: 1000,
        }).addTo(map);

        marker.bindPopup(popupContent);
        
        trainMarkersRef.current[train.trainNumber] = marker;
      }
      
      // Update popup content continuously if open
      if (trainMarkersRef.current[train.trainNumber].isPopupOpen()) {
        trainMarkersRef.current[train.trainNumber].getPopup().setContent(popupContent);
      }
    });
  }

  // ── Update Signal Markers ───────────────────────────────────
  function updateSignalMarkers(map, state) {
    state.signals.forEach(sig => {
      if (!sig.lat || isNaN(sig.lat) || sig.lat === 0) return;

      const color = SIGNAL_COLORS[sig.aspect] || SIGNAL_COLORS.GREEN;
      const glowColor = sig.aspect === 'RED' ? '#ef444488' : sig.aspect === 'YELLOW' ? '#eab30888' : '#10b98144';

      const html = `<div style="width:12px;height:12px;background:${color};border-radius:50%;border:2px solid #fff;box-shadow:0 0 12px ${glowColor};"></div>`;

      if (signalMarkersRef.current[sig.id]) {
        signalMarkersRef.current[sig.id].setIcon(
          L.divIcon({ className: '', html, iconSize: [12, 12], iconAnchor: [6, 6] })
        );
      } else {
        const marker = L.marker([sig.lat, sig.lng], {
          icon: L.divIcon({ className: '', html, iconSize: [12, 12], iconAnchor: [6, 6] }),
          zIndexOffset: 500,
        }).addTo(map);

        marker.bindTooltip(`<b>${sig.name}</b><br>ID: ${sig.id}<br>Chainage: ${sig.chainage}<br>KM: ${sig.km.toFixed(3)}<br>Type: ${sig.type}`, {
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

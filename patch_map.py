with open('frontend/src/components/MapComponent.jsx', 'r') as f:
    content = f.read()

# Add getSimulator import
import_str = "import { getSimulator } from '../services/telemetrySimulator';\n"
if "getSimulator" not in content:
    content = content.replace("import { ALL_MAIN_TRACKS, ALL_YARD_TRACKS } from '../data/allTracksData';", 
                              "import { ALL_MAIN_TRACKS, ALL_YARD_TRACKS } from '../data/allTracksData';\n" + import_str)

# Add signal colors
signal_colors = """
// Signal aspect colors
const SIGNAL_COLORS = {
  GREEN: '#10b981',
  YELLOW: '#eab308',
  DOUBLE_YELLOW: '#f59e0b',
  RED: '#ef4444'
};
"""
if "SIGNAL_COLORS" not in content:
    content = content.replace("const MapComponent", signal_colors + "\nconst MapComponent")

# Add refs
refs = """  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trainMarkersRef = useRef({});
  const signalMarkersRef = useRef({});"""
content = content.replace("  const mapRef = useRef(null);\n  const mapInstanceRef = useRef(null);", refs)

# Add subscription and rendering logic
logic = """
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
      if (train.currentLat === 0 && train.currentLng === 0) return;
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

      if (trainMarkersRef.current[train.trainNumber]) {
        trainMarkersRef.current[train.trainNumber].setLatLng([train.currentLat, train.currentLng]);
      } else {
        const marker = L.marker([train.currentLat, train.currentLng], {
          icon: L.divIcon({ className: '', html, iconSize: [16, 16], iconAnchor: [8, 8] }),
          zIndexOffset: 1000,
        }).addTo(map);
        trainMarkersRef.current[train.trainNumber] = marker;
      }
    });
  }

  // ── Update Signal Markers ───────────────────────────────────
  function updateSignalMarkers(map, state) {
    state.signals.forEach(sig => {
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
"""

content = content.replace("""    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);""", logic)

with open('frontend/src/components/MapComponent.jsx', 'w') as f:
    f.write(content)
print("Patched MapComponent.jsx")

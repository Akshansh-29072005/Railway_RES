import re

with open('frontend/src/components/MapComponent.jsx', 'r') as f:
    content = f.read()

# 1. Add blockPolylinesRef
if "blockPolylinesRef" not in content:
    content = content.replace("const signalMarkersRef = useRef({});", "const signalMarkersRef = useRef({});\n  const blockPolylinesRef = useRef({});")

# 2. Add updateBlocks call
if "updateBlocks(map, state);" not in content:
    content = content.replace("updateSignalMarkers(map, state);", "updateSignalMarkers(map, state);\n      updateBlocks(map, state);")

# 3. Add updateBlocks function definition and safe NaN checks for markers
blocks_func = """
  // ── Update Blocks ───────────────────────────────────────────
  function updateBlocks(map, state) {
    if (!state.blocks) return;
    state.blocks.forEach(blk => {
      const color = blk.state === 'OCCUPIED' ? '#ef4444' : '#a855f7';
      const glow = blk.state === 'OCCUPIED' ? 'drop-shadow(0 0 8px #ef4444)' : 'drop-shadow(0 0 5px #a855f7)';

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
            weight: 12,
            opacity: 0.6,
          }).addTo(map);
          blockPolylinesRef.current[blk.id] = polyline;
        }
      }
    });
  }
"""

if "function updateBlocks" not in content:
    content = content.replace("  return (", blocks_func + "\n  return (")

# 4. Safe NaN checks inside markers
content = content.replace("if (train.currentLat === 0 && train.currentLng === 0) return;", "if (!train.currentLat || isNaN(train.currentLat) || train.currentLat === 0) return;")

content = content.replace("state.signals.forEach(sig => {", "state.signals.forEach(sig => {\n      if (!sig.lat || isNaN(sig.lat) || sig.lat === 0) return;")

# Fix early return if the end of the file is broken from last time
# I noticed `return ` was cut off at the end of the view earlier! Let me fix the end of MapComponent!
if "return \n" in content[-15:]:
    content = content.replace("return \n", "return (\n    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>\n      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />\n    </div>\n  );\n};\nexport default MapComponent;")

with open('frontend/src/components/MapComponent.jsx', 'w') as f:
    f.write(content)

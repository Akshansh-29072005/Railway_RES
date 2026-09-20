with open('frontend/src/components/VisualizeMap.jsx', 'r') as f:
    content = f.read()

# I will just write a new clean file for VisualizeMap.jsx since there's a lot of old junk at the bottom.
clean = """import React from 'react';
import MapComponent from './MapComponent';

export default function VisualizeMap() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 144px)', width: '100%', background: '#0f172a', color: '#f8fafc', overflow: 'hidden' }}>
      {/* ── TOP CONTROL BAR ─────────────────────────────────── */}
      <div style={{ height: '48px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            padding: '5px 12px', borderRadius: '6px',
            fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <span>🎛️</span> Network Map
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
          <span style={{ color: '#64748b' }}>Corridor:</span>
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>SECR R → DURG</span>
        </div>
      </div>

      {/* ── MAP AREA ────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapComponent />
      </div>
    </div>
  );
}
"""
with open('frontend/src/components/VisualizeMap.jsx', 'w') as f:
    f.write(clean)
print("Done")

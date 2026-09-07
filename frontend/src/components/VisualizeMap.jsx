import React, { Component } from 'react';
import MapComponent from './MapComponent';
import { Layers, MapPin, Activity, Navigation } from 'lucide-react';
import '../MapStyles.css';

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Map Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ef4444', background: '#0f172a', height: '100%' }}>
          <h2>Map rendering error occurred:</h2>
          <pre style={{ color: '#f8fafc', marginTop: '10px' }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function VisualizeMap() {
  return (
    <MapErrorBoundary>
      <div className="app-container" style={{ display: 'flex', height: 'calc(100vh - 144px)', width: '100%', background: '#0f172a', color: '#f8fafc', overflow: 'hidden' }}>
        {/* Sidebar UI */}
        <aside className="sidebar" style={{ width: '320px', background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', padding: '24px', boxShadow: '4px 0 15px rgba(0,0,0,0.2)', zIndex: 10, flexShrink: 0 }}>
          <div className="sidebar-header" style={{ marginBottom: '24px' }}>
            <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Navigation className="logo-icon" style={{ color: '#3b82f6', width: '28px', height: '28px' }} />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.5px' }}>Satellite Track</h1>
            </div>
            <p className="subtitle" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Real-time track alignment mapping</p>
          </div>

          <div className="stats-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <Activity className="stat-icon" style={{ color: '#3b82f6', width: '22px', height: '22px' }} />
              <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="stat-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 600 }}>Track Status</span>
                <span className="stat-value text-green" style={{ fontSize: '0.95rem', fontWeight: 500, color: '#10b981' }}>Active</span>
              </div>
            </div>
            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <Layers className="stat-icon" style={{ color: '#3b82f6', width: '22px', height: '22px' }} />
              <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="stat-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 600 }}>Map Layer</span>
                <span className="stat-value" style={{ fontSize: '0.95rem', fontWeight: 500 }}>Esri Satellite</span>
              </div>
            </div>
            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <MapPin className="stat-icon" style={{ color: '#3b82f6', width: '22px', height: '22px' }} />
              <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="stat-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 600 }}>Data Source</span>
                <span className="stat-value" style={{ fontSize: '0.95rem', fontWeight: 500 }}>GeoJSON Export</span>
              </div>
            </div>
          </div>

          <div className="info-panel" style={{ marginTop: 'auto', background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>Track Visualization</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '12px' }}>
              The map displays high-resolution satellite imagery with overlaid track paths. 
            </p>
            <div className="legend">
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', marginBottom: '6px' }}>
                <div className="legend-line" style={{ width: '36px', height: '4px', background: '#ef4444', position: 'relative' }}></div>
                <span>Bilaspur - Raipur - Durg</span>
              </div>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', marginBottom: '6px' }}>
                <div className="legend-line" style={{ width: '36px', height: '4px', background: '#3b82f6', position: 'relative' }}></div>
                <span>Durg - Dalli Rajhara - Taroki</span>
              </div>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', marginBottom: '6px' }}>
                <div className="legend-line" style={{ width: '36px', height: '4px', background: '#10b981', position: 'relative' }}></div>
                <span>Raipur - Lakholi</span>
              </div>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
                <div className="legend-line" style={{ width: '36px', height: '4px', background: '#f97316', position: 'relative' }}></div>
                <span>Kendri - Dhamtari / Rajim</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Map Area */}
        <main className="main-content" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="top-bar" style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, pointerEvents: 'none' }}>
            <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#1e293b', padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', width: '280px', pointerEvents: 'auto' }}>
              <input type="text" placeholder="Search locations..." style={{ background: 'transparent', border: 'none', color: '#f8fafc', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
            </div>
            <button className="btn-primary" style={{ background: '#3b82f6', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', pointerEvents: 'auto' }}>Export View</button>
          </div>
          <MapComponent />
        </main>
      </div>
    </MapErrorBoundary>
  );
}

import React, { useState, useEffect } from 'react';
import { STATIONS, SIGNALS } from '../data/corridorData';
import { getSimulator } from '../services/telemetrySimulator';

const ControlRoomView = () => {
  const [simState, setSimState] = useState({
    simTimeStr: '00:00:00',
    trains: [],
    signals: {},
    restrictions: [],
    isPaused: false,
    speedMultiplier: 1
  });

  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const sim = getSimulator();
    
    // Fallback if getState() exists, otherwise wait for subscribe
    if (typeof sim.getState === 'function') {
      setSimState(sim.getState());
    }

    const handleUpdate = (state) => {
      setSimState(state);
    };

    const unsub = sim.subscribe(handleUpdate);
    
    return () => unsub();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sections = [
    { id: 'URK-WRC', label: 'URK → WRC' },
    { id: 'WRC-R', label: 'WRC → R' },
    { id: 'R-SRWN', label: 'R → SRWN' },
    { id: 'SRWN-SZB', label: 'SRWN → SZB' },
    { id: 'SZB-KOU', label: 'SZB → KOU' },
    { id: 'KOU-BFC', label: 'KOU → BFC' },
    { id: 'BFC-BPHB', label: 'BFC → BPHB' },
    { id: 'BPHB-BQR', label: 'BPHB → BQR' },
    { id: 'BQR-DURG', label: 'BQR → DURG' }
  ];

  const endpoints = [
    { method: 'POST', path: '/api/v2.4/control-room/section-occupancy', desc: 'Real-time block tracking', color: '#10b981' },
    { method: 'GET', path: '/api/v2.4/control-room/signal-aspect-feed', desc: 'Live ABS signal states', color: '#3b82f6' },
    { method: 'GET', path: '/api/v2.4/control-room/block-restriction-log', desc: 'TSR/PSR active list', color: '#3b82f6' },
    { method: 'WSS', path: '/api/v2.4/control-room/telemetry-stream', desc: 'Sub-second GPS feed', color: '#a855f7' }
  ];

  const getSignalColor = (aspect) => {
    switch(aspect) {
      case 'GREEN': return '#10b981';
      case 'YELLOW': return '#eab308';
      case 'DOUBLE_YELLOW': return '#f59e0b';
      case 'RED': return '#ef4444';
      default: return '#64748b';
    }
  };

  const allSignals = Object.values(simState.signals || {});

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100%', padding: '20px', fontFamily: 'sans-serif', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* TOP HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px 20px', borderRadius: '8px', border: '1px solid #334155' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0', letterSpacing: '1px' }}>
          SECR RAIPUR DIVISION — CONTROL ROOM OPERATIONS CONSOLE
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6', fontFamily: 'monospace' }}>
            {simState.simTimeStr}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: blink ? '#10b981' : '#047857', boxShadow: blink ? '0 0 8px #10b981' : 'none', transition: 'all 0.3s' }}></div>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: blink ? '#10b981' : '#047857' }}>LIVE</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        
        {/* LEFT PANEL — BLOCK SECTION OCCUPANCY MATRIX */}
        <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>BLOCK SECTION OCCUPANCY MATRIX</h2>
          <div style={{ overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>Section</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>Status</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>Train</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>Speed</th>
                </tr>
              </thead>
              <tbody>
                {sections.map(sec => {
                  const occupyingTrains = simState.trains.filter(t => t.blockSection === sec.id);
                  const isOccupied = occupyingTrains.length > 0;
                  return (
                    <tr key={sec.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '500', fontSize: '14px' }}>{sec.label}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ backgroundColor: isOccupied ? '#ef4444' : '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          {isOccupied ? 'OCCUPIED' : 'CLEAR'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', fontSize: '14px', fontFamily: 'monospace', color: isOccupied ? '#f8fafc' : '#64748b' }}>
                        {isOccupied ? occupyingTrains.map(t => t.trainNumber).join(', ') : '—'}
                      </td>
                      <td style={{ padding: '12px 10px', fontSize: '14px', color: isOccupied ? '#f8fafc' : '#64748b' }}>
                        {isOccupied ? occupyingTrains.map(t => `${Math.round(t.currentSpeed)} km/h`).join(', ') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL — SIGNAL ASPECT PANEL */}
        <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>LIVE SIGNAL ASPECT PANEL (ABS)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px', overflowY: 'auto', paddingRight: '5px' }}>
            {allSignals.length > 0 ? (
              allSignals.map(sig => (
                <div key={sig.id} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: getSignalColor(sig.aspect), boxShadow: `0 0 10px ${getSignalColor(sig.aspect)}` }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0' }}>{sig.id}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{sig.section || `${sig.km} km`}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', fontSize: '14px', padding: '10px 0' }}>No signals data available</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* BOTTOM LEFT — AVAILABLE API ENDPOINTS */}
        <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', padding: '20px' }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>CONTROL ROOM API ENDPOINTS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {endpoints.map((ep, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #334155' }}>
                <div style={{ backgroundColor: ep.color, color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', width: '45px', textAlign: 'center' }}>
                  {ep.method}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#e2e8f0' }}>{ep.path}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{ep.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM RIGHT — ACTIVE SPEED RESTRICTIONS */}
        <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', padding: '20px' }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>ACTIVE SPEED RESTRICTIONS (TSR/PSR)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '300px', paddingRight: '5px' }}>
            {simState.restrictions && simState.restrictions.length > 0 ? (
              simState.restrictions.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #334155', borderLeft: `4px solid ${r.type === 'TSR' ? '#f59e0b' : '#3b82f6'}` }}>
                  <span style={{ fontSize: '18px' }}>⚠️</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0' }}>{r.id} <span style={{ fontSize: '11px', backgroundColor: '#334155', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 'normal' }}>{r.type}</span></span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>{r.speedLimit} km/h</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{r.fromStation} – {r.toStation} ({r.startKm} to {r.endKm} km)</span>
                    <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Reason: {r.reason}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#10b981', fontSize: '14px', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                No active speed restrictions
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ControlRoomView;

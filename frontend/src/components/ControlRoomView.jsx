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
    <div className="bg-surface text-on-surface min-h-[calc(100vh-140px)] p-6 font-body-md flex flex-col gap-6">
      
      {/* TOP HEADER BAR */}
      <div className="flex justify-between items-center bg-surface-container px-6 py-4 rounded-xl border border-outline-variant/30 shadow-sm">
        <h1 className="m-0 text-lg font-bold text-primary tracking-wide">
          SECR RAIPUR DIVISION — CONTROL ROOM OPERATIONS CONSOLE
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-lg font-bold text-secondary font-mono">
            {simState.simTimeStr}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${blink ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-green-700'}`}></div>
            <span className={`text-sm font-bold ${blink ? 'text-green-600' : 'text-green-800'}`}>LIVE</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        
        {/* LEFT PANEL — BLOCK SECTION OCCUPANCY MATRIX */}
        <div className="flex-1 bg-surface-container-low rounded-xl border border-outline-variant/30 shadow-sm p-6 flex flex-col">
          <h2 className="m-0 mb-4 text-base font-bold text-primary border-b border-outline-variant/30 pb-3">BLOCK SECTION OCCUPANCY MATRIX</h2>
          <div className="overflow-y-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="p-3 border-b-2 border-outline-variant/30 text-on-surface-variant text-sm">Section</th>
                  <th className="p-3 border-b-2 border-outline-variant/30 text-on-surface-variant text-sm">Status</th>
                  <th className="p-3 border-b-2 border-outline-variant/30 text-on-surface-variant text-sm">Train</th>
                  <th className="p-3 border-b-2 border-outline-variant/30 text-on-surface-variant text-sm">Speed</th>
                </tr>
              </thead>
              <tbody>
                {sections.map(sec => {
                  const occupyingTrains = simState.trains.filter(t => t.blockSection === sec.id);
                  const isOccupied = occupyingTrains.length > 0;
                  return (
                    <tr key={sec.id} className="border-b border-outline-variant/20">
                      <td className="p-3 font-medium text-sm text-on-surface">{sec.label}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold text-white ${isOccupied ? 'bg-red-500' : 'bg-green-500'}`}>
                          {isOccupied ? 'OCCUPIED' : 'CLEAR'}
                        </span>
                      </td>
                      <td className={`p-3 text-sm font-mono ${isOccupied ? 'text-on-surface font-bold' : 'text-outline-variant'}`}>
                        {isOccupied ? occupyingTrains.map(t => t.trainNumber).join(', ') : '—'}
                      </td>
                      <td className={`p-3 text-sm ${isOccupied ? 'text-on-surface font-bold' : 'text-outline-variant'}`}>
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
        <div className="flex-1 bg-surface-container-low rounded-xl border border-outline-variant/30 shadow-sm p-6 flex flex-col">
          <h2 className="m-0 mb-4 text-base font-bold text-primary border-b border-outline-variant/30 pb-3">LIVE SIGNAL ASPECT PANEL (ABS)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-2">
            {allSignals.length > 0 ? (
              allSignals.map(sig => (
                <div key={sig.id} className="bg-surface border border-outline-variant/30 rounded-lg p-3 flex items-center gap-3">
                  <div style={{ backgroundColor: getSignalColor(sig.aspect), boxShadow: `0 0 10px ${getSignalColor(sig.aspect)}` }} className="w-5 h-5 rounded-full"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-on-surface">{sig.id}</span>
                    <span className="text-xs text-on-surface-variant">{sig.section || `${sig.km} km`}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-on-surface-variant text-sm py-2">No signals data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* BOTTOM LEFT — AVAILABLE API ENDPOINTS */}
        <div className="flex-1 bg-surface-container-low rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <h2 className="m-0 mb-4 text-base font-bold text-primary border-b border-outline-variant/30 pb-3">CONTROL ROOM API ENDPOINTS</h2>
          <div className="flex flex-col gap-3">
            {endpoints.map((ep, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-surface p-3 rounded-lg border border-outline-variant/30">
                <div style={{ backgroundColor: ep.color }} className="text-white text-xs font-bold px-2 py-1 rounded w-12 text-center">
                  {ep.method}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-sm text-on-surface font-semibold">{ep.path}</span>
                  <span className="text-xs text-on-surface-variant">{ep.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM RIGHT — ACTIVE SPEED RESTRICTIONS */}
        <div className="flex-1 bg-surface-container-low rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <h2 className="m-0 mb-4 text-base font-bold text-primary border-b border-outline-variant/30 pb-3">ACTIVE SPEED RESTRICTIONS (TSR/PSR)</h2>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
            {simState.restrictions && simState.restrictions.length > 0 ? (
              simState.restrictions.map(r => (
                <div key={r.id} className={`flex items-start gap-3 bg-surface p-3 rounded-lg border border-outline-variant/30 border-l-4 ${r.type === 'TSR' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                  <span className="text-lg">⚠️</span>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-on-surface">
                        {r.id} <span className="text-xs bg-surface-container px-2 py-0.5 rounded ml-2 font-normal text-on-surface-variant">{r.type}</span>
                      </span>
                      <span className="text-sm font-bold text-red-600">{r.speedLimit} km/h</span>
                    </div>
                    <span className="text-xs text-on-surface-variant">{r.fromStation} – {r.toStation} ({r.startKm} to {r.endKm} km)</span>
                    <span className="text-xs text-outline-variant italic">Reason: {r.reason}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-green-600 text-sm py-2 flex items-center gap-2 font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
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

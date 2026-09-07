import React, { useState, useEffect, useRef } from 'react';
import MapComponent from './MapComponent';
import { STATIONS, minsToTime, DELAY_REASONS } from '../data/corridorData';
import { getSimulator } from '../services/telemetrySimulator';

function getDelayColor(d) {
  if (d <= 0) return '#10b981';
  if (d <= 10) return '#eab308';
  if (d <= 20) return '#f97316';
  return '#ef4444';
}

function getDelayLabel(d) {
  if (d <= 0) return 'On Time';
  return `+${d} min`;
}

export default function VisualizeMap() {
  const [state, setState] = useState(null);
  const [mode, setMode] = useState('passenger'); // passenger | control | metrics | whatif
  const [drawerOpen, setDrawerOpen] = useState(true);
  // Disruption state
  const [disruptionStation, setDisruptionStation] = useState('SZB');
  const [targetTrain, setTargetTrain] = useState('ALL');
  const [disruptionAmount, setDisruptionAmount] = useState(30);
  const [disruptionUnit, setDisruptionUnit] = useState('sec');
  const [disruptionReason, setDisruptionReason] = useState('SIGNAL');
  const simRef = useRef(null);

  useEffect(() => {
    const sim = getSimulator();
    simRef.current = sim;
    sim.start();
    const unsub = sim.subscribe(s => setState(s));
    return () => unsub();
  }, []);

  const handleSpeedChange = (mult) => {
    if (simRef.current) simRef.current.setSpeed(mult);
  };

  const handleTogglePause = () => {
    if (simRef.current) simRef.current.togglePause();
  };

  const handleInjectDisruption = (preset = null) => {
    if (simRef.current) {
      if (preset) {
        simRef.current.injectDisruption(preset.stationCode, preset.trainNumber, preset.amount, preset.unit, preset.reason, preset.speedLimit);
      } else {
        // Form based
        const limitMap = { 'SIGNAL': 0, 'CONGESTION': 10, 'TSR': 20, 'CROSSING': 0 };
        const sLimit = limitMap[disruptionReason] ?? 0;
        simRef.current.injectDisruption(disruptionStation, targetTrain, disruptionAmount, disruptionUnit, disruptionReason, sLimit);
      }
    }
  };

  const handleClearDisruptions = () => {
    if (simRef.current) {
      simRef.current.clearDisruptions();
    }
  };

  const activeTrains = state?.trains?.filter(
    t => t.status === 'RUNNING' || t.status === 'AT_STATION'
  ) || [];

  const metrics = simRef.current?.getMetrics?.() || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 144px)', width: '100%', background: '#0f172a', color: '#f8fafc', overflow: 'hidden' }}>
      {/* ── TOP CONTROL BAR ─────────────────────────────────── */}
      <div style={{ height: '48px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[
            { id: 'passenger', icon: '👤', label: 'Passenger' },
            { id: 'control', icon: '🎛️', label: 'Control Room' },
            { id: 'metrics', icon: '📊', label: 'Model Metrics' },
            { id: 'whatif', icon: '🧪', label: 'What-If' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              background: mode === m.id ? '#3b82f6' : 'transparent',
              color: mode === m.id ? '#fff' : '#94a3b8',
              border: mode === m.id ? 'none' : '1px solid #334155',
              padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'all 0.2s',
            }}>
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
          <span style={{ color: '#64748b' }}>Corridor:</span>
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>SECR R → DURG</span>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ color: '#64748b' }}>Sim:</span>
          <span style={{ color: '#3b82f6', fontWeight: 700, fontFamily: 'monospace' }}>{state?.simTimeStr || '14:00'}</span>
          <span style={{ color: '#334155' }}>|</span>

          <button onClick={handleTogglePause} style={{
            background: state?.isPaused ? '#ef4444' : '#10b981', color: '#fff',
            border: 'none', padding: '3px 10px', borderRadius: '4px', cursor: 'pointer',
            fontSize: '11px', fontWeight: 600,
          }}>
            {state?.isPaused ? '⏸ Paused' : '▶ Live'}
          </button>

          {[1, 5, 10].map(s => (
            <button key={s} onClick={() => handleSpeedChange(s)} style={{
              background: state?.speedMultiplier === s ? '#3b82f6' : '#0f172a',
              color: state?.speedMultiplier === s ? '#fff' : '#94a3b8',
              border: '1px solid #334155', padding: '3px 8px', borderRadius: '4px',
              cursor: 'pointer', fontSize: '11px', fontWeight: 600,
            }}>
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* ── MAP AREA ────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapComponent />

        {/* Floating Legend */}
        <div style={{
          position: 'absolute', bottom: drawerOpen ? '280px' : '16px', right: '16px',
          background: 'rgba(15, 23, 42, 0.92)', border: '1px solid #334155',
          borderRadius: '10px', padding: '12px 16px', zIndex: 15, fontSize: '11px',
          backdropFilter: 'blur(8px)', transition: 'bottom 0.3s',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '6px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px' }}>Legend</div>
          {[
            { color: '#10b981', label: 'On Time' },
            { color: '#eab308', label: 'Delay < 10m' },
            { color: '#f97316', label: 'Delay 10-20m' },
            { color: '#ef4444', label: 'Delay > 20m' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <div style={{ width: '10px', height: '10px', background: l.color, borderRadius: '50%' }} />
              <span style={{ color: '#cbd5e1' }}>{l.label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #334155', marginTop: '6px', paddingTop: '6px' }}>
            {[
              { color: '#10b981', label: '🟢 Signal: Clear' },
              { color: '#eab308', label: '🟡 Signal: Caution' },
              { color: '#ef4444', label: '🔴 Signal: Stop' },
            ].map(l => (
              <div key={l.label} style={{ color: '#94a3b8', marginBottom: '2px' }}>{l.label}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DRAWER TOGGLE ───────────────────────────────────── */}
      <button onClick={() => setDrawerOpen(!drawerOpen)} style={{
        position: 'relative', zIndex: 20, width: '100%', height: '28px',
        background: '#1e293b', border: 'none', borderTop: '1px solid #334155',
        color: '#64748b', cursor: 'pointer', fontSize: '11px', fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        flexShrink: 0,
      }}>
        {drawerOpen ? '▼ Hide Analytics' : '▲ Show Analytics'} — {mode === 'passenger' ? 'Passenger Train List' : mode === 'control' ? 'Time-Distance View' : mode === 'metrics' ? 'ML Model Metrics' : 'What-If Simulator'}
      </button>

      {/* ── BOTTOM ANALYTICS DRAWER ─────────────────────────── */}
      {drawerOpen && (
        <div style={{
          height: '250px', background: '#0f172a', borderTop: '1px solid #334155',
          overflow: 'auto', padding: '12px 20px', flexShrink: 0,
        }}>
          {/* ─── PASSENGER VIEW ─────────────────────────────── */}
          {mode === 'passenger' && (
            <div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {activeTrains.length === 0 && (
                  <div style={{ color: '#64748b', fontSize: '13px', padding: '20px' }}>
                    No active trains yet. Simulation starting at {state?.simTimeStr || '14:00'}...
                  </div>
                )}
                {activeTrains.map(train => {
                  const nextEta = Object.values(train.etas)[0];
                  return (
                    <div key={train.trainNumber} style={{
                      background: '#1e293b', border: '1px solid #334155', borderRadius: '10px',
                      padding: '10px 14px', minWidth: '220px', maxWidth: '280px', flex: '1 1 220px',
                      borderLeft: `4px solid ${train.color}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: train.color }}>{train.trainNumber}</span>
                          <span style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '6px' }}>{train.trainName}</span>
                        </div>
                        <span style={{
                          background: getDelayColor(train.delayMinutes) + '22',
                          color: getDelayColor(train.delayMinutes),
                          padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                        }}>
                          {getDelayLabel(train.delayMinutes)}
                        </span>
                      </div>
                      {nextEta && (
                        <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span>Next: <strong>{nextEta.stationName}</strong></span>
                            <span>ETA <strong style={{ color: '#3b82f6' }}>{nextEta.mlStr}</strong></span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>PF <strong>{nextEta.platform || '—'}</strong></span>
                            <span style={{ color: '#10b981' }}>{nextEta.confidencePercent}% ±{nextEta.uncertainty}m</span>
                          </div>
                          <div style={{ color: '#64748b', fontSize: '10px', marginTop: '4px' }}>
                            {nextEta.reason}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── CONTROL VIEW (Time-Distance Summary) ──────── */}
          {mode === 'control' && (
            <div>
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>Train</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>Direction</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>Km</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>Speed</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>Block</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>Delay</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(state?.trains || []).filter(t => t.status !== 'NOT_STARTED' && t.status !== 'COMPLETED').map(t => (
                    <tr key={t.trainNumber} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '6px 8px' }}>
                        <span style={{ color: t.color, fontWeight: 700 }}>{t.trainNumber}</span>
                        <span style={{ color: '#94a3b8', marginLeft: '6px' }}>{t.trainName}</span>
                      </td>
                      <td style={{ padding: '6px 8px', color: '#94a3b8' }}>{t.direction === 'DN' ? 'R→DURG' : 'DURG→R'}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#cbd5e1' }}>{t.currentKm.toFixed(1)}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#3b82f6' }}>{Math.round(t.currentSpeed)} km/h</td>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#94a3b8' }}>{t.blockSection}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: getDelayColor(t.delayMinutes) }}>
                        {t.delayMinutes > 0 ? `+${t.delayMinutes}m` : 'OT'}
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <span style={{
                          background: t.status === 'AT_STATION' ? '#f59e0b22' : '#10b98122',
                          color: t.status === 'AT_STATION' ? '#f59e0b' : '#10b981',
                          padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                        }}>
                          {t.status === 'AT_STATION' ? '🛑 Halted' : '🚂 Running'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── CONTROL ROOM MODE ─────────────────────────── */}
          {mode === 'control' && (
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '13px', color: '#f59e0b' }}>
                🎛️ Dispatcher Telemetry & Delay Reason Feed
              </h3>
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '4px 8px' }}>Train</th>
                    <th style={{ padding: '4px 8px' }}>Name</th>
                    <th style={{ padding: '4px 8px' }}>Block Section</th>
                    <th style={{ padding: '4px 8px' }}>Speed</th>
                    <th style={{ padding: '4px 8px' }}>Delay</th>
                    <th style={{ padding: '4px 8px' }}>Reason</th>
                    <th style={{ padding: '4px 8px' }}>Next Station ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTrains.map(t => {
                    const nextEta = Object.values(t.etas)[0];
                    return (
                      <tr key={t.trainNumber} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '4px 8px', fontWeight: 700, color: t.color }}>{t.trainNumber}</td>
                        <td style={{ padding: '4px 8px' }}>{t.trainName}</td>
                        <td style={{ padding: '4px 8px', color: '#38bdf8' }}>{t.blockSection}</td>
                        <td style={{ padding: '4px 8px', color: t.currentSpeed === 0 ? '#ef4444' : '#f8fafc', fontWeight: t.currentSpeed === 0 ? 700 : 400 }}>
                          {Math.round(t.currentSpeed)} km/h {t.currentSpeed === 0 ? '⚠️ STOPPED' : ''}
                        </td>
                        <td style={{ padding: '4px 8px', color: getDelayColor(t.delayMinutes), fontWeight: 700 }}>
                          {t.delayMinutes > 0 ? `+${t.delayMinutes.toFixed(1)}m` : 'OT'}
                        </td>
                        <td style={{ padding: '4px 8px', color: '#f59e0b' }}>{nextEta?.reason || t.delayReason}</td>
                        <td style={{ padding: '4px 8px', color: '#10b981' }}>
                          {nextEta ? `${nextEta.stationCode}: ${nextEta.mlStr} (±${nextEta.uncertainty}m)` : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── MODEL METRICS MODE ────────────────────────── */}
          {mode === 'metrics' && (
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '13px', color: '#10b981' }}>
                📊 ML Prediction Telemetry & Accuracy Metrics
              </h3>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                <div style={{ background: '#1e293b', padding: '10px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>MEAN ABSOLUTE ERROR (MAE)</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{metrics.mae || 1.8} min</div>
                </div>
                <div style={{ background: '#1e293b', padding: '10px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>MEDIAN ABSOLUTE ERROR (MdAE)</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8' }}>{metrics.mdae || 1.2} min</div>
                </div>
                <div style={{ background: '#1e293b', padding: '10px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>ACCURACY WITHIN ±5 MIN</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>{metrics.within5 || 92}%</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── WHAT-IF DISRUPTION ENGINE ─────────────────── */}
          {mode === 'whatif' && (
            <div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* INJECTION FORM */}
                <div style={{ flex: '0 0 380px', background: '#1e293b', borderRadius: '10px', padding: '12px 14px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '13px', color: '#f59e0b', fontWeight: 700 }}>🧪 Inject Disruption</h3>
                    <button onClick={handleClearDisruptions} style={{
                      background: '#334155', color: '#cbd5e1', border: 'none', padding: '3px 8px', borderRadius: '4px',
                      fontSize: '10px', cursor: 'pointer', fontWeight: 600
                    }}>
                      🔄 Reset Disruptions
                    </button>
                  </div>

                  {/* PRESET BUTTONS */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleInjectDisruption({ stationCode: 'WRC', trainNumber: 'ALL', amount: 30, unit: 'sec', reason: 'SIGNAL', speedLimit: 0 })} style={{
                      background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, cursor: 'pointer'
                    }}>
                      ⚡ +30s Signal Halt at WRC
                    </button>
                    <button onClick={() => handleInjectDisruption({ stationCode: 'SRWN', trainNumber: 'ALL', amount: 45, unit: 'sec', reason: 'CONGESTION', speedLimit: 10 })} style={{
                      background: '#f97316', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, cursor: 'pointer'
                    }}>
                      ⚡ +45s Congestion at SRWN
                    </button>
                    <button onClick={() => handleInjectDisruption({ stationCode: 'R', trainNumber: 'ALL', amount: 2, unit: 'min', reason: 'TSR', speedLimit: 20 })} style={{
                      background: '#eab308', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, cursor: 'pointer'
                    }}>
                      ⚡ +2m TSR (20km/h) at Raipur
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Target Station/Block:</label>
                      <select value={disruptionStation} onChange={e => setDisruptionStation(e.target.value)} style={{
                        width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', padding: '4px 6px', borderRadius: '4px', fontSize: '11px'
                      }}>
                        {STATIONS.map(s => (
                          <option key={s.code} value={s.code}>{s.code} — {s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Target Train:</label>
                      <select value={targetTrain} onChange={e => setTargetTrain(e.target.value)} style={{
                        width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', padding: '4px 6px', borderRadius: '4px', fontSize: '11px'
                      }}>
                        <option value="ALL">ALL ACTIVE TRAINS</option>
                        {activeTrains.map(t => (
                          <option key={t.trainNumber} value={t.trainNumber}>{t.trainNumber} - {t.trainName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                        Disruption Amount: <strong style={{ color: '#ef4444' }}>+{disruptionAmount} {disruptionUnit}</strong>
                      </label>
                      <input 
                        type="number" 
                        min={1} 
                        max={300} 
                        value={disruptionAmount} 
                        onChange={e => setDisruptionAmount(Math.max(1, +e.target.value))} 
                        style={{
                          width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', padding: '4px 6px', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box'
                        }} 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Unit:</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => setDisruptionUnit('sec')} 
                          style={{
                            flex: 1, background: disruptionUnit === 'sec' ? '#3b82f6' : '#0f172a', color: '#fff',
                            border: '1px solid #334155', padding: '4px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          Seconds (s)
                        </button>
                        <button 
                          onClick={() => setDisruptionUnit('min')} 
                          style={{
                            flex: 1, background: disruptionUnit === 'min' ? '#3b82f6' : '#0f172a', color: '#fff',
                            border: '1px solid #334155', padding: '4px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          Minutes (m)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Disruption Type:</label>
                    <select value={disruptionReason} onChange={e => setDisruptionReason(e.target.value)} style={{
                      width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', padding: '4px 6px', borderRadius: '4px', fontSize: '11px'
                    }}>
                      <option value="SIGNAL">🚥 Signal Failure / Red Stop Aspect (0 km/h)</option>
                      <option value="TSR">⚠️ TSR Temporary Speed Restriction (20 km/h)</option>
                      <option value="CONGESTION">🚧 Track Congestion (10 km/h)</option>
                      <option value="CROSSING">🚂 Freight Train Crossing / Preemption</option>
                    </select>
                  </div>

                  <button onClick={() => handleInjectDisruption()} style={{
                    width: '100%', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: 'none',
                    padding: '8px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '12px'
                  }}>
                    ⚡ Inject +{disruptionAmount}{disruptionUnit} Disruption Now
                  </button>
                </div>

                {/* REAL-TIME PREDICTION IMPACT PREVIEW */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '12px', color: '#94a3b8' }}>
                    📉 Model Prediction Response & Downstream Impact
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '160px', overflowY: 'auto' }}>
                    {activeTrains.map(t => {
                      const nextEta = Object.values(t.etas)[0];
                      const isStopped = t.currentSpeed === 0;
                      return (
                        <div key={t.trainNumber} style={{
                          background: '#1e293b', border: isStopped ? '1px solid #ef4444' : '1px solid #334155',
                          borderRadius: '8px', padding: '8px 10px', flex: '1 1 180px', minWidth: '150px',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: t.color, fontWeight: 700, fontSize: '11px' }}>{t.trainNumber}</span>
                            <span style={{ fontSize: '10px', color: isStopped ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                              {Math.round(t.currentSpeed)} km/h {isStopped ? '🛑' : ''}
                            </span>
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '10px' }}>{t.trainName}</div>
                          {nextEta && (
                            <div style={{ marginTop: '4px', fontSize: '10px', borderTop: '1px solid #334155', paddingTop: '4px' }}>
                              <div style={{ color: '#64748b' }}>→ {nextEta.stationName}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                <span style={{ color: '#38bdf8', fontWeight: 700 }}>ETA: {nextEta.mlStr}</span>
                                <span style={{ color: getDelayColor(nextEta.delayVsSchedule), fontWeight: 700 }}>
                                  {nextEta.delayVsSchedule > 0 ? `+${nextEta.delayMinutes}m` : 'OT'}
                                </span>
                              </div>
                              <div style={{ color: '#f59e0b', fontSize: '9px', marginTop: '2px' }}>
                                Reason: {nextEta.reason} ({nextEta.confidencePercent}% conf)
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

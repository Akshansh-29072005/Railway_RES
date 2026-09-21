import React, { useState } from 'react';
import MapComponent from './MapComponent';

export default function VisualizeMap() {
  const [showML, setShowML] = useState(false);
  const [showScene5, setShowScene5] = useState(false);
  const [mlData, setMlData] = useState(null);

  const submitTSR = async () => {
    const speed = document.getElementById('tsr-speed').value;
    const reason = document.getElementById('tsr-reason').value;
    // Dummy path near Raipur (snapped to exact track) for presentation
    const payload = {
      speedLimit: parseInt(speed, 10) || 20,
      reason: reason,
      path: [[21.25837, 81.62990], [21.25609, 81.62890]]
    };

    try {
      await fetch('http://localhost:8080/api/tsr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('Failed to log TSR', e);
    }
  };

  const submitIncident = async () => {
    const type = document.getElementById('inc-type').value;
    const payload = {
      type: type,
      pos: [21.25713, 81.62935] // Snapped exactly on the track near Raipur
    };

    try {
      await fetch('http://localhost:8080/api/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('Failed to report incident', e);
    }
  };

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
          <button 
            onClick={() => setShowML(!showML)}
            style={{
              background: showML ? '#a855f7' : 'rgba(168, 85, 247, 0.2)',
              color: showML ? '#fff' : '#a855f7',
              border: '1px solid #a855f7',
              padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '10px',
              transition: 'all 0.2s'
            }}>
            <span>🧠</span> Toggle ML Engine
          </button>
          <button 
            onClick={() => setShowScene5(!showScene5)}
            style={{
              background: showScene5 ? '#0ea5e9' : 'rgba(14, 165, 233, 0.2)',
              color: showScene5 ? '#fff' : '#0ea5e9',
              border: '1px solid #0ea5e9',
              padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '10px',
              transition: 'all 0.2s'
            }}>
            <span>🌐</span> Scene 5: API & Mobile
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
            Live Telemetry Feed Active
          </div>
          <span style={{ color: '#64748b' }}>Corridor:</span>
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>SECR R → DURG</span>
        </div>
      </div>

      {/* ── MAP AREA WITH 3 COLUMNS ────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', minHeight: 0, overflow: 'hidden' }}>
        
        {/* LEFT PANEL: MAINTENANCE APP */}
        <div style={{ width: '280px', background: '#1e293b', borderRight: '1px solid #334155', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', zIndex: 10 }}>
          <h3 style={{ margin: 0, color: '#f59e0b', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚧</span> Maintenance App
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Log Temporary Speed Restrictions instantly.</p>
          
          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '5px' }}>Restriction Speed (km/h)</label>
            <input id="tsr-speed" type="number" defaultValue={20} style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', color: '#fff', padding: '8px', borderRadius: '4px', marginBottom: '10px' }} />
            
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '5px' }}>Reason</label>
            <input id="tsr-reason" type="text" defaultValue="Track Fracture" style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', color: '#fff', padding: '8px', borderRadius: '4px', marginBottom: '15px' }} />
            
            <button onClick={submitTSR} style={{ width: '100%', background: '#f59e0b', color: '#000', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>
              Log TSR Live
            </button>
          </div>
        </div>

        {/* CENTER PANEL: MAIN MAP */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapComponent onPredictionUpdate={(data) => setMlData(data)} />
          
          {/* ML PREDICTION OVERLAY */}
          {showML && mlData && (
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #475569', borderRadius: '12px', padding: '20px', width: '90%', maxWidth: '800px', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                  <span>🧠</span> ML Prediction Engine - Train {mlData.trainId}
                </h3>
                <button onClick={() => setShowML(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>✕</button>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Live Location */}
                <div style={{ flex: 1, background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '5px' }}>Live Location</div>
                  <div style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: '13px' }}>{mlData.liveLocation}</div>
                </div>
                <div style={{ color: '#64748b', fontWeight: 'bold' }}>+</div>
                
                {/* TSR Impact */}
                <div style={{ flex: 1.2, background: mlData.upcomingTSRs > 0 ? 'rgba(245, 158, 11, 0.15)' : '#1e293b', padding: '12px', borderRadius: '8px', border: `1px solid ${mlData.upcomingTSRs > 0 ? '#f59e0b' : '#334155'}`, textAlign: 'center', transition: 'all 0.3s ease' }}>
                  <div style={{ fontSize: '11px', color: mlData.upcomingTSRs > 0 ? '#f59e0b' : '#94a3b8', marginBottom: '5px' }}>Upcoming TSRs</div>
                  <div style={{ color: mlData.upcomingTSRs > 0 ? '#f59e0b' : '#e2e8f0', fontWeight: 'bold', fontSize: '13px' }}>
                    {mlData.upcomingTSRs > 0 ? `${mlData.upcomingTSRs} Active (+14 mins)` : 'None (0 mins)'}
                  </div>
                </div>
                <div style={{ color: '#64748b', fontWeight: 'bold' }}>+</div>

                {/* Weather */}
                <div style={{ flex: 1, background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '5px' }}>Weather</div>
                  <div style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: '13px' }}>{mlData.weatherData}</div>
                </div>
                <div style={{ color: '#64748b', fontWeight: 'bold' }}>+</div>

                {/* Historical Delay */}
                <div style={{ flex: 1, background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '5px' }}>Historical Trend</div>
                  <div style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: '13px' }}>+{mlData.historicalDelay} mins</div>
                </div>
                <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '18px' }}>=</div>

                {/* Dynamic ETA */}
                <div style={{ flex: 1.5, background: mlData.totalDelayMins > 0 ? '#ef4444' : '#10b981', padding: '15px', borderRadius: '8px', border: 'none', textAlign: 'center', boxShadow: `0 0 15px ${mlData.totalDelayMins > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`, transition: 'all 0.3s ease' }}>
                  <div style={{ fontSize: '11px', color: '#fff', opacity: 0.9, marginBottom: '2px' }}>Dynamic ETA</div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>{mlData.predictedEta}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: GUARD APP */}
        <div style={{ width: '280px', background: '#1e293b', borderLeft: '1px solid #334155', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', zIndex: 10 }}>
          <h3 style={{ margin: 0, color: '#ef4444', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚨</span> Guard & Loco App
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Report operational bottlenecks instantly.</p>
          
          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '5px' }}>Incident Type</label>
            <select id="inc-type" style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', color: '#fff', padding: '8px', borderRadius: '4px', marginBottom: '15px' }}>
              <option value="Chain Pulling">Chain Pulling</option>
              <option value="Cattle Run Over">Cattle Run Over</option>
              <option value="Signal Failure">Signal Failure</option>
            </select>
            
            <button onClick={submitIncident} style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
              Report Incident
            </button>
          </div>
        </div>

      </div>

      {/* ── SCENE 5 OVERLAY: API & PASSENGER APP ────────────────────────── */}
      {showScene5 && (
        <div style={{ position: 'absolute', top: '48px', left: 0, right: 0, bottom: 0, background: '#0f172a', zIndex: 9999, display: 'flex' }}>
          
          {/* LEFT: SWAGGER API MOCKUP */}
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto', borderRight: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
              <div style={{ background: '#89bf04', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{`{ }`}</div>
              <h1 style={{ margin: 0, color: '#e2e8f0' }}>Railway Predict API v1</h1>
            </div>
            
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Endpoint 1 */}
              <div style={{ display: 'flex', borderBottom: '1px solid #334155' }}>
                <div style={{ background: '#61affe', padding: '10px 20px', fontWeight: 'bold', color: '#fff', minWidth: '80px', textAlign: 'center' }}>GET</div>
                <div style={{ padding: '10px 20px', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '16px', display: 'flex', alignItems: 'center' }}>/api/v1/eta/predict</div>
                <div style={{ padding: '10px 20px', color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center' }}>Get dynamic ETA for a specific train based on ML models.</div>
              </div>
              <div style={{ padding: '20px', background: '#0f172a' }}>
                <div style={{ marginBottom: '10px', color: '#cbd5e1' }}>Parameters</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#94a3b8', fontSize: '14px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#e2e8f0' }}>trainId <span style={{color: '#ef4444'}}>*</span></td>
                      <td style={{ padding: '8px' }}>string (query)</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ marginTop: '20px', marginBottom: '10px', color: '#cbd5e1' }}>Responses (Live Data Feed)</div>
                <pre style={{ background: '#1e293b', padding: '15px', borderRadius: '6px', color: '#a855f7', border: '1px solid #334155', margin: 0 }}>
{`{
  "trainId": "TR-12834",
  "liveLocation": "km 412 (Bhilai Segment)",
  "upcomingTSRs": ${mlData?.upcomingTSRs || 0},
  "totalDelayMins": ${mlData?.totalDelayMins || 0},
  "predictedEta": "${mlData?.predictedEta || 'On Time'}"
}`}
                </pre>
              </div>
            </div>
            
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', marginTop: '20px' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ background: '#49cc90', padding: '10px 20px', fontWeight: 'bold', color: '#fff', minWidth: '80px', textAlign: 'center' }}>POST</div>
                <div style={{ padding: '10px 20px', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '16px', display: 'flex', alignItems: 'center' }}>/api/tsr</div>
                <div style={{ padding: '10px 20px', color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center' }}>Log a Temporary Speed Restriction (Edge App)</div>
              </div>
            </div>
          </div>

          {/* RIGHT: PASSENGER APP MOCKUP */}
          <div style={{ flex: 1, padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120' }}>
            <div style={{ width: '320px', height: '650px', background: '#ffffff', borderRadius: '40px', padding: '15px', border: '8px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '30px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100px', height: '20px', background: '#1e293b', borderRadius: '0 0 10px 10px' }}></div>
              </div>
              
              <div style={{ flex: 1, background: '#f8fafc', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: '#2563eb', padding: '20px', color: '#fff', textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '18px' }}>NTES Live Status</h2>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Train TR-12834 (Durg Exp)</div>
                </div>
                
                <div style={{ padding: '20px', flex: 1 }}>
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Current Station</div>
                    <div style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '16px' }}>Raipur Junction</div>
                    <div style={{ color: '#10b981', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span> Departed
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Next Station</div>
                    <div style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '16px' }}>Bhilai Power House</div>
                    
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Dynamic ETA (AI Powered)</div>
                      
                      {mlData?.totalDelayMins > 0 ? (
                        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span>⚠️ Delayed by {mlData.totalDelayMins} mins</span>
                          <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 'normal' }}>Due to: Upcoming Track Maintenance</span>
                        </div>
                      ) : (
                        <div style={{ background: '#d1fae5', color: '#059669', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                          ✅ On Time
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

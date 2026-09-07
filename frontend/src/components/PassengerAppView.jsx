import React, { useState, useEffect } from 'react';
import { STATIONS, TRAINS, minsToTime, getStation } from '../data/corridorData';
import { getSimulator } from '../services/telemetrySimulator';

const PassengerAppView = () => {
  const [simState, setSimState] = useState(null);
  const [selectedTrainNum, setSelectedTrainNum] = useState('22436'); // Default Vande Bharat

  useEffect(() => {
    const sim = getSimulator();
    sim.start();
    const unsub = sim.subscribe((state) => setSimState({ ...state }));
    setSimState({ ...sim.getState() });
    return () => unsub();
  }, []);

  if (!simState) return <div style={{ color: 'white', padding: 20 }}>Loading...</div>;

  const train = simState.trains.find(t => t.trainNumber === selectedTrainNum);
  const activeTrains = simState.trains;

  const formatTime = (timeStr) => timeStr || '--:--';
  
  // Calculate next station and passed stations
  let passedStations = [];
  let nextStation = null;
  let futureStations = [];
  let finalStation = null;

  if (train) {
    const schedule = train.schedule || [];
    for (const stop of schedule) {
      const etaData = train.etas?.[stop.station];
      // For simplicity, say it passed if currentKm > stop.km (ignoring direction for simplicity, just relying on rough estimates)
      const stationKm = getStation(stop.station)?.km || 0;
      const isUp = train.direction === 'UP';
      const hasPassed = isUp ? train.currentKm < stationKm : train.currentKm > stationKm;

      const stationData = { ...stop, etaData, hasPassed };
      
      if (hasPassed) {
        passedStations.push(stationData);
      } else {
        if (!nextStation) {
          nextStation = stationData;
        } else {
          futureStations.push(stationData);
        }
      }
    }
    
    if (schedule.length > 0) {
      const finalStop = schedule[schedule.length - 1];
      finalStation = {
        ...finalStop,
        etaData: train.etas?.[finalStop.station]
      };
    }
  }

  return (
    <div className="flex flex-row w-full bg-surface text-on-surface font-body-md p-6 box-border gap-10 overflow-hidden min-h-[calc(100vh-140px)]">
      {/* Train Selector Left Panel */}
      <div className="flex flex-col w-[200px]">
        <h3 className="m-0 mb-4 text-lg font-bold text-primary">Select Train</h3>
        <select 
          value={selectedTrainNum}
          onChange={(e) => setSelectedTrainNum(e.target.value)}
          className="px-3 py-2 bg-surface-container text-on-surface border border-outline-variant/30 rounded-lg text-sm outline-none focus:border-primary shadow-sm"
        >
          {activeTrains.map(t => (
            <option key={t.trainNumber} value={t.trainNumber}>
              {t.trainNumber} - {t.trainName}
            </option>
          ))}
        </select>
      </div>

      {/* Phone Mockup */}
      <div style={{
        width: '375px',
        height: '750px',
        backgroundColor: '#f8fafc', // Light gray/white phone bg
        borderRadius: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 8px #1e293b', // Bevel effect
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {/* Status Bar & Notch */}
        <div style={{
          height: '44px',
          backgroundColor: '#3b82f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          fontSize: '12px',
          color: '#ffffff',
          fontWeight: '600'
        }}>
          <span>{simState.simTimeStr}</span>
          {/* Notch */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120px',
            height: '24px',
            backgroundColor: '#1e293b',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
          }} />
          <div style={{ display: 'flex', gap: '4px' }}>
            <span>LTE</span>
            <span>100%</span>
          </div>
        </div>

        {/* IRCTC Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          padding: '16px 20px',
          color: 'white'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>IRCTC Rail Connect</h2>
        </div>

        {!train ? (
          <div style={{ padding: '20px', color: '#64748b' }}>Train not found or inactive.</div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '16px',
            gap: '16px',
            backgroundColor: '#f1f5f9'
          }}>
            {/* Search Input Simulation */}
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <input 
                type="text" 
                value={train.trainNumber} 
                readOnly
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#334155'
                }}
              />
              <button style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0 16px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer'
              }}>
                Track This Train
              </button>
            </div>

            {/* Train Info Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>{train.trainName}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                {train.schedule?.[0]?.station} ➔ {train.schedule?.[train.schedule.length - 1]?.station}
              </div>
            </div>

            {/* Next Station Highlighted Card */}
            {nextStation && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                border: '2px solid #3b82f6',
                boxShadow: '0 4px 6px -1px rgba(59,130,246,0.2)'
              }}>
                <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase' }}>Next Station</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>
                  {getStation(nextStation.station)?.name || nextStation.station} ({nextStation.station})
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>ETA</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                      {nextStation.etaData?.mlStr || formatTime(nextStation.etaData?.scheduledStr)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Delay</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: train.delayMinutes > 0 ? '#ef4444' : '#10b981' }}>
                      {train.delayMinutes > 0 ? `+${train.delayMinutes} min` : 'On Time'}
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#eff6ff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  marginTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600' }}>
                    {nextStation.etaData?.platform ? `Platform ${nextStation.etaData.platform}` : 'Platform TBD'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#3b82f6' }}>
                    {nextStation.etaData?.confidencePercent ? `${nextStation.etaData.confidencePercent}% conf.` : ''} 
                    {nextStation.etaData?.uncertainty ? ` (±${nextStation.etaData.uncertainty}m)` : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Final Destination Card */}
            {finalStation && nextStation && finalStation.station !== nextStation.station && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Final Destination</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>
                  {getStation(finalStation.station)?.name || finalStation.station} ({finalStation.station})
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>ETA</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>
                      {finalStation.etaData?.mlStr || formatTime(finalStation.etaData?.scheduledStr)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Delay</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: train.delayMinutes > 0 ? '#ef4444' : '#10b981' }}>
                      {train.delayMinutes > 0 ? `+${train.delayMinutes} min` : 'On Time'}
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  marginTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>
                    {finalStation.etaData?.platform ? `Platform ${finalStation.etaData.platform}` : 'Platform TBD'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {finalStation.etaData?.confidencePercent ? `${Math.max(0, finalStation.etaData.confidencePercent - 15)}% conf.` : ''} 
                  </div>
                </div>
              </div>
            )}

            {/* Delay Reason Badge */}
            {train.delayReason && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                {train.delayReason}
              </div>
            )}

            {/* Upcoming Stations List */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#0f172a' }}>Journey</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {passedStations.slice(-2).map((st, i) => (
                  <div key={st.station} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '14px', color: '#0f172a' }}>{st.station}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Passed</div>
                    </div>
                  </div>
                ))}
                
                {nextStation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6', boxShadow: '0 0 0 4px #bfdbfe' }} />
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{nextStation.station}</div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#3b82f6' }}>{nextStation.etaData?.mlStr || '--:--'}</div>
                    </div>
                  </div>
                )}
                
                {futureStations.slice(0, 3).map((st, i) => (
                  <div key={st.station} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.8 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '14px', color: '#334155' }}>{st.station}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Sch: {formatTime(st.etaData?.scheduledStr)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div style={{
          height: '60px',
          backgroundColor: 'white',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px',
          color: '#0f172a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🚅</span>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Speed</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {train ? Math.round(train.currentSpeed) : 0} <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>km/h</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981',
              animation: 'blink 1.5s infinite'
            }} />
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', letterSpacing: '0.5px' }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Explainer Panel Right */}
      <div style={{
        flex: 1,
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #334155',
        overflowY: 'auto'
      }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 'bold', color: '#f8fafc' }}>
          Passenger API Endpoints
        </h2>
        
        <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
          The mobile experience is powered by the RES Telemetry Platform's predictive APIs. 
          Below are the key endpoints consumed by the passenger application.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Endpoint 1 */}
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: '#0ea5e9', color: 'white', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', marginBottom: '12px' }}>GET</div>
            <code style={{ marginLeft: '12px', color: '#38bdf8', fontSize: '14px' }}>/api/v2.4/passenger/train-eta-summary</code>
            <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '12px', lineHeight: 1.5 }}>
              Returns ML-predicted ETAs for the upcoming journey, factoring in current speed, network congestion, and historical patterns.
            </p>
            <pre style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', color: '#a7f3d0', fontSize: '13px', overflowX: 'auto', marginTop: '16px', border: '1px solid #334155' }}>
{`{
  "train": "22436",
  "next_station": "BSP",
  "eta_ml": "14:32",
  "delay_min": 4,
  "confidence_pct": 92,
  "uncertainty_min": 3
}`}
            </pre>
          </div>

          {/* Endpoint 2 */}
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: '#0ea5e9', color: 'white', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', marginBottom: '12px' }}>GET</div>
            <code style={{ marginLeft: '12px', color: '#38bdf8', fontSize: '14px' }}>/api/v2.4/passenger/platform-prediction</code>
            <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '12px', lineHeight: 1.5 }}>
              Predicts the arrival platform based on station layout, current occupancy, and typical allocation patterns for the train.
            </p>
            <pre style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', color: '#a7f3d0', fontSize: '13px', overflowX: 'auto', marginTop: '16px', border: '1px solid #334155' }}>
{`{
  "station": "BSP",
  "predicted_platform": 3,
  "probability": 0.88,
  "alternatives": [
    { "platform": 4, "probability": 0.12 }
  ]
}`}
            </pre>
          </div>

          {/* Endpoint 3 */}
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: '#0ea5e9', color: 'white', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', marginBottom: '12px' }}>GET</div>
            <code style={{ marginLeft: '12px', color: '#38bdf8', fontSize: '14px' }}>/api/v2.4/passenger/delay-reason-feed</code>
            <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '12px', lineHeight: 1.5 }}>
              Provides real-time, passenger-friendly explanations for delays, derived from TMS and signal logs.
            </p>
            <pre style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', color: '#a7f3d0', fontSize: '13px', overflowX: 'auto', marginTop: '16px', border: '1px solid #334155' }}>
{`{
  "active_reason": "Carrying delay from Raipur section",
  "category": "NETWORK_CONGESTION",
  "severity": "MODERATE",
  "estimated_recovery": "PARTIAL"
}`}
            </pre>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PassengerAppView;

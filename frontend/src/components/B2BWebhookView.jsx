import React, { useState, useEffect, useRef } from 'react';
import { minsToTime } from '../data/corridorData';
import { getSimulator } from '../services/telemetrySimulator';

const B2BWebhookView = () => {
  const [simState, setSimState] = useState(null);
  const [events, setEvents] = useState([]);
  const [pings, setPings] = useState({
    irctc: 2, google: 1, mmt: 4, ixigo: 3, wimt: 45
  });
  const [eventCounter, setEventCounter] = useState(842300);
  const eventsEndRef = useRef(null);

  useEffect(() => {
    const sim = getSimulator();
    const handleUpdate = (state) => {
      setSimState({ ...state });
      
      // Generate some random events based on state.trains
      if (Math.random() > 0.6 && state.trains && state.trains.length > 0) {
        const train = state.trains[Math.floor(Math.random() * state.trains.length)];
        const eventTypes = ['DELAY_THRESHOLD', 'ETA_UPDATE', 'PLATFORM_CHANGE'];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const consumers = ['IRCTC', 'Google Transit', 'MakeMyTrip', 'Ixigo', 'Where Is My Train'];
        const consumer = consumers[Math.floor(Math.random() * consumers.length)];
        
        let msg = '';
        if (eventType === 'DELAY_THRESHOLD') {
          msg = `Train ${train.trainNumber} delay > 15m → ${consumer} notified`;
        } else if (eventType === 'ETA_UPDATE') {
          const stCodes = Object.keys(train.etas);
          const st = stCodes.length > 0 ? stCodes[Math.floor(Math.random() * stCodes.length)] : 'NDLS';
          msg = `Train ${train.trainNumber} ETA ${st}: ${state.simTimeStr} → ${consumer} notified`;
        } else {
          msg = `Train ${train.trainNumber} PF Change at Station → ${consumer} notified`;
        }
        
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
        const newEvent = `[${timeStr}] ${eventType} → ${msg}`;
        setEvents(prev => [...prev.slice(-49), newEvent]);
        setEventCounter(prev => prev + 1);
      }
    };
    
    const unsub = sim.subscribe(handleUpdate);
    return () => unsub();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPings(prev => ({
        irctc: (prev.irctc + 1) % 5,
        google: (prev.google + 1) % 4,
        mmt: (prev.mmt + 1) % 6,
        ixigo: (prev.ixigo + 1) % 5,
        wimt: prev.wimt > 50 ? 40 : prev.wimt + 1
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);

  const getSamplePayload = () => {
    if (!simState || !simState.trains || simState.trains.length === 0) return '{}';
    const train = simState.trains[0];
    return JSON.stringify({
      eventId: `evt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: "train.eta.updated",
      data: {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        currentKm: train.currentKm.toFixed(2),
        currentSpeed: train.currentSpeed.toFixed(1),
        delayMinutes: train.delayMinutes,
        etas: Object.keys(train.etas).slice(0, 3).reduce((acc, k) => {
          acc[k] = train.etas[k].mlStr;
          return acc;
        }, {})
      }
    }, null, 2);
  };

  const subscribers = [
    { name: 'IRCTC Rail Connect', status: 'Active', ping: pings.irctc, users: '184K' },
    { name: 'Google Transit Feed', status: 'Active', ping: pings.google, users: '2.1M' },
    { name: 'MakeMyTrip Core', status: 'Active', ping: pings.mmt, users: '890K' },
    { name: 'Ixigo Gateway', status: 'Active', ping: pings.ixigo, users: '1.4M' },
    { name: 'Where Is My Train', status: 'Delayed', ping: pings.wimt, users: '3.2M' },
  ];

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#e2e8f0', minHeight: '100%', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#38bdf8', letterSpacing: '1px' }}>B2B REAL-TIME ETA INTEGRATION GATEWAY</h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Powering third-party transit apps with sub-second railway telemetry</p>
      </div>


      {/* METRICS & SUBSCRIBERS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* SUBSCRIBERS */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#e2e8f0' }}>REGISTERED WEBHOOK SUBSCRIBERS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subscribers.map((sub, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: sub.status === 'Active' ? '#10b981' : '#eab308', fontSize: '12px' }}>●</span>
                  <span style={{ fontWeight: '500' }}>{sub.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                  <span>{sub.status}</span>
                  <span>Last ping: {sub.ping}s ago</span>
                  <span style={{ color: '#38bdf8' }}>{sub.users} users</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* METRICS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'linear-gradient(180deg, #1e293b, #0f172a)', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Throughput</div>
            <div style={{ color: '#38bdf8', fontSize: '28px', fontWeight: 'bold' }}>42,000</div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>req/s</div>
          </div>
          <div style={{ background: 'linear-gradient(180deg, #1e293b, #0f172a)', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Latency (P99)</div>
            <div style={{ color: '#10b981', fontSize: '28px', fontWeight: 'bold' }}>18ms</div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>average</div>
          </div>
          <div style={{ background: 'linear-gradient(180deg, #1e293b, #0f172a)', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Subscribers</div>
            <div style={{ color: '#8b5cf6', fontSize: '28px', fontWeight: 'bold' }}>5.4M</div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>clients</div>
          </div>
          <div style={{ background: 'linear-gradient(180deg, #1e293b, #0f172a)', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Events Processed</div>
            <div style={{ color: '#f59e0b', fontSize: '28px', fontWeight: 'bold' }}>{eventCounter.toLocaleString()}</div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>since boot</div>
          </div>
        </div>
      </div>

      {/* EVENT STREAM & SAMPLE RESPONSE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* EVENT STREAM */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#e2e8f0' }}>LIVE WEBHOOK EVENT STREAM</h2>
          <div style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '8px', flex: 1, minHeight: '200px', maxHeight: '300px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#10b981', lineHeight: '1.6' }}>
            {events.length === 0 ? <div style={{ color: '#64748b' }}>Waiting for events...</div> : events.map((ev, i) => (
              <div key={i}>{ev}</div>
            ))}
            <div ref={eventsEndRef} />
          </div>
        </div>

        {/* SAMPLE RESPONSE */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#e2e8f0' }}>SAMPLE API PAYLOAD</h2>
          <div style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '8px', flex: 1, minHeight: '200px', maxHeight: '300px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#38bdf8', whiteSpace: 'pre' }}>
            {getSamplePayload()}
          </div>
        </div>

      </div>

    </div>
  );
};

export default B2BWebhookView;

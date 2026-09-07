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
    <div className="bg-surface text-on-surface min-h-[calc(100vh-140px)] p-6 font-body-md">
      
      {/* HEADER */}
      <div className="mb-8 border-b border-outline-variant/30 pb-4">
        <h1 className="m-0 mb-2 text-2xl font-bold text-primary tracking-wide">B2B REAL-TIME ETA INTEGRATION GATEWAY</h1>
        <p className="m-0 text-on-surface-variant text-sm">Powering third-party transit apps with sub-second railway telemetry</p>
      </div>

      {/* METRICS & SUBSCRIBERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* SUBSCRIBERS */}
        <div className="bg-surface-container-low rounded-xl p-6 shadow-sm border border-outline-variant/30">
          <h2 className="m-0 mb-4 text-base font-bold text-primary border-b border-outline-variant/30 pb-2">REGISTERED WEBHOOK SUBSCRIBERS</h2>
          <div className="flex flex-col gap-3">
            {subscribers.map((sub, i) => (
              <div key={i} className="flex items-center justify-between bg-surface p-3 rounded-lg border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${sub.status === 'Active' ? 'text-green-500' : 'text-amber-500'}`}>●</span>
                  <span className="font-semibold text-on-surface text-sm">{sub.name}</span>
                </div>
                <div className="flex gap-4 text-xs text-on-surface-variant items-center">
                  <span className={sub.status === 'Active' ? 'text-green-600' : 'text-amber-600'}>{sub.status}</span>
                  <span>Last ping: {sub.ping}s ago</span>
                  <span className="text-secondary font-semibold">{sub.users} users</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-center items-center shadow-sm">
            <div className="text-on-surface-variant text-xs mb-2 uppercase tracking-wide">Throughput</div>
            <div className="text-secondary text-2xl font-bold">42,000</div>
            <div className="text-outline-variant text-xs mt-1">req/s</div>
          </div>
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-center items-center shadow-sm">
            <div className="text-on-surface-variant text-xs mb-2 uppercase tracking-wide">Latency (P99)</div>
            <div className="text-green-600 text-2xl font-bold">18ms</div>
            <div className="text-outline-variant text-xs mt-1">average</div>
          </div>
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-center items-center shadow-sm">
            <div className="text-on-surface-variant text-xs mb-2 uppercase tracking-wide">Active Subscribers</div>
            <div className="text-primary text-2xl font-bold">5.4M</div>
            <div className="text-outline-variant text-xs mt-1">clients</div>
          </div>
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-center items-center shadow-sm">
            <div className="text-on-surface-variant text-xs mb-2 uppercase tracking-wide">Events Processed</div>
            <div className="text-amber-500 text-2xl font-bold">{eventCounter.toLocaleString()}</div>
            <div className="text-outline-variant text-xs mt-1">since boot</div>
          </div>
        </div>
      </div>

      {/* EVENT STREAM & SAMPLE RESPONSE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* EVENT STREAM */}
        <div className="bg-surface-container-low rounded-xl p-6 shadow-sm border border-outline-variant/30 flex flex-col">
          <h2 className="m-0 mb-4 text-base font-bold text-primary border-b border-outline-variant/30 pb-2">LIVE WEBHOOK EVENT STREAM</h2>
          <div className="bg-on-surface p-4 rounded-lg flex-1 min-h-[200px] max-h-[300px] overflow-y-auto font-mono text-xs text-green-400 leading-relaxed">
            {events.length === 0 ? <div className="text-outline-variant">Waiting for events...</div> : events.map((ev, i) => (
              <div key={i}>{ev}</div>
            ))}
            <div ref={eventsEndRef} />
          </div>
        </div>

        {/* SAMPLE RESPONSE */}
        <div className="bg-surface-container-low rounded-xl p-6 shadow-sm border border-outline-variant/30 flex flex-col">
          <h2 className="m-0 mb-4 text-base font-bold text-primary border-b border-outline-variant/30 pb-2">SAMPLE API PAYLOAD</h2>
          <div className="bg-on-surface p-4 rounded-lg flex-1 min-h-[200px] max-h-[300px] overflow-y-auto font-mono text-xs text-secondary whitespace-pre">
            {getSamplePayload()}
          </div>
        </div>

      </div>

    </div>
  );
};

export default B2BWebhookView;

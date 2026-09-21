import React, { useState, useEffect, useRef } from 'react';
import { getSimulator } from '../services/telemetrySimulator';

const B2BWebhookView = () => {
  const [simState, setSimState] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventCounter, setEventCounter] = useState(842300);
  const eventsEndRef = useRef(null);

  // We only show one subscriber now.
  const [ping, setPing] = useState(2);

  useEffect(() => {
    const sim = getSimulator();
    const handleUpdate = (state) => {
      setSimState({ ...state });
      
      // Generate some random events based on state.trains
      if (Math.random() > 0.6 && state.trains && state.trains.length > 0) {
        const train = state.trains[Math.floor(Math.random() * state.trains.length)];
        const eventTypes = ['DELAY_THRESHOLD', 'ETA_UPDATE', 'PLATFORM_CHANGE'];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const consumer = 'Train Tracking App';
        
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
      setPing(prev => (prev + 1) % 5);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (eventsEndRef.current) {
      const parent = eventsEndRef.current.parentElement;
      parent.scrollTop = parent.scrollHeight;
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
        currentKm: train.currentKm?.toFixed(2) || "0.00",
        currentSpeed: train.currentSpeed?.toFixed(1) || "60.0",
        delayMinutes: train.delayMinutes || 0,
        etas: Object.keys(train.etas || {}).slice(0, 3).reduce((acc, k) => {
          acc[k] = train.etas[k]?.mlStr || "On Time";
          return acc;
        }, {})
      }
    }, null, 2);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full bg-surface text-on-surface font-body-md p-6 box-border gap-8 overflow-hidden min-h-[calc(100vh-140px)]">
      
      {/* LEFT PANEL: Live Metrics, Subscribers, Event Stream */}
      <div className="flex flex-col w-full lg:w-[350px] gap-6 shrink-0 h-full overflow-y-auto pr-2 pb-6">
        
        {/* LIVE METRICS */}
        <div>
          <h3 className="m-0 mb-3 text-sm font-bold text-primary border-b border-outline-variant/30 pb-2 uppercase tracking-wide">Live Gateway Metrics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-center items-center shadow-sm">
              <div className="text-on-surface-variant text-[10px] mb-1 uppercase tracking-wide text-center">Throughput</div>
              <div className="text-secondary text-lg font-bold">42,000</div>
              <div className="text-outline-variant text-[10px] mt-1">req/s</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-center items-center shadow-sm">
              <div className="text-on-surface-variant text-[10px] mb-1 uppercase tracking-wide text-center">Latency (P99)</div>
              <div className="text-green-600 text-lg font-bold">18ms</div>
              <div className="text-outline-variant text-[10px] mt-1">average</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-center items-center shadow-sm">
              <div className="text-on-surface-variant text-[10px] mb-1 uppercase tracking-wide text-center">Active Subs</div>
              <div className="text-primary text-lg font-bold">5.4M</div>
              <div className="text-outline-variant text-[10px] mt-1">clients</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-center items-center shadow-sm">
              <div className="text-on-surface-variant text-[10px] mb-1 uppercase tracking-wide text-center">Events</div>
              <div className="text-amber-500 text-lg font-bold">{eventCounter.toLocaleString()}</div>
              <div className="text-outline-variant text-[10px] mt-1">processed</div>
            </div>
          </div>
        </div>

        {/* SUBSCRIBERS */}
        <div className="bg-surface-container-low rounded-xl p-5 shadow-sm border border-outline-variant/30">
          <h2 className="m-0 mb-3 text-sm font-bold text-primary border-b border-outline-variant/30 pb-2 uppercase tracking-wide">REGISTERED SUBSCRIBERS</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-surface p-3 rounded-lg border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-500">●</span>
                <span className="font-semibold text-on-surface text-sm">Train Tracking App</span>
              </div>
              <div className="flex gap-3 text-xs text-on-surface-variant items-center">
                <span className="text-green-600">Active</span>
                <span>Ping: {ping}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* EVENT STREAM */}
        <div className="bg-surface-container-low rounded-xl p-5 shadow-sm border border-outline-variant/30 flex flex-col flex-1 min-h-[300px]">
          <h2 className="m-0 mb-3 text-sm font-bold text-primary border-b border-outline-variant/30 pb-2 uppercase tracking-wide">LIVE WEBHOOK EVENT STREAM</h2>
          <div className="bg-on-surface p-4 rounded-lg flex-1 overflow-y-auto font-mono text-[11px] text-green-400 leading-relaxed max-h-[400px]">
            {events.length === 0 ? <div className="text-outline-variant">Waiting for events...</div> : events.map((ev, i) => (
              <div key={i}>{ev}</div>
            ))}
            <div ref={eventsEndRef} />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Documentation */}
      <div className="flex flex-col flex-1 gap-6 overflow-y-auto rounded-xl p-6 bg-[#1e293b] text-slate-300 shadow-xl border border-slate-800">
        <div className="border-b border-slate-700 pb-4">
          <h1 className="m-0 mb-2 text-2xl font-bold text-white tracking-wide">Webhook Integration Documentation</h1>
          <p className="m-0 text-slate-400 text-sm">Integrate with the RES Telemetry Platform to receive real-time predictive ETAs and alerts directly to your application.</p>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Card 1 */}
          <div className="bg-[#0f172a] rounded-xl border border-slate-700 shadow-md overflow-hidden flex flex-col">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 flex items-center gap-4">
              <div className="bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded w-fit">WEBHOOK</div>
              <span className="font-mono text-sm text-[#38bdf8] font-semibold">/api/v2.4/webhook/train-eta-updated</span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-slate-300 m-0">
                Fired whenever the ML engine recalculates a train's ETA, factoring in current speed, network congestion, and historical patterns. This is the primary event for updating user-facing boards.
              </p>
              <div className="bg-[#1e293b] p-4 rounded-lg overflow-x-auto font-mono text-xs text-green-300 whitespace-pre">
                {getSamplePayload()}
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0f172a] rounded-xl border border-slate-700 shadow-md overflow-hidden flex flex-col">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 flex items-center gap-4">
              <div className="bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded w-fit">WEBHOOK</div>
              <span className="font-mono text-sm text-[#38bdf8] font-semibold">/api/v2.4/webhook/platform-changed</span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-slate-300 m-0">
                Predicts and alerts on arrival platform allocations based on station layout, current occupancy, and typical allocation patterns. Triggered when certainty exceeds 90%.
              </p>
              <div className="bg-[#1e293b] p-4 rounded-lg overflow-x-auto font-mono text-xs text-green-300 whitespace-pre">
{`{
  "eventId": "evt_platform_998822",
  "timestamp": "${new Date().toISOString()}",
  "eventType": "train.platform.changed",
  "data": {
    "trainNumber": "22436",
    "station": "BSP",
    "predicted_platform": 3,
    "probability": 0.88,
    "alternatives": [
      { "platform": 4, "probability": 0.12 }
    ]
  }
}`}
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0f172a] rounded-xl border border-slate-700 shadow-md overflow-hidden flex flex-col">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 flex items-center gap-4">
              <div className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded w-fit">ALERT</div>
              <span className="font-mono text-sm text-[#38bdf8] font-semibold">/api/v2.4/webhook/delay-threshold-exceeded</span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-slate-300 m-0">
                Triggered automatically if a train's delay grows beyond a pre-configured threshold (default 15 mins). Useful for pushing critical notifications to transit users.
              </p>
              <div className="bg-[#1e293b] p-4 rounded-lg overflow-x-auto font-mono text-xs text-green-300 whitespace-pre">
{`{
  "eventId": "evt_delay_102030",
  "timestamp": "${new Date().toISOString()}",
  "eventType": "train.delay.threshold_exceeded",
  "data": {
    "trainNumber": "22436",
    "currentDelayMinutes": 22,
    "thresholdMinutes": 15,
    "reason_code": "TSR_CONGESTION"
  }
}`}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default B2BWebhookView;

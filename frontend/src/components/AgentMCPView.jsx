import React, { useState, useEffect, useRef } from 'react';
import { getSimulator } from '../services/telemetrySimulator';

const AgentMCPView = () => {
  const [simState, setSimState] = useState(null);
  const [events, setEvents] = useState([]);
  const [agentCalls, setAgentCalls] = useState(1402);
  const eventsEndRef = useRef(null);

  useEffect(() => {
    const sim = getSimulator();
    const handleUpdate = (state) => {
      setSimState({ ...state });
      
      if (Math.random() > 0.4 && state.trains && state.trains.length > 0) {
        const train = state.trains[Math.floor(Math.random() * state.trains.length)];
        const toolTypes = ['get_train_eta', 'list_active_trains', 'get_station_board'];
        const tool = toolTypes[Math.floor(Math.random() * toolTypes.length)];
        const agents = ['Customer Support Agent', 'Logistics AI', 'Maintenance Bot'];
        const agent = agents[Math.floor(Math.random() * agents.length)];
        
        let msg = '';
        if (tool === 'get_train_eta') {
          msg = `Agent [${agent}] called get_train_eta for ${train.trainNumber}`;
        } else if (tool === 'list_active_trains') {
          msg = `Agent [${agent}] called list_active_trains`;
        } else {
          msg = `Agent [${agent}] called get_station_board for ${Object.keys(train.etas)[0] || 'NDLS'}`;
        }
        
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
        const newEvent = `[${timeStr}] MCP_CALL → ${msg} → SUCCESS`;
        setEvents(prev => [...prev.slice(-49), newEvent]);
        setAgentCalls(prev => prev + 1);
      }
    };
    
    const unsub = sim.subscribe(handleUpdate);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (eventsEndRef.current) {
      const parent = eventsEndRef.current.parentElement;
      parent.scrollTop = parent.scrollHeight;
    }
  }, [events]);

  return (
    <div className="flex flex-col lg:flex-row w-full bg-surface text-on-surface font-body-md p-6 box-border gap-8 overflow-hidden min-h-[calc(100vh-140px)]">
      
      {/* LEFT PANEL: Live Feed & Metrics */}
      <div className="flex flex-col w-full lg:w-[350px] gap-6 shrink-0 h-full overflow-y-auto pr-2 pb-6">
        
        {/* LIVE METRICS */}
        <div>
          <h3 className="m-0 mb-3 text-sm font-bold text-primary border-b border-outline-variant/30 pb-2 uppercase tracking-wide">AI Agent Telemetry</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-center items-center shadow-sm">
              <div className="text-on-surface-variant text-[10px] mb-1 uppercase tracking-wide text-center">Active Agents</div>
              <div className="text-secondary text-lg font-bold">14</div>
              <div className="text-outline-variant text-[10px] mt-1">connected</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-center items-center shadow-sm">
              <div className="text-on-surface-variant text-[10px] mb-1 uppercase tracking-wide text-center">MCP Latency</div>
              <div className="text-green-600 text-lg font-bold">24ms</div>
              <div className="text-outline-variant text-[10px] mt-1">average</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-center items-center shadow-sm col-span-2">
              <div className="text-on-surface-variant text-[10px] mb-1 uppercase tracking-wide text-center">Total Tool Calls</div>
              <div className="text-primary text-xl font-bold">{agentCalls.toLocaleString()}</div>
              <div className="text-outline-variant text-[10px] mt-1">today</div>
            </div>
          </div>
        </div>

        {/* EVENT STREAM */}
        <div className="bg-surface-container-low rounded-xl p-5 shadow-sm border border-outline-variant/30 flex flex-col flex-1 min-h-[300px]">
          <h2 className="m-0 mb-3 text-sm font-bold text-primary border-b border-outline-variant/30 pb-2 uppercase tracking-wide">LIVE MCP FEED</h2>
          <div className="bg-on-surface p-4 rounded-lg flex-1 overflow-y-auto font-mono text-[11px] text-[#a78bfa] leading-relaxed max-h-[400px]">
            {events.length === 0 ? <div className="text-outline-variant">Waiting for AI agent tool calls...</div> : events.map((ev, i) => (
              <div key={i}>{ev}</div>
            ))}
            <div ref={eventsEndRef} />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Documentation */}
      <div className="flex flex-col flex-1 gap-6 overflow-y-auto rounded-xl p-6 bg-[#1e293b] text-slate-300 shadow-xl border border-slate-800">
        <div className="border-b border-slate-700 pb-4">
          <h1 className="m-0 mb-2 text-2xl font-bold text-white tracking-wide">Agent MCP Tools</h1>
          <p className="m-0 text-slate-400 text-sm">Model Context Protocol (MCP) integrations allowing AI agents and chatbots to securely query real-time railway telemetry.</p>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Card 1 */}
          <div className="bg-[#0f172a] rounded-xl border border-slate-700 shadow-md overflow-hidden flex flex-col">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 flex items-center gap-4">
              <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded w-fit">MCP TOOL</div>
              <span className="font-mono text-sm text-[#38bdf8] font-semibold">get_train_eta</span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-slate-300 m-0">
                Retrieves the real-time ML-predicted ETA and current location data for a specific train. Use this tool when users ask "Where is train X?" or "When will my train reach station Y?".
              </p>
              <div className="bg-[#1e293b] p-4 rounded-lg overflow-x-auto font-mono text-xs text-purple-300 whitespace-pre">
{`// Example Tool Arguments
{
  "trainNumber": "22436",
  "targetStation": "BSP"
}

// Response
{
  "status": "success",
  "eta_ml": "14:32",
  "confidence_pct": 92,
  "current_delay_min": 4
}`}
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0f172a] rounded-xl border border-slate-700 shadow-md overflow-hidden flex flex-col">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 flex items-center gap-4">
              <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded w-fit">MCP TOOL</div>
              <span className="font-mono text-sm text-[#38bdf8] font-semibold">list_active_trains</span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-slate-300 m-0">
                Lists all currently tracked trains in the network that match specific criteria (e.g., active on a route, currently delayed by &gt; 30mins, etc).
              </p>
              <div className="bg-[#1e293b] p-4 rounded-lg overflow-x-auto font-mono text-xs text-purple-300 whitespace-pre">
{`// Example Tool Arguments
{
  "statusFilter": "delayed",
  "minDelayMinutes": 30
}

// Response
{
  "count": 1,
  "trains": [
    { "trainNumber": "12808", "currentDelay": 45, "lastUpdated": "2 mins ago" }
  ]
}`}
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0f172a] rounded-xl border border-slate-700 shadow-md overflow-hidden flex flex-col">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 flex items-center gap-4">
              <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded w-fit">MCP TOOL</div>
              <span className="font-mono text-sm text-[#38bdf8] font-semibold">get_station_board</span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-slate-300 m-0">
                Returns the upcoming arrivals and departures for a specific station within a given time window, including predicted platform allocations.
              </p>
              <div className="bg-[#1e293b] p-4 rounded-lg overflow-x-auto font-mono text-xs text-purple-300 whitespace-pre">
{`// Example Tool Arguments
{
  "stationCode": "NDLS",
  "windowHours": 2
}`}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AgentMCPView;

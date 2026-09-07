import React, { useState, useEffect } from 'react';
import { getSimulator } from '../services/telemetrySimulator';

const AgentMCPView = () => {
  const [simState, setSimState] = useState(null);

  useEffect(() => {
    const sim = getSimulator();
    const unsub = sim.subscribe(state => setSimState({ ...state }));
    return () => unsub();
  }, []);

  const activeTrains = simState?.trains?.filter(t => t.status === 'RUNNING' || t.status === 'AT_STATION') || [];

  return (
    <div className="w-full px-margin-edge py-12 bg-surface min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto flex flex-col gap-space-24">
        
        {/* Header Section */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/30 flex flex-col gap-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="material-symbols-outlined text-[32px] text-primary">integration_instructions</span>
            <h1 className="text-3xl font-bold text-on-surface font-display tracking-tight">
              Agent MCP Integration Gateway
            </h1>
          </div>
          <p className="text-lg text-on-surface-variant max-w-3xl leading-relaxed">
            This endpoint provides machine-readable telemetry data for AI agents via Model Context Protocol (MCP). Agents can programmatically query this gateway to provide end-users with real-time train ETAs, platform predictions, and delay confidences without relying on standard GUI tools.
          </p>
        </div>

        {/* Protocol Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-24">
          
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">data_object</span>
              Available MCP Tools
            </h2>
            <ul className="flex flex-col gap-4 mt-2">
              <li className="flex flex-col gap-1 pb-4 border-b border-outline-variant/20">
                <code className="text-sm font-bold text-secondary bg-secondary/10 w-fit px-2 py-1 rounded">get_train_eta</code>
                <span className="text-sm text-on-surface-variant">Fetches the latest ETA, delay status, and confidence interval for a specific train number.</span>
              </li>
              <li className="flex flex-col gap-1 pb-4 border-b border-outline-variant/20">
                <code className="text-sm font-bold text-secondary bg-secondary/10 w-fit px-2 py-1 rounded">list_active_trains</code>
                <span className="text-sm text-on-surface-variant">Returns an array of all currently active trains in the corridor along with their last known GPS coordinate and speed.</span>
              </li>
              <li className="flex flex-col gap-1">
                <code className="text-sm font-bold text-secondary bg-secondary/10 w-fit px-2 py-1 rounded">get_station_board</code>
                <span className="text-sm text-on-surface-variant">Retrieves the upcoming arrivals and departures for a specific station code, simulating the NTES display.</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">terminal</span>
              Live Telemetry Feed (JSON)
            </h2>
            <div className="bg-on-surface text-surface rounded-xl p-4 overflow-y-auto max-h-[300px] font-mono text-xs leading-relaxed">
              {activeTrains.length === 0 ? (
                <span className="text-outline-variant">Waiting for simulation data...</span>
              ) : (
                <pre>{JSON.stringify({
                  timestamp: simState?.simTimeStr,
                  active_trains_count: activeTrains.length,
                  trains: activeTrains.map(t => ({
                    trainNumber: t.trainNumber,
                    trainName: t.trainName,
                    status: t.status,
                    currentSpeed: Math.round(t.currentSpeed),
                    delayMinutes: t.delayMinutes,
                    etas: t.etas
                  }))
                }, null, 2)}</pre>
              )}
            </div>
          </div>

        </div>

        {/* Security & Authentication */}
        <div className="bg-error-container text-on-error-container rounded-2xl p-6 flex items-start gap-4 mt-4">
          <span className="material-symbols-outlined mt-1">shield_lock</span>
          <div>
            <h3 className="font-bold mb-1">MCP Authentication Required</h3>
            <p className="text-sm opacity-90">
              All MCP tool calls must be authenticated using short-lived JWT tokens signed by the CRIS Identity Provider. 
              Agents attempting to scrape data without providing a valid `Authorization: Bearer` header will be rate-limited and blocked at the edge ingress layer.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgentMCPView;

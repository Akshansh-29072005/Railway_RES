import React, { useState } from 'react';

export default function RouteMatrix({ trainNo }) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleResync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  return (
    <section className="w-full bg-surface-container-lowest rounded-DEFAULT shadow-sm overflow-hidden mt-space-32">
      <div className="p-space-16 bg-surface-container-low flex flex-wrap items-center justify-between gap-space-12">
        <div className="flex items-center gap-space-8">
          <span className="material-symbols-outlined text-primary text-[22px]">departure_board</span>
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
              Live Predictive Route ETA Matrix — Train #{trainNo || '22436'}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Real-time sectional timetable comparing scheduled departure against dynamic machine-learning projections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-8">
          <span className="bg-surface text-primary px-space-12 py-space-4 rounded-DEFAULT font-label-sm text-label-sm font-mono font-bold">
            ROUTE: NDLS → BSB (759 KM)
          </span>
          <button 
            onClick={handleResync}
            className="bg-surface text-secondary hover:bg-surface-container px-space-12 py-space-4 rounded-DEFAULT font-label-sm text-label-sm font-semibold flex items-center gap-space-4"
          >
            <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>refresh</span>
            <span>{isSyncing ? 'Syncing...' : 'Re-sync RTIS'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-body-sm text-body-sm">
          <thead className="bg-primary text-white font-label-sm text-label-sm font-mono uppercase tracking-wider">
            <tr>
              <th className="px-space-16 py-space-12">Station Node</th>
              <th className="px-space-16 py-space-12">Station Name</th>
              <th className="px-space-16 py-space-12 text-center">Sched. Arrival</th>
              <th className="px-space-16 py-space-12 text-center">Predicted RES ETA</th>
              <th className="px-space-16 py-space-12 text-center">Delay Status</th>
              <th className="px-space-16 py-space-12 text-center">Platform Allocation</th>
              <th className="px-space-16 py-space-12 text-center">ML Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y-0">
            <tr className="bg-surface hover:bg-surface-container transition-colors">
              <td className="px-space-16 py-space-12 font-mono font-bold text-primary">NDLS</td>
              <td className="px-space-16 py-space-12 font-medium">New Delhi (Origin)</td>
              <td className="px-space-16 py-space-12 text-center font-mono">06:00 (Dep)</td>
              <td className="px-space-16 py-space-12 text-center font-mono font-bold text-emerald-800">06:00 (Actual)</td>
              <td className="px-space-16 py-space-12 text-center">
                <span className="bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-bold px-space-8 py-space-2 rounded-DEFAULT">
                  DEPARTED ON TIME
                </span>
              </td>
              <td className="px-space-16 py-space-12 text-center font-mono font-bold">PF #16</td>
              <td className="px-space-16 py-space-12 text-center font-mono text-tertiary-container font-bold">100.0%</td>
            </tr>
            <tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
              <td className="px-space-16 py-space-12 font-mono font-bold text-primary">CNB</td>
              <td className="px-space-16 py-space-12 font-medium">Kanpur Central</td>
              <td className="px-space-16 py-space-12 text-center font-mono">10:08</td>
              <td className="px-space-16 py-space-12 text-center font-mono font-bold text-amber-800">10:10</td>
              <td className="px-space-16 py-space-12 text-center">
                <span className="bg-amber-100 text-amber-900 font-label-sm text-label-sm font-bold px-space-8 py-space-2 rounded-DEFAULT">
                  DELAY +02 MIN
                </span>
              </td>
              <td className="px-space-16 py-space-12 text-center font-mono font-bold text-primary">PF #01 (Confirmed)</td>
              <td className="px-space-16 py-space-12 text-center font-mono text-emerald-800 font-bold">98.4%</td>
            </tr>
            <tr className="bg-surface hover:bg-surface-container transition-colors">
              <td className="px-space-16 py-space-12 font-mono font-bold text-primary">PRYJ</td>
              <td className="px-space-16 py-space-12 font-medium">Prayagraj Junction</td>
              <td className="px-space-16 py-space-12 text-center font-mono">12:08</td>
              <td className="px-space-16 py-space-12 text-center font-mono font-bold text-amber-800">12:09</td>
              <td className="px-space-16 py-space-12 text-center">
                <span className="bg-amber-100 text-amber-900 font-label-sm text-label-sm font-bold px-space-8 py-space-2 rounded-DEFAULT">
                  DELAY +01 MIN
                </span>
              </td>
              <td className="px-space-16 py-space-12 text-center font-mono font-bold text-on-surface-variant">PF #06 (Estimated)</td>
              <td className="px-space-16 py-space-12 text-center font-mono text-emerald-800 font-bold">96.2%</td>
            </tr>
            <tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
              <td className="px-space-16 py-space-12 font-mono font-bold text-primary">BSB</td>
              <td className="px-space-16 py-space-12 font-medium">Varanasi Junction (Terminus)</td>
              <td className="px-space-16 py-space-12 text-center font-mono">14:00</td>
              <td className="px-space-16 py-space-12 text-center font-mono font-bold text-emerald-800">14:00</td>
              <td className="px-space-16 py-space-12 text-center">
                <span className="bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-bold px-space-8 py-space-2 rounded-DEFAULT">
                  PROJECTED ON TIME
                </span>
              </td>
              <td className="px-space-16 py-space-12 text-center font-mono font-bold text-primary">PF #01 (Reserved)</td>
              <td className="px-space-16 py-space-12 text-center font-mono text-emerald-800 font-bold">99.1%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

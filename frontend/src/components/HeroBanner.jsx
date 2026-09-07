import React, { useState, useEffect } from 'react';

export default function HeroBanner({ onOpenAuth, onDownloadDocs }) {
  const [trackedCount, setTrackedCount] = useState(13420);

  useEffect(() => {
    const timer = setInterval(() => {
      const delta = Math.floor(Math.random() * 3) - 1;
      setTrackedCount(prev => prev + delta);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-primary-container text-on-primary py-space-32 px-margin-edge shadow-md relative overflow-hidden">
      <div className="absolute right-0 top-0 w-96 h-full opacity-10 pointer-events-none flex items-center justify-center">
        <span className="material-symbols-outlined text-[320px] select-none text-white">train</span>
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col gap-space-20 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-space-16">
          <div className="flex flex-col gap-space-4">
            <div className="flex items-center gap-space-8">
              <span className="bg-secondary px-space-8 py-space-2 font-label-sm text-label-sm font-bold uppercase rounded-DEFAULT tracking-wider text-on-secondary">
                CRIS Telemetry Gateway
              </span>
              <span className="font-label-sm text-label-sm text-primary-fixed-dim font-mono">
                SPEC: REST / gRPC / WebSocket v2.4
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl font-bold tracking-tight text-white">
              RAILWAY RES — REAL-TIME ETA &amp; TELEMETRY API ENGINE
            </h1>
            <p className="font-body-md text-body-md text-primary-fixed max-w-4xl leading-relaxed">
              Official CRIS &amp; IRCTC Enterprise Data Gateway for Live Train Tracking, Predictive Station ETAs, Automated Platform Allocation, and High-Throughput Dissemination across National Rail Corridors.
            </p>
          </div>

          <div className="flex items-center gap-space-12">
            <button 
              onClick={onOpenAuth}
              className="bg-surface-container-lowest text-primary font-headline-sm text-headline-sm px-space-16 py-space-8 rounded-DEFAULT font-semibold shadow-sm hover:bg-surface-container transition-all flex items-center gap-space-8" 
              id="auth-spec-btn"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>mTLS / OAuth2 Portal</span>
            </button>
            <button 
              onClick={onDownloadDocs}
              className="bg-secondary-container text-white font-headline-sm text-headline-sm px-space-16 py-space-8 rounded-DEFAULT font-semibold shadow-sm hover:bg-secondary transition-all flex items-center gap-space-8" 
              id="docs-download-btn"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download OpenAPI 3.1</span>
            </button>
          </div>
        </div>

        {/* Real-Time Operational KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-16 pt-space-8">
          <div className="bg-surface-container-lowest p-space-16 rounded-DEFAULT shadow-sm text-on-surface flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Active Tracked Trains</span>
              <span className="material-symbols-outlined text-[20px] text-tertiary-container">satellite_alt</span>
            </div>
            <div className="mt-space-8 flex items-baseline gap-space-8">
              <span className="font-headline-xl text-headline-xl font-bold text-primary font-mono" id="tracked-counter">
                {trackedCount.toLocaleString()}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Locos</span>
            </div>
            <div className="mt-space-4 flex items-center gap-space-4">
              <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-emerald-700 font-medium">100% RTIS GNSS Locked</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-16 rounded-DEFAULT shadow-sm text-on-surface flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">ETA Prediction Variance</span>
              <span className="material-symbols-outlined text-[20px] text-secondary">timer</span>
            </div>
            <div className="mt-space-8 flex items-baseline gap-space-8">
              <span className="font-headline-xl text-headline-xl font-bold text-secondary font-mono">±42s</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Tolerance</span>
            </div>
            <div className="mt-space-4 flex items-center gap-space-4 text-outline">
              <span className="font-label-sm text-label-sm font-mono text-on-surface-variant">ML Geo-Fence Engine v3.1</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-16 rounded-DEFAULT shadow-sm text-on-surface flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">API Throughput</span>
              <span className="material-symbols-outlined text-[20px] text-primary">speed</span>
            </div>
            <div className="mt-space-8 flex items-baseline gap-space-8">
              <span className="font-headline-xl text-headline-xl font-bold text-primary font-mono">48,200</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">req / sec</span>
            </div>
            <div className="mt-space-4 flex items-center gap-space-4 text-emerald-700">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span className="font-label-sm text-label-sm font-medium">Peak Tatkal Handling Active</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-16 rounded-DEFAULT shadow-sm text-on-surface flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">P99 Edge Latency</span>
              <span className="material-symbols-outlined text-[20px] text-tertiary-container">hub</span>
            </div>
            <div className="mt-space-8 flex items-baseline gap-space-8">
              <span className="font-headline-xl text-headline-xl font-bold text-tertiary-container font-mono">18ms</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Edge CDN</span>
            </div>
            <div className="mt-space-4 flex items-center gap-space-4 text-outline">
              <span className="font-label-sm text-label-sm font-mono text-on-surface-variant">Cluster: NDLS / CSTM / HWH</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

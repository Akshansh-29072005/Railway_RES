import React from 'react';

export default function ArchitectureShowcase() {
  return (
    <section className="flex flex-col gap-space-16 pt-space-8 mt-space-32">
      <div className="flex flex-col gap-space-4">
        <span className="font-label-sm text-label-sm uppercase font-bold text-secondary tracking-wider">
          Enterprise Distribution Engine
        </span>
        <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
          How Indian Railways Disseminates Real-Time RES Feeds
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          Sub-second event ingestion directly from NavIC GPS locos through CRIS high-speed Kafka clusters to dispatch centers, physical stations, and million-user passenger endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-24 pt-space-12">
        {/* Column 1: Control Room */}
        <div className="bg-surface-container-lowest p-space-24 rounded-DEFAULT shadow-sm flex flex-col justify-between gap-space-16 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-space-12">
            <div className="w-12 h-12 rounded-DEFAULT bg-primary text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">speed</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Control Room &amp; Divisional Dispatchers</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Seamless real-time signal aspect telemetry, electronic interlocking clearance, headway minimization, and proactive detection of Permanent Speed Restrictions (PSR) across 68 divisions.
            </p>
          </div>
          <div className="flex flex-col gap-space-8 pt-space-12">
            <div className="flex items-center gap-space-8 text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">check_circle</span>
              <span>Section Controller Headway Radar</span>
            </div>
            <div className="flex items-center gap-space-8 text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">check_circle</span>
              <span>Automated Conflict Alerts</span>
            </div>
            <div className="flex items-center gap-space-8 text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">check_circle</span>
              <span>Loco Pilot Speed Verification</span>
            </div>
          </div>
        </div>

        {/* Column 2: Station Displays */}
        <div className="bg-surface-container-lowest p-space-24 rounded-DEFAULT shadow-sm flex flex-col justify-between gap-space-16 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-space-12">
            <div className="w-12 h-12 rounded-DEFAULT bg-secondary-container text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">display_settings</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Station NTES &amp; Platform Displays</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Direct low-latency push protocol to 8,000+ railway stations powering multi-lingual RGB LED platform boards, coach guidance indicators (CGDB), and synthesized automated PA audio broadcast systems.
            </p>
          </div>
          <div className="flex flex-col gap-space-8 pt-space-12">
            <div className="flex items-center gap-space-8 text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">check_circle</span>
              <span>Sub-50ms Synchronous LED Updates</span>
            </div>
            <div className="flex items-center gap-space-8 text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">check_circle</span>
              <span>Automated Hindi &amp; English Audio Engine</span>
            </div>
            <div className="flex items-center gap-space-8 text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">check_circle</span>
              <span>Platform Re-allocation Dynamic Rerouting</span>
            </div>
          </div>
        </div>

        {/* Column 3: Passenger Apps & B2B */}
        <div className="bg-surface-container-lowest p-space-24 rounded-DEFAULT shadow-sm flex flex-col justify-between gap-space-16 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-space-12">
            <div className="w-12 h-12 rounded-DEFAULT bg-tertiary-container text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">devices</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Passenger Apps &amp; B2B Aggregators</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Powers over 80 million daily active mobile sessions across IRCTC Rail Connect, Google Maps Transit, MakeMyTrip, Ixigo, and critical industrial supply chain coal/container tracking systems.
            </p>
          </div>
          <div className="flex flex-col gap-space-8 pt-space-12">
            <div className="flex items-center gap-space-8 text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">check_circle</span>
              <span>PNR-specific Live Boarding Countdowns</span>
            </div>
            <div className="flex items-center gap-space-8 text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">check_circle</span>
              <span>Instant Delay Push Webhooks (Kafka)</span>
            </div>
            <div className="flex items-center gap-space-8 text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">check_circle</span>
              <span>Strict 99.98% Service Level Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

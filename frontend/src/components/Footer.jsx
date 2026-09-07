import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low mt-space-48">
      <div className="w-full px-margin-edge py-space-32 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-24">
        <div className="flex flex-col gap-space-8 max-w-2xl">
          <div className="flex items-center gap-space-12">
            <span className="font-headline-sm text-headline-sm font-bold text-primary">Indian Railways RES Portal</span>
            <span className="font-label-sm text-label-sm bg-surface-container-highest text-on-surface px-space-8 py-space-2 rounded-DEFAULT">
              CRIS-IRCTC Network
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            © 2024 Centre for Railway Information Systems (CRIS), Ministry of Railways &amp; Indian Railway Catering and Tourism Corporation (IRCTC). All Rights Reserved. Restricted to authorized railway operations personnel and registered enterprise API developers.
          </p>
          <div className="flex flex-wrap items-center gap-space-16 text-on-surface-variant font-label-sm text-label-sm mt-space-4">
            <a className="hover:text-primary transition-colors" href="#">Security &amp; Encryption Standards</a>
            <span>•</span>
            <a className="hover:text-primary transition-colors" href="#">GIGW Accessibility Compliance</a>
            <span>•</span>
            <a className="hover:text-primary transition-colors" href="#">Developer Terms of Service</a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-24 bg-surface-container p-space-16 rounded-xl">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">Production API Uptime</span>
            <div className="flex items-center gap-space-4">
              <span className="font-headline-md text-headline-md font-bold text-primary font-mono">99.98%</span>
              <span className="material-symbols-outlined text-[18px] text-tertiary-container">verified</span>
            </div>
            <span className="font-label-sm text-label-sm text-outline">Last 90 days rolling average</span>
          </div>
          <div className="h-10 w-px bg-outline-variant/50 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">Emergency NOC Hotline</span>
            <span className="font-label-lg text-label-lg font-mono font-bold text-secondary">1800-111-CRIS (2747)</span>
            <span className="font-label-sm text-label-sm text-outline">Station Dispatch &amp; Telecom Desk</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React, { useState, useEffect } from 'react';

export default function Header({ activeNav, setActiveNav }) {
  const [timeStr, setTimeStr] = useState('26-OCT-2024 [14:48:32 IST]');
  const [lang, setLang] = useState('English');
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${day}-${month}-${year} [${hours}:${mins}:${secs} IST]`);
    };
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'api-console', label: 'API Console & Live Tester' },
    { id: 'control-room', label: 'Control Room & Signals' },
    { id: 'station-ntes', label: 'Station NTES Display' },
    { id: 'passenger-app', label: 'Passenger App (IRCTC)' },
    { id: 'b2b-webhooks', label: 'B2B Webhooks' },
    { id: 'sla-latency', label: 'SLA & Latency Telemetry' },
    { id: 'visualize', label: 'Visualize' },
    { id: 'agent-mcp', label: 'Agent MCP Integration' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
      {/* Top Govt Bar */}
      <div className="h-8 w-full bg-surface-container-low px-margin-edge flex items-center justify-between text-on-surface-variant border-b border-outline-variant/30">
        <div className="flex items-center gap-space-16">
          <div className="flex items-center gap-space-8">
            <span className="material-symbols-outlined text-[14px] text-primary">flag</span>
            <span className="font-label-sm text-label-sm tracking-wide text-primary font-semibold uppercase">
              Government of India | Ministry of Railways | CRIS
            </span>
          </div>
          <span className="hidden md:inline-block text-outline-variant">|</span>
          <div className="hidden md:flex items-center gap-space-8">
            <span className="material-symbols-outlined text-[14px] text-secondary">schedule</span>
            <span className="font-label-sm text-label-sm tracking-wider text-on-surface font-medium">
              {timeStr}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-16">
          <div className="flex items-center gap-space-4">
            <button 
              onClick={() => setFontSize('small')}
              className={`font-label-sm text-label-sm px-space-8 py-space-2 bg-surface hover:bg-surface-container text-on-surface rounded-DEFAULT transition-colors ${fontSize === 'small' ? 'font-bold underline' : ''}`} 
              type="button"
            >
              A-
            </button>
            <button 
              onClick={() => setFontSize('normal')}
              className={`font-label-sm text-label-sm px-space-8 py-space-2 bg-surface hover:bg-surface-container text-on-surface rounded-DEFAULT transition-colors ${fontSize === 'normal' ? 'font-bold' : ''}`} 
              type="button"
            >
              A
            </button>
            <button 
              onClick={() => setFontSize('large')}
              className={`font-label-sm text-label-sm px-space-8 py-space-2 bg-surface hover:bg-surface-container text-on-surface rounded-DEFAULT transition-colors ${fontSize === 'large' ? 'font-bold' : ''}`} 
              type="button"
            >
              A+
            </button>
          </div>
          <span className="text-outline-variant">|</span>
          <div className="flex items-center font-label-sm text-label-sm gap-space-8">
            <button 
              onClick={() => setLang('Hindi')}
              className={`transition-colors ${lang === 'Hindi' ? 'text-primary font-bold' : 'text-on-surface hover:text-secondary'}`} 
              type="button"
            >
              हिंदी
            </button>
            <span className="text-outline-variant">/</span>
            <button 
              onClick={() => setLang('English')}
              className={`transition-colors ${lang === 'English' ? 'text-primary font-bold' : 'text-on-surface hover:text-secondary'}`} 
              type="button"
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Main Logo & Profile Header */}
      <div className="h-16 w-full bg-surface px-margin-edge flex items-center justify-between gap-space-16">
        <div className="flex items-center gap-space-16">
          <img 
            alt="Railway RES Logo" 
            className="h-10 w-auto object-contain rounded-sm" 
            src="/railway_res_logo.jpg"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-space-8">
              <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold">INDIAN RAILWAYS RES</span>
              <span className="font-label-sm text-label-sm uppercase bg-surface-container text-primary px-space-8 py-space-2 rounded-DEFAULT tracking-wider font-semibold">CRIS Core</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Real-Time Train ETA &amp; Telemetry Platform</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-space-16">
          <div className="flex items-center gap-space-8 bg-surface-container-low px-space-12 py-space-8 rounded-DEFAULT">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary-container"></span>
            </span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider">Control Room Live Telemetry</span>
          </div>
          <div className="flex items-center gap-space-8 bg-surface-container-low px-space-12 py-space-8 rounded-DEFAULT">
            <span className="material-symbols-outlined text-[16px] text-primary">dns</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Cluster:</span>
            <span className="font-label-sm text-label-sm text-primary font-bold">CRIS Production Cluster 04 (NDLS)</span>
          </div>
        </div>

        <div className="flex items-center gap-space-16">
          <a className="hidden sm:flex items-center gap-space-4 font-label-md text-label-md text-primary hover:text-secondary transition-colors" href="#">
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            <span>API Docs</span>
          </a>
          <div className="flex items-center gap-space-12 pl-space-16">
            <div className="text-right hidden sm:flex flex-col">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">Er. Rajesh K. Varma</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Chief Operations Officer (NOC)</span>
            </div>
            <img 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/20" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAefAt3Kd1w1xpCq1jAeMnOM25tQwwcIx-UTjD0e8ptrR7v9DGYnd7FNfU9AzcLoaUefvPDAL6AV2hMnh925X33NK8-ZwFkzuoGM5KbXV20uQNYkDhTyAWeGTXLMW-juzCszGTJJzSwzXOk10b2yZVqxvHvL9gNQ2ujVvCsWGPIbbUT_vzd5IdiXWRdKk-CMzCKLSnzQ5IDDVoK0J5Rp0F3EPZuC_Ni1mcABfK5_8w-iAJh6Cb9gGIZLg"
            />
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="h-12 w-full bg-primary px-margin-edge flex items-center justify-between">
        <nav className="flex items-center gap-space-4 h-full overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`h-full px-space-16 flex items-center font-label-md text-label-md transition-colors whitespace-nowrap ${
                activeNav === item.id 
                  ? 'bg-primary-container text-on-primary font-bold' 
                  : 'text-on-primary-container hover:bg-primary-container hover:text-on-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-space-8 text-on-primary">
          <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">sensors</span>
          <span className="font-label-sm text-label-sm text-tertiary-fixed font-mono font-medium">FEED FREQ: 250ms</span>
        </div>
      </div>


    </header>
  );
}

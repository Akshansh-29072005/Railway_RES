import React from 'react';

export default function CategoryFilter({ activeCategory, setActiveCategory }) {
  const tabs = [
    { id: 'all', label: 'All APIs (12)' },
    { id: 'control-room', label: 'Control Room & Signals' },
    { id: 'station-ntes', label: 'Station Master & NTES Displays' },
    { id: 'passenger', label: 'Passenger Apps (IRCTC)' },
    { id: 'b2b', label: 'B2B Webhooks (OTAs & Transit)' }
  ];

  return (
    <div className="w-full bg-surface-container-low px-margin-edge py-space-12 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-space-16 overflow-x-auto">
        <div className="flex items-center gap-space-8 whitespace-nowrap" id="tab-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`tab-btn px-space-16 py-space-8 font-label-md text-label-md rounded-DEFAULT transition-colors ${
                activeCategory === tab.id
                  ? 'font-bold bg-primary text-on-primary shadow-sm'
                  : 'font-medium bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-space-8">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">Protocol Filter:</span>
          <span className="font-label-sm text-label-sm bg-surface px-space-8 py-space-4 font-mono font-bold text-primary rounded-DEFAULT">HTTP/2</span>
          <span className="font-label-sm text-label-sm bg-surface px-space-8 py-space-4 font-mono font-bold text-primary rounded-DEFAULT">WSS</span>
        </div>
      </div>
    </div>
  );
}

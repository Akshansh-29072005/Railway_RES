import React, { useState } from 'react';

export default function SecurityNotice() {
  const [showKeyModal, setShowKeyModal] = useState(false);

  const handleGenKey = () => {
    setShowKeyModal(true);
  };

  return (
    <>
      <section className="w-full bg-surface-container-low p-space-24 rounded-DEFAULT shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-24 mt-space-32">
        <div className="flex items-start gap-space-16 max-w-3xl">
          <div className="p-space-8 bg-surface-container-highest rounded-DEFAULT text-primary shrink-0">
            <span className="material-symbols-outlined text-[28px]">security</span>
          </div>
          <div className="flex flex-col gap-space-4">
            <div className="flex items-center gap-space-8">
              <h4 className="font-headline-sm text-headline-sm font-bold text-primary">
                Institutional Access &amp; Compliance Standards
              </h4>
              <span className="bg-primary-container text-white font-label-sm text-label-sm font-mono px-space-8 py-space-2 rounded-DEFAULT">
                GIGW 3.0 Compliant
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              RES telemetry APIs require Mutual TLS (mTLS) with CRIS Root CA certificates. Commercial aggregators and B2B developers must hold an authorized IRCTC Content Dissemination Agreement. Sandboxed mock feeds with synthetic GPS replay are unrestricted.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-12 shrink-0">
          <button
            onClick={handleGenKey}
            className="bg-primary hover:bg-primary-container text-white font-headline-sm text-headline-sm font-semibold px-space-20 py-space-12 rounded-DEFAULT shadow-sm transition-all flex items-center gap-space-8"
            id="gen-sandbox-key-btn"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">key</span>
            <span>Generate Sandbox Key</span>
          </button>
        </div>
      </section>

      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-space-16">
          <div className="bg-surface p-space-24 rounded-xl shadow-2xl max-w-md w-full border border-outline-variant flex flex-col gap-space-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-8 text-primary">
                <span className="material-symbols-outlined text-[24px]">vpn_key</span>
                <h3 className="font-headline-sm font-bold text-primary">CRIS Sandbox Key Generated</h3>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="bg-surface-container-lowest p-space-16 rounded-DEFAULT border border-outline-variant/40 flex flex-col gap-space-8 font-mono text-body-sm">
              <div>
                <span className="text-on-surface-variant">KEY: </span>
                <strong className="text-secondary select-all font-bold">iris_sandbox_live_8849b29e_cr24</strong>
              </div>
              <div>
                <span className="text-on-surface-variant">QUOTA: </span>
                <strong className="text-primary">10,000 req/day</strong>
              </div>
              <div>
                <span className="text-on-surface-variant">ENDPOINT: </span>
                <span className="text-tertiary-container truncate block">https://sandbox-telemetry.cris.org.in/v2.4</span>
              </div>
            </div>
            <button
              onClick={() => setShowKeyModal(false)}
              className="bg-primary text-white py-space-8 rounded-DEFAULT font-semibold hover:bg-primary-container transition-colors"
            >
              Done &amp; Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

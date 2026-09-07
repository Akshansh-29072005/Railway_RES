import React, { useState } from 'react';

const ENDPOINTS = {
  position: {
    method: 'GET',
    path: '/api/v2.4/eta/live-train-position',
    status: 'HTTP 200 OK',
    time: '14ms',
    payload: {
      "system": "RAILWAY_RES_CRIS_ENGINE_V2.4",
      "status": "SUCCESS",
      "train_info": {
        "train_number": "22436",
        "train_name": "VANDE BHARAT EXPRESS",
        "origin": "NDLS (New Delhi)",
        "destination": "BSB (Varanasi Junction)",
        "service_type": "PREMIUM_SUPERFAST_EMU",
        "rake_composition": "16_COACH_CHAIR_CAR"
      },
      "real_time_telemetry": {
        "rtis_gnss_status": "LOCKED_NAV_IC",
        "current_coordinates": { "latitude": 28.5831, "longitude": 77.2345 },
        "current_speed_kmph": 128.4,
        "max_sanctioned_speed": 130.0,
        "current_block_section": "TKJ-NZM UP FAST LINE",
        "signal_aspect": "DOUBLE_YELLOW_CAUTION_45KMPH"
      },
      "live_eta_schedule": [
        {
          "station_code": "CNB",
          "station_name": "Kanpur Central",
          "scheduled_arrival": "14:00",
          "predicted_eta": "14:02",
          "delay_minutes": 2,
          "platform_assigned": "Platform 01 (Confirmed)",
          "confidence_score": 0.984
        },
        {
          "station_code": "PRYJ",
          "station_name": "Prayagraj Junction",
          "scheduled_arrival": "16:08",
          "predicted_eta": "16:09",
          "delay_minutes": 1,
          "platform_assigned": "Platform 06 (Estimated)",
          "confidence_score": 0.962
        },
        {
          "station_code": "BSB",
          "station_name": "Varanasi Junction",
          "scheduled_arrival": "18:30",
          "predicted_eta": "18:30",
          "delay_minutes": 0,
          "status": "ON_TIME",
          "platform_assigned": "Platform 01",
          "confidence_score": 0.991
        }
      ],
      "control_room_flags": {
        "interlocking_clearance": true,
        "weather_condition": "CLEAR",
        "priority_level": "LEVEL_1_HIGHEST"
      }
    }
  },
  occupancy: {
    method: 'POST',
    path: '/api/v2.4/control-room/section-occupancy',
    status: 'HTTP 201 CREATED',
    time: '28ms',
    payload: {
      "system": "CRIS_SECTION_CONTROL_RADAR",
      "division": "NR_DELHI",
      "section_id": "NDLS-GZB-3A",
      "block_track_status": "OCCUPIED",
      "active_occupant": {
        "train_number": "12002",
        "loco_id": "WAP7_30221",
        "entry_timestamp": "2026-09-05T21:24:10+05:30",
        "clearing_eta": "2026-09-05T21:28:45+05:30"
      },
      "headway_safe_margin_seconds": 240,
      "next_signal_aspect": "GREEN_CLEAR_MAX_SANCTIONED",
      "automatic_block_signaling": "ENABLED"
    }
  },
  pids: {
    method: 'GET',
    path: '/api/v2.4/station/pids-feed',
    status: 'HTTP 200 OK',
    time: '9ms',
    payload: {
      "station_code": "NDLS",
      "pids_display_node": "PF_16_CONCOURSE_LED",
      "active_announcements": [
        {
          "train_number": "22436",
          "train_name_hi": "नई दिल्ली - वाराणसी वंदे भारत एक्सप्रेस",
          "train_name_en": "Vande Bharat Express",
          "platform": "16",
          "eta": "06:00",
          "status_text": "ON TIME / समय पर",
          "coach_formation": ["E1", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13", "C14", "E2"]
        }
      ],
      "refresh_interval_seconds": 15
    }
  },
  webhook: {
    method: 'POST',
    path: '/api/v2.4/b2b/webhook/delay-broadcaster',
    status: 'HTTP 202 ACCEPTED',
    time: '42ms',
    payload: {
      "event_type": "TRAIN_DELAY_THRESHOLD_EXCEEDED",
      "event_id": "EVT_7721094_DEL",
      "timestamp": "2026-09-05T21:26:28+05:30",
      "impacted_train": "12301",
      "train_name": "HOWRAH RAJDHANI EXPRESS",
      "current_delay_minutes": 28,
      "cause_code": "CAUTION_ORDER_CONSTRUCTION_ASR",
      "subscribers_notified": 184200,
      "target_aggregators": ["IRCTC_APP", "GOOG_TRANSIT_FEED", "MMT_CORE", "IXIGO_GATEWAY"]
    }
  }
};

export default function ApiExplorer({ trainNo, setTrainNo }) {
  const [activeRoute, setActiveRoute] = useState('position');
  const [division, setDivision] = useState('NR');
  const [responseMode, setResponseMode] = useState('full_telemetry');
  const [includeGnss, setIncludeGnss] = useState('true');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [responseTime, setResponseTime] = useState(ENDPOINTS['position'].time);
  const [currentPayload, setCurrentPayload] = useState(ENDPOINTS['position'].payload);

  const endpoint = ENDPOINTS[activeRoute];

  const handleRouteSelect = (routeKey) => {
    setActiveRoute(routeKey);
    setCurrentPayload(ENDPOINTS[routeKey].payload);
    setResponseTime(ENDPOINTS[routeKey].time);
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const updatedPayload = JSON.parse(JSON.stringify(ENDPOINTS[activeRoute].payload));
      if (updatedPayload.train_info) {
        updatedPayload.train_info.train_number = trainNo || '22436';
      }
      if (updatedPayload.real_time_telemetry) {
        updatedPayload.real_time_telemetry.current_speed_kmph = +(120 + Math.random() * 9).toFixed(1);
      }
      const randMs = Math.floor(10 + Math.random() * 15);
      setResponseTime(`${randMs}ms`);
      setCurrentPayload(updatedPayload);
      setIsExecuting(false);
    }, 320);
  };

  const handleResetParams = () => {
    setTrainNo('22436');
    setDivision('NR');
    setResponseMode('full_telemetry');
    setIncludeGnss('true');
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadSchema = () => {
    const schemaContent = `export interface RailwayResPayload {\n  system: string;\n  status: string;\n  train_info?: {\n    train_number: string;\n    train_name: string;\n  };\n}`;
    const blob = new Blob([schemaContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'railway-res-schema.d.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderHighlightedJson = (obj) => {
    const str = JSON.stringify(obj, null, 2);
    const highlighted = str.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-primary-fixed-dim'; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-secondary-fixed'; // key
          } else {
            cls = 'text-tertiary-fixed'; // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-emerald-400'; // boolean
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
    return { __html: highlighted };
  };

  return (
    <main className="w-full px-margin-edge py-space-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-space-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24">
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-16">
            <div className="bg-surface-container-lowest p-space-20 rounded-DEFAULT shadow-sm flex flex-col gap-space-16">
              <div className="flex items-center justify-between pb-space-8">
                <div className="flex items-center gap-space-8">
                  <span className="material-symbols-outlined text-[20px] text-primary">terminal</span>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-primary">API Endpoint Builder</h2>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">v2.4 STABLE</span>
              </div>

              <div className="flex flex-col gap-space-8">
                <label className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">
                  Active Operations Route
                </label>
                <div className="flex items-center gap-space-8 p-space-8 bg-surface-container-low rounded-DEFAULT">
                  <span className={`${endpoint.method === 'GET' ? 'bg-emerald-700' : 'bg-primary'} text-white font-label-sm text-label-sm font-bold px-space-8 py-space-4 rounded-DEFAULT`}>
                    {endpoint.method}
                  </span>
                  <span className="font-code-block text-code-block font-mono text-primary font-semibold truncate flex-1" id="active-endpoint-path">
                    {endpoint.path}
                  </span>
                </div>
              </div>

              {/* Parameter Form */}
              <div className="flex flex-col gap-space-12 pt-space-8">
                <span className="font-label-sm text-label-sm font-bold uppercase text-on-surface-variant tracking-wider">Request Parameters</span>
                
                <div className="flex flex-col gap-space-4">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface font-semibold font-mono">train_number</label>
                    <span className="font-label-sm text-label-sm text-secondary font-bold">REQUIRED</span>
                  </div>
                  <input
                    className="w-full bg-surface-container-low text-on-surface px-space-12 py-space-8 font-mono text-body-md rounded-DEFAULT focus:outline-none focus:bg-surface"
                    id="param-train-no"
                    placeholder="e.g. 12002, 22436"
                    type="text"
                    value={trainNo}
                    onChange={(e) => setTrainNo(e.target.value)}
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Vande Bharat Express (NDLS to BSB)</span>
                </div>

                <div className="flex flex-col gap-space-4">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface font-semibold font-mono">current_division</label>
                    <span className="font-label-sm text-label-sm text-outline">OPTIONAL</span>
                  </div>
                  <select
                    className="w-full bg-surface-container-low text-on-surface px-space-12 py-space-8 font-mono text-body-md rounded-DEFAULT focus:outline-none focus:bg-surface"
                    id="param-division"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                  >
                    <option value="NR">NR — Northern Railway (Delhi)</option>
                    <option value="NCR">NCR — North Central (Prayagraj)</option>
                    <option value="WR">WR — Western Railway (Mumbai)</option>
                    <option value="ER">ER — Eastern Railway (Kolkata)</option>
                    <option value="SCR">SCR — South Central (Secunderabad)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-space-12">
                  <div className="flex flex-col gap-space-4">
                    <label className="font-label-md text-label-md text-on-surface font-semibold font-mono">response_mode</label>
                    <select
                      className="w-full bg-surface-container-low text-on-surface px-space-12 py-space-8 font-mono text-label-md rounded-DEFAULT focus:outline-none"
                      id="param-mode"
                      value={responseMode}
                      onChange={(e) => setResponseMode(e.target.value)}
                    >
                      <option value="full_telemetry">full_telemetry</option>
                      <option value="compact_eta">compact_eta</option>
                      <option value="block_section_only">block_section</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-space-4">
                    <label className="font-label-md text-label-md text-on-surface font-semibold font-mono">include_gnss</label>
                    <select
                      className="w-full bg-surface-container-low text-on-surface px-space-12 py-space-8 font-mono text-label-md rounded-DEFAULT focus:outline-none"
                      id="param-gnss"
                      value={includeGnss}
                      onChange={(e) => setIncludeGnss(e.target.value)}
                    >
                      <option value="true">true (NavIC Locked)</option>
                      <option value="false">false</option>
                    </select>
                  </div>
                </div>

                <div className="pt-space-8 flex items-center gap-space-12">
                  <button
                    onClick={handleExecute}
                    disabled={isExecuting}
                    className="flex-1 bg-secondary hover:bg-on-secondary-fixed text-white font-headline-sm text-headline-sm font-semibold py-space-12 px-space-16 rounded-DEFAULT shadow-md flex items-center justify-center gap-space-8 transition-colors disabled:opacity-75"
                    id="send-request-btn"
                  >
                    {isExecuting ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                        <span>Querying CRIS Radar...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                        <span>Execute Telemetry Query</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleResetParams}
                    className="bg-surface-container text-on-surface hover:bg-surface-container-high px-space-12 py-space-12 rounded-DEFAULT transition-colors"
                    id="reset-params-btn"
                    title="Reset Default Params"
                  >
                    <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Catalog Endpoints List */}
            <div className="bg-surface-container-lowest p-space-16 rounded-DEFAULT shadow-sm flex flex-col gap-space-12">
              <span className="font-label-sm text-label-sm font-bold uppercase text-on-surface-variant tracking-wider">Mission-Critical Catalog</span>
              <div className="flex flex-col gap-space-8">
                <div
                  onClick={() => handleRouteSelect('position')}
                  className={`endpoint-card p-space-12 rounded-DEFAULT cursor-pointer flex flex-col gap-space-4 transition-colors ${
                    activeRoute === 'position' ? 'bg-surface-container-low' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-8">
                      <span className="bg-emerald-700 text-white font-label-sm text-label-sm font-bold px-space-8 py-space-2 rounded-DEFAULT">GET</span>
                      <span className="font-code-block text-code-block text-primary font-bold">/eta/live-train-position</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-tertiary-container">sensors</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time RTIS GNSS coordinate tracking, line speed &amp; section interlocking.</p>
                </div>

                <div
                  onClick={() => handleRouteSelect('occupancy')}
                  className={`endpoint-card p-space-12 rounded-DEFAULT cursor-pointer flex flex-col gap-space-4 transition-colors ${
                    activeRoute === 'occupancy' ? 'bg-surface-container-low' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-8">
                      <span className="bg-primary text-white font-label-sm text-label-sm font-bold px-space-8 py-space-2 rounded-DEFAULT">POST</span>
                      <span className="font-code-block text-code-block text-primary font-semibold">/control-room/section-occupancy</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-outline">traffic</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Block section telemetry, headway safety calculations, and signal aspects.</p>
                </div>

                <div
                  onClick={() => handleRouteSelect('pids')}
                  className={`endpoint-card p-space-12 rounded-DEFAULT cursor-pointer flex flex-col gap-space-4 transition-colors ${
                    activeRoute === 'pids' ? 'bg-surface-container-low' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-8">
                      <span className="bg-emerald-700 text-white font-label-sm text-label-sm font-bold px-space-8 py-space-2 rounded-DEFAULT">GET</span>
                      <span className="font-code-block text-code-block text-primary font-semibold">/station/pids-feed</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-outline">tv</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Passenger Information Display System platform assign &amp; audio synch.</p>
                </div>

                <div
                  onClick={() => handleRouteSelect('webhook')}
                  className={`endpoint-card p-space-12 rounded-DEFAULT cursor-pointer flex flex-col gap-space-4 transition-colors ${
                    activeRoute === 'webhook' ? 'bg-surface-container-low' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-8">
                      <span className="bg-primary text-white font-label-sm text-label-sm font-bold px-space-8 py-space-2 rounded-DEFAULT">POST</span>
                      <span className="font-code-block text-code-block text-primary font-semibold">/b2b/webhook/delay-broadcaster</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-outline">webhook</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Automated bulk push webhooks for delay exceeding +15min thresholds.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-16">
            <div className="bg-surface-container-lowest rounded-DEFAULT shadow-sm flex flex-col overflow-hidden">
              <div className="bg-primary px-space-16 py-space-12 flex flex-wrap items-center justify-between gap-space-12 text-white">
                <div className="flex items-center gap-space-12">
                  <div className="flex items-center gap-space-6 bg-emerald-950 px-space-8 py-space-4 rounded-DEFAULT">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span className="font-label-sm text-label-sm font-bold font-mono text-emerald-300" id="response-status-badge">
                      {endpoint.status}
                    </span>
                  </div>
                  <span className="text-outline-variant">|</span>
                  <span className="font-label-sm text-label-sm font-mono text-primary-fixed" id="response-time-badge">
                    Response: {responseTime}
                  </span>
                  <span className="hidden sm:inline-block font-label-sm text-label-sm font-mono text-primary-fixed-dim">JSON-UTF8</span>
                </div>
                <div className="flex items-center gap-space-8">
                  <button
                    onClick={handleCopyJson}
                    className="bg-primary-container text-white px-space-12 py-space-4 font-label-sm text-label-sm rounded-DEFAULT hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-space-4"
                    id="copy-json-btn"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSchema}
                    className="bg-primary-container text-white px-space-12 py-space-4 font-label-sm text-label-sm rounded-DEFAULT hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-space-4"
                    id="download-schema-btn"
                  >
                    <span className="material-symbols-outlined text-[14px]">file_download</span>
                    <span>Schema (.d.ts)</span>
                  </button>
                </div>
              </div>

              {/* Sub-ribbon */}
              <div className="bg-surface-container-low px-space-16 py-space-8 flex flex-wrap items-center justify-between gap-space-8 text-on-surface font-mono text-label-sm">
                <div className="flex items-center gap-space-12">
                  <span className="text-on-surface-variant">CURRENT LOCO: <strong className="text-primary">WAP-7 #30498</strong></span>
                  <span>COORD: <strong class="text-primary font-bold">28.5831° N, 77.2345° E</strong></span>
                </div>
                <div className="flex items-center gap-space-8">
                  <span className="bg-surface px-space-8 py-space-2 rounded-DEFAULT text-emerald-800 font-bold">
                    SPEED: {currentPayload?.real_time_telemetry?.current_speed_kmph || '128.4'} KM/H
                  </span>
                  <span className="bg-surface px-space-8 py-space-2 rounded-DEFAULT text-secondary font-bold">DELAY: +02 MIN</span>
                </div>
              </div>

              {/* Terminal Code Window */}
              <div className="bg-inverse-surface p-space-16 overflow-x-auto min-h-[420px] max-h-[580px]">
                <pre
                  className="font-code-block text-code-block text-inverse-on-surface leading-relaxed whitespace-pre font-mono"
                  id="json-code-container"
                  dangerouslySetInnerHTML={renderHighlightedJson(currentPayload)}
                />
              </div>

              <div className="bg-surface-container-high px-space-16 py-space-8 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <div className="flex items-center gap-space-12">
                  <span className="flex items-center gap-space-4">
                    <span className="material-symbols-outlined text-[14px] text-tertiary-container">lock</span>
                    <span>TLS 1.3 End-to-End Cryptography</span>
                  </span>
                  <span className="hidden sm:inline-block">•</span>
                  <span className="hidden sm:inline-block">Payload Size: 1.84 KB</span>
                </div>
                <span className="font-mono text-primary font-bold">RATE LIMIT: 100,000 / HR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

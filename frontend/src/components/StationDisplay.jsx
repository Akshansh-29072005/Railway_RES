import React, { useState, useEffect } from 'react';
import { STATIONS, minsToTime } from '../data/corridorData';
import { getSimulator } from '../services/telemetrySimulator';

const StationDisplay = () => {
  const [selectedStation, setSelectedStation] = useState('R'); // Default Raipur
  const [simState, setSimState] = useState(null);
  
  useEffect(() => {
    const sim = getSimulator();
    if (sim.state && sim.state.isPaused) {
      sim.start(); // Ensure it is running
    }
    
    // Set initial state
    setSimState(sim.state);
    
    // Subscribe to updates
    const unsubscribe = sim.subscribe((newState) => {
      setSimState(newState);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  if (!simState) {
    return (
      <div style={{ backgroundColor: '#000', color: '#ff6a00', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Courier New, monospace' }}>
        LOADING TELEMETRY...
      </div>
    );
  }

  const stationObj = STATIONS.find(s => s.code === selectedStation);
  
  // Filter trains for arrivals and departures
  const stationTrains = simState.trains.filter(t => 
    t.schedule && t.schedule.some(s => s.station === selectedStation)
  );

  const getTrainETA = (train) => {
    if (train.etas && train.etas[selectedStation]) {
      return train.etas[selectedStation].mlStr || train.etas[selectedStation].scheduledStr || '--:--';
    }
    return '--:--';
  };

  const getTrainDelay = (train) => {
    if (train.etas && train.etas[selectedStation]) {
      return train.etas[selectedStation].delayVsSchedule || 0;
    }
    return train.delayMinutes || 0;
  };

  const getTrainPlatform = (train) => {
    if (train.etas && train.etas[selectedStation]) {
      return train.etas[selectedStation].platform || '-';
    }
    return '-';
  };

  const arrivals = [...stationTrains].sort((a, b) => {
    const timeA = getTrainETA(a);
    const timeB = getTrainETA(b);
    return timeA.localeCompare(timeB);
  }).slice(0, 5);

  const departures = [...stationTrains].sort((a, b) => {
    const timeA = getTrainETA(a);
    const timeB = getTrainETA(b);
    return timeA.localeCompare(timeB);
  }).slice(0, 5);

  const ledGlowStyle = {
    color: '#ff6a00',
    textShadow: '0 0 5px #ff6a00, 0 0 10px #ff4500, 0 0 15px #ff4500',
    fontFamily: '"Courier New", Courier, monospace',
    textTransform: 'uppercase',
  };
  
  const ledRedStyle = {
    color: '#ff2222',
    textShadow: '0 0 5px #ff2222, 0 0 10px #ff0000',
    fontFamily: '"Courier New", Courier, monospace',
    textTransform: 'uppercase',
  };

  const ledGreenStyle = {
    color: '#22ff22',
    textShadow: '0 0 5px #22ff22, 0 0 10px #00ff00',
    fontFamily: '"Courier New", Courier, monospace',
    textTransform: 'uppercase',
  };

  // Build announcement ticker
  const tickerTrains = stationTrains.filter(t => getTrainDelay(t) > 0 || (t.etas && t.etas[selectedStation] && t.etas[selectedStation].mlStr));
  let tickerText = 'Welcome to Indian Railways NTES - ';
  if (tickerTrains.length > 0) {
    const t = tickerTrains[0];
    const pf = getTrainPlatform(t);
    tickerText += `Train ${t.trainNumber} ${t.trainName} is arriving at Platform ${pf} — कृपया प्लेटफ़ॉर्म ${pf} पर आएँ | `;
  }
  tickerText += `Current Time: ${simState.simTimeStr} | Help line: 139`;

  const renderTableRows = (trains) => {
    if (trains.length === 0) {
      return (
        <tr>
          <td colSpan="6" style={{ textAlign: 'center', padding: '10px', ...ledGlowStyle }}>NO TRAINS SCHEDULED</td>
        </tr>
      );
    }

    return trains.map((t, idx) => {
      const delay = getTrainDelay(t);
      const isLate = delay > 5;
      const eta = getTrainETA(t);
      const platform = getTrainPlatform(t);

      return (
        <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
          <td style={{ padding: '8px', ...ledGlowStyle }}>{t.trainNumber}</td>
          <td style={{ padding: '8px', ...ledGlowStyle }}>
            <div>{t.trainName}</div>
          </td>
          <td style={{ padding: '8px', ...ledGlowStyle }}>{eta}</td>
          <td style={{ padding: '8px', ...ledGlowStyle }}>{isLate ? <span style={ledRedStyle}>DELAYED</span> : <span style={ledGreenStyle}>ON TIME</span>}</td>
          <td style={{ padding: '8px', ...ledGlowStyle }}>{platform}</td>
        </tr>
      );
    });
  };

  return (
    <div style={{
      backgroundColor: '#000000',
      width: '100%',
      height: '100%',
      minHeight: '100vh',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 4px, 3px 100%',
        pointerEvents: 'none',
        zIndex: 10
      }}></div>

      {/* Header / Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <select 
            value={selectedStation} 
            onChange={(e) => setSelectedStation(e.target.value)}
            style={{
              backgroundColor: '#111',
              color: '#ff6a00',
              border: '1px solid #ff6a00',
              padding: '10px',
              fontFamily: '"Courier New", monospace',
              fontSize: '18px',
              outline: 'none',
              cursor: 'pointer',
              ...ledGlowStyle
            }}
          >
            {STATIONS.map(s => (
              <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
            ))}
          </select>
          <div style={{ ...ledGlowStyle, fontSize: '24px' }}>
            {stationObj?.nameHi || 'रेलवे स्टेशन'} / {stationObj?.name || 'RAILWAY STATION'}
          </div>
        </div>
        <div style={{ ...ledGlowStyle, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div>TIME: {simState.simTimeStr}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1, zIndex: 5 }}>
        {/* Arrivals */}
        <div style={{ flex: 1, border: '2px solid #333', borderRadius: '5px', padding: '10px', backgroundColor: '#0a0a0a' }}>
          <h2 style={{ ...ledGlowStyle, borderBottom: '2px dashed #ff6a00', paddingBottom: '10px', textAlign: 'center', marginTop: 0 }}>
            ARRIVALS / आगमन
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ ...ledGlowStyle, padding: '10px 8px', borderBottom: '1px solid #555' }}>Train No.</th>
                <th style={{ ...ledGlowStyle, padding: '10px 8px', borderBottom: '1px solid #555' }}>Train Name</th>
                <th style={{ ...ledGlowStyle, padding: '10px 8px', borderBottom: '1px solid #555' }}>Expt.Time</th>
                <th style={{ ...ledGlowStyle, padding: '10px 8px', borderBottom: '1px solid #555' }}>Status</th>
                <th style={{ ...ledGlowStyle, padding: '10px 8px', borderBottom: '1px solid #555' }}>PF.No</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRows(arrivals)}
            </tbody>
          </table>
        </div>

        {/* Departures */}
        <div style={{ flex: 1, border: '2px solid #333', borderRadius: '5px', padding: '10px', backgroundColor: '#0a0a0a' }}>
          <h2 style={{ ...ledGlowStyle, borderBottom: '2px dashed #ff6a00', paddingBottom: '10px', textAlign: 'center', marginTop: 0 }}>
            DEPARTURES / प्रस्थान
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ ...ledGlowStyle, padding: '10px 8px', borderBottom: '1px solid #555' }}>Train No.</th>
                <th style={{ ...ledGlowStyle, padding: '10px 8px', borderBottom: '1px solid #555' }}>Train Name</th>
                <th style={{ ...ledGlowStyle, padding: '10px 8px', borderBottom: '1px solid #555' }}>Expt.Time</th>
                <th style={{ ...ledGlowStyle, padding: '10px 8px', borderBottom: '1px solid #555' }}>Status</th>
                <th style={{ ...ledGlowStyle, padding: '10px 8px', borderBottom: '1px solid #555' }}>PF.No</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRows(departures)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Occupancy */}
      <div style={{ marginTop: '20px', zIndex: 5, padding: '15px', border: '1px solid #333', backgroundColor: '#0a0a0a' }}>
        <h3 style={{ ...ledGlowStyle, marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>PLATFORM OCCUPANCY / प्लेटफ़ॉर्म स्थिति</h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          {[1, 2, 3, 4, 5, 6, 7].map(pf => {
            const occupiedBy = stationTrains.find(t => getTrainPlatform(t) == pf && t.etas && t.etas[selectedStation] && Math.abs(t.etas[selectedStation].delayVsSchedule) < 60); // Mock logic for occupied
            const isOccupied = !!occupiedBy;
            
            return (
              <div key={pf} style={{ 
                flex: 1, 
                border: '1px solid #333', 
                padding: '10px', 
                textAlign: 'center',
                backgroundColor: isOccupied ? 'rgba(255, 34, 34, 0.1)' : 'rgba(34, 255, 34, 0.1)'
              }}>
                <div style={{ ...ledGlowStyle, fontSize: '20px', marginBottom: '5px' }}>PF {pf}</div>
                <div style={{ ...(isOccupied ? ledRedStyle : ledGreenStyle), fontSize: '14px' }}>
                  {isOccupied ? `TRN ${occupiedBy.trainNumber}` : 'FREE'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Announcements Ticker */}
      <div style={{ 
        marginTop: '20px', 
        overflow: 'hidden', 
        whiteSpace: 'nowrap',
        border: '1px solid #ff6a00',
        padding: '10px',
        backgroundColor: '#111',
        zIndex: 5
      }}>
        <style>{`
          @keyframes tickerScroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
        <div style={{
          ...ledGlowStyle,
          display: 'inline-block',
          animation: 'tickerScroll 25s linear infinite',
          fontSize: '20px'
        }}>
          *** {tickerText} *** {tickerText} ***
        </div>
      </div>
      
    </div>
  );
};

export default StationDisplay;

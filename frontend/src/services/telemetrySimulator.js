import { TRAINS, interpolatePosition, interpolatePositionUp, CORRIDOR_BLOCKS } from '../data/corridorData';
import { CABLE_PLAN_SIGNALS, chainageToKm } from '../data/cablePlanData';

const DEFAULT_TICK_INTERVAL_MS = 1000;

export class SimulationEngine {
  constructor() {
    this.trains = [];
    this.signals = [];
    this.blocks = [];
    this.isPaused = false;
    this.tickInterval = null;
    this.listeners = [];
    
    // Initialize signals from physical schematic data
    this.signals = CABLE_PLAN_SIGNALS.map(s => {
      const km = chainageToKm(s.chainage);
      const coords = interpolatePosition(km);
      return {
        ...s,
        km,
        lat: coords && !isNaN(coords.lat) ? coords.lat : 0,
        lng: coords && !isNaN(coords.lng) ? coords.lng : 0,
        aspect: s.defaultAspect
      };
    }).filter(s => s.lat !== 0 && s.lng !== 0); // Drop invalid ones to prevent crash
    
    // Create physical blocks from signals (sorted by KM)
    const sortedSigs = [...this.signals].sort((a, b) => a.km - b.km);
    for (let i = 0; i < sortedSigs.length - 1; i++) {
      this.blocks.push({
        id: `BLK_${sortedSigs[i].id}_${sortedSigs[i+1].id}`,
        startKm: sortedSigs[i].km,
        endKm: sortedSigs[i+1].km,
        state: 'FREE'
      });
    }

    // Initialize 4 Demo Trains
    this.trains = [
      {
        trainNumber: '12808', trainName: 'Samta Express (SRWN->UKR)', color: '#3b82f6',
        direction: 'UP', currentKm: 936.5, status: 'RUNNING',
        currentLat: 0, currentLng: 0, delayMinutes: 0, scheduledTime: "14:30"
      },
      {
        trainNumber: '12102', trainName: 'Jnaneswari Deluxe (Standing at R)', color: '#ef4444',
        direction: 'DN', currentKm: 933.6, status: 'STANDING',
        currentLat: 0, currentLng: 0, delayMinutes: 0, scheduledTime: "14:45"
      },
      {
        trainNumber: '12833', trainName: 'Howrah Express (UKR->SRWN)', color: '#eab308',
        direction: 'DN', currentKm: 928.9, status: 'RUNNING',
        currentLat: 0, currentLng: 0, delayMinutes: 0, scheduledTime: "15:00"
      },
      {
        trainNumber: '22815', trainName: 'Ernakulam Express (Random)', color: '#10b981',
        direction: 'UP', currentKm: 950.0, status: 'RUNNING',
        currentLat: 0, currentLng: 0, delayMinutes: 0, scheduledTime: "15:15"
      }
    ];

    this.activeMaintenance = [];
    // Start polling backend for maintenance every 2 seconds
    setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8080/api/maintenance/active");
        if (res.ok) {
           this.activeMaintenance = await res.json();
        }
      } catch (e) {}
    }, 2000);
  }

  start() {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => {
      if (!this.isPaused) this.tick();
    }, DEFAULT_TICK_INTERVAL_MS);
  }

  stop() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = null;
  }

  pause() { this.isPaused = true; }
  resume() { this.isPaused = false; }
  togglePause() { this.isPaused = !this.isPaused; }
  setSpeed(multiplier) {}

  subscribe(listener) {
    this.listeners.push(listener);
    // Initial emit
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState() {
    return {
      trains: this.trains,
      signals: this.signals,
      blocks: this.blocks,
      isPaused: this.isPaused,
      simTimeStr: '14:00',
      activeMaintenance: this.activeMaintenance
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  tick() {
    // 1. Move trains
    this.trains.forEach(t => {
      if (t.status === 'RUNNING') {
        let speedKmph = 20; // Default slow demo speed

        const inMaintenance = this.activeMaintenance.some(m => {
          const block = CORRIDOR_BLOCKS.find(b => b.id === m.section_block);
          if (block) {
            return t.currentKm >= Math.min(block.startKm, block.endKm) && 
                   t.currentKm <= Math.max(block.startKm, block.endKm);
          }
          return false;
        });

        if (inMaintenance) {
          speedKmph = 5; // Severe speed restriction
          t.delayMinutes += 0.05; // Dynamically increase delay!
        }

        t.currentSpeed = speedKmph; // Save speed for UI
        const distKm = (speedKmph / 3600); // dist per second
        
        if (t.direction === 'DN') {
          t.currentKm += distKm;
          if (t.currentKm > 965) t.currentKm = 828; // loop
        } else {
          t.currentKm -= distKm;
          if (t.currentKm < 823) t.currentKm = 960; // loop
        }
        
        const pos = t.direction === 'DN' 
          ? interpolatePosition(t.currentKm) 
          : interpolatePositionUp(t.currentKm);
          
        t.currentLat = pos && !isNaN(pos.lat) ? pos.lat : 0;
        t.currentLng = pos && !isNaN(pos.lng) ? pos.lng : 0;
      }
    });
    
    // 2. Evaluate Block Occupancy
    this.blocks.forEach(blk => {
      blk.state = 'FREE';
      this.trains.forEach(t => {
        if (t.currentKm >= blk.startKm && t.currentKm <= blk.endKm) {
          blk.state = 'OCCUPIED';
        }
      });
    });

    // 3. Physical Signal Logic based on Blocks
    this.signals.forEach(sig => {
      let occupied = false;
      this.trains.forEach(t => {
        if (t.direction === 'DN' && sig.routeDirection !== 'NAGPUR') {
           if (t.currentKm > sig.km && t.currentKm < sig.km + 2) occupied = true;
        } else if (t.direction === 'UP' && sig.routeDirection === 'NAGPUR') {
           if (t.currentKm < sig.km && t.currentKm > sig.km - 2) occupied = true;
        }
      });
      sig.aspect = occupied ? 'RED' : sig.defaultAspect;
    });

    this.notify();
  }
}

let instance = null;
export function getSimulator() {
  if (!instance) instance = new SimulationEngine();
  return instance;
}

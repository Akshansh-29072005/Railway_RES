import { TRAINS, interpolatePosition, interpolatePositionUp } from '../data/corridorData';
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

    // Initialize trains
    TRAINS.forEach((train, i) => {
      this.trains.push({
        trainNumber: train.number,
        trainName: train.name,
        color: train.color,
        direction: train.direction,
        currentKm: train.direction === 'DN' ? 828 - (i*5) : 960 + (i*5),
        status: 'RUNNING',
        currentLat: 0,
        currentLng: 0,
        delayMinutes: 0
      });
    });
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
      simTimeStr: '14:00'
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
        const speedKmph = 60; 
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

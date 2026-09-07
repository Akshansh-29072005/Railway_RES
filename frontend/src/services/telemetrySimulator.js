/**
 * telemetrySimulator.js — Real-time Train Telemetry Simulation Engine
 * 
 * Provides a tick-based simulation of train movements along the
 * Raipur–Durg corridor with three ETA calculation methods:
 *   1. Schedule ETA (pure timetable)
 *   2. Baseline/COA ETA (linear extrapolation)
 *   3. ML Model ETA (weighted prediction with confidence)
 * 
 * Usage:
 *   import { SimulationEngine } from './telemetrySimulator';
 *   const sim = new SimulationEngine();
 *   sim.start(); // begins ticking
 *   const state = sim.getState(); // returns current snapshot
 */

import {
  STATIONS, TRAINS, SIGNALS, RESTRICTIONS,
  interpolatePosition, interpolatePositionUp, getStation, minsToTime, DELAY_REASONS
} from '../data/corridorData';

// ─── SIMULATION CONFIGURATION ───────────────────────────────────
const DEFAULT_TICK_INTERVAL_MS = 1000; // 1 second real-time per tick
const CORRIDOR_LENGTH_KM = 40;

// ─── TRAIN STATE ────────────────────────────────────────────────
function createTrainState(train, simTimeMin) {
  // Find the first scheduled stop
  const firstStop = train.schedule[0];
  const lastStop = train.schedule[train.schedule.length - 1];
  
  // Start time: 10 minutes before first station arrival (or departure if origin)
  const startTime = (firstStop.arr || firstStop.dep) - 10;
  const endTime = (lastStop.arr || lastStop.dep);

  // Initial km based on direction
  let initialKm = train.direction === 'DN' ? -5 : CORRIDOR_LENGTH_KM + 5;

  return {
    trainNumber: train.number,
    trainName: train.name,
    trainNameHi: train.nameHi,
    trainType: train.type,
    rake: train.rake,
    origin: train.origin,
    destination: train.destination,
    direction: train.direction,
    maxSpeed: train.maxSpeed,
    color: train.color,
    schedule: train.schedule,

    // Dynamic state
    currentKm: initialKm,
    currentSpeed: 0,
    currentLat: 0,
    currentLng: 0,
    delayMinutes: Math.floor(Math.random() * 12), // Initial random delay 0-11 min
    delayReason: 'CARRY',
    blockSection: '',
    lastStation: null,
    nextStation: train.schedule[0]?.station || null,
    status: 'NOT_STARTED', // NOT_STARTED | RUNNING | AT_STATION | COMPLETED
    haltTimer: 0,
    scheduleIndex: 0,

    // Timing
    startTime,
    endTime,

    // ETA predictions for each upcoming station
    etas: {},
  };
}

// ─── SIMULATION ENGINE ──────────────────────────────────────────
export class SimulationEngine {
  constructor() {
    this.trainStates = [];
    this.signalStates = [...SIGNALS.map(s => ({ ...s, aspect: 'GREEN' }))];
    this.simTimeMin = 840; // Start at 14:00 (840 minutes from midnight)
    this.speedMultiplier = 1;
    this.isPaused = false;
    this.tickInterval = null;
    this.listeners = [];
    this.tickCount = 0;

    // Initialize train states
    TRAINS.forEach(train => {
      this.trainStates.push(createTrainState(train, this.simTimeMin));
    });
  }

  // ─── CONTROL ────────────────────────────────────────────────
  start() {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => {
      if (!this.isPaused) {
        this.tick();
      }
    }, DEFAULT_TICK_INTERVAL_MS);
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  pause() { this.isPaused = true; }
  resume() { this.isPaused = false; }
  togglePause() { this.isPaused = !this.isPaused; }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  // ─── MAIN TICK ──────────────────────────────────────────────
  tick() {
    this.tickCount++;
    // Advance simulation time (each tick = speedMultiplier * 0.1 minutes of sim time)
    const timeAdvance = this.speedMultiplier * 0.1;
    this.simTimeMin += timeAdvance;

    // Update each train
    this.trainStates.forEach(ts => this.updateTrain(ts, timeAdvance));

    // Update signal aspects based on block occupancy
    this.updateSignals();

    // Calculate ETAs for all active trains
    this.trainStates.forEach(ts => {
      if (ts.status === 'RUNNING' || ts.status === 'AT_STATION') {
        this.calculateETAs(ts);
      }
    });

    this.notify();
  }

  // ─── TRAIN MOVEMENT ─────────────────────────────────────────
  updateTrain(ts, timeAdvanceMin) {
    const scheduleStartTime = ts.startTime + ts.delayMinutes;

    // Not yet started
    if (this.simTimeMin < scheduleStartTime) {
      ts.status = 'NOT_STARTED';
      return;
    }

    // Already completed
    if (ts.status === 'COMPLETED') return;

    const lastStop = ts.schedule[ts.schedule.length - 1];
    const finalKm = ts.direction === 'DN'
      ? (getStation(lastStop.station)?.km ?? CORRIDOR_LENGTH_KM)
      : 0;

    // Check if train has reached final destination
    if (ts.direction === 'DN' && ts.currentKm >= finalKm) {
      ts.status = 'COMPLETED';
      ts.currentSpeed = 0;
      ts.currentKm = finalKm;
      const pos = interpolatePosition(ts.currentKm);
      ts.currentLat = pos.lat;
      ts.currentLng = pos.lng;
      return;
    }
    if (ts.direction === 'UP' && ts.currentKm <= finalKm) {
      ts.status = 'COMPLETED';
      ts.currentSpeed = 0;
      ts.currentKm = finalKm;
      const pos = interpolatePosition(ts.currentKm);
      ts.currentLat = pos.lat;
      ts.currentLng = pos.lng;
      return;
    }

    // Handle station halt
    if (ts.status === 'AT_STATION') {
      ts.haltTimer -= timeAdvanceMin;
      ts.currentSpeed = 0;
      if (ts.haltTimer <= 0) {
        ts.status = 'RUNNING';
        ts.scheduleIndex++;
        ts.haltTimer = 0;
        // Update next station
        if (ts.scheduleIndex < ts.schedule.length) {
          ts.nextStation = ts.schedule[ts.scheduleIndex].station;
        }
      }
      return;
    }

    ts.status = 'RUNNING';

    // Determine target speed based on restrictions
    let targetSpeed = ts.maxSpeed;
    
    // Check active disruption speed limit
    if (ts.disruptionTicks > 0) {
      ts.disruptionTicks--;
      targetSpeed = Math.min(targetSpeed, ts.disruptionSpeedLimit ?? 0);
      if (ts.disruptionSpeedLimit === 0) {
        ts.currentSpeed = Math.max(0, ts.currentSpeed - 35 * timeAdvanceMin);
      }
    }

    // Check TSR/PSR zones
    const effectiveKm = ts.direction === 'DN' ? ts.currentKm : (CORRIDOR_LENGTH_KM - ts.currentKm);
    for (const r of RESTRICTIONS) {
      if (effectiveKm >= r.fromKm && effectiveKm <= r.toKm) {
        targetSpeed = Math.min(targetSpeed, r.speedLimit);
        if (ts.delayReason === 'ONTIME' || ts.delayReason === 'CARRY') {
          ts.delayReason = 'TSR';
        }
      }
    }

    // Check if approaching next station (slow down within 1.5km)
    if (ts.scheduleIndex < ts.schedule.length) {
      const nextStationData = getStation(ts.schedule[ts.scheduleIndex].station);
      if (nextStationData) {
        const nextKm = ts.direction === 'DN' ? nextStationData.km : (CORRIDOR_LENGTH_KM - nextStationData.km);
        const distToStation = Math.abs(nextKm - ts.currentKm);
        if (distToStation < 1.5) {
          targetSpeed = Math.min(targetSpeed, 30 + distToStation * 40);
        }
        // Check if arrived at station
        if (distToStation < 0.15) {
          const schedStop = ts.schedule[ts.scheduleIndex];
          const haltDuration = nextStationData.haltMin || 1;
          ts.status = 'AT_STATION';
          ts.haltTimer = haltDuration;
          ts.lastStation = schedStop.station;
          ts.currentKm = nextKm;
          ts.currentSpeed = 0;

          // Add small random delay variation
          if (Math.random() < 0.3) {
            ts.delayMinutes += Math.floor(Math.random() * 4);
            const reasons = ['CONGESTION', 'SIGNAL', 'PLATFORM', 'CROSSING'];
            ts.delayReason = reasons[Math.floor(Math.random() * reasons.length)];
          }

          const pos = interpolatePosition(ts.direction === 'DN' ? ts.currentKm : (CORRIDOR_LENGTH_KM - ts.currentKm));
          ts.currentLat = pos.lat;
          ts.currentLng = pos.lng;
          return;
        }
      }
    }

    // Accelerate/decelerate toward target speed
    const speedDiff = targetSpeed - ts.currentSpeed;
    const accel = speedDiff > 0 ? 15 : -25; // km/h per minute
    ts.currentSpeed = Math.max(0, Math.min(ts.maxSpeed, ts.currentSpeed + accel * timeAdvanceMin));

    // Move train (convert speed from km/h to km/min, then multiply by time)
    const distanceKm = (ts.currentSpeed / 60) * timeAdvanceMin;
    if (ts.direction === 'DN') {
      ts.currentKm += distanceKm;
    } else {
      ts.currentKm -= distanceKm;
    }

    // Clamp within corridor
    ts.currentKm = Math.max(-5, Math.min(CORRIDOR_LENGTH_KM + 5, ts.currentKm));

    // Update block section
    const mappedKm = ts.direction === 'DN' ? ts.currentKm : (CORRIDOR_LENGTH_KM - ts.currentKm);
    ts.blockSection = this.getBlockSection(mappedKm);

    // Update lat/lng
    const clampedKm = Math.max(0, Math.min(CORRIDOR_LENGTH_KM, mappedKm));
    const pos = interpolatePosition(clampedKm);
    ts.currentLat = pos.lat;
    ts.currentLng = pos.lng;
  }

  getBlockSection(km) {
    for (let i = 0; i < STATIONS.length - 1; i++) {
      if (km >= STATIONS[i].km && km < STATIONS[i + 1].km) {
        return `${STATIONS[i].code}–${STATIONS[i + 1].code}`;
      }
    }
    if (km < 0) return 'Approaching URK';
    return `${STATIONS[STATIONS.length - 2].code}–${STATIONS[STATIONS.length - 1].code}`;
  }

  // ─── SIGNAL ASPECTS ─────────────────────────────────────────
  updateSignals() {
    // Reset all to GREEN
    this.signalStates.forEach(sig => { sig.aspect = 'GREEN'; });

    // For each active train, set signals in its block to RED
    // and the approaching signal to YELLOW
    this.trainStates.forEach(ts => {
      if (ts.status !== 'RUNNING' && ts.status !== 'AT_STATION') return;
      const trainKm = ts.direction === 'DN'
        ? ts.currentKm
        : (CORRIDOR_LENGTH_KM - ts.currentKm);

      if (trainKm < 0 || trainKm > CORRIDOR_LENGTH_KM) return;

      this.signalStates.forEach(sig => {
        const dist = sig.km - trainKm;
        // Signal in the same block as train → RED
        if (Math.abs(dist) < 2) {
          sig.aspect = 'RED';
        }
        // Next signal ahead → YELLOW
        else if (dist > 0 && dist < 4 && ts.direction === 'DN') {
          if (sig.aspect !== 'RED') sig.aspect = 'YELLOW';
        }
        else if (dist < 0 && dist > -4 && ts.direction === 'UP') {
          if (sig.aspect !== 'RED') sig.aspect = 'YELLOW';
        }
        // Signal two blocks ahead → DOUBLE_YELLOW
        else if (dist > 0 && dist < 6 && ts.direction === 'DN') {
          if (sig.aspect === 'GREEN') sig.aspect = 'DOUBLE_YELLOW';
        }
        else if (dist < 0 && dist > -6 && ts.direction === 'UP') {
          if (sig.aspect === 'GREEN') sig.aspect = 'DOUBLE_YELLOW';
        }
      });
    });
  }

  // ─── ETA CALCULATIONS ───────────────────────────────────────
  calculateETAs(ts) {
    ts.etas = {};
    const remainingStops = ts.schedule.slice(ts.scheduleIndex);
    
    remainingStops.forEach((stop, idx) => {
      const station = getStation(stop.station);
      if (!station) return;

      const stationKm = ts.direction === 'DN' ? station.km : (CORRIDOR_LENGTH_KM - station.km);
      const distToStation = Math.abs(stationKm - ts.currentKm);
      
      // 1. Schedule ETA
      const scheduleArr = stop.arr || stop.dep;
      const scheduleETA = scheduleArr;

      // 2. Baseline/COA ETA (linear extrapolation)
      const effectiveSpeed = ts.currentSpeed > 5 ? ts.currentSpeed : 40;
      const timeToReachMin = (distToStation / effectiveSpeed) * 60;
      const baselineETA = this.simTimeMin + timeToReachMin;

      // 3. ML Model ETA (weighted with carrying delay + disruption + TSRs)
      let mlAdjustment = ts.delayMinutes;
      
      // Factor: TSR zones in path
      for (const r of RESTRICTIONS) {
        const rStart = r.fromKm;
        const rEnd = r.toKm;
        const currentMappedKm = ts.direction === 'DN' ? ts.currentKm : (CORRIDOR_LENGTH_KM - ts.currentKm);
        if (currentMappedKm < rEnd && station.km > rStart) {
          const tsrDistance = Math.min(rEnd, station.km) - Math.max(rStart, currentMappedKm);
          if (tsrDistance > 0) {
            const normalTime = (tsrDistance / ts.maxSpeed) * 60;
            const slowTime = (tsrDistance / r.speedLimit) * 60;
            mlAdjustment += (slowTime - normalTime);
          }
        }
      }

      // If standing due to disruption or signal halt
      if (ts.currentSpeed < 10 && ts.status === 'RUNNING') {
        mlAdjustment += 0.5; // Additional 30s penalty
      }

      const mlETA = scheduleETA + mlAdjustment;

      // Confidence: decreases with delay and distance
      const baseConfidence = 0.95;
      const distancePenalty = distToStation * 0.005;
      const delayPenalty = Math.min(0.35, ts.delayMinutes * 0.015);
      const confidence = Math.max(0.40, Math.min(0.98, baseConfidence - distancePenalty - delayPenalty));

      const uncertainty = Math.max(1, Math.round((1 - confidence) * 25));
      const delaySecTotal = Math.round(ts.delayMinutes * 60);

      ts.etas[stop.station] = {
        stationCode: stop.station,
        stationName: station.name,
        stationNameHi: station.nameHi,
        distanceKm: +distToStation.toFixed(1),
        platform: stop.platform,
        scheduled: scheduleETA,
        scheduledStr: minsToTime(scheduleETA),
        baselineETA: +baselineETA.toFixed(1),
        baselineStr: minsToTime(Math.round(baselineETA)),
        mlETA: +mlETA.toFixed(1),
        mlStr: minsToTime(Math.round(mlETA)),
        delayVsSchedule: Math.round(ts.delayMinutes),
        delayMinutes: +ts.delayMinutes.toFixed(2),
        delaySecTotal,
        confidence: +confidence.toFixed(2),
        confidencePercent: Math.round(confidence * 100),
        uncertainty,
        reasonCode: ts.delayReason,
        reason: DELAY_REASONS.find(r => r.code === ts.delayReason)?.label || ts.delayReason,
        reasonHi: DELAY_REASONS.find(r => r.code === ts.delayReason)?.labelHi || '',
      };
    });
  }

  // ─── WHAT-IF SIMULATOR & DISRUPTION ENGINE ──────────────────
  injectDisruption({ stationCode = 'WRC', trainNumber = 'ALL', amount = 30, unit = 'sec', reason = 'SIGNAL', speedLimit = 0 } = {}) {
    const delayMin = unit === 'sec' ? (amount / 60) : amount;
    const amountSec = unit === 'sec' ? amount : amount * 60;

    const disruption = {
      id: `DIS-${Date.now()}`,
      stationCode,
      trainNumber,
      amount,
      unit,
      delayMin,
      amountSec,
      reason,
      speedLimit,
      timestamp: minsToTime(Math.round(this.simTimeMin)),
      active: true
    };

    if (!this.activeDisruptions) this.activeDisruptions = [];
    this.activeDisruptions.unshift(disruption);

    let countAffected = 0;
    this.trainStates.forEach(ts => {
      if (ts.status === 'RUNNING' || ts.status === 'AT_STATION') {
        const matchesTrain = trainNumber === 'ALL' || ts.trainNumber === trainNumber;
        if (matchesTrain) {
          const stopIdx = ts.schedule.findIndex(s => s.station === stationCode);
          if (stopIdx >= ts.scheduleIndex || stopIdx === -1 || stationCode === 'ALL') {
            ts.delayMinutes += delayMin;
            ts.delayReason = reason;
            ts.disruptionSpeedLimit = speedLimit;
            // Active slowdown duration in ticks
            ts.disruptionTicks = Math.max(20, Math.round(amountSec / 2));
            countAffected++;
          }
        }
      }
    });

    // Recalculate ETAs instantly
    this.trainStates.forEach(ts => {
      if (ts.status === 'RUNNING' || ts.status === 'AT_STATION') {
        this.calculateETAs(ts);
      }
    });

    this.notify();
    return { disruption, countAffected };
  }

  clearDisruptions() {
    this.activeDisruptions = [];
    this.trainStates.forEach(ts => {
      ts.disruptionTicks = 0;
      ts.disruptionSpeedLimit = undefined;
    });
    this.notify();
  }

  injectTSR(fromKm, toKm, speedLimit, durationMin) {
    RESTRICTIONS.push({
      id: `TSR-INJECT-${Date.now()}`,
      type: 'TSR',
      fromKm,
      toKm,
      fromStation: this.getBlockSection(fromKm).split('–')[0],
      toStation: this.getBlockSection(toKm).split('–')[1] || '',
      speedLimit,
      reason: `Injected TSR (${durationMin}min)`,
      validFrom: null,
      validTo: null,
      _injected: true,
    });
  }

  extendBlock(stationCode, extraMinutes) {
    return this.injectDisruption({
      stationCode,
      trainNumber: 'ALL',
      amount: extraMinutes,
      unit: 'min',
      reason: 'SIGNAL',
      speedLimit: 0
    });
  }

  // ─── STATE SNAPSHOT ─────────────────────────────────────────
  getState() {
    return {
      simTimeMin: this.simTimeMin,
      simTimeStr: minsToTime(Math.round(this.simTimeMin)),
      speedMultiplier: this.speedMultiplier,
      isPaused: this.isPaused,
      tickCount: this.tickCount,
      trains: this.trainStates.map(ts => ({ ...ts, etas: { ...ts.etas } })),
      signals: this.signalStates.map(s => ({ ...s })),
      restrictions: [...RESTRICTIONS],
      activeDisruptions: [...(this.activeDisruptions || [])],
      stations: STATIONS,
    };
  }

  // ─── METRICS ────────────────────────────────────────────────
  getMetrics() {
    let totalError = 0;
    let totalAbsError = 0;
    let count = 0;
    const errors = [];

    this.trainStates.forEach(ts => {
      Object.values(ts.etas).forEach(eta => {
        if (eta.scheduled && eta.mlETA) {
          const error = eta.mlETA - eta.scheduled;
          const absError = Math.abs(eta.delayVsSchedule);
          totalError += error;
          totalAbsError += absError;
          errors.push(absError);
          count++;
        }
      });
    });

    errors.sort((a, b) => a - b);
    const mae = count > 0 ? +(totalAbsError / count).toFixed(1) : 0;
    const mdae = errors.length > 0 ? errors[Math.floor(errors.length / 2)] : 0;
    const within5 = count > 0 ? Math.round((errors.filter(e => e <= 5).length / count) * 100) : 0;
    const within10 = count > 0 ? Math.round((errors.filter(e => e <= 10).length / count) * 100) : 0;
    const within15 = count > 0 ? Math.round((errors.filter(e => e <= 15).length / count) * 100) : 0;

    return { mae, mdae, within5, within10, within15, totalPredictions: count };
  }
}

// ─── SINGLETON INSTANCE ─────────────────────────────────────────
let _instance = null;

export function getSimulator() {
  if (!_instance) {
    _instance = new SimulationEngine();
  }
  return _instance;
}

export default SimulationEngine;

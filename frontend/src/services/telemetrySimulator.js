export class SimulationEngine {
  constructor() {}
  start() {}
  stop() {}
  pause() {}
  resume() {}
  togglePause() {}
  setSpeed(multiplier) {}
  subscribe(listener) {
    listener({ trains: [], signals: [], isPaused: false, speedMultiplier: 1, simTimeStr: '00:00' });
    return () => {};
  }
  getState() {
    return { trains: [], signals: [], isPaused: false, speedMultiplier: 1, simTimeStr: '00:00' };
  }
  injectDisruption() {}
  clearDisruptions() {}
  getMetrics() { return {}; }
}

let instance = null;
export function getSimulator() {
  if (!instance) instance = new SimulationEngine();
  return instance;
}

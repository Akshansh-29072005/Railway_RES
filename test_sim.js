import { getSimulator } from './frontend/src/services/telemetrySimulator.js';

try {
  const sim = getSimulator();
  console.log("Sim signals length:", sim.signals.length);
  console.log("Sim blocks length:", sim.blocks.length);
  console.log("Sim trains length:", sim.trains.length);
  
  sim.tick();
  console.log("First train lat:", sim.trains[0].currentLat);
} catch (e) {
  console.error("SIM ERROR:", e);
}

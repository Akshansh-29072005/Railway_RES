import { interpolatePosition, TRACK_PATH } from './frontend/src/data/corridorData.js';
import { chainageToKm } from './frontend/src/data/cablePlanData.js';

const chainageStr = "828/22";
const km = chainageToKm(chainageStr);
console.log("KM:", km);
const pos = interpolatePosition(km);
console.log("POS:", pos);

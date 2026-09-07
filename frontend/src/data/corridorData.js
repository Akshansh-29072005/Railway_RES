/**
 * corridorData.js — SECR Raipur–Durg Corridor Master Data
 * Contains all station, signal, train, and restriction metadata
 * for the ~40 km prototype section.
 */

// ─── STATIONS ────────────────────────────────────────────────────
export const STATIONS = [
  { code: 'URK',  name: 'Urkura',           nameHi: 'उरकुरा',         km: 0,   lat: 21.2785, lng: 81.5820, platforms: 2, haltMin: 0,  isJunction: false },
  { code: 'WRC',  name: 'WRS Colony',       nameHi: 'डब्ल्यूआरएस कॉलोनी', km: 4,   lat: 21.2660, lng: 81.5995, platforms: 1, haltMin: 1,  isJunction: false },
  { code: 'R',    name: 'Raipur Junction',  nameHi: 'रायपुर जंक्शन',    km: 6,   lat: 21.2565, lng: 81.6293, platforms: 6, haltMin: 5,  isJunction: true  },
  { code: 'SRWN', name: 'Saraswati Nagar',  nameHi: 'सरस्वती नगर',      km: 10,  lat: 21.2380, lng: 81.6050, platforms: 2, haltMin: 1,  isJunction: false },
  { code: 'SZB',  name: 'Sarona',           nameHi: 'सरोना',            km: 16,  lat: 21.2085, lng: 81.5640, platforms: 2, haltMin: 2,  isJunction: false },
  { code: 'KOU',  name: 'Kumhari',          nameHi: 'कुम्हारी',          km: 24,  lat: 21.1920, lng: 81.4950, platforms: 2, haltMin: 1,  isJunction: false },
  { code: 'BFC',  name: 'Bhilai Charoda',   nameHi: 'भिलाई चरोदा',      km: 30,  lat: 21.2020, lng: 81.4100, platforms: 2, haltMin: 1,  isJunction: false },
  { code: 'BPHB', name: 'Bhilai Power House',nameHi: 'भिलाई पावर हाउस', km: 34,  lat: 21.2095, lng: 81.3520, platforms: 2, haltMin: 1,  isJunction: false },
  { code: 'BQR',  name: 'Bhilai Nagar',     nameHi: 'भिलाई नगर',        km: 37,  lat: 21.2105, lng: 81.3200, platforms: 3, haltMin: 2,  isJunction: false },
  { code: 'DURG', name: 'Durg Junction',    nameHi: 'दुर्ग जंक्शन',      km: 40,  lat: 21.1968, lng: 81.2846, platforms: 5, haltMin: 5,  isJunction: true  },
];

// ─── TRACK POLYLINE (interpolated coordinates Urkura → Durg) ───
export const TRACK_PATH = [
  [21.2785, 81.5820], // URK
  [21.2740, 81.5870],
  [21.2710, 81.5920],
  [21.2660, 81.5995], // WRC
  [21.2620, 81.6100],
  [21.2590, 81.6200],
  [21.2565, 81.6293], // R
  [21.2520, 81.6250],
  [21.2460, 81.6180],
  [21.2380, 81.6050], // SRWN
  [21.2320, 81.5940],
  [21.2250, 81.5830],
  [21.2170, 81.5740],
  [21.2085, 81.5640], // SZB
  [21.2040, 81.5480],
  [21.2000, 81.5300],
  [21.1960, 81.5130],
  [21.1920, 81.4950], // KOU
  [21.1940, 81.4750],
  [21.1970, 81.4550],
  [21.1990, 81.4350],
  [21.2020, 81.4100], // BFC
  [21.2050, 81.3900],
  [21.2080, 81.3710],
  [21.2095, 81.3520], // BPHB
  [21.2100, 81.3360],
  [21.2105, 81.3200], // BQR
  [21.2080, 81.3050],
  [21.2030, 81.2940],
  [21.1968, 81.2846], // DURG
];

// ─── AUTOMATIC BLOCK SIGNALS (ABS) every ~2 km ─────────────────
// Signals are placed between stations along the track
export const SIGNALS = [];
(function generateSignals() {
  const totalKm = 40;
  const signalSpacing = 2; // km
  let signalId = 1;
  for (let km = 0; km <= totalKm; km += signalSpacing) {
    // Interpolate position along track
    const fraction = km / totalKm;
    const pathIndex = Math.min(
      Math.floor(fraction * (TRACK_PATH.length - 1)),
      TRACK_PATH.length - 2
    );
    const localFraction = (fraction * (TRACK_PATH.length - 1)) - pathIndex;
    const lat = TRACK_PATH[pathIndex][0] + (TRACK_PATH[pathIndex + 1][0] - TRACK_PATH[pathIndex][0]) * localFraction;
    const lng = TRACK_PATH[pathIndex][1] + (TRACK_PATH[pathIndex + 1][1] - TRACK_PATH[pathIndex][1]) * localFraction;

    // Find which section this signal belongs to
    let sectionFrom = STATIONS[0].code;
    let sectionTo = STATIONS[STATIONS.length - 1].code;
    for (let i = 0; i < STATIONS.length - 1; i++) {
      if (km >= STATIONS[i].km && km < STATIONS[i + 1].km) {
        sectionFrom = STATIONS[i].code;
        sectionTo = STATIONS[i + 1].code;
        break;
      }
    }

    SIGNALS.push({
      id: `ABS-${String(signalId).padStart(2, '0')}`,
      km,
      lat: +lat.toFixed(5),
      lng: +lng.toFixed(5),
      sectionFrom,
      sectionTo,
      aspect: 'GREEN', // default, updated by simulator
    });
    signalId++;
  }
})();

// ─── SPEED RESTRICTIONS (TSR/PSR) ──────────────────────────────
export const RESTRICTIONS = [
  {
    id: 'TSR-447',
    type: 'TSR',
    fromKm: 11.2,
    toKm: 13.8,
    fromStation: 'SRWN',
    toStation: 'SZB',
    speedLimit: 30,
    reason: 'Bridge repair work — temporary',
    validFrom: '2026-09-01',
    validTo: '2026-09-30',
  },
  {
    id: 'PSR-12',
    type: 'PSR',
    fromKm: 25.0,
    toKm: 26.5,
    fromStation: 'KOU',
    toStation: 'BFC',
    speedLimit: 45,
    reason: 'Sharp curve restriction — permanent',
    validFrom: null,
    validTo: null,
  },
];

// ─── TRAINS ────────────────────────────────────────────────────
// Each train has schedule stops with arrival/departure times (minutes from midnight)
// Direction: DN = Raipur → Durg, UP = Durg → Raipur
export const TRAINS = [
  {
    number: '22435',
    name: 'VANDE BHARAT EXP (UP)',
    nameHi: 'वंदे भारत एक्सप्रेस (अप)',
    type: 'PREMIUM_SUPERFAST_EMU',
    rake: '16_COACH_CHAIR_CAR',
    origin: 'BSB',
    destination: 'NDLS',
    direction: 'UP',
    maxSpeed: 130,
    color: '#0ea5e9',
    schedule: [
      { station: 'DURG', arr: 870, dep: 875, platform: 2 }, // 14:30 → 14:35
      { station: 'SZB',  arr: 893, dep: 894, platform: 2 }, // 14:53
      { station: 'R',    arr: 910, dep: 915, platform: 4 }, // 15:10 → 15:15
    ],
  },
  {
    number: '12834',
    name: 'HWH-ADI EXPRESS',
    nameHi: 'हावड़ा-अहमदाबाद एक्सप्रेस',
    type: 'SUPERFAST',
    rake: '24_COACH_LHB',
    origin: 'HWH',
    destination: 'ADI',
    direction: 'DN',
    maxSpeed: 110,
    color: '#f97316',
    schedule: [
      { station: 'R',    arr: 895, dep: 900, platform: 1 }, // 14:55 → 15:00
      { station: 'KOU',  arr: 918, dep: 919, platform: 1 }, // 15:18
      { station: 'DURG', arr: 938, dep: 943, platform: 3 }, // 15:38 → 15:43
    ],
  },
  {
    number: '18237',
    name: 'CHHATTISGARH EXPRESS',
    nameHi: 'छत्तीसगढ़ एक्सप्रेस',
    type: 'MAIL_EXPRESS',
    rake: '20_COACH_ICF',
    origin: 'BSP',
    destination: 'DURG',
    direction: 'DN',
    maxSpeed: 100,
    color: '#10b981',
    schedule: [
      { station: 'R',    arr: 935, dep: 940, platform: 2 }, // 15:35 → 15:40
      { station: 'SRWN', arr: 948, dep: 949, platform: 1 }, // 15:48
      { station: 'SZB',  arr: 958, dep: 960, platform: 1 }, // 15:58 → 16:00
      { station: 'KOU',  arr: 972, dep: 973, platform: 2 }, // 16:12
      { station: 'DURG', arr: 990, dep: null, platform: 4 }, // 16:30
    ],
  },
  {
    number: '58229',
    name: 'PASSENGER (DEMU)',
    nameHi: 'पैसेंजर (डेमू)',
    type: 'PASSENGER',
    rake: '8_COACH_DEMU',
    origin: 'R',
    destination: 'DURG',
    direction: 'DN',
    maxSpeed: 75,
    color: '#a3a3a3',
    schedule: [
      { station: 'R',    arr: null, dep: 845, platform: 2 }, // 14:05
      { station: 'WRC',  arr: 852, dep: 853, platform: 1 }, // 14:12
      { station: 'SRWN', arr: 862, dep: 864, platform: 1 }, // 14:22 → 14:24
      { station: 'SZB',  arr: 878, dep: 880, platform: 1 }, // 14:38 → 14:40
      { station: 'KOU',  arr: 898, dep: 900, platform: 2 }, // 14:58 → 15:00
      { station: 'BFC',  arr: 915, dep: 917, platform: 2 }, // 15:15 → 15:17
      { station: 'BPHB', arr: 925, dep: 927, platform: 1 }, // 15:25 → 15:27
      { station: 'BQR',  arr: 935, dep: 937, platform: 3 }, // 15:35 → 15:37
      { station: 'DURG', arr: 950, dep: null, platform: 3 }, // 15:50
    ],
  },
  {
    number: 'BOXN-FL',
    name: 'FREIGHT (BOXN COAL)',
    nameHi: 'मालगाड़ी (कोयला)',
    type: 'FREIGHT',
    rake: '59_WAGON_BOXN',
    origin: 'KORBA',
    destination: 'DURG_YARD',
    direction: 'DN',
    maxSpeed: 60,
    color: '#78716c',
    schedule: [
      { station: 'R',    arr: 850, dep: 860, platform: null }, // Through
      { station: 'DURG', arr: 940, dep: null, platform: null }, // Yard
    ],
  },
];

// ─── DELAY REASON CODES ─────────────────────────────────────────
export const DELAY_REASONS = [
  { code: 'CARRY', label: 'Carrying delay from previous section', labelHi: 'पिछले खंड से विलंब' },
  { code: 'CONGESTION', label: 'Downstream track congestion', labelHi: 'आगे ट्रैक पर भीड़' },
  { code: 'TSR', label: 'Temporary speed restriction', labelHi: 'अस्थायी गति प्रतिबंध' },
  { code: 'SIGNAL', label: 'Signal check / Red aspect hold', labelHi: 'सिग्नल चेक' },
  { code: 'PLATFORM', label: 'Platform occupation conflict', labelHi: 'प्लेटफ़ॉर्म व्यस्त' },
  { code: 'CROSSING', label: 'Crossing / precedence given', labelHi: 'क्रॉसिंग / प्राथमिकता' },
  { code: 'CREW', label: 'Crew/loco change', labelHi: 'क्रू/लोको बदलाव' },
  { code: 'ONTIME', label: 'Running on time', labelHi: 'समय पर' },
];

// ─── HELPER FUNCTIONS ───────────────────────────────────────────

/** Convert minutes-from-midnight to HH:MM string */
export function minsToTime(mins) {
  if (mins == null) return '--:--';
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Get station by code */
export function getStation(code) {
  return STATIONS.find(s => s.code === code);
}

/** Interpolate position along TRACK_PATH given km value */
export function interpolatePosition(km) {
  const totalKm = 40;
  const fraction = Math.max(0, Math.min(1, km / totalKm));
  const pathIndex = Math.min(
    Math.floor(fraction * (TRACK_PATH.length - 1)),
    TRACK_PATH.length - 2
  );
  const localFraction = (fraction * (TRACK_PATH.length - 1)) - pathIndex;
  return {
    lat: TRACK_PATH[pathIndex][0] + (TRACK_PATH[pathIndex + 1][0] - TRACK_PATH[pathIndex][0]) * localFraction,
    lng: TRACK_PATH[pathIndex][1] + (TRACK_PATH[pathIndex + 1][1] - TRACK_PATH[pathIndex][1]) * localFraction,
  };
}

/** Interpolate position for UP direction (reverses km) */
export function interpolatePositionUp(km) {
  return interpolatePosition(40 - km);
}

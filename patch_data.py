import re

with open('frontend/src/data/corridorData.js', 'r') as f:
    content = f.read()

# 1. Update TRAINS
trains_str = """export const TRAINS = [
  {
    number: '22435',
    name: 'VANDE BHARAT EXP',
    nameHi: 'वंदे भारत',
    type: 'PREMIUM_SUPERFAST_EMU',
    rake: '16_COACH_CHAIR_CAR',
    origin: 'BSB',
    destination: 'NDLS',
    direction: 'UP',
    maxSpeed: 130,
    color: '#0ea5e9',
    schedule: [
      { station: 'DUR', arr: 870, dep: 875, platform: 2 },
      { station: 'BHI', arr: 885, dep: 887, platform: 1 },
      { station: 'RAI', arr: 910, dep: 915, platform: 4 },
      { station: 'BHA', arr: 960, dep: 962, platform: 1 },
      { station: 'DAD', arr: 990, dep: 995, platform: 1 },
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
      { station: 'DAD', arr: 820, dep: 825, platform: 1 },
      { station: 'RAI', arr: 895, dep: 900, platform: 1 },
      { station: 'DUR', arr: 938, dep: 943, platform: 3 },
    ],
  },
  {
    number: '58229',
    name: 'PASSENGER (DEMU)',
    nameHi: 'पैसेंजर (डेमू)',
    type: 'PASSENGER',
    rake: '8_COACH_DEMU',
    origin: 'RAI',
    destination: 'DUR',
    direction: 'DN',
    maxSpeed: 75,
    color: '#a3a3a3',
    schedule: [
      { station: 'RAI', arr: null, dep: 845, platform: 2 },
      { station: 'BHI', arr: 925, dep: 927, platform: 1 },
      { station: 'DUR', arr: 950, dep: null, platform: 3 },
    ],
  },
  {
    number: 'BOXN-FL',
    name: 'FREIGHT (BOXN COAL)',
    nameHi: 'मालगाड़ी (कोयला)',
    type: 'FREIGHT',
    rake: '59_WAGON_BOXN',
    origin: 'KORBA',
    destination: 'DUR',
    direction: 'DN',
    maxSpeed: 60,
    color: '#78716c',
    schedule: [
      { station: 'RAI', arr: 850, dep: 860, platform: null },
      { station: 'DUR', arr: 940, dep: null, platform: null },
    ],
  },
];"""

content = re.sub(r"export const TRAINS = \[.*?\];", trains_str, content, flags=re.DOTALL)

# 2. Update InterpolatePosition
helper_str = """
export function interpolatePosition(km) {
  const startKm = 828.687;
  const endKm = 960.309;
  const totalKm = endKm - startKm;
  const fraction = Math.max(0, Math.min(1, (km - startKm) / totalKm));
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

export function interpolatePositionUp(km) {
  const startKm = 828.687;
  const endKm = 960.309;
  return interpolatePosition(endKm - (km - startKm));
}
"""

content = re.sub(r"export function interpolatePosition\(km\) \{.*?\n\}\n\n/\*\* Interpolate position for UP direction \(reverses km\) \*/\nexport function interpolatePositionUp\(km\) \{.*?\n\}", helper_str.strip(), content, flags=re.DOTALL)

with open('frontend/src/data/corridorData.js', 'w') as f:
    f.write(content)

# 3. Patch telemetrySimulator.js
with open('frontend/src/services/telemetrySimulator.js', 'r') as f:
    sim_content = f.read()

sim_content = re.sub(
    r"const CORRIDOR_LENGTH_KM = 40;",
    "const CORRIDOR_LENGTH_KM = 131.622;\nconst START_KM = 828.687;",
    sim_content
)

sim_content = re.sub(
    r"let initialKm = train\.direction === 'DN' \? -5 : CORRIDOR_LENGTH_KM \+ 5;",
    "let initialKm = train.direction === 'DN' ? START_KM - 5 : START_KM + CORRIDOR_LENGTH_KM + 5;",
    sim_content
)

with open('frontend/src/services/telemetrySimulator.js', 'w') as f:
    f.write(sim_content)

print("Patched.")

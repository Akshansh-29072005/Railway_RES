import json

with open('corridor_processed.json') as f:
    data = json.load(f)

# Sort stations by chainage
st = data["STATIONS_DATA"]
st = sorted(st, key=lambda x: x["chainage"])

# Format JS
out = "/**\n * corridorData.js — SECR Raipur Division Corridor Master Data (OSM Extracted)\n */\n\n"
out += "export const STATIONS = [\n"
for s in st:
    out += f"  {{ code: '{s['id']}', name: '{s['name']}', nameHi: '{s['name']}', km: {s['chainage']}, lat: {s['coordinates'][0]}, lng: {s['coordinates'][1]}, platforms: {s['platforms']}, haltMin: 2, isJunction: {'true' if s['isJunction'] else 'false'} }},\n"
out += "];\n\n"

def format_path(name, path):
    res = f"export const {name} = [\n"
    for p in path:
        res += f"  [{p[0]:.5f}, {p[1]:.5f}],\n"
    res += "];\n\n"
    return res

out += format_path("TRACK_PATH", data["TRACK_PATH"])
out += format_path("MINERAL_CORRIDOR_PATH", data["MINERAL_CORRIDOR_PATH"])
out += format_path("BYPASS_PATH", data["BYPASS_PATH"])

out += "export const SOUTHERN_LOOPS_PATH = [];\n"
out += "export const BHILAI_YARD_PATHS = [];\n\n"

# Add mock signals for telemetry
out += """// ─── AUTOMATIC BLOCK SIGNALS (ABS) ─────────────────
export const SIGNALS = [];
(function generateSignals() {
  const signalSpacing = 50; // Place a signal every 50 points
  let signalId = 1;
  for (let i = 0; i < TRACK_PATH.length - 1; i += signalSpacing) {
    SIGNALS.push({
      id: `ABS-${String(signalId).padStart(2, '0')}`,
      km: i,
      lat: TRACK_PATH[i][0],
      lng: TRACK_PATH[i][1],
      sectionFrom: 'A',
      sectionTo: 'B',
      aspect: 'GREEN',
    });
    signalId++;
  }
})();

export const RESTRICTIONS = [
  {
    id: 'TSR-447',
    type: 'TSR',
    fromKm: 830.0,
    toKm: 832.0,
    speedLimit: 30,
  }
];

export const TRAINS = [
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
    schedule: [],
  }
];

export const CORRIDOR_BOUNDS = {
  latMin: 20.5,
  latMax: 22.1,
  lngMin: 81.0,
  lngMax: 82.2
};
"""

with open('frontend/src/data/corridorData.js', 'w') as f:
    f.write(out)

print("corridorData.js updated")

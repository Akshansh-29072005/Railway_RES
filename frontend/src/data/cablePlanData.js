// cablePlanData.js
// Parses and maps the exact SECR Cable Route Plan infrastructure data.

// The standard track distance between two OHE masts in the Raipur division
// SECR documentation lists standard spacing as 60 meters.
export const OHE_MAST_SPACING_METERS = 60;

/**
 * Converts a fractional chainage marker (e.g. "828/22") into a precise decimal KM.
 * Based on the Raipur Junction (KM 828.687) benchmark baseline.
 */
export function chainageToKm(chainageStr) {
  if (!chainageStr) return 0;
  const parts = chainageStr.split('/');
  if (parts.length !== 2) return parseFloat(chainageStr) || 0;
  
  const kmBase = parseFloat(parts[0]);
  const mastNum = parseFloat(parts[1]);
  
  // The Cable Route Plan blueprint uses 828.687 as the Raipur baseline,
  // but our corridorData.js tracks Raipur at km 933.663.
  // We must apply the offset (104.976) to translate schematic KM to real map KM.
  const CORRIDOR_OFFSET = 104.976; 
  
  return kmBase + (mastNum * (OHE_MAST_SPACING_METERS / 1000)) + CORRIDOR_OFFSET;
}

export const CABLE_PLAN_SIGNALS = [
  // Extracted exactly from "1624691258949-20 RAIPUR(WEST)-1.png"
  {
    id: "SIG_RW_DN_DIST",
    name: "Raipur West DN DIST.",
    chainage: "831/32",
    type: "DISTANT",
    routeDirection: "NAGPUR",
    defaultAspect: "YELLOW"
  },
  {
    id: "SIG_RW_DN_INN_DIST",
    name: "Raipur West DN INN. DIST.",
    chainage: "831/18",
    type: "DISTANT",
    routeDirection: "NAGPUR",
    defaultAspect: "DOUBLE_YELLOW"
  },
  {
    id: "SIG_RW_UP_SIG_4",
    name: "Raipur West UP Signal 4",
    chainage: "831/14",
    type: "STARTER",
    routeDirection: "HOWRAH",
    defaultAspect: "RED"
  },
  {
    id: "SIG_RW_C1_HOME",
    name: "Raipur West C-1 Home (1A/B/C/D/E/F)",
    chainage: "831/2",
    type: "HOME",
    routeDirection: "NAGPUR",
    defaultAspect: "RED"
  },
  {
    id: "SIG_RW_SH_5A",
    name: "Raipur West Shunt SH-5A/B/C/D",
    chainage: "830/34",
    type: "SHUNT",
    routeDirection: "NAGPUR",
    defaultAspect: "RED"
  },
  {
    id: "SIG_RW_SH_3A",
    name: "Raipur West Shunt SH-3A/B/C/D/E",
    chainage: "830/26",
    type: "SHUNT",
    routeDirection: "HOWRAH",
    defaultAspect: "RED"
  },
  {
    id: "SIG_RW_WEST_CABIN_DN",
    name: "Raipur West Cabin DN Main",
    chainage: "829/14",
    type: "HOME",
    routeDirection: "NAGPUR",
    defaultAspect: "RED"
  },
  {
    id: "SIG_RW_WEST_CABIN_UP",
    name: "Raipur West Cabin UP Main",
    chainage: "829/14",
    type: "HOME",
    routeDirection: "HOWRAH",
    defaultAspect: "GREEN"
  },
  // Extracted exactly from "1624691353666-21 RAIPUR(WEST-EAST)-1.png" (Station Platform Area)
  {
    id: "SIG_R_PF6_UP_STARTER",
    name: "Raipur Jn PF-6 UP Starter (17A/B)",
    chainage: "828/22",
    type: "STARTER",
    routeDirection: "HOWRAH",
    defaultAspect: "RED"
  },
  {
    id: "SIG_R_PF5_UP_STARTER",
    name: "Raipur Jn PF-5 UP Starter (15A/B)",
    chainage: "828/22",
    type: "STARTER",
    routeDirection: "HOWRAH",
    defaultAspect: "RED"
  },
  {
    id: "SIG_R_PF3_DN_STARTER",
    name: "Raipur Jn PF-3 DN Starter (19A/B)",
    chainage: "828/20",
    type: "STARTER",
    routeDirection: "NAGPUR",
    defaultAspect: "RED"
  },
  {
    id: "SIG_R_PF2_DN_STARTER",
    name: "Raipur Jn PF-2 DN Starter (25A/B)",
    chainage: "828/12",
    type: "STARTER",
    routeDirection: "NAGPUR",
    defaultAspect: "RED"
  },
  {
    id: "SIG_R_PF1_DN_STARTER",
    name: "Raipur Jn PF-1 DN Starter (27A/B)",
    chainage: "828/12",
    type: "STARTER",
    routeDirection: "NAGPUR",
    defaultAspect: "RED"
  },
  // Extracted exactly from "1624691198582-19 RAIPUR(EAST)-1.png" (East Approach Area)
  {
    id: "SIG_RE_DN_23",
    name: "Raipur East DN (23)",
    chainage: "827/20",
    type: "HOME",
    routeDirection: "NAGPUR",
    defaultAspect: "YELLOW"
  },
  {
    id: "SIG_RE_UP_C2",
    name: "Raipur East UP (C-2)",
    chainage: "827/16",
    type: "HOME",
    routeDirection: "HOWRAH",
    defaultAspect: "GREEN"
  },
  {
    id: "SIG_RE_DN_URKURA_GATE",
    name: "Urkura DN Gate Sig Cum Dist Sig",
    chainage: "826/36",
    type: "GATE_DISTANT",
    routeDirection: "NAGPUR",
    defaultAspect: "GREEN"
  },
  {
    id: "SIG_RE_UP_RAIPUR_GATE",
    name: "Raipur UP Gate Sig Cum Inn Dist Sig",
    chainage: "826/14",
    type: "GATE_DISTANT",
    routeDirection: "HOWRAH",
    defaultAspect: "YELLOW"
  },
  {
    id: "SIG_RE_UP_RAIPUR_DIST",
    name: "Raipur UP Gate Inn Dist Sig Cum Dist Sig",
    chainage: "826/4",
    type: "DISTANT",
    routeDirection: "HOWRAH",
    defaultAspect: "DOUBLE_YELLOW"
  }
];

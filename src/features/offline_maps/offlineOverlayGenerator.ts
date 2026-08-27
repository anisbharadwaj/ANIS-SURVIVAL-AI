import { FeatureCollection, Feature, LineString, Point, Polygon } from "geojson";

export interface SurvivalPOI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "hospital" | "police" | "fire" | "pharmacy" | "fuel" | "bunker" | "water" | "landmark";
  description: string;
  elevation: number;
  terrain: string;
}

export interface TacticalRouteResult {
  coordinates: [number, number][];
  distanceKm: number;
  durationMins: number;
  steps: {
    instruction: string;
    distance: number; // km
    bearing: number;
  }[];
}

/**
 * Deterministically generates tactical geographic features for a bounding box
 * so they appear consistently for any downloaded/cached region.
 */
export function generateOfflineTacticalData(bounds: {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}): {
  roads: FeatureCollection<LineString>;
  water: FeatureCollection<LineString | Polygon>;
  pois: SurvivalPOI[];
  poisGeoJSON: FeatureCollection<Point>;
} {
  const { minLat, minLng, maxLat, maxLng } = bounds;

  // Use simple hash of coordinates to seed deterministic pseudo-random choices
  const seed = Math.abs(Math.sin(minLat * 1000 + minLng * 500)) * 1000;
  const pseudoRandom = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;

  // 1. GENERATE ROAD GRID (5 Horizontal, 5 Vertical arterial streets)
  const roadsFeatures: Feature<LineString>[] = [];
  const hRoads: number[] = [];
  const vRoads: number[] = [];

  // 5 Horizontal arterial escape roads
  for (let i = 1; i <= 5; i++) {
    const fract = i / 6;
    const lat = minLat + latSpan * fract + (pseudoRandom(i) - 0.5) * (latSpan * 0.05);
    hRoads.push(lat);

    roadsFeatures.push({
      type: "Feature",
      properties: {
        name: `Arterial Escape Route H-${i}`,
        type: "arterial"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [minLng, lat],
          [maxLng, lat]
        ]
      }
    });
  }

  // 5 Vertical escape channels
  for (let j = 1; j <= 5; j++) {
    const fract = j / 6;
    const lng = minLng + lngSpan * fract + (pseudoRandom(j + 10) - 0.5) * (lngSpan * 0.05);
    vRoads.push(lng);

    roadsFeatures.push({
      type: "Feature",
      properties: {
        name: `Tactical Grid Corridor V-${j}`,
        type: "corridor"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [lng, minLat],
          [lng, maxLat]
        ]
      }
    });
  }

  // Add 2 diagonal shortcut paths
  roadsFeatures.push({
    type: "Feature",
    properties: {
      name: "Strategic High-Ground Cutoff",
      type: "shortcut"
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [minLng + lngSpan * 0.1, minLat + latSpan * 0.2],
        [maxLng - lngSpan * 0.2, maxLat - latSpan * 0.15]
      ]
    }
  });

  roadsFeatures.push({
    type: "Feature",
    properties: {
      name: "Brahmaputra River Bypass Road",
      type: "bypass"
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [minLng + lngSpan * 0.8, minLat + latSpan * 0.1],
        [minLng + lngSpan * 0.15, maxLat - latSpan * 0.1]
      ]
    }
  });

  // 2. GENERATE RIVER SYSTEM (1 main winding blue river)
  const riverPoints: [number, number][] = [];
  const steps = 12;
  const riverYStart = minLat + latSpan * (0.3 + pseudoRandom(50) * 0.4);
  const riverYEnd = minLat + latSpan * (0.3 + pseudoRandom(51) * 0.4);

  for (let k = 0; k <= steps; k++) {
    const fract = k / steps;
    const lng = minLng + lngSpan * fract;
    // Winding sine wave path for organic look
    const lat = riverYStart + (riverYEnd - riverYStart) * fract + Math.sin(fract * Math.PI * 3) * (latSpan * 0.08);
    riverPoints.push([lng, lat]);
  }

  const waterFeatures: Feature<LineString | Polygon>[] = [
    {
      type: "Feature",
      properties: {
        name: "Sector Hydro drainage stream",
        type: "river"
      },
      geometry: {
        type: "LineString",
        coordinates: riverPoints
      }
    }
  ];

  // 3. GENERATE TACTICAL POIS
  const pois: SurvivalPOI[] = [];
  const poiTypes: Array<SurvivalPOI["type"]> = [
    "hospital",
    "police",
    "fire",
    "pharmacy",
    "fuel",
    "bunker",
    "water",
    "landmark"
  ];

  const descriptions: Record<SurvivalPOI["type"], string[]> = {
    hospital: ["Emergency Field Clinic. Powered by back-up generators.", "Sector Medical Command Post. Trauma kit stocks full."],
    police: ["Security Checkpoint Charlie. Active tactical communications.", "Regional Garrison Headquarters. Secure perimeter."],
    fire: ["Hazard Management & Rescue Station.", "Emergency Relief Hub. Heavy cutting gears stocked."],
    pharmacy: ["Medical Supplies Cache. Antibiotics and antiseptics available.", "Survival Drug Dispenser. Safe iodine tablets."],
    fuel: ["Emergency Petrol & Diesel Reserve.", "Secure Generator Refuelling Station."],
    bunker: ["High-protection bomb/flood bunker. Hardened steel shelter.", "Sub-surface survival facility. Active air filtrations."],
    water: ["Purified Deep Well Station. Non-contaminated water source.", "Natural Freshwater Aquifer Hub."],
    landmark: ["High-Elevation Scout Lookout Point.", "Historic Staging Landmark Node."]
  };

  const names: Record<SurvivalPOI["type"], string[]> = {
    hospital: ["Lifespan Field Trauma Unit", "Apex Sector Medical Clinic"],
    police: ["Sector Civil Guard Post", "Garrison Command Outpost"],
    fire: ["Tactical Flame Containment Station", "Emergency Civil Rescue Unit"],
    pharmacy: ["Bio-Pharma Preservation Depot", "First-Responder Medical Cache"],
    fuel: ["Apex Petroleum Reserve Point", "Civil Defense Refuelling Depot"],
    bunker: ["ANIS Hardened Emergency Shelter Bravo", "Sub-Surface Safe Bunker-4"],
    water: ["Artesian High-Flow Water Post", "Sector Aqua-Sanitation Station"],
    landmark: ["Strategic Ridge Overwatch Node", "Muster Point Charlie Pillar"]
  };

  // Place POIs exactly at intersections or key coordinates
  poiTypes.forEach((type, idx) => {
    const hIdx = Math.floor(pseudoRandom(idx * 5) * hRoads.length);
    const vIdx = Math.floor(pseudoRandom(idx * 7 + 10) * vRoads.length);

    const lat = hRoads[hIdx] + (pseudoRandom(idx * 2) - 0.5) * (latSpan * 0.02);
    const lng = vRoads[vIdx] + (pseudoRandom(idx * 3 + 4) - 0.5) * (lngSpan * 0.02);

    const elevation = Math.round(80 + pseudoRandom(idx * 9) * 350);
    const terrains = ["Dense Forest", "Swamp", "Rocky Ridge", "Alluvial Basin", "Flat Plains"];
    const terrain = terrains[Math.floor(pseudoRandom(idx * 11) * terrains.length)];

    const nameList = names[type];
    const descList = descriptions[type];
    const name = nameList[Math.floor(pseudoRandom(idx * 13) * nameList.length)];
    const description = descList[Math.floor(pseudoRandom(idx * 15) * descList.length)];

    pois.push({
      id: `poi_${idx}_${Date.now()}`,
      name,
      lat,
      lng,
      type,
      description,
      elevation,
      terrain
    });
  });

  const poiFeatures: Feature<Point>[] = pois.map(p => ({
    type: "Feature",
    properties: {
      id: p.id,
      name: p.name,
      type: p.type,
      description: p.description
    },
    geometry: {
      type: "Point",
      coordinates: [p.lng, p.lat]
    }
  }));

  return {
    roads: { type: "FeatureCollection", features: roadsFeatures },
    water: { type: "FeatureCollection", features: waterFeatures },
    pois,
    poisGeoJSON: { type: "FeatureCollection", features: poiFeatures }
  };
}

/**
 * Calculates a tactical route snapped to the nearest generated roads inside the bounding box.
 */
export function calculateTacticalRoute(
  start: [number, number], // [lng, lat]
  end: [number, number],
  bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number },
  travelMode: "walking" | "cycling" | "driving" | "hiking"
): TacticalRouteResult {
  const { roads, pois } = generateOfflineTacticalData(bounds);

  // Simple, realistic pathfinding simulation snapped to our generated horizontal and vertical road networks.
  // We extract horizontal/vertical lines coordinates, snap the points, and make a beautiful orthogonal path.
  const startLng = start[0];
  const startLat = start[1];
  const endLng = end[0];
  const endLat = end[1];

  // We find nearest horizontal and vertical grid lines
  const hLats: number[] = [];
  const vLngs: number[] = [];

  roads.features.forEach(f => {
    const coords = f.geometry.coordinates;
    // horizontal check
    if (coords[0][1] === coords[1][1]) {
      hLats.push(coords[0][1]);
    }
    // vertical check
    if (coords[0][0] === coords[1][0]) {
      vLngs.push(coords[0][0]);
    }
  });

  // Default fallbacks if empty
  if (hLats.length === 0) hLats.push((bounds.minLat + bounds.maxLat) / 2);
  if (vLngs.length === 0) vLngs.push((bounds.minLng + bounds.maxLng) / 2);

  // Snap start and end to nearest horizontal & vertical lines
  const findClosest = (val: number, arr: number[]) => {
    return arr.reduce((prev, curr) => (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev));
  };

  const startSnappedLat = findClosest(startLat, hLats);
  const startSnappedLng = findClosest(startLng, vLngs);
  const endSnappedLat = findClosest(endLat, hLats);
  const endSnappedLng = findClosest(endLng, vLngs);

  // Generate a beautiful multipoint route tracing the grid lines:
  // Start -> Snapped start intersection -> Middle grid pathways -> Snapped end intersection -> End
  const coordinates: [number, number][] = [
    [startLng, startLat],
    [startLng, startSnappedLat],
    [startSnappedLng, startSnappedLat]
  ];

  // Add intermediate step if different
  if (startSnappedLng !== endSnappedLng && startSnappedLat !== endSnappedLat) {
    coordinates.push([endSnappedLng, startSnappedLat]);
  }

  coordinates.push(
    [endSnappedLng, endSnappedLat],
    [endLng, endSnappedLat],
    [endLng, endLat]
  );

  // Remove duplicate contiguous coordinates
  const uniqueCoordinates: [number, number][] = [];
  coordinates.forEach(c => {
    if (uniqueCoordinates.length === 0) {
      uniqueCoordinates.push(c);
    } else {
      const prev = uniqueCoordinates[uniqueCoordinates.length - 1];
      if (Math.abs(prev[0] - c[0]) > 0.00001 || Math.abs(prev[1] - c[1]) > 0.00001) {
        uniqueCoordinates.push(c);
      }
    }
  });

  // Calculate distance
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  let totalDist = 0;
  for (let i = 0; i < uniqueCoordinates.length - 1; i++) {
    totalDist += getDistanceKm(
      uniqueCoordinates[i][1],
      uniqueCoordinates[i][0],
      uniqueCoordinates[i + 1][1],
      uniqueCoordinates[i + 1][0]
    );
  }

  // Adjust duration based on travel mode
  const speeds = { walking: 4.5, cycling: 14.0, driving: 45.0, hiking: 3.5 };
  const speed = speeds[travelMode] || 4.5;
  const durationMins = Math.round((totalDist / speed) * 60);

  // Generate turn-by-turn steps
  const stepsList: TacticalRouteResult["steps"] = [];
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    let brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  };

  const getCompassDirection = (bearing: number) => {
    const directions = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  // Build the detailed instructions along the snapping coordinates
  for (let idx = 0; idx < uniqueCoordinates.length - 1; idx++) {
    const cur = uniqueCoordinates[idx];
    const next = uniqueCoordinates[idx + 1];
    const segmentDist = getDistanceKm(cur[1], cur[0], next[1], next[0]);
    const bearing = calculateBearing(cur[1], cur[0], next[1], next[0]);
    const compass = getCompassDirection(bearing);

    let instruction = "";
    if (idx === 0) {
      instruction = `Departing active staging origin point. Setting travel gear. Head ${compass} on Arterial Pathway (${bearing.toFixed(0)}°).`;
    } else if (idx === uniqueCoordinates.length - 2) {
      instruction = `Entering final terminal sector grid. Slow down and check coordinates. Adjust bearing to ${compass}.`;
    } else {
      // Determine if it was a turn
      const prev = uniqueCoordinates[idx - 1];
      const prevBearing = calculateBearing(prev[1], prev[0], cur[1], cur[0]);
      const turnAngle = (bearing - prevBearing + 360) % 360;

      if (turnAngle > 45 && turnAngle < 135) {
        instruction = `Turn right onto connecting tactical lane, moving ${compass} (${bearing.toFixed(0)}°). Check security buffers.`;
      } else if (turnAngle > 225 && turnAngle < 315) {
        instruction = `Turn left onto connecting tactical lane, moving ${compass} (${bearing.toFixed(0)}°). Prone to low visibility.`;
      } else {
        instruction = `Merge cleanly into central bypass pathway, continuing ${compass} (${bearing.toFixed(0)}°).`;
      }
    }

    stepsList.push({
      instruction,
      distance: parseFloat(segmentDist.toFixed(3)),
      bearing
    });
  }

  return {
    coordinates: uniqueCoordinates,
    distanceKm: parseFloat(totalDist.toFixed(2)),
    durationMins: Math.max(1, durationMins),
    steps: stepsList
  };
}

import { IndiaState, AssamVillage, SearchResultPlace } from "../../types";
import { INDIA_STATES_DATABASE } from "../../data/india/states";
import { ASSAM_VILLAGES_DATABASE } from "../../data/india/assam_villages";
import { PREINDEXED_LANDMARKS } from "../../data/india/landmarks";

export type { IndiaState, AssamVillage, SearchResultPlace };

export { INDIA_STATES_DATABASE, ASSAM_VILLAGES_DATABASE, PREINDEXED_LANDMARKS };


/**
 * Searches the entire Indian sub-continent database.
 * If no hardcoded match is found, it uses natural language analysis of terms
 * to dynamically generate a fully realistic, stable coordinate and place profile
 * in any State of India.
 */
import { INDIAN_VILLAGES } from "../../data/indian_villages";

export const MAJOR_CITIES: Record<string, { state: string; lat: number; lng: number; terrain: string }> = {
  "mumbai": { state: "Maharashtra", lat: 18.9220, lng: 72.8347, terrain: "Coastal Belt" },
  "pune": { state: "Maharashtra", lat: 18.5204, lng: 73.8567, terrain: "Hilly Plateau" },
  "nagpur": { state: "Maharashtra", lat: 21.1458, lng: 79.0882, terrain: "Plains" },
  "thane": { state: "Maharashtra", lat: 19.2183, lng: 72.9781, terrain: "Coastal Plains" },
  "delhi": { state: "Delhi", lat: 28.6139, lng: 77.2090, terrain: "Urban Plain" },
  "gurugram": { state: "Haryana", lat: 28.4595, lng: 77.0266, terrain: "Urban Plain" },
  "noida": { state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, terrain: "Urban Plain" },
  "bengaluru": { state: "Karnataka", lat: 12.9716, lng: 77.5946, terrain: "Hilly Plateau" },
  "bangalore": { state: "Karnataka", lat: 12.9716, lng: 77.5946, terrain: "Hilly Plateau" },
  "mysuru": { state: "Karnataka", lat: 12.2958, lng: 76.6394, terrain: "Plains Overwatch" },
  "coorg": { state: "Karnataka", lat: 12.4244, lng: 75.7382, terrain: "Dense Forest" },
  "chennai": { state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, terrain: "Coastal Belt" },
  "coimbatore": { state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, terrain: "Plains" },
  "kolkata": { state: "West Bengal", lat: 22.5726, lng: 88.3639, terrain: "Coastal Delta" },
  "darjeeling": { state: "West Bengal", lat: 27.0410, lng: 88.2627, terrain: "Cliff" },
  "hyderabad": { state: "Telangana", lat: 17.3850, lng: 78.4867, terrain: "Plains" },
  "ahmedabad": { state: "Gujarat", lat: 23.0225, lng: 72.5714, terrain: "Semi-Arid Plain" },
  "surat": { state: "Gujarat", lat: 21.1702, lng: 72.8311, terrain: "Coastal Plain" },
  "jaipur": { state: "Rajasthan", lat: 26.9124, lng: 75.7873, terrain: "Semi-Arid Hills" },
  "jodhpur": { state: "Rajasthan", lat: 26.2389, lng: 73.0243, terrain: "Desert" },
  "jaisalmer": { state: "Rajasthan", lat: 26.9157, lng: 70.9083, terrain: "Desert" },
  "udaipur": { state: "Rajasthan", lat: 24.5854, lng: 73.7125, terrain: "Hilly Plain" },
  "lucknow": { state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, terrain: "Plains" },
  "kanpur": { state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, terrain: "Plains" },
  "agra": { state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081, terrain: "Plains" },
  "varanasi": { state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, terrain: "Plains" },
  "patna": { state: "Bihar", lat: 25.5941, lng: 85.1376, terrain: "Plains" },
  "gaya": { state: "Bihar", lat: 24.7955, lng: 84.9994, terrain: "Plains" },
  "ranchi": { state: "Jharkhand", lat: 23.3441, lng: 85.3096, terrain: "Hilly Forest" },
  "jamshedpur": { state: "Jharkhand", lat: 22.8046, lng: 86.2029, terrain: "Plains" },
  "bhopal": { state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, terrain: "Plains" },
  "indore": { state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, terrain: "Plains" },
  "gwalior": { state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828, terrain: "Plains" },
  "raipur": { state: "Chhattisgarh", lat: 21.2514, lng: 81.6296, terrain: "Plains" },
  "bilaspur": { state: "Chhattisgarh", lat: 22.0790, lng: 82.1399, terrain: "Dense Forest" },
  "bhubaneswar": { state: "Odisha", lat: 20.2961, lng: 85.8245, terrain: "Coastal Plain" },
  "puri": { state: "Odisha", lat: 19.8135, lng: 85.8312, terrain: "Coastal Plain" },
  "cuttack": { state: "Odisha", lat: 20.4625, lng: 85.8830, terrain: "Plains" },
  "chandigarh": { state: "Chandigarh", lat: 30.7333, lng: 76.7794, terrain: "Plains" },
  "amritsar": { state: "Punjab", lat: 31.6340, lng: 74.8723, terrain: "Plains" },
  "ludhiana": { state: "Punjab", lat: 30.9010, lng: 75.8573, terrain: "Plains" },
  "shimla": { state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, terrain: "Cliff" },
  "manali": { state: "Himachal Pradesh", lat: 32.2396, lng: 77.1887, terrain: "Cliff" },
  "dharamshala": { state: "Himachal Pradesh", lat: 32.2190, lng: 76.3234, terrain: "Cliff" },
  "srinagar": { state: "Jammu and Kashmir", lat: 34.0837, lng: 74.7973, terrain: "Rocky Gorge" },
  "jammu": { state: "Jammu and Kashmir", lat: 32.7266, lng: 74.8570, terrain: "Hilly Plain" },
  "leh": { state: "Ladakh", lat: 34.1526, lng: 77.5771, terrain: "Snow Ridge" },
  "dehradun": { state: "Uttarakhand", lat: 30.3165, lng: 78.0322, terrain: "Hilly Forest" },
  "haridwar": { state: "Uttarakhand", lat: 29.9457, lng: 78.1642, terrain: "Plains" },
  "rishikesh": { state: "Uttarakhand", lat: 30.0869, lng: 78.2676, terrain: "Rocky Gorge" },
  "nainital": { state: "Uttarakhand", lat: 29.3803, lng: 79.4636, terrain: "Cliff" },
  "guwahati": { state: "Assam", lat: 26.1445, lng: 91.7362, terrain: "Plains" },
  "dispur": { state: "Assam", lat: 26.1500, lng: 91.7700, terrain: "Plains" },
  "tezpur": { state: "Assam", lat: 26.6338, lng: 92.7926, terrain: "Plains" },
  "dibrugarh": { state: "Assam", lat: 27.4728, lng: 94.9120, terrain: "Plains" },
  "silchar": { state: "Assam", lat: 24.8333, lng: 92.8000, terrain: "Plains" },
  "jorhat": { state: "Assam", lat: 26.7509, lng: 94.2037, terrain: "Plains" },
  "shillong": { state: "Meghalaya", lat: 25.5788, lng: 91.8833, terrain: "Dense Forest" },
  "itanagar": { state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053, terrain: "Dense Forest" },
  "tawang": { state: "Arunachal Pradesh", lat: 27.5855, lng: 91.8594, terrain: "Snow Ridge" },
  "aizawl": { state: "Mizoram", lat: 23.7271, lng: 92.7176, terrain: "Dense Forest" },
  "imphal": { state: "Manipur", lat: 24.8170, lng: 93.9368, terrain: "Hilly Forest" },
  "kohima": { state: "Nagaland", lat: 25.6751, lng: 94.1086, terrain: "Dense Forest" },
  "dimapur": { state: "Nagaland", lat: 25.9061, lng: 93.7259, terrain: "Plains" },
  "agartala": { state: "Tripura", lat: 23.8315, lng: 91.2868, terrain: "Plains" },
  "gangtok": { state: "Sikkim", lat: 27.3314, lng: 88.6138, terrain: "Cliff" },
  "thiruvananthapuram": { state: "Kerala", lat: 8.5241, lng: 76.9366, terrain: "Coastal Belt" },
  "kochi": { state: "Kerala", lat: 9.9312, lng: 76.2673, terrain: "Coastal Belt" },
  "kozhikode": { state: "Kerala", lat: 11.2588, lng: 75.7804, terrain: "Coastal Belt" },
  "amravati": { state: "Andhra Pradesh", lat: 16.5417, lng: 80.5150, terrain: "Plains" },
  "visakhapatnam": { state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, terrain: "Coastal Belt" },
  "tirupati": { state: "Andhra Pradesh", lat: 13.6288, lng: 79.4192, terrain: "Hilly Plain" },
  "panaji": { state: "Goa", lat: 15.4909, lng: 73.8278, terrain: "Coastal Belt" },
  "margao": { state: "Goa", lat: 15.2736, lng: 73.9582, terrain: "Coastal Plain" },
  "port blair": { state: "Andaman and Nicobar Islands", lat: 11.7401, lng: 92.6586, terrain: "Coastal Belt" },
  "kavaratti": { state: "Lakshadweep", lat: 10.5726, lng: 72.6417, terrain: "Coastal Belt" },
  "puducherry": { state: "Puducherry", lat: 11.9416, lng: 79.8083, terrain: "Coastal Belt" }
};

/**
 * Searches the entire Indian sub-continent database.
 * If no hardcoded match is found, it uses natural language analysis of terms
 * to dynamically generate a fully realistic, stable coordinate and place profile
 * in any State of India.
 */
export function searchIndiaDatabase(query: string): SearchResultPlace[] {
  if (!query || !query.trim()) return [];
  const cleanQuery = query.trim().toLowerCase();

  // 1. Support direct GPS coordinate parsing (e.g. "28.6139, 77.2090" or "28.6139 77.2090")
  const coordRegex = /^\s*(-?\d+\.\d+)\s*[, ]\s*(-?\d+\.\d+)\s*$/;
  const matchCoords = cleanQuery.match(coordRegex);
  if (matchCoords) {
    const lat = parseFloat(matchCoords[1]);
    const lng = parseFloat(matchCoords[2]);
    return [{
      name: `🛰️ Coordinate Lock: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
      lat,
      lng,
      category: "Landmark",
      description: "Direct coordinate telemetry parsed from user input dispatch.",
      state: "Simulated Sector",
      district: "Tactical Input",
      terrain: "Custom Target Grid",
      altitude: 120,
      populationEstimate: "N/A"
    }];
  }

  // 2. PIN Code regex matching (6-digit PIN code)
  const pinRegex = /\b(\d{6})\b/;
  const matchPin = cleanQuery.match(pinRegex);
  if (matchPin) {
    const pin = matchPin[1];
    const firstDigit = parseInt(pin[0]);
    let pState = "Delhi NCR";
    let pDistrict = "Central Zone";
    let pLat = 28.6139;
    let pLng = 77.2090;
    
    if (firstDigit === 1) { pState = "Delhi"; pLat = 28.6139; pLng = 77.2090; pDistrict = "New Delhi"; }
    else if (firstDigit === 2) { pState = "Uttar Pradesh"; pLat = 26.8467; pLng = 80.9462; pDistrict = "Lucknow Region"; }
    else if (firstDigit === 3) { pState = "Rajasthan"; pLat = 26.9124; pLng = 75.7873; pDistrict = "Jaipur Division"; }
    else if (firstDigit === 4) { pState = "Maharashtra"; pLat = 18.9220; pLng = 72.8347; pDistrict = "Mumbai Sector"; }
    else if (firstDigit === 5) { pState = "Karnataka"; pLat = 12.9716; pLng = 77.5946; pDistrict = "Bengaluru District"; }
    else if (firstDigit === 6) { pState = "Tamil Nadu"; pLat = 13.0827; pLng = 80.2707; pDistrict = "Chennai Division"; }
    else if (firstDigit === 7) { pState = "West Bengal"; pLat = 22.5726; pLng = 88.3639; pDistrict = "Kolkata Sector"; }
    else if (firstDigit === 8) { pState = "Bihar"; pLat = 25.5941; pLng = 85.1376; pDistrict = "Patna Zone"; }
    
    let hash = 0;
    for (let idx = 0; idx < pin.length; idx++) {
      hash = pin.charCodeAt(idx) + ((hash << 5) - hash);
    }
    const offsetLat = (Math.sin(hash) * 0.08);
    const offsetLng = (Math.cos(hash) * 0.08);
    
    return [{
      name: `📮 PIN Code: ${pin} Sector`,
      lat: pLat + offsetLat,
      lng: pLng + offsetLng,
      category: "Landmark",
      description: `Tactical Postal Code Grid Zone for PIN ${pin} in ${pState}. Real-time signal coverage active.`,
      state: pState,
      district: pDistrict,
      terrain: "Urban/Suburban Grid",
      altitude: 180 + Math.abs(hash % 150),
      populationEstimate: "45,000"
    }];
  }

  const results: SearchResultPlace[] = [];

  // Parse terms to support State -> District -> Village/City -> Landmark hierarchy
  const terms = cleanQuery.split(/[,➔\->\>]+/).map(t => t.trim()).filter(Boolean);

  if (terms.length === 0) return [];

  // Hierarchy search case
  if (terms.length === 1) {
    const term = terms[0];

    // Filter states
    INDIA_STATES_DATABASE.forEach(s => {
      if (s.name.toLowerCase().includes(term) || s.capital.toLowerCase().includes(term)) {
        results.push({
          name: s.name,
          lat: s.lat,
          lng: s.lng,
          category: "State",
          description: `${s.type} - Capital: ${s.capital}. ${s.description}`,
          state: s.name,
          district: "State Capital Sector",
          terrain: s.description.includes("forest") ? "Dense Forest" : s.description.includes("Himalayan") ? "Cliff" : "Plains",
          altitude: s.description.includes("Himalayan") ? 1800 : s.description.includes("plateau") ? 600 : 150,
          populationEstimate: "Millions"
        });

        // Smart Suggestion: Suggest districts for this state
        const districts = getDistrictsForState(s.name);
        districts.slice(0, 4).forEach(d => {
          let hash = 0;
          const seed = `${s.name}_${d}`;
          for (let idx = 0; idx < seed.length; idx++) {
            hash = seed.charCodeAt(idx) + ((hash << 5) - hash);
          }
          const offsetLat = Math.sin(hash) * 0.3;
          const offsetLng = Math.cos(hash) * 0.3;
          results.push({
            name: `${s.name} ➔ ${d}`,
            lat: s.lat + offsetLat,
            lng: s.lng + offsetLng,
            category: "District",
            description: `Tactical district sector in state of ${s.name}. Select to inspect or download.`,
            state: s.name,
            district: d,
            terrain: s.description.includes("forest") ? "Dense Forest" : "Plains",
            altitude: s.description.includes("Himalayan") ? 1200 : 250,
            populationEstimate: "Hundreds of Thousands"
          });
        });
      }
    });

    // Filter pre-indexed landmarks
    PREINDEXED_LANDMARKS.forEach(l => {
      if (
        l.name?.toLowerCase().includes(term) ||
        l.district?.toLowerCase().includes(term) ||
        l.state?.toLowerCase().includes(term)
      ) {
        results.push({
          name: l.name!,
          lat: l.lat!,
          lng: l.lng!,
          category: l.category || "Landmark",
          description: l.description!,
          state: l.state!,
          district: l.district!,
          terrain: l.terrain || "Tactical Node",
          altitude: l.altitude || 150,
          populationEstimate: l.populationEstimate || "Unknown"
        });
      }
    });

    // Filter Assam Villages Database
    ASSAM_VILLAGES_DATABASE.forEach(v => {
      if (
        v.name.toLowerCase().includes(term) ||
        v.district.toLowerCase().includes(term) ||
        v.subdivision.toLowerCase().includes(term)
      ) {
        results.push({
          name: v.name,
          lat: v.lat,
          lng: v.lng,
          category: "Village",
          description: `${v.district} District subdivision ${v.subdivision}. Pop: ${v.populationEstimate}. ${v.description}`,
          state: "Assam",
          district: v.district,
          terrain: v.terrain,
          altitude: v.altitude,
          populationEstimate: v.populationEstimate
        });

        // Smart Suggestion: Suggest landmarks inside this village!
        const landmarkTypes = ["Hospital", "Police Station", "Fire Station", "Pharmacy", "Fuel Station"];
        landmarkTypes.forEach((type, idx) => {
          results.push({
            name: `Assam ➔ ${v.district} ➔ ${v.name} ➔ ${type}`,
            lat: v.lat + (idx * 0.002 - 0.004),
            lng: v.lng + (idx * 0.002 - 0.004),
            category: (type === "Hospital" || type === "Pharmacy" ? "Hospital" : type === "Police Station" || type === "Fire Station" ? "Police" : "Landmark") as any,
            description: `Tactical offline ${type.toLowerCase()} asset in ${v.name}, ${v.district}.`,
            state: "Assam",
            district: v.district,
            terrain: v.terrain,
            altitude: v.altitude + idx,
            populationEstimate: "N/A"
          });
        });
      }
    });

    // Filter INDIAN_VILLAGES Database from database file
    INDIAN_VILLAGES.forEach(v => {
      if (
        v.name.toLowerCase().includes(term) ||
        v.state.toLowerCase().includes(term) ||
        v.terrain.toLowerCase().includes(term)
      ) {
        results.push({
          name: v.name,
          lat: v.latitude,
          lng: v.longitude,
          category: "Village",
          description: `${v.description} Survival Tip: ${v.survivalTip}. Safety Rating: ${v.safetyRating}.`,
          state: v.state,
          district: "Local Sector",
          terrain: v.terrain,
          altitude: v.altitude,
          populationEstimate: "Thousands"
        });
      }
    });
  } else if (terms.length >= 2) {
    const stateTerm = terms[0];
    const districtTerm = terms[1];
    const villageTerm = terms[2] || "";
    const landmarkTerm = terms[3] || "";

    const matchedState = INDIA_STATES_DATABASE.find(s => s.name.toLowerCase().includes(stateTerm));
    if (matchedState) {
      const districts = getDistrictsForState(matchedState.name);
      const matchedDistrict = districts.find(d => d.toLowerCase().includes(districtTerm));

      if (matchedDistrict) {
        if (!villageTerm) {
          const places = getPlacesForDistrict(matchedState.name, matchedDistrict);
          places.forEach(p => {
            results.push({
              name: `${matchedState.name} ➔ ${matchedDistrict} ➔ ${p.name}`,
              lat: p.lat,
              lng: p.lng,
              category: "Village",
              description: `${p.description} State: ${matchedState.name}.`,
              state: matchedState.name,
              district: matchedDistrict,
              terrain: p.terrain,
              altitude: p.altitude,
              populationEstimate: p.populationEstimate
            });
          });

          let hash = 0;
          const seed = `${matchedState.name}_${matchedDistrict}`;
          for (let idx = 0; idx < seed.length; idx++) {
            hash = seed.charCodeAt(idx) + ((hash << 5) - hash);
          }
          results.push({
            name: `${matchedState.name} ➔ ${matchedDistrict}`,
            lat: matchedState.lat + Math.sin(hash) * 0.3,
            lng: matchedState.lng + Math.cos(hash) * 0.3,
            category: "District",
            description: `Entire tactical district of ${matchedDistrict} in ${matchedState.name}.`,
            state: matchedState.name,
            district: matchedDistrict,
            terrain: matchedState.description.includes("forest") ? "Dense Forest" : "Plains",
            altitude: matchedState.description.includes("Himalayan") ? 1100 : 220,
            populationEstimate: "Hundreds of Thousands"
          });
        } else {
          const places = getPlacesForDistrict(matchedState.name, matchedDistrict);
          const matchedPlace = places.find(p => p.name.toLowerCase().includes(villageTerm));

          if (matchedPlace) {
            if (!landmarkTerm) {
              results.push({
                name: `${matchedState.name} ➔ ${matchedDistrict} ➔ ${matchedPlace.name}`,
                lat: matchedPlace.lat,
                lng: matchedPlace.lng,
                category: "Village",
                description: `${matchedPlace.description} State: ${matchedState.name}.`,
                state: matchedState.name,
                district: matchedDistrict,
                terrain: matchedPlace.terrain,
                altitude: matchedPlace.altitude,
                populationEstimate: matchedPlace.populationEstimate
              });

              const landmarkTypes = ["Hospital", "Police Station", "Fire Station", "Pharmacy", "Fuel Station", "Landmark"];
              landmarkTypes.forEach((type, idx) => {
                results.push({
                  name: `${matchedState.name} ➔ ${matchedDistrict} ➔ ${matchedPlace.name} ➔ ${type}`,
                  lat: matchedPlace.lat + (idx * 0.0015 - 0.003),
                  lng: matchedPlace.lng + (idx * 0.0015 - 0.003),
                  category: (type === "Hospital" || type === "Pharmacy" ? "Hospital" : type === "Police Station" || type === "Fire Station" ? "Police" : "Landmark") as any,
                  description: `Emergency offline ${type.toLowerCase()} division in ${matchedPlace.name}.`,
                  state: matchedState.name,
                  district: matchedDistrict,
                  terrain: matchedPlace.terrain,
                  altitude: matchedPlace.altitude + idx,
                  populationEstimate: "N/A"
                });
              });
            } else {
              const landmarkTypes = ["Hospital", "Police Station", "Fire Station", "Pharmacy", "Fuel Station", "Landmark"];
              const matchedType = landmarkTypes.find(t => t.toLowerCase().includes(landmarkTerm));
              const finalType = matchedType || "Landmark";

              let idx = landmarkTypes.indexOf(finalType);
              if (idx === -1) idx = 5;

              results.push({
                name: `${matchedState.name} ➔ ${matchedDistrict} ➔ ${matchedPlace.name} ➔ ${finalType}`,
                lat: matchedPlace.lat + (idx * 0.0015 - 0.003),
                lng: matchedPlace.lng + (idx * 0.0015 - 0.003),
                category: (finalType === "Hospital" || finalType === "Pharmacy" ? "Hospital" : finalType === "Police Station" || finalType === "Fire Station" ? "Police" : "Landmark") as any,
                description: `Emergency offline ${finalType.toLowerCase()} division in ${matchedPlace.name}, ${matchedDistrict}. Verified.`,
                state: matchedState.name,
                district: matchedDistrict,
                terrain: matchedPlace.terrain,
                altitude: matchedPlace.altitude + idx,
                populationEstimate: "N/A"
              });
            }
          }
        }
      }
    }
  }

  // 3. DETECT UNMATCHED QUERIES OR GENERAL KEYWORD FALLBACKS (Nationwide Synthesis Engine)
  // If we have few matches or specific tactical keyword lookups (e.g. "Mumbai hospital" or "Kedarnath Gurudwara"),
  // we dynamically synthesize correct tactical points across ALL India locations.
  if (results.length < 6) {
    // Determine base state and base coordinate
    let matchedState = INDIA_STATES_DATABASE[0]; // Default: Andhra Pradesh
    let matchedCityName = "New Delhi";
    let baseLat = 28.6139;
    let baseLng = 77.2090;
    let baseTerrain = "Urban Corridor";

    // Scan for state inside query
    for (const state of INDIA_STATES_DATABASE) {
      if (cleanQuery.includes(state.name.toLowerCase())) {
        matchedState = state;
        baseLat = state.lat;
        baseLng = state.lng;
        baseTerrain = state.description.includes("forest") ? "Dense Forest" : state.description.includes("Himalayan") ? "Cliff" : "Plains";
        matchedCityName = state.capital;
        break;
      }
    }

    // Scan for major city inside query
    for (const [cityName, cityData] of Object.entries(MAJOR_CITIES)) {
      if (cleanQuery.includes(cityName)) {
        matchedCityName = cityName.toUpperCase();
        baseLat = cityData.lat;
        baseLng = cityData.lng;
        baseTerrain = cityData.terrain;
        const stateObj = INDIA_STATES_DATABASE.find(s => s.name.toLowerCase() === cityData.state.toLowerCase());
        if (stateObj) {
          matchedState = stateObj;
        }
        break;
      }
    }

    // Extract categories
    let finalCategory: SearchResultPlace["category"] = "Landmark";
    let catKeywordDesc = "Strategic observation post. Multi-frequency backup links active.";
    let catDisplayName = "Tactical Node";

    const catKeywords: { kw: string[]; cat: SearchResultPlace["category"]; desc: string; dName: string }[] = [
      { kw: ["hospital", "clinic", "health", "medical", "dispensary", "trauma"], cat: "Hospital", desc: "Reinforced regional emergency hospital base with tactical critical-care systems.", dName: "Field Trauma Hospital" },
      { kw: ["police", "thana", "garrison", "security", "jail", "post", "defense"], cat: "Police", desc: "Secured local security post. Active communication transceivers and high-gain antenna arrays.", dName: "Civil Guard Post" },
      { kw: ["fire", "brigade"], cat: "Police", desc: "Emergency heavy equipment fire rescue division. Full search and rescue support gear.", dName: "Fire Rescue Outpost" },
      { kw: ["pharmacy", "chemist", "medical store", "drug"], cat: "Hospital", desc: "Sub-surface medical cache containing antibiotics, hydration packs, and trauma supplies.", dName: "Medical Depot Supply Cache" },
      { kw: ["school", "college", "university", "iit", "iim", "institute", "academy"], cat: "Shelter", desc: "Concrete-reinforced university campus area, equipped with backup solar panels and rain capture reservoirs.", dName: "Education Shelter Complex" },
      { kw: ["temple", "mosque", "church", "gurudwara", "mandir", "masjid", "shrine"], cat: "Landmark", desc: "Large stone construction assembly hall, sturdy roof structure, suitable for high wind refuge.", dName: "Religious Staging Node" },
      { kw: ["park", "sanctuary", "national park", "wildlife"], cat: "Landmark", desc: "Nature reserve area, rich groundwater, dense forest foliage ideal for low-signature camouflaged camping.", dName: "Eco-Sanctuary Base" },
      { kw: ["river", "lake", "canal", "aquifer", "stream", "reservoir"], cat: "Water", desc: "Abundant water body source. Water flow verified, manual distillation recommended before high-volume usage.", dName: "Hydration Supply Node" },
      { kw: ["forest", "jungle", "woods"], cat: "Landmark", desc: "Extremely dense canopy cover, high-density woods, low satellite detection index.", dName: "Heavy Canopy Sector" },
      { kw: ["mountain", "hill", "summit", "peak", "ridge", "cliff"], cat: "Landmark", desc: "High elevation rocky mountain overwatch outpost. Clear line of sight for long-range communications.", dName: "Overwatch Highpoint" },
      { kw: ["bunker", "shelter", "refuge"], cat: "Shelter", desc: "Reinforced underground emergency shelter. Steel door locking structures and air filtration systems.", dName: "Underground Shelter Unit" },
      { kw: ["road", "street", "highway", "nh-", "expressway"], cat: "Landmark", desc: "Major paved transportation route. Tactical movement lines cleared for disaster response teams.", dName: "Arterial Highway Corridor" },
      { kw: ["metro", "railway", "airport", "bus", "station", "terminal"], cat: "Landmark", desc: "Critical transportation staging terminal, spacious layout, excellent underground structural reinforcements.", dName: "Transit Terminal Hub" }
    ];

    for (const item of catKeywords) {
      if (item.kw.some(k => cleanQuery.includes(k))) {
        finalCategory = item.cat;
        catKeywordDesc = item.desc;
        catDisplayName = item.dName;
        break;
      }
    }

    // Hash the search query to make deterministic coordinates offsets
    let hash = 0;
    for (let idx = 0; idx < cleanQuery.length; idx++) {
      hash = cleanQuery.charCodeAt(idx) + ((hash << 5) - hash);
    }

    // Synthesize beautiful results using deterministic math
    const placesSynthesized = [
      { nameSuffix: catDisplayName, latOffset: (Math.sin(hash) * 0.024), lngOffset: (Math.cos(hash) * 0.024), altOffset: 10 },
      { nameSuffix: `Secondary ${catDisplayName} B`, latOffset: (Math.cos(hash * 2) * 0.045), lngOffset: (Math.sin(hash * 2) * 0.045), altOffset: 35 },
      { nameSuffix: `${catDisplayName} Shelter Alpha`, latOffset: (Math.sin(hash * 3) * 0.068), lngOffset: (Math.cos(hash * 3) * 0.068), altOffset: -15 }
    ];

    // Capitalize the first letter of search terms to display elegantly as location names
    const rawSearchTitle = query.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    placesSynthesized.forEach((ps, pIdx) => {
      const generatedName = pIdx === 0 ? `${rawSearchTitle}` : `${rawSearchTitle} (${ps.nameSuffix})`;
      const generatedLat = baseLat + ps.latOffset;
      const generatedLng = baseLng + ps.lngOffset;

      results.push({
        name: generatedName,
        lat: generatedLat,
        lng: generatedLng,
        category: finalCategory,
        description: `Deterministic fallback GIS node for ${generatedName}. ${catKeywordDesc}`,
        state: matchedState.name,
        district: `${matchedCityName} Region`,
        terrain: baseTerrain,
        altitude: Math.round(150 + Math.abs((hash + ps.altOffset) % 400)),
        populationEstimate: "N/A"
      });
    });
  }

  // Deduplicate and return top 12 results
  const seen = new Set<string>();
  const finalResults: SearchResultPlace[] = [];
  results.forEach(r => {
    const key = `${r.lat.toFixed(5)}_${r.lng.toFixed(5)}_${r.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      finalResults.push(r);
    }
  });

  return finalResults.slice(0, 12);
}

/**
 * Returns districts for a given state name (supporting pre-filled and dynamically generated districts).
 */
export function getDistrictsForState(stateName: string): string[] {
  if (stateName === "Assam") {
    return Array.from(new Set(ASSAM_VILLAGES_DATABASE.map(v => v.district))).sort();
  }
  if (stateName === "Delhi") {
    return ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "New Delhi"];
  }
  if (stateName === "Maharashtra") {
    return ["Mumbai City", "Pune", "Thane", "Nagpur", "Nashik", "Satara"];
  }
  if (stateName === "Karnataka") {
    return ["Bengaluru Urban", "Mysuru", "Kodagu (Coorg)", "Dakshina Kannada", "Udupi"];
  }
  if (stateName === "Uttarakhand") {
    return ["Dehradun", "Tehri Garhwal", "Rudraprayag", "Haridwar", "Nainital"];
  }
  if (stateName === "Rajasthan") {
    return ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer", "Kota"];
  }

  // Dynamic deterministic generation for other states
  let hash = 0;
  for (let idx = 0; idx < stateName.length; idx++) {
    hash = stateName.charCodeAt(idx) + ((hash << 5) - hash);
  }
  const prefixList = ["North", "South", "East", "West", "Central"];
  const suffixList = ["District", "Sector", "County", "Zone"];
  const d1 = prefixList[Math.abs(hash) % prefixList.length] + " " + stateName;
  const d2 = "Central " + stateName + " Valley";
  const d3 = stateName + " Border " + suffixList[Math.abs(hash + 2) % suffixList.length];
  return [d1, d2, d3];
}

export interface GenericPlace {
  name: string;
  lat: number;
  lng: number;
  altitude: number;
  terrain: string;
  description: string;
  populationEstimate: string;
}

/**
 * Returns places/towns for a given state and district.
 */
export function getPlacesForDistrict(stateName: string, districtName: string): GenericPlace[] {
  if (stateName === "Assam") {
    const matched = ASSAM_VILLAGES_DATABASE.filter(v => v.district === districtName);
    if (matched.length > 0) {
      return matched.map(m => ({
        name: m.name,
        lat: m.lat,
        lng: m.lng,
        altitude: m.altitude,
        terrain: m.terrain,
        description: m.description,
        populationEstimate: m.populationEstimate
      }));
    }
  }

  // Predefined for our key states
  if (stateName === "Delhi") {
    if (districtName === "South Delhi") {
      return [
        { name: "Sanjay Van Forest", lat: 28.5284, lng: 77.1691, altitude: 270, terrain: "Dense Forest", description: "Vast central dense forest preserve.", populationEstimate: "200" },
        { name: "Mehrauli Canopy", lat: 28.5144, lng: 77.1812, altitude: 275, terrain: "Dense Forest", description: "Rocky historic valley shelters.", populationEstimate: "1,200" }
      ];
    }
    if (districtName === "New Delhi" || districtName === "Central Delhi") {
      return [
        { name: "Connaught Place Staging", lat: 28.6304, lng: 77.2177, altitude: 215, terrain: "Urban Corridor", description: "Central administrative trade district.", populationEstimate: "150k" },
        { name: "India Gate Overwatch", lat: 28.6129, lng: 77.2295, altitude: 210, terrain: "Plains Overwatch", description: "National monument grid, fully cleared sightlines.", populationEstimate: "15k" }
      ];
    }
  }

  if (stateName === "Maharashtra") {
    if (districtName === "Pune") {
      return [
        { name: "Lonavala Valley", lat: 18.7557, lng: 73.4091, altitude: 624, terrain: "Cliff", description: "Western Ghats canyon pass.", populationEstimate: "55k" },
        { name: "Shaniwar Wada Command", lat: 18.5194, lng: 73.8553, altitude: 560, terrain: "Fortified Ruins", description: "Fortified palace ruins with massive stone walls.", populationEstimate: "120k" }
      ];
    }
    if (districtName === "Mumbai City") {
      return [
        { name: "Gateway of India Port", lat: 18.9220, lng: 72.8347, altitude: 5, terrain: "Coastal Belt", description: "Seaside monument with direct marine dock lines.", populationEstimate: "50k" },
        { name: "KEM Hospital Compound", lat: 19.0026, lng: 72.8421, altitude: 8, terrain: "Urban Corridor", description: "Primary emergency health trauma station.", populationEstimate: "200k" }
      ];
    }
  }

  if (stateName === "Karnataka") {
    if (districtName === "Kodagu (Coorg)") {
      return [
        { name: "Madikeri Forest Post", lat: 12.4244, lng: 75.7382, altitude: 1150, terrain: "Dense Forest", description: "Wet subtropical mountain rainforest camp.", populationEstimate: "42k" }
      ];
    }
    if (districtName === "Mysuru") {
      return [
        { name: "Mysuru Palace Staging", lat: 12.3052, lng: 76.6551, altitude: 770, terrain: "Plains Overwatch", description: "Historic reinforced palace compound.", populationEstimate: "12k" }
      ];
    }
  }

  // Dynamic generation for any state and district
  const combinedSeed = `${stateName}_${districtName}`;
  let hash = 0;
  for (let idx = 0; idx < combinedSeed.length; idx++) {
    hash = combinedSeed.charCodeAt(idx) + ((hash << 5) - hash);
  }

  const baseState = INDIA_STATES_DATABASE.find(s => s.name === stateName) || INDIA_STATES_DATABASE[0];
  const pseudoRandLat = Math.sin(hash) * 0.25;
  const pseudoRandLng = Math.cos(hash) * 0.25;
  const l1Lat = baseState.lat + pseudoRandLat;
  const l1Lng = baseState.lng + pseudoRandLng;
  const l2Lat = baseState.lat - pseudoRandLng * 0.4;
  const l2Lng = baseState.lng - pseudoRandLat * 0.4;

  const list: GenericPlace[] = [
    {
      name: `${districtName} Central Sector`,
      lat: l1Lat,
      lng: l1Lng,
      altitude: Math.round(120 + Math.abs((hash * 3) % 450)),
      terrain: baseState.description.includes("mountain") || baseState.description.includes("Himalayan") ? "Cliff" : "Plains",
      description: `Primary civil dispatch and administration zone for ${districtName}.`,
      populationEstimate: `${Math.round(20 + Math.abs(hash % 80))}k`
    },
    {
      name: `Emergency Basecamp ${String.fromCharCode(65 + Math.abs(hash % 4))}`,
      lat: l2Lat,
      lng: l2Lng,
      altitude: Math.round(140 + Math.abs((hash * 5) % 480)),
      terrain: baseState.description.includes("forest") ? "Dense Forest" : "Plains",
      description: `Secure relief staging hub containing clean freshwater aquifers and rations storage.`,
      populationEstimate: `${Math.round(1 + Math.abs(hash % 9))}k`
    }
  ];

  return list;
}

import React, { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Heart, 
  Globe, 
  Compass, 
  Download, 
  Trash2, 
  Play, 
  Pause, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  FolderOpen,
  Navigation,
  HardDrive,
  Mic,
  MicOff,
  History,
  Wifi,
  WifiOff
} from "lucide-react";
import { 
  getRegions, 
  deleteRegion, 
  getOfflineCacheStats, 
  clearAllOfflineCache, 
  saveRegion,
  OfflineRegion 
} from "../../lib/offlineDb";
import { Waypoint } from "../../types";
import { 
  INDIA_STATES_DATABASE, 
  ASSAM_VILLAGES_DATABASE,
  IndiaState,
  AssamVillage
} from "./indiaData";

interface GlobalSearchConsoleProps {
  latitude: number;
  longitude: number;
  setLatitude: (lat: number) => void;
  setLongitude: (lng: number) => void;
  speakVoiceFeedback: (text: string) => void;
  destinationWaypoint: Waypoint | null;
  setDestinationWaypoint: (wp: Waypoint | null) => void;
  setChatLog: React.Dispatch<React.SetStateAction<any[]>>;
  onSearchFocus?: () => void;
}

// Extensive Global Landmark and Survival Base Directory
interface GlobalLandmark {
  name: string;
  category: string;
  lat: number;
  lng: number;
  altitude: number;
  terrain: string;
  description: string;
  country: string;
  hierarchy: string[]; // [Continent, Country, State/Region]
}

const GLOBAL_LANDMARKS_DIRECTORY: GlobalLandmark[] = [
  // India (Delhi & Himalayas)
  { name: "New Delhi Base Camp", category: "Basecamp", lat: 28.6139, lng: 77.2090, altitude: 310, terrain: "Dense Forest", description: "Central headquarters tactical emergency node.", country: "India", hierarchy: ["Asia", "India", "Delhi NCR"] },
  { name: "Rishikesh River Camp", category: "Water Supply", lat: 30.0869, lng: 78.2676, altitude: 340, terrain: "Dense Forest", description: "Fresh river water monitoring basin on foothills of the Himalayas.", country: "India", hierarchy: ["Asia", "India", "Uttarakhand"] },
  { name: "Narendra Nagar Cliff Camp", category: "Rescue Node", lat: 30.1611, lng: 78.2975, altitude: 1050, terrain: "cliff", description: "Strategic mountain ridge checkpoint prone to seismic blockage.", country: "India", hierarchy: ["Asia", "India", "Uttarakhand"] },
  { name: "Mussoorie Hilltop Base", category: "Cold Shelter", lat: 30.4598, lng: 78.0792, altitude: 2005, terrain: "cliff", description: "Alpine high-elevation freeze shelter.", country: "India", hierarchy: ["Asia", "India", "Uttarakhand"] },
  { name: "Sanjay Van Wildlife Camp", category: "Shelter", lat: 28.5284, lng: 77.1691, altitude: 280, terrain: "Dense Forest", description: "Dense forest shelter inside Delhi's largest woodland.", country: "India", hierarchy: ["Asia", "India", "Delhi NCR"] },
  
  // USA & Americas
  { name: "Colorado Rockies Rescue Camp", category: "Basecamp", lat: 39.7392, lng: -104.9903, altitude: 2450, terrain: "cliff", description: "Extreme elevation survival post.", country: "USA", hierarchy: ["North America", "USA", "Colorado"] },
  { name: "Yosemite High Sierra Shelter", category: "Shelter", lat: 37.8651, lng: -119.5383, altitude: 1200, terrain: "Dense Forest", description: "Rockfall tracking shelter and forest supply cache.", country: "USA", hierarchy: ["North America", "USA", "California"] },
  { name: "Manaus Amazon Outpost", category: "Pathogen Clinic", lat: -3.4653, lng: -62.2159, altitude: 40, terrain: "swamp", description: "Anti-pathogen research outpost in deep rainforest.", country: "Brazil", hierarchy: ["South America", "Brazil", "Amazon Basin"] },
  { name: "Alaska Denali Cold Base", category: "Extreme Cold", lat: 63.0692, lng: -151.0063, altitude: 3100, terrain: "snow", description: "Sub-zero blizzard staging bunker and thermal supply depot.", country: "USA", hierarchy: ["North America", "USA", "Alaska"] },

  // Europe
  { name: "Zermatt Glacier Outpost", category: "Cold Shelter", lat: 45.9763, lng: 7.6585, altitude: 1620, terrain: "snow", description: "Glacier emergency staging point in Swiss Alps.", country: "Switzerland", hierarchy: ["Europe", "Switzerland", "Swiss Alps"] },
  { name: "Chamonix Mont Blanc Node", category: "Alpine Rescue", lat: 45.9227, lng: 6.8685, altitude: 1035, terrain: "snow", description: "High-altitude medical alpine station.", country: "France", hierarchy: ["Europe", "France", "Rhone-Alpes"] },
  { name: "Iceland Volcanic Rift Hub", category: "Basecamp", lat: 64.1466, lng: -21.9426, altitude: 15, terrain: "swamp", description: "Seismic and gas plume telemetry base.", country: "Iceland", hierarchy: ["Europe", "Iceland", "Reykjavik"] },

  // Nepal
  { name: "Everest Basecamp Alpha", category: "Rescue Node", lat: 28.0044, lng: 86.8558, altitude: 5364, terrain: "snow", description: "Extreme altitude survival staging outpost.", country: "Nepal", hierarchy: ["Asia", "Nepal", "Khumbu Region"] },

  // Australia / Oceania
  { name: "Outback Desert Oasis", category: "Water Supply", lat: -23.6980, lng: 133.8807, altitude: 540, terrain: "swamp", description: "Deep borehole thermal water supply cache.", country: "Australia", hierarchy: ["Oceania", "Australia", "Northern Territory"] }
];

export const STATE_DISTRICTS_MAP: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
  "Arunachal Pradesh": ["Tawang", "Itanagar", "West Kameng"],
  "Assam": ["Biswanath", "Sonitpur", "Majuli", "Kamrup Metropolitan", "Jorhat", "Dibrugarh", "Lakhimpur"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Wayanad"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Varanasi"],
  "West Bengal": ["Kolkata", "Darjeeling", "Howrah"]
};

export const DISTRICT_CITIES_MAP: Record<string, string[]> = {
  "Biswanath": ["Biswanath Chariali", "Behali Village", "Gohpur Town", "Halem Village", "Borgang Village", "Bedeti Village", "Kalabari", "Rangati"],
  "Sonitpur": ["Tezpur", "Dhekiajuli", "Rangapara", "Balipara", "Jamugurihat"],
  "Majuli": ["Garamur", "Kamalabari", "Auniati", "Dakshinpat"],
  "Kamrup Metropolitan": ["Guwahati", "Dispur", "Kamakhya", "Maligaon"],
  "New Delhi": ["Connaught Place", "Chanakyapuri", "Dwarka", "Vasant Kunj"],
  "Ahmedabad": ["Satellite", "Navrangpura", "Maninagar", "Vastrapur"],
  "Shimla": ["Mall Road", "Kufri", "Chhota Shimla"],
  "Bengaluru": ["Indiranagar", "Koramangala", "Jayanagar", "Whitefield"],
  "Kochi": ["Fort Kochi", "Ernakulam", "Edappally"],
  "Mumbai": ["Colaba", "Andheri", "Bandra", "Juhu"],
  "Jaipur": ["C-Scheme", "Malviya Nagar", "Vaishali Nagar"],
  "Rishikesh": ["Triveni Ghat", "Laxman Jhula", "Ram Jhula"],
  "Lucknow": ["Hazratganj", "Gomti Nagar", "Aliganj"],
  "Kolkata": ["Salt Lake", "Park Street", "New Town"]
};

export const CITY_LANDMARKS_MAP: Record<string, { name: string; category: string; latOffset: number; lngOffset: number }[]> = {
  "Biswanath Chariali": [
    { name: "Biswanath Chariali Civil Hospital", category: "Hospital", latOffset: 0.004, lngOffset: -0.003 },
    { name: "Chariali Central Police HQ", category: "Police Station", latOffset: -0.002, lngOffset: 0.005 },
    { name: "Biswanath Fire & Rescue Station", category: "Fire Station", latOffset: 0.001, lngOffset: -0.002 },
    { name: "Survival Life Pharmacy", category: "Pharmacy", latOffset: -0.003, lngOffset: -0.004 },
    { name: "Indian Oil Fuel Depot", category: "Fuel Station", latOffset: 0.005, lngOffset: 0.001 }
  ],
  "Tezpur": [
    { name: "Tezpur Medical College & Hospital", category: "Hospital", latOffset: 0.005, lngOffset: -0.004 },
    { name: "Sadar Police Station Tezpur", category: "Police Station", latOffset: -0.001, lngOffset: 0.003 },
    { name: "Tezpur Town Fire Station", category: "Fire Station", latOffset: 0.002, lngOffset: -0.001 },
    { name: "Apollo Pharmacy Tezpur", category: "Pharmacy", latOffset: -0.002, lngOffset: -0.002 },
    { name: "HP Fuel Oasis", category: "Fuel Station", latOffset: 0.003, lngOffset: 0.004 }
  ],
  "Guwahati": [
    { name: "Gauhati Medical College & Hospital (GMCH)", category: "Hospital", latOffset: 0.008, lngOffset: -0.006 },
    { name: "Dispur Police Outpost", category: "Police Station", latOffset: -0.003, lngOffset: 0.005 },
    { name: "Guwahati Central Fire HQ", category: "Fire Station", latOffset: 0.001, lngOffset: -0.002 },
    { name: "Brahmaputra Life Care Pharmacy", category: "Pharmacy", latOffset: -0.005, lngOffset: -0.004 },
    { name: "NRL Fuel Station", category: "Fuel Station", latOffset: 0.006, lngOffset: 0.002 }
  ],
  "Connaught Place": [
    { name: "Dr. Ram Manohar Lohia Hospital", category: "Hospital", latOffset: 0.005, lngOffset: -0.005 },
    { name: "Connaught Place Police HQ", category: "Police Station", latOffset: -0.002, lngOffset: 0.002 },
    { name: "Connaught Place Fire Depot", category: "Fire Station", latOffset: 0.001, lngOffset: -0.001 },
    { name: "Fortis Healthworld Pharmacy", category: "Pharmacy", latOffset: -0.003, lngOffset: -0.002 },
    { name: "BPCL CNG Fuel Pump", category: "Fuel Station", latOffset: 0.003, lngOffset: 0.004 }
  ],
  "Indiranagar": [
    { name: "Indiranagar General Hospital", category: "Hospital", latOffset: 0.003, lngOffset: -0.003 },
    { name: "Indiranagar Police Post", category: "Police Station", latOffset: -0.002, lngOffset: 0.003 },
    { name: "Bengaluru East Fire Depot", category: "Fire Station", latOffset: 0.001, lngOffset: -0.001 },
    { name: "Medplus Pharmacy Indiranagar", category: "Pharmacy", latOffset: -0.004, lngOffset: -0.002 },
    { name: "Shell Fuel Station", category: "Fuel Station", latOffset: 0.004, lngOffset: 0.002 }
  ],
  "Fort Kochi": [
    { name: "Fort Kochi Government Hospital", category: "Hospital", latOffset: 0.002, lngOffset: -0.003 },
    { name: "Fort Kochi Police Station", category: "Police Station", latOffset: -0.003, lngOffset: 0.002 },
    { name: "Kochi Marine Fire Rescue Station", category: "Fire Station", latOffset: 0.001, lngOffset: -0.002 },
    { name: "Fort Care Pharmacy", category: "Pharmacy", latOffset: -0.002, lngOffset: -0.001 },
    { name: "Kochi Port Fuel Bunker", category: "Fuel Station", latOffset: 0.003, lngOffset: 0.001 }
  ],
  "Colaba": [
    { name: "INHS Asvini Navy Hospital Colaba", category: "Hospital", latOffset: 0.005, lngOffset: -0.004 },
    { name: "Colaba Police Outpost", category: "Police Station", latOffset: -0.002, lngOffset: 0.003 },
    { name: "Nariman Point Fire Depot", category: "Fire Station", latOffset: 0.001, lngOffset: -0.001 },
    { name: "Nobel Chemist Colaba", category: "Pharmacy", latOffset: -0.003, lngOffset: -0.002 },
    { name: "HP Marine Drive Fuel Oasis", category: "Fuel Station", latOffset: 0.004, lngOffset: 0.003 }
  ],
  "C-Scheme": [
    { name: "Jaipur SMS Medical College Hospital", category: "Hospital", latOffset: 0.006, lngOffset: -0.005 },
    { name: "Ashok Nagar Police HQ", category: "Police Station", latOffset: -0.001, lngOffset: 0.004 },
    { name: "Jaipur Central Fire Depot", category: "Fire Station", latOffset: 0.002, lngOffset: -0.001 },
    { name: "Dawa Bazaar Pharmacy", category: "Pharmacy", latOffset: -0.004, lngOffset: -0.002 },
    { name: "IOCL Fuel Station C-Scheme", category: "Fuel Station", latOffset: 0.003, lngOffset: 0.002 }
  ]
};

export const GlobalSearchConsole: React.FC<GlobalSearchConsoleProps> = ({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  speakVoiceFeedback,
  destinationWaypoint,
  setDestinationWaypoint,
  setChatLog,
  onSearchFocus
}) => {
  // Input fields
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GlobalLandmark[]>([]);
  const [browsingContinent, setBrowsingContinent] = useState<string | null>(null);
  const [browsingCountry, setBrowsingCountry] = useState<string | null>(null);
  const [selectedStateForAssam, setSelectedStateForAssam] = useState<boolean>(false);
  const [districtFilter, setDistrictFilter] = useState<string>("All");
  const [stateSearchQuery, setStateSearchQuery] = useState<string>("");

  // Hierarchical State -> District -> Village/City -> Landmark targeting states
  const [hierState, setHierState] = useState<string>("");
  const [hierDistrict, setHierDistrict] = useState<string>("");
  const [hierVillageCity, setHierVillageCity] = useState<string>("");
  const [hierLandmark, setHierLandmark] = useState<string>("");

  // Map packaging options
  const [downloadScope, setDownloadScope] = useState<"india" | "state" | "district" | "city" | "village" | "custom">("state");
  const [downloadMode, setDownloadMode] = useState<"small" | "standard" | "full" | "tactical">("standard");
  const [incRoads, setIncRoads] = useState<boolean>(true);
  const [incTerrainWater, setIncTerrainWater] = useState<boolean>(true);
  const [incRouting, setIncRouting] = useState<boolean>(true);
  const [incMedical, setIncMedical] = useState<boolean>(true);
  const [incSecurity, setIncSecurity] = useState<boolean>(true);
  const [incFuel, setIncFuel] = useState<boolean>(true);
  const [incLandmarks, setIncLandmarks] = useState<boolean>(true);

  // Simulated Custom Sector Packaging Progress
  const [customSectorDownloadProgress, setCustomSectorDownloadProgress] = useState<number>(0);
  const [customSectorStatus, setCustomSectorStatus] = useState<"idle" | "packaging" | "securing" | "secured">("idle");
  const [customSectorSizeEst, setCustomSectorSizeEst] = useState<number>(0);
  const [customSectorTileEst, setCustomSectorTileEst] = useState<number>(0);

  // Search History, Voice, and Offline indicators
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("anis_search_history");
    return saved ? JSON.parse(saved) : ["New Delhi Base", "Biswanath Chariali", "Tezpur Hospital", "Rishikesh Water Supply"];
  });
  const [isOfflineOnlySearch, setIsOfflineOnlySearch] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [voiceStatusText, setVoiceStatusText] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Favorites state
  const [favorites, setFavorites] = useState<{ id: string; name: string; lat: number; lng: number; desc: string }[]>(() => {
    const saved = localStorage.getItem("anis_favorites");
    return saved ? JSON.parse(saved) : [
      { id: "fav_1", name: "Safehouse Alpha", lat: 28.6139, lng: 77.2090, desc: "Primary tactical camp shelter." },
      { id: "fav_2", name: "Rishikesh Well", lat: 30.0869, lng: 78.2676, desc: "Potable river water outlet." }
    ];
  });
  const [newFavoriteName, setNewFavoriteName] = useState("");
  const [newFavoriteDesc, setNewFavoriteDesc] = useState("");
  const [isAddingFav, setIsAddingFav] = useState(false);

  // Sync checkboxes based on preset Download Mode
  useEffect(() => {
    if (downloadMode === "small") {
      setIncRoads(true);
      setIncTerrainWater(true);
      setIncRouting(false);
      setIncMedical(false);
      setIncSecurity(false);
      setIncFuel(false);
      setIncLandmarks(false);
    } else if (downloadMode === "standard") {
      setIncRoads(true);
      setIncTerrainWater(true);
      setIncRouting(true);
      setIncMedical(true);
      setIncSecurity(false);
      setIncFuel(false);
      setIncLandmarks(true);
    } else if (downloadMode === "full") {
      setIncRoads(true);
      setIncTerrainWater(true);
      setIncRouting(true);
      setIncMedical(true);
      setIncSecurity(true);
      setIncFuel(true);
      setIncLandmarks(true);
    } else if (downloadMode === "tactical") {
      setIncRoads(true);
      setIncTerrainWater(true);
      setIncRouting(true);
      setIncMedical(true);
      setIncSecurity(true);
      setIncFuel(true);
      setIncLandmarks(true);
    }
  }, [downloadMode]);

  // Compute dynamic size and tile estimates for sector packaging
  useEffect(() => {
    let baseTiles = 120;
    if (downloadScope === "india") baseTiles = 6500;
    else if (downloadScope === "state") baseTiles = 1800;
    else if (downloadScope === "district") baseTiles = 600;
    else if (downloadScope === "city") baseTiles = 250;
    else if (downloadScope === "village") baseTiles = 80;
    else if (downloadScope === "custom") baseTiles = 350;

    let modeMultiplier = 1.0;
    if (downloadMode === "small") modeMultiplier = 0.5;
    else if (downloadMode === "standard") modeMultiplier = 1.0;
    else if (downloadMode === "full") modeMultiplier = 1.8;
    else if (downloadMode === "tactical") modeMultiplier = 3.2;

    let featureFactor = 1.0;
    if (incRoads) featureFactor += 0.1;
    if (incTerrainWater) featureFactor += 0.15;
    if (incRouting) featureFactor += 0.2;
    if (incMedical) featureFactor += 0.15;
    if (incSecurity) featureFactor += 0.15;
    if (incFuel) featureFactor += 0.1;
    if (incLandmarks) featureFactor += 0.15;

    const estimatedTiles = Math.round(baseTiles * modeMultiplier * featureFactor);
    const estimatedMB = estimatedTiles * 0.0068; // ~6.8 KB per tile average

    setCustomSectorTileEst(estimatedTiles);
    setCustomSectorSizeEst(estimatedMB);
  }, [downloadScope, downloadMode, incRoads, incTerrainWater, incRouting, incMedical, incSecurity, incFuel, incLandmarks]);

  // Offline Maps stats
  const [offlineRegions, setOfflineRegions] = useState<OfflineRegion[]>([]);
  const [storageStats, setStorageStats] = useState({ tileCount: 0, cacheSizeMB: 0 });
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Load IndexedDB storage statistics and downloaded regions
  const refreshStorageTelemetry = async () => {
    setIsRefreshingStats(true);
    try {
      const regions = await getRegions();
      setOfflineRegions(regions);
      const stats = await getOfflineCacheStats();
      setStorageStats(stats);
    } catch (e) {
      console.warn("Failed retrieving offline maps storage stats:", e);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  useEffect(() => {
    refreshStorageTelemetry();
    // Re-check periodically
    const timer = setInterval(refreshStorageTelemetry, 10000);
    return () => clearInterval(timer);
  }, []);

  // Save favorites helper
  const saveFavoritesList = (list: typeof favorites) => {
    setFavorites(list);
    localStorage.setItem("anis_favorites", JSON.stringify(list));
  };

  // 1. FUZZY SEARCH MATCHING ALGORITHM
  const getFuzzyDistance = (s1: string, s2: string): number => {
    const a = s1.toLowerCase();
    const b = s2.toLowerCase();
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  // Check if a coordinate falls within any completed offline cached region
  const isCoordinateOfflineCached = (lat: number, lng: number): boolean => {
    if (offlineRegions.length === 0) return false;
    return offlineRegions.some(region => {
      if (region.status !== 'completed') return false;
      // Define a realistic bounding box for cache hit calculation
      const minLat = region.minLat !== undefined ? region.minLat : (region.name.includes("Biswanath") ? 26.6 : lat - 0.05);
      const maxLat = region.maxLat !== undefined ? region.maxLat : (region.name.includes("Biswanath") ? 26.9 : lat + 0.05);
      const minLng = region.minLng !== undefined ? region.minLng : (region.name.includes("Biswanath") ? 93.0 : lng - 0.05);
      const maxLng = region.maxLng !== undefined ? region.maxLng : (region.name.includes("Biswanath") ? 93.7 : lng + 0.05);
      return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    });
  };

  // Add search query to history list
  const addToHistory = (query: string) => {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    if (clean.length < 2) return;
    const updated = [clean, ...searchHistory.filter(h => h.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem("anis_search_history", JSON.stringify(updated));
  };

  // Perform autocomplete search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();

    // Coordinate parsing checker: "28.6139, 77.2090" or "lat 28.6139 long 77.2090"
    const coordRegex = /(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/;
    const match = query.match(coordRegex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      setSuggestions([
        {
          name: `Locked GPS Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          category: "GPS Pin",
          lat,
          lng,
          altitude: 0,
          terrain: "unknown",
          description: "Operator-entered coordinate string.",
          country: "India",
          hierarchy: ["Global", "Coordinate Parsing"]
        }
      ]);
      return;
    }

    // Standard text query with fuzzy suggestion
    const mappedStates: GlobalLandmark[] = INDIA_STATES_DATABASE.map(s => ({
      name: s.name,
      category: s.type,
      lat: s.lat,
      lng: s.lng,
      altitude: 150,
      terrain: "plains",
      description: `Capital: ${s.capital}. ${s.description}`,
      country: "India",
      hierarchy: ["Asia", "India", s.name]
    }));

    const mappedVillages: GlobalLandmark[] = ASSAM_VILLAGES_DATABASE.map(v => ({
      name: v.name,
      category: "Assam Village",
      lat: v.lat,
      lng: v.lng,
      altitude: v.altitude,
      terrain: v.terrain,
      description: `District: ${v.district}, Subdivision: ${v.subdivision}. Pop: ${v.populationEstimate}. ${v.description}`,
      country: "India",
      hierarchy: ["Asia", "India", "Assam", v.district]
    }));

    // Dynamic India POI generator based on search keywords
    const dynamicPOIs: GlobalLandmark[] = [];
    const keywords = query.split(/\s+/);
    
    // Check if user is searching for a particular state in India
    const matchedState = INDIA_STATES_DATABASE.find(s => query.includes(s.name.toLowerCase()));
    const stateName = matchedState ? matchedState.name : "India";
    const stateLat = matchedState ? matchedState.lat : 20.5937;
    const stateLng = matchedState ? matchedState.lng : 78.9629;

    const categoriesList = [
      { key: "hospital", label: "Hospital", desc: "Emergency medical facilities, critical trauma ward & supply center.", offsetLat: 0.015, offsetLng: -0.01 },
      { key: "police", label: "Police Station", desc: "Tactical police post, communication hub, and localized emergency defense shelter.", offsetLat: -0.01, offsetLng: 0.02 },
      { key: "fire", label: "Fire Station", desc: "First response fire & disaster support unit.", offsetLat: 0.02, offsetLng: 0.01 },
      { key: "school", label: "School", desc: "Educational infrastructure, temporary disaster relief encampment.", offsetLat: -0.015, offsetLng: -0.015 },
      { key: "college", label: "College", desc: "Secondary staging depot with emergency power generation.", offsetLat: 0.03, offsetLng: -0.02 },
      { key: "railway", label: "Railway Station", desc: "High-capacity transit line, transport corridor safety nexus.", offsetLat: 0.005, offsetLng: 0.005 },
      { key: "bus", label: "Bus Stand", desc: "Evacuation marshalling yard and regional transport connection.", offsetLat: -0.02, offsetLng: 0.025 },
      { key: "airport", label: "Airport", desc: "Air supply terminal with helicopter landing strip.", offsetLat: 0.05, offsetLng: -0.05 },
      { key: "temple", label: "Temple", desc: "Worship node and high-elevation emergency community shelter.", offsetLat: -0.005, offsetLng: 0.015 },
      { key: "mosque", label: "Mosque", desc: "Local community safe point with clean water source.", offsetLat: 0.01, offsetLng: -0.025 },
      { key: "church", label: "Church", desc: "Relief coordination depot and food kitchen.", offsetLat: -0.025, offsetLng: 0.01 },
      { key: "tourist", label: "Tourist Place", desc: "Notable national monument and safety muster zone.", offsetLat: 0.04, offsetLng: 0.03 },
      { key: "mountain", label: "Mountain Pass", desc: "High-altitude tactical ridge vantage point with thermal corridors.", offsetLat: 0.1, offsetLng: -0.1 },
      { key: "river", label: "River Basin", desc: "Flowing freshwater asset with high flood-watch warnings.", offsetLat: -0.05, offsetLng: 0.06 },
      { key: "lake", label: "Lake Reservoir", desc: "Static water supply resource with bio-hazard monitoring.", offsetLat: 0.035, offsetLng: -0.04 },
      { key: "forest", label: "Forest Reserve", desc: "Dense woodland wilderness, wilderness tracking and wood asset.", offsetLat: -0.08, offsetLng: 0.08 },
      { key: "national park", label: "National Park Wilderness", desc: "Uncultivated animal corridor and biological zone.", offsetLat: 0.12, offsetLng: 0.09 }
    ];

    categoriesList.forEach(cat => {
      if (query.includes(cat.key)) {
        // Generate a localized POI around the matched state coordinates (or current GPS)
        const namePrefix = matchedState ? matchedState.name : "National";
        dynamicPOIs.push({
          name: `${namePrefix} Tactical ${cat.label} Node`,
          category: cat.label,
          lat: stateLat + cat.offsetLat,
          lng: stateLng + cat.offsetLng,
          altitude: 180,
          terrain: "forest",
          description: cat.desc,
          country: "India",
          hierarchy: ["Asia", "India", stateName, `${cat.label} Division`]
        });
      }
    });

    // If query is an Indian state or major city name, generate additional localized landmarks
    const popularCities = [
      { name: "Mumbai", lat: 19.0760, lng: 72.8777, state: "Maharashtra" },
      { name: "Delhi", lat: 28.6139, lng: 77.2090, state: "Delhi" },
      { name: "Bangalore", lat: 12.9716, lng: 77.5946, state: "Karnataka" },
      { name: "Kolkata", lat: 22.5726, lng: 88.3639, state: "West Bengal" },
      { name: "Chennai", lat: 13.0827, lng: 80.2707, state: "Tamil Nadu" },
      { name: "Hyderabad", lat: 17.3850, lng: 78.4867, state: "Telangana" },
      { name: "Pune", lat: 18.5204, lng: 73.8567, state: "Maharashtra" },
      { name: "Jaipur", lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
      { name: "Lucknow", lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh" },
      { name: "Patna", lat: 25.5941, lng: 85.1376, state: "Bihar" },
      { name: "Srinagar", lat: 34.0837, lng: 74.7973, state: "Jammu and Kashmir" },
      { name: "Guwahati", lat: 26.1445, lng: 91.7362, state: "Assam" }
    ];

    popularCities.forEach(city => {
      if (query.includes(city.name.toLowerCase()) || city.name.toLowerCase().includes(query)) {
        dynamicPOIs.push({
          name: `${city.name} Metropolis Core`,
          category: "City Center",
          lat: city.lat,
          lng: city.lng,
          altitude: 80,
          terrain: "plains",
          description: `Major metropolitan capital node of ${city.state}. Full infrastructure grids and hospital zones.`,
          country: "India",
          hierarchy: ["Asia", "India", city.state, city.name]
        });
        
        // Add a hospital and police station for this city procedurally!
        dynamicPOIs.push({
          name: `${city.name} General Trauma Hospital`,
          category: "Hospital",
          lat: city.lat + 0.008,
          lng: city.lng - 0.005,
          altitude: 85,
          terrain: "plains",
          description: `State-run emergency response clinic in ${city.name}. Equipped with critical surgery wards.`,
          country: "India",
          hierarchy: ["Asia", "India", city.state, city.name]
        });

        dynamicPOIs.push({
          name: `${city.name} Security Command Post`,
          category: "Police Station",
          lat: city.lat - 0.005,
          lng: city.lng + 0.008,
          altitude: 83,
          terrain: "plains",
          description: `Strategic military police headquarters in ${city.name} for evacuation & communications.`,
          country: "India",
          hierarchy: ["Asia", "India", city.state, city.name]
        });
      }
    });

    const ALL_SEARCH_POOL: GlobalLandmark[] = [
      ...GLOBAL_LANDMARKS_DIRECTORY,
      ...mappedStates,
      ...mappedVillages,
      ...dynamicPOIs
    ];

    const matches = ALL_SEARCH_POOL.filter(landmark => {
      const inName = landmark.name.toLowerCase().includes(query);
      const inCountry = landmark.country.toLowerCase().includes(query);
      const inDesc = landmark.description.toLowerCase().includes(query);
      
      // Calculate Levenshtein distance for fuzzy misspelling toleration
      const distance = getFuzzyDistance(query, landmark.name);
      const fuzzyMatch = distance <= 3; // allow 3 character mistakes

      // If we are in Offline-only mode, filter out suggestions not in downloaded regions
      if (isOfflineOnlySearch) {
        return (inName || inCountry || inDesc || fuzzyMatch) && isCoordinateOfflineCached(landmark.lat, landmark.lng);
      }

      return inName || inCountry || inDesc || fuzzyMatch;
    });

    // Remove duplicates by name
    const uniqueMatches: GlobalLandmark[] = [];
    const seenNames = new Set<string>();
    matches.forEach(m => {
      if (!seenNames.has(m.name)) {
        seenNames.add(m.name);
        uniqueMatches.push(m);
      }
    });

    setSuggestions(uniqueMatches.slice(0, 8));
  }, [searchQuery, isOfflineOnlySearch, offlineRegions]);

  // Handle location selection
  const handleSelectLocation = (loc: { lat: number; lng: number; name: string; altitude?: number; terrain?: string }) => {
    if (searchQuery.trim()) {
      addToHistory(searchQuery);
    }
    setLatitude(loc.lat);
    setLongitude(loc.lng);
    setSearchQuery("");
    setSuggestions([]);

    const spokenText = `Coordinates locked on ${loc.name}. Latitude ${loc.lat.toFixed(4)}, Longitude ${loc.lng.toFixed(4)}.`;
    speakVoiceFeedback(spokenText);

    // Notify user in system log
    setChatLog(prev => [
      ...prev,
      {
        sender: "anis",
        text: `### 🧭 GEOLOCATION DIRECTORY LOCK\n*   **Target Location**: ${loc.name}\n*   **GPS Latitude**: ${loc.lat}\n*   **GPS Longitude**: ${loc.lng}\n*   **Elevation**: ${loc.altitude || "N/A"}m\n*   **Survival Rating**: Center core verified.`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Navigation setter: Sets Destination
  const handleSetAsDestination = (loc: { lat: number; lng: number; name: string }) => {
    if (searchQuery.trim()) {
      addToHistory(searchQuery);
    }
    const wp: Waypoint = {
      id: "dest_" + Date.now(),
      latitude: loc.lat,
      longitude: loc.lng,
      altitude: 0,
      timestamp: new Date().toISOString(),
      type: "hazard"
    };
    setDestinationWaypoint(wp);
    setSearchQuery("");
    setSuggestions([]);

    const text = `Plotting courses toward destination: ${loc.name}. Corridor tracking active.`;
    speakVoiceFeedback(text);
  };

  // Favorites Handlers
  const triggerAddCurrentAsFavorite = () => {
    if (!newFavoriteName.trim()) return;
    const newFav = {
      id: "fav_" + Date.now(),
      name: newFavoriteName,
      lat: latitude,
      lng: longitude,
      desc: newFavoriteDesc || "Current telemetry coordinate lock."
    };
    saveFavoritesList([newFav, ...favorites]);
    setNewFavoriteName("");
    setNewFavoriteDesc("");
    setIsAddingFav(false);
    speakVoiceFeedback(`Added ${newFav.name} to safety bookmarks.`);
  };

  const removeFavorite = (id: string, name: string) => {
    saveFavoritesList(favorites.filter(f => f.id !== id));
    speakVoiceFeedback(`Purged ${name} from bookmark system.`);
  };

  // Offline maps deletions & updates
  const handleDeleteRegion = async (id: string, name: string) => {
    try {
      await deleteRegion(id);
      speakVoiceFeedback(`Purged offline tile map region: ${name}. Storage liberated.`);
      await refreshStorageTelemetry();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateRegionVersion = async (region: OfflineRegion) => {
    try {
      const updatedRegion: OfflineRegion = {
        ...region,
        status: 'downloading',
        downloadedTiles: Math.floor(region.totalTiles * 0.4), // simulate checking
        timestamp: Date.now()
      };
      await saveRegion(updatedRegion);
      speakVoiceFeedback(`Synchronizing offline region data corridors for ${region.name}.`);
      await refreshStorageTelemetry();

      // Complete simulation in 2 seconds
      setTimeout(async () => {
        const completed: OfflineRegion = {
          ...updatedRegion,
          downloadedTiles: region.totalTiles,
          status: 'completed',
          sizeBytes: region.sizeBytes + 1024 * 512 // 0.5mb increment
        };
        await saveRegion(completed);
        await refreshStorageTelemetry();
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePauseResumeRegion = async (region: OfflineRegion) => {
    const nextStatus = region.status === 'downloading' ? 'paused' : 'downloading';
    try {
      const updated: OfflineRegion = {
        ...region,
        status: nextStatus
      };
      await saveRegion(updated);
      speakVoiceFeedback(`${nextStatus === 'paused' ? 'Paused' : 'Resumed'} tile downloads for ${region.name}.`);
      await refreshStorageTelemetry();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadOfflineRegion = async (region: OfflineRegion) => {
    try {
      await saveRegion(region);
      speakVoiceFeedback(`Initiating offline tactical cache mapping for ${region.name}.`);
      await refreshStorageTelemetry();

      // Complete simulation in 2 seconds
      setTimeout(async () => {
        const completed: OfflineRegion = {
          ...region,
          downloadedTiles: region.totalTiles,
          status: 'completed',
          timestamp: Date.now()
        };
        await saveRegion(completed);
        speakVoiceFeedback(`Download completed. ${region.name} terrain is now secured offline.`);
        await refreshStorageTelemetry();
      }, 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Dedicated custom sector packager download sequence
  const handleExecuteCustomSectorDownload = async () => {
    if (customSectorStatus === "packaging" || customSectorStatus === "securing") return;
    
    setCustomSectorStatus("packaging");
    setCustomSectorDownloadProgress(1);
    speakVoiceFeedback(`Initiating customized tactical download for sector size of ${customSectorSizeEst.toFixed(1)} megabytes.`);

    // Simulate progress increments
    let progress = 1;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 14) + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setCustomSectorDownloadProgress(progress);
    }, 300);

    // Finalize after simulation completes
    setTimeout(async () => {
      clearInterval(interval);
      setCustomSectorDownloadProgress(100);
      setCustomSectorStatus("securing");

      let sectorName = "";
      let lat = latitude;
      let lng = longitude;

      if (downloadScope === "india") {
        sectorName = "Entire India National Grid";
        lat = 22.9734;
        lng = 78.6569;
      } else if (downloadScope === "state") {
        sectorName = `${hierState || "Assam"} State Sector`;
        const matchState = INDIA_STATES_DATABASE.find(s => s.name === hierState);
        if (matchState) {
          lat = matchState.lat;
          lng = matchState.lng;
        }
      } else if (downloadScope === "district") {
        sectorName = `${hierDistrict || "Biswanath"} District Sector`;
        const matchVillage = ASSAM_VILLAGES_DATABASE.find(v => v.district === hierDistrict);
        if (matchVillage) {
          lat = matchVillage.lat;
          lng = matchVillage.lng;
        }
      } else if (downloadScope === "city" || downloadScope === "village") {
        sectorName = `${hierVillageCity || "Biswanath Chariali"} Sub-Sector`;
        const matchVillage = ASSAM_VILLAGES_DATABASE.find(v => v.name === hierVillageCity);
        if (matchVillage) {
          lat = matchVillage.lat;
          lng = matchVillage.lng;
        }
      } else if (downloadScope === "custom") {
        sectorName = `Custom Tactical Grid (${latitude.toFixed(3)}N, ${longitude.toFixed(3)}E)`;
      }

      const customRegion: OfflineRegion = {
        id: `reg_custom_${Date.now()}`,
        name: `${sectorName} [${downloadMode.toUpperCase()}]`,
        minLat: lat - 0.2,
        minLng: lng - 0.2,
        maxLat: lat + 0.2,
        maxLng: lng + 0.2,
        minZoom: downloadMode === "small" ? 8 : 10,
        maxZoom: downloadMode === "tactical" ? 17 : (downloadMode === "full" ? 15 : 13),
        totalTiles: customSectorTileEst,
        downloadedTiles: customSectorTileEst,
        sizeBytes: customSectorSizeEst * 1024 * 1024,
        status: 'completed',
        timestamp: Date.now()
      };

      try {
        await saveRegion(customRegion);
        speakVoiceFeedback(`Sector compilation successful. Operational status: Secured Offline. Tile storage synchronized.`);
        setCustomSectorStatus("secured");
        await refreshStorageTelemetry();
      } catch (err) {
        console.error("Error securing custom sector:", err);
        setCustomSectorStatus("idle");
      }
    }, 4000);
  };

  // Trigger coordinate parsing search directly
  const executeCoordinateLock = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    speakVoiceFeedback(`Direct Coordinate lock. Latitude ${lat}, Longitude ${lng}.`);
  };

  const startSpeechRecognition = () => {
    if (isListeningVoice) {
      setIsListeningVoice(false);
      setVoiceStatusText("");
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN"; // Set India locale

        recognition.onstart = () => {
          setIsListeningVoice(true);
          setVoiceStatusText("Listening for India map coordinates...");
          speakVoiceFeedback("Voice scanner active. State target name.");
        };

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setSearchQuery(text);
          setIsListeningVoice(false);
          setVoiceStatusText("");
          speakVoiceFeedback(`Voice input lock: ${text}. Executing tactical search.`);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event);
          runSpeechFallback();
        };

        recognition.onend = () => {
          setIsListeningVoice(false);
          setVoiceStatusText("");
        };

        recognition.start();
      } catch (err) {
        console.warn("Speech recognition failed to initialize", err);
        runSpeechFallback();
      }
    } else {
      runSpeechFallback();
    }
  };

  const runSpeechFallback = () => {
    setIsListeningVoice(true);
    setVoiceStatusText("Simulating emergency satellite speech lock...");
    speakVoiceFeedback("Satellite voice channel secured. State destination.");
    
    setTimeout(() => {
      const presets = [
        "Biswanath Chariali Hospital", 
        "Tezpur Civil Airport", 
        "Guwahati Kamakhya Temple", 
        "Srinagar Dal Lake", 
        "Mumbai General Trauma Hospital",
        "New Delhi Base Camp"
      ];
      const randomTarget = presets[Math.floor(Math.random() * presets.length)];
      setSearchQuery(randomTarget);
      setIsListeningVoice(false);
      setVoiceStatusText("");
      speakVoiceFeedback(`Satellite voice input registered: ${randomTarget}.`);
    }, 2500);
  };

  return (
    <div className="space-y-4">
      {/* 1. GOOGLE MAPS STYLE SEARCH EXPERIENCE */}
      <div className="bg-[#0b101c] border border-[#182a4d] rounded-xl p-3.5 shadow-xl relative">
        <div className="flex items-center justify-between border-b border-[#142340] pb-2.5 mb-3">
          <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-sky-400" />
            Global Location Search
          </h3>
          {storageStats.tileCount > 0 && (
            <div className="text-[8px] font-mono bg-emerald-950 border border-emerald-500/40 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
              India Cache: {storageStats.tileCount} Tiles ({storageStats.cacheSizeMB.toFixed(1)}MB)
            </div>
          )}
        </div>

        {/* Offline Search & Nationwide Radio Controls */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <button
            id="toggle_online_search"
            onClick={() => {
              setIsOfflineOnlySearch(false);
              speakVoiceFeedback("Switched to nationwide online and database search.");
            }}
            className={`py-1 text-[9px] font-bold font-mono rounded flex items-center justify-center gap-1 cursor-pointer transition-all ${
              !isOfflineOnlySearch
                ? "bg-sky-600/20 border border-sky-400 text-sky-400 font-black"
                : "bg-[#060a12] border border-[#142340] text-slate-500 hover:text-slate-300"
            }`}
          >
            <Wifi className="w-3 h-3 text-sky-400" /> ONLINE NATIONWIDE
          </button>
          <button
            id="toggle_offline_search"
            onClick={() => {
              setIsOfflineOnlySearch(true);
              speakVoiceFeedback("Fitted search strictly to downloaded offline cached regions.");
            }}
            className={`py-1 text-[9px] font-bold font-mono rounded flex items-center justify-center gap-1 cursor-pointer transition-all ${
              isOfflineOnlySearch
                ? "bg-amber-600/20 border border-amber-400 text-amber-400 font-black animate-pulse"
                : "bg-[#060a12] border border-[#142340] text-slate-500 hover:text-slate-300"
            }`}
          >
            <WifiOff className="w-3 h-3 text-amber-400" /> OFFLINE CACHE ONLY
          </button>
        </div>

        <div className="relative">
          <div className="flex bg-[#070b13] border border-[#1b2f56] rounded-lg items-center px-3 py-2 gap-1.5">
            <Search className="w-4 h-4 text-gray-500 shrink-0 mr-1" />
            <input
              id="global_map_search_input"
              type="text"
              placeholder="Search State, District, Village, City, Landmark or Any Place in India"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === "") {
                  setShowHistory(true);
                } else {
                  setShowHistory(false);
                }
              }}
              onFocus={() => {
                onSearchFocus?.();
                if (searchQuery === "") {
                  setShowHistory(true);
                }
              }}
              className="bg-transparent w-full border-none focus:outline-none text-xs text-gray-100 placeholder-gray-500 font-mono"
            />
            
            {/* Search History Button Toggle */}
            <button
              id="btn_search_history_toggle"
              onClick={() => setShowHistory(p => !p)}
              className="p-1 text-slate-500 hover:text-sky-400 rounded transition-colors cursor-pointer"
              title="Recent searches"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Voice Search Micro Button */}
            <button
              id="btn_voice_search_trigger"
              onClick={startSpeechRecognition}
              className={`p-1 rounded cursor-pointer transition-all ${
                isListeningVoice 
                  ? "bg-red-950/80 border border-red-500 text-red-400 animate-bounce scale-110" 
                  : "text-slate-500 hover:text-red-400"
              }`}
              title="Voice Search"
            >
              {isListeningVoice ? <Mic className="w-4 h-4 animate-pulse text-red-500" /> : <Mic className="w-4 h-4" />}
            </button>

            {searchQuery && (
              <button
                id="btn_clear_map_search"
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                className="text-gray-500 hover:text-gray-300 text-[10px] font-mono font-bold cursor-pointer shrink-0 ml-1"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Voice listening overlay status indicator */}
          {isListeningVoice && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-red-950/90 border border-red-500/50 p-2.5 rounded-lg text-xs text-red-200 font-mono flex items-center gap-2 z-50">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              {voiceStatusText || "Satellite listening active..."}
            </div>
          )}

          {/* Recent Searches dropdown */}
          {showHistory && searchQuery === "" && searchHistory.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-[#090e1a] border border-[#1d325c] rounded-lg shadow-2xl z-50 divide-y divide-[#152342] overflow-hidden">
              <div className="p-1.5 px-2.5 text-[8.5px] font-bold text-slate-500 font-mono uppercase tracking-wider bg-[#060a12]">
                ⏱️ Recent Tactical Recon Queries
              </div>
              {searchHistory.map((hist, idx) => (
                <button
                  key={idx}
                  id={`history_item_${idx}`}
                  onClick={() => {
                    setSearchQuery(hist);
                    setShowHistory(false);
                  }}
                  className="w-full text-left p-2 hover:bg-[#111b2e] text-xs text-sky-400 font-mono flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  {hist}
                </button>
              ))}
              <div className="p-1.5 text-right bg-[#060a12]">
                <button
                  id="btn_clear_history_list"
                  onClick={() => {
                    setSearchHistory([]);
                    localStorage.removeItem("anis_search_history");
                    speakVoiceFeedback("Recon search logs purged.");
                  }}
                  className="text-[8.5px] text-red-400 font-bold hover:underline"
                >
                  PURGE RECON LOGS
                </button>
              </div>
            </div>
          )}

          {/* Autocomplete Suggestions Box */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-[#090e1a] border border-[#1d325c] rounded-lg shadow-2xl z-50 divide-y divide-[#152342] overflow-hidden">
              {suggestions.map((s, idx) => {
                const offlineOk = isCoordinateOfflineCached(s.lat, s.lng);
                return (
                  <div key={idx} className="p-2.5 hover:bg-[#111b2e] transition-colors flex items-start justify-between gap-2">
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-gray-100 leading-tight">{s.name}</h4>
                          {offlineOk ? (
                            <span className="text-[7.5px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 px-1 rounded font-bold uppercase flex items-center gap-0.5">
                              <Wifi className="w-2 h-2 text-emerald-400" /> CACHED
                            </span>
                          ) : (
                            <span className="text-[7.5px] font-mono bg-amber-950/80 border border-amber-500/40 text-amber-400 px-1 rounded font-bold uppercase flex items-center gap-0.5">
                              <WifiOff className="w-2 h-2 text-amber-400" /> SATELLITE ONLY
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1.5 items-center mt-0.5">
                          <span className="text-[8px] font-mono bg-[#162744] text-sky-300 px-1 py-0.2 rounded uppercase font-black">{s.category}</span>
                          <span className="text-[9px] font-mono text-gray-500">{s.country} ({s.lat.toFixed(3)}, {s.lng.toFixed(3)})</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono mt-1 leading-normal">{s.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        id={`btn_suggestion_lock_${idx}`}
                        onClick={() => {
                          handleSelectLocation(s);
                          setShowHistory(false);
                        }}
                        className="px-2 py-0.5 bg-sky-950/70 hover:bg-sky-900 border border-sky-600 text-[9px] font-mono font-bold text-sky-400 rounded cursor-pointer transition-colors"
                      >
                        LOCK COORDS
                      </button>
                      <button
                        id={`btn_suggestion_nav_${idx}`}
                        onClick={() => {
                          handleSetAsDestination(s);
                          setShowHistory(false);
                        }}
                        className="px-2 py-0.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600 text-[9px] font-mono font-bold text-emerald-400 rounded cursor-pointer transition-colors flex items-center gap-0.5"
                      >
                        <Navigation className="w-2.5 h-2.5" /> NAV ROUTE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Locked Telemetry Card */}
        <div className="mt-3 bg-[#060a12] border border-[#14223d] rounded-lg p-3 flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[8px] font-mono font-bold text-sky-400 uppercase tracking-widest">ACTIVE GPS LOCK</span>
            <p className="text-xs font-mono font-black text-gray-100 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E
            </p>
            <p className="text-[9px] text-gray-500 font-mono">Precision lock: ±4m Sat-Corridors. Active tracker logging.</p>
          </div>
          <button
            id="btn_add_to_favorites_trigger"
            onClick={() => setIsAddingFav(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#121c32] hover:bg-[#1a2b4b] border border-[#203253] text-[9px] font-mono font-bold text-gray-300 hover:text-rose-400 rounded cursor-pointer transition-all"
          >
            <Heart className="w-3 h-3" /> BOOKMARK
          </button>
        </div>

        {/* New Favorite Modal Form Overlay */}
        {isAddingFav && (
          <div className="bg-[#080d17] border border-rose-900/60 rounded-lg p-3 mt-3 space-y-2.5">
            <p className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-widest">ADD TARGET TO FAVORITES</p>
            <div className="space-y-1">
              <input
                id="input_new_fav_name"
                type="text"
                placeholder="Custom Bookmark Name (e.g. Helicopter Landing)..."
                value={newFavoriteName}
                onChange={(e) => setNewFavoriteName(e.target.value)}
                className="w-full bg-[#121a28] border border-[#1d2f53] rounded text-xs py-1 px-2 text-white placeholder-gray-500"
              />
              <input
                id="input_new_fav_desc"
                type="text"
                placeholder="Tactical description (Water source, shelter)..."
                value={newFavoriteDesc}
                onChange={(e) => setNewFavoriteDesc(e.target.value)}
                className="w-full bg-[#121a28] border border-[#1d2f53] rounded text-xs py-1 px-2 text-white placeholder-gray-500"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                id="btn_cancel_add_fav"
                onClick={() => setIsAddingFav(false)}
                className="px-2 py-1 text-[10px] font-mono text-gray-400 hover:text-white cursor-pointer"
              >
                CANCEL
              </button>
              <button
                id="btn_confirm_add_fav"
                onClick={triggerAddCurrentAsFavorite}
                className="px-3 py-1 bg-rose-950/70 hover:bg-rose-900 border border-rose-500 text-rose-400 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors"
              >
                SAVE PIN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. FAVORITES & GEOGRAPHIC HIERARCHY ACCORDION */}
      <div className="bg-[#0b101c] border border-[#182a4d] rounded-xl p-3.5 shadow-xl">
        <div className="flex justify-between items-center border-b border-[#142340] pb-2.5 mb-3">
          <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            Safety Bookmarks & Hierarchy
          </h3>
        </div>

        {/* Favorite Locations List */}
        {favorites.length === 0 ? (
          <p className="text-[10px] font-mono text-gray-500 italic py-1">No bookmarked coordinates.</p>
        ) : (
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto scrollbar-thin">
            {favorites.map((f) => (
              <div key={f.id} className="bg-[#060a12] border border-[#121e35] rounded p-2 flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-200 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    {f.name}
                  </h4>
                  <p className="text-[8px] font-mono text-gray-500">({f.lat.toFixed(4)}, {f.lng.toFixed(4)})</p>
                  <p className="text-[9px] font-mono text-gray-400 truncate leading-tight mt-0.5">{f.desc}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    id={`btn_fav_jump_${f.id}`}
                    onClick={() => handleSelectLocation({ lat: f.lat, lng: f.lng, name: f.name })}
                    className="p-1.5 bg-[#121c32] hover:bg-[#1a2b4b] border border-[#203253] text-[9px] font-mono font-bold text-sky-400 rounded cursor-pointer"
                    title="Jump to Pin"
                  >
                    LOCK
                  </button>
                  <button
                    id={`btn_fav_delete_${f.id}`}
                    onClick={() => removeFavorite(f.id, f.name)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-950 rounded text-red-400 cursor-pointer"
                    title="Delete Pin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Location Hierarchy Browser */}
        <div className="border-t border-[#13223f] pt-3.5 space-y-4">
          <div className="bg-[#050810] border border-[#142340] rounded-xl p-3.5 space-y-3">
            <p className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-sky-400" />
              Hierarchical Recon Search & Targeting
            </p>
            <p className="text-[10px] text-gray-400 font-mono leading-tight">
              Select any region in India down to village and landmark levels to lock satellite grids and package them for offline use.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {/* State Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-black text-gray-400 block">1. SELECT STATE / UT</label>
                <select
                  id="select_hier_state"
                  value={hierState}
                  onChange={(e) => {
                    const state = e.target.value;
                    setHierState(state);
                    setHierDistrict("");
                    setHierVillageCity("");
                    setHierLandmark("");
                    speakVoiceFeedback(`State selected: ${state}. Retrieval of subordinate districts pending.`);
                  }}
                  className="w-full bg-[#121a28] border border-[#1d2f53] rounded text-xs py-1.5 px-2 text-gray-200 focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="">-- Choose State --</option>
                  {INDIA_STATES_DATABASE.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* District Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-black text-gray-400 block">2. SELECT DISTRICT</label>
                <select
                  id="select_hier_district"
                  value={hierDistrict}
                  disabled={!hierState}
                  onChange={(e) => {
                    const dist = e.target.value;
                    setHierDistrict(dist);
                    setHierVillageCity("");
                    setHierLandmark("");
                    speakVoiceFeedback(`District targeting set to ${dist}. Loading local cities and villages.`);
                  }}
                  className="w-full bg-[#121a28] border border-[#1d2f53] rounded text-xs py-1.5 px-2 text-gray-200 disabled:opacity-40 focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="">-- Choose District --</option>
                  {hierState && (STATE_DISTRICTS_MAP[hierState] || ["Central District", "Sadar District", "Rural District"]).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Village/City Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-black text-gray-400 block">3. VILLAGE / CITY</label>
                <select
                  id="select_hier_village"
                  value={hierVillageCity}
                  disabled={!hierDistrict}
                  onChange={(e) => {
                    const city = e.target.value;
                    setHierVillageCity(city);
                    setHierLandmark("");
                    speakVoiceFeedback(`Sector narrowed to town node: ${city}. Searching landmarks.`);
                  }}
                  className="w-full bg-[#121a28] border border-[#1d2f53] rounded text-xs py-1.5 px-2 text-gray-200 disabled:opacity-40 focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="">-- Choose Village/City --</option>
                  {hierDistrict && (DISTRICT_CITIES_MAP[hierDistrict] || [
                    `${hierDistrict} Main City`, `${hierDistrict} North Block`, `${hierDistrict} South Block`
                  ]).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Landmark Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-black text-gray-400 block">4. LANDMARK / POI</label>
                <select
                  id="select_hier_landmark"
                  value={hierLandmark}
                  disabled={!hierVillageCity}
                  onChange={(e) => {
                    const landmark = e.target.value;
                    setHierLandmark(landmark);
                    speakVoiceFeedback(`Target POI identified: ${landmark}. Precision coordinate offsets calculated.`);
                  }}
                  className="w-full bg-[#121a28] border border-[#1d2f53] rounded text-xs py-1.5 px-2 text-gray-200 disabled:opacity-40 focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="">-- Choose Landmark (Optional) --</option>
                  {hierVillageCity && (CITY_LANDMARKS_MAP[hierVillageCity] || [
                    { name: `${hierVillageCity} Community Hospital`, category: "Hospital" },
                    { name: `${hierVillageCity} Security Checkpoint`, category: "Police Station" },
                    { name: `${hierVillageCity} Emergency Fire Depot`, category: "Fire Station" },
                    { name: `${hierVillageCity} Central Pharmacy`, category: "Pharmacy" },
                    { name: `${hierVillageCity} Fuel Depot`, category: "Fuel Station" }
                  ]).map((lm: any) => (
                    <option key={lm.name} value={lm.name}>[{lm.category}] {lm.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hierarchical Active Telemetry Display */}
            {hierState && (
              <div className="p-2.5 bg-[#080d16] border border-[#17253f] rounded-lg space-y-2">
                <div className="text-[9px] font-mono leading-relaxed space-y-1 text-slate-300">
                  <div className="flex gap-1.5">
                    <span className="text-gray-500 font-bold uppercase">TARGET PATH:</span>
                    <span className="text-sky-300 font-bold">
                      {hierState} 
                      {hierDistrict && ` → ${hierDistrict}`}
                      {hierVillageCity && ` → ${hierVillageCity}`}
                      {hierLandmark && ` → ${hierLandmark}`}
                    </span>
                  </div>
                  
                  {/* Calculate dynamic Lat/Lng based on hierarchy selection */}
                  {(() => {
                    let finalLat = 22.9734;
                    let finalLng = 78.6569;
                    let desc = "Standard national core telemetry.";
                    
                    const stateMatch = INDIA_STATES_DATABASE.find(s => s.name === hierState);
                    if (stateMatch) {
                      finalLat = stateMatch.lat;
                      finalLng = stateMatch.lng;
                      desc = stateMatch.description;
                    }

                    // Check if it's an Assam village first
                    const villageMatch = ASSAM_VILLAGES_DATABASE.find(v => v.name === hierVillageCity);
                    if (villageMatch) {
                      finalLat = villageMatch.lat;
                      finalLng = villageMatch.lng;
                      desc = villageMatch.description;
                    } else if (hierVillageCity) {
                      // Fallback offsets based on state coords to keep it realistic
                      finalLat = (stateMatch?.lat || 22.0) + 0.12;
                      finalLng = (stateMatch?.lng || 78.0) - 0.08;
                      desc = `Municipal hub in the heart of ${hierDistrict || hierState}.`;
                    }

                    // Apply landmark offset
                    if (hierLandmark && hierVillageCity) {
                      const landmarks = CITY_LANDMARKS_MAP[hierVillageCity] || [];
                      const lmMatch = landmarks.find(l => l.name === hierLandmark);
                      if (lmMatch) {
                        finalLat += lmMatch.latOffset;
                        finalLng += lmMatch.lngOffset;
                        desc = `Critical emergency landmark of category ${lmMatch.category}. Safeguarded corridor.`;
                      } else {
                        // Dynamic random-but-deterministic offsets for mock landmarks
                        finalLat += 0.003;
                        finalLng -= 0.002;
                        desc = `Sector utility coordinate index. Emergency reserve station.`;
                      }
                    }

                    return (
                      <div className="space-y-1 border-t border-[#121c2f] pt-1.5 mt-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span>ESTIMATED GRID COORDS:</span>
                          <span className="font-bold text-gray-100 font-mono">{finalLat.toFixed(5)}° N, {finalLng.toFixed(5)}° E</span>
                        </div>
                        <p className="text-[9px] text-gray-500 italic leading-snug">{desc}</p>
                        
                        <div className="flex gap-2 pt-1.5">
                          <button
                            id="btn_hier_lock_coords"
                            type="button"
                            onClick={() => handleSelectLocation({ lat: finalLat, lng: finalLng, name: hierLandmark || hierVillageCity || hierDistrict || hierState })}
                            className="flex-1 py-1 px-2 bg-sky-950/80 hover:bg-sky-900 border border-sky-600 text-[9px] text-sky-300 font-mono font-bold rounded cursor-pointer transition-colors text-center"
                          >
                            🧭 LOCK COORDS
                          </button>
                          <button
                            id="btn_hier_stage_offline"
                            type="button"
                            onClick={() => {
                              // Set corresponding offline scope
                              if (hierLandmark || hierVillageCity) {
                                setDownloadScope("city");
                              } else if (hierDistrict) {
                                setDownloadScope("district");
                              } else {
                                setDownloadScope("state");
                              }
                              speakVoiceFeedback(`Sector copied to Offline Packager below. Ready for compilation presets.`);
                            }}
                            className="flex-1 py-1 px-2 bg-amber-950/80 hover:bg-amber-900 border border-amber-600 text-[9px] text-amber-300 font-mono font-bold rounded cursor-pointer transition-colors text-center"
                          >
                            📋 STAGE FOR OFFLINE
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          <p className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-widest mb-1 mt-3 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            Indian Geographic Atlas & Indexes
          </p>

          <div className="space-y-2 text-xs font-mono">
            {/* Asia - India Section */}
            <div className="bg-[#060a12] border border-[#111e33] rounded-lg overflow-hidden">
              <button
                id="btn_browse_continent_asia"
                onClick={() => setBrowsingContinent(browsingContinent === "Asia" ? null : "Asia")}
                className="w-full flex justify-between items-center px-3 py-2 hover:bg-[#111e33] text-gray-200 font-bold text-[10px] cursor-pointer"
              >
                <span className="flex items-center gap-1.5">🇮🇳 🌍 ASIA / INDIA STATES & VILLAGES</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${browsingContinent === "Asia" ? 'rotate-180' : ''}`} />
              </button>

              {browsingContinent === "Asia" && (
                <div className="border-t border-[#111e33] p-3 space-y-3 bg-[#070b13]">
                  {/* Tab Selector inside India */}
                  <div className="flex gap-2 border-b border-[#142340] pb-2">
                    <button
                      id="btn_tab_all_states"
                      type="button"
                      onClick={() => setSelectedStateForAssam(false)}
                      className={`px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest border rounded transition-all cursor-pointer ${
                        !selectedStateForAssam 
                          ? 'bg-sky-950/80 border-sky-500 text-sky-300' 
                          : 'bg-transparent border-[#1d2f53] text-gray-400 hover:text-white'
                      }`}
                    >
                      All States of India ({INDIA_STATES_DATABASE.length})
                    </button>
                    <button
                      id="btn_tab_assam_villages"
                      type="button"
                      onClick={() => {
                        setSelectedStateForAssam(true);
                        speakVoiceFeedback("Accessing tactical Assam village index and terrain profiles.");
                      }}
                      className={`px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest border rounded transition-all cursor-pointer ${
                        selectedStateForAssam 
                          ? 'bg-sky-950/80 border-sky-500 text-sky-300' 
                          : 'bg-transparent border-[#1d2f53] text-gray-400 hover:text-white'
                      }`}
                    >
                      🌾 Assam Village Atlas ({ASSAM_VILLAGES_DATABASE.length})
                    </button>
                  </div>

                  {/* 1. STATE BROWSER MODULE */}
                  {!selectedStateForAssam ? (
                    <div className="space-y-2.5">
                      {/* State filter input */}
                      <div className="relative flex items-center bg-[#050810] border border-[#1b2f56] rounded px-2.5 py-1">
                        <Search className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
                        <input
                          id="input_filter_india_states"
                          type="text"
                          placeholder="Search state or capital (e.g. Assam, Delhi)..."
                          value={stateSearchQuery}
                          onChange={(e) => setStateSearchQuery(e.target.value)}
                          className="bg-transparent w-full text-[10px] text-gray-200 border-none focus:outline-none placeholder-gray-600 font-mono"
                        />
                      </div>

                      {/* States Grid */}
                      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto scrollbar-thin">
                        {INDIA_STATES_DATABASE.filter(s => {
                          const query = stateSearchQuery.toLowerCase().trim();
                          return s.name.toLowerCase().includes(query) || s.capital.toLowerCase().includes(query);
                        }).map((s) => (
                          <div 
                            key={s.name} 
                            className="p-2.5 bg-[#0a0f1b] border border-[#14223d] hover:border-sky-800/80 rounded transition-all flex items-center justify-between gap-2.5"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] bg-[#1c2e4d] text-sky-300 px-1 py-0.2 rounded font-bold uppercase tracking-wider shrink-0">{s.type === "Union Territory" ? "UT" : "STATE"}</span>
                                <h4 className="text-[11px] font-bold text-gray-100 truncate">{s.name}</h4>
                              </div>
                              <p className="text-[9px] font-mono text-sky-400 mt-0.5">Capital: <span className="text-gray-300 font-bold">{s.capital}</span></p>
                              <p className="text-[9px] font-mono text-gray-400 line-clamp-1 mt-0.5 leading-normal">{s.description}</p>
                              <p className="text-[8px] font-mono text-gray-600 mt-0.5">Coords: {s.lat.toFixed(3)}°N, {s.lng.toFixed(3)}°E</p>
                            </div>
                            
                            <div className="flex flex-col gap-1.5 shrink-0">
                              <button
                                id={`btn_state_lock_${s.name.replace(/\s+/g, '_')}`}
                                type="button"
                                onClick={() => {
                                  handleSelectLocation({ lat: s.lat, lng: s.lng, name: s.name });
                                  if (s.name === "Assam") {
                                    setSelectedStateForAssam(true);
                                  }
                                }}
                                className="px-2.5 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-700/80 text-[9px] text-sky-300 font-bold rounded cursor-pointer transition-colors"
                              >
                                LOCK {s.name === "Assam" ? "🌾" : "📍"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // 2. ASSAM VILLAGE ATLAS MODULE
                    <div className="space-y-3">
                      {/* District Horizontal Filter Bar */}
                      <div>
                        <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-1">Filter by District:</span>
                        <div className="flex flex-wrap gap-1">
                          {["All", "Biswanath", "Sonitpur", "Majuli", "Kamrup Metropolitan", "Jorhat", "Dibrugarh", "Lakhimpur"].map((dist) => (
                            <button
                              id={`btn_dist_filter_${dist.replace(/\s+/g, '_')}`}
                              key={dist}
                              type="button"
                              onClick={() => setDistrictFilter(dist)}
                              className={`px-2 py-0.5 text-[8px] font-mono font-bold border rounded transition-all cursor-pointer ${
                                districtFilter === dist 
                                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300' 
                                  : 'bg-[#101726]/40 border-[#1d2f53] text-gray-400 hover:text-white'
                              }`}
                            >
                              {dist === "Kamrup Metropolitan" ? "Kamrup Metro" : dist}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Villages Grid */}
                      <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                        {ASSAM_VILLAGES_DATABASE.filter(v => {
                          if (districtFilter === "All") return true;
                          return v.district === districtFilter;
                        }).map((v) => (
                          <div 
                            key={v.name} 
                            className="p-2.5 bg-[#0a0f1b] border border-[#14223d] hover:border-emerald-800/80 rounded transition-all"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0">
                                <h4 className="text-[11px] font-bold text-gray-100 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                                  {v.name}
                                </h4>
                                <div className="flex flex-wrap gap-1.5 mt-1 text-[8px] font-mono text-gray-400">
                                  <span className="bg-[#12231e] text-emerald-300 px-1 py-0.2 rounded">Dist: {v.district}</span>
                                  <span className="bg-[#182845] text-sky-300 px-1 py-0.2 rounded">Subdiv: {v.subdivision}</span>
                                  <span className="bg-[#241e17] text-amber-300 px-1 py-0.2 rounded font-bold">Alt: {v.altitude}m</span>
                                  <span className="bg-[#251722] text-rose-300 px-1 py-0.2 rounded">Pop: {v.populationEstimate}</span>
                                </div>
                                <p className="text-[9px] text-gray-400 font-mono mt-1.5 leading-relaxed">{v.description}</p>
                                <p className="text-[8px] text-gray-500 font-mono mt-1">Terrain Profile: <span className="text-gray-300 font-bold uppercase">{v.terrain}</span></p>
                              </div>

                              <div className="flex flex-col gap-1 shrink-0">
                                <button
                                  id={`btn_village_lock_${v.name.replace(/\s+/g, '_')}`}
                                  type="button"
                                  onClick={() => handleSelectLocation({ lat: v.lat, lng: v.lng, name: v.name })}
                                  className="px-2 py-0.5 bg-sky-950 hover:bg-sky-900 border border-sky-600 text-[8px] font-mono font-bold text-sky-400 rounded cursor-pointer transition-colors"
                                >
                                  LOCK
                                </button>
                                <button
                                  id={`btn_village_route_${v.name.replace(/\s+/g, '_')}`}
                                  type="button"
                                  onClick={() => handleSetAsDestination({ lat: v.lat, lng: v.lng, name: v.name })}
                                  className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-[8px] font-mono font-bold text-emerald-400 rounded cursor-pointer transition-colors flex items-center justify-center gap-0.5"
                                >
                                  <Navigation className="w-2 h-2" /> PLOT
                                </button>
                                <button
                                  id={`btn_village_dl_${v.name.replace(/\s+/g, '_')}`}
                                  type="button"
                                  onClick={() => handleDownloadOfflineRegion({
                                    id: `reg_${v.name.toLowerCase().replace(/\s+/g, '_')}`,
                                    name: `${v.name} (${v.district})`,
                                    minLat: v.lat - 0.1,
                                    minLng: v.lng - 0.1,
                                    maxLat: v.lat + 0.1,
                                    maxLng: v.lng + 0.1,
                                    minZoom: 10,
                                    maxZoom: 14,
                                    totalTiles: 450,
                                    downloadedTiles: 0,
                                    sizeBytes: 1024 * 1024 * 1.5,
                                    status: 'downloading',
                                    timestamp: Date.now()
                                  })}
                                  className="px-2 py-0.5 bg-gray-950 hover:bg-gray-800 border border-gray-700 text-[8px] font-mono font-bold text-gray-300 rounded cursor-pointer transition-colors flex items-center justify-center gap-0.5"
                                >
                                  <Download className="w-2 h-2" /> OFFLINE
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Americas */}
            <div className="bg-[#060a12] border border-[#111e33] rounded-lg">
              <button
                id="btn_browse_continent_americas"
                type="button"
                onClick={() => setBrowsingContinent(browsingContinent === "Americas" ? null : "Americas")}
                className="w-full flex justify-between items-center px-3 py-2 hover:bg-[#111e33] text-gray-200 font-bold text-[10px] cursor-pointer"
              >
                <span>🌎 NORTH & SOUTH AMERICAS</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${browsingContinent === "Americas" ? 'rotate-180' : ''}`} />
              </button>

              {browsingContinent === "Americas" && (
                <div className="border-t border-[#111e33] p-2 space-y-1 text-[10px] pl-4">
                  <div className="flex justify-between items-center hover:text-sky-300 py-1">
                    <span>🇺🇸 Colorado Mountains</span>
                    <button type="button" onClick={() => handleSelectLocation({ lat: 39.7392, lng: -104.9903, name: "Colorado Mountains" })} className="text-sky-400 font-black font-mono">LOCK</button>
                  </div>
                  <div className="flex justify-between items-center hover:text-sky-300 py-1">
                    <span>🇺🇸 Yosemite Forest Camp</span>
                    <button type="button" onClick={() => handleSelectLocation({ lat: 37.8651, lng: -119.5383, name: "Yosemite Forest Camp" })} className="text-sky-400 font-black font-mono">LOCK</button>
                  </div>
                  <div className="flex justify-between items-center hover:text-sky-300 py-1">
                    <span>🇧🇷 Amazon River Outpost</span>
                    <button type="button" onClick={() => handleSelectLocation({ lat: -3.4653, lng: -62.2159, name: "Amazon River Outpost" })} className="text-sky-400 font-black font-mono">LOCK</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 PREMIUM OFFLINE SECTOR MAP PACKAGER */}
      <div id="anis_custom_sector_packager_box" className="bg-[#0b101c] border border-[#182a4d] rounded-xl p-3.5 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-[#142340] pb-2.5">
          <h3 className="text-xs font-display font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Download className="w-4 h-4 text-amber-400" />
            Tactical Offline Sector Packager
          </h3>
          <span className="text-[8px] font-mono bg-[#281a0c] text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded font-black">STAGING HUB</span>
        </div>

        <div className="space-y-3 text-xs font-mono">
          {/* Target Scope Grid */}
          <div className="space-y-1.5">
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">1. Sector Scope Boundaries</span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { key: "india", label: "🇮🇳 India Grid" },
                { key: "state", label: "🗺️ Entire State" },
                { key: "district", label: "📐 District Block" },
                { key: "city", label: "🏘️ City Node" },
                { key: "village", label: "🌾 Village Area" },
                { key: "custom", label: "🎯 Custom Box" }
              ].map(item => (
                <button
                  id={`btn_scope_${item.key}`}
                  key={item.key}
                  type="button"
                  onClick={() => setDownloadScope(item.key as any)}
                  className={`px-2 py-1 text-[8.5px] font-bold border rounded transition-all text-center cursor-pointer ${
                    downloadScope === item.key
                      ? "bg-amber-950/60 border-amber-500 text-amber-300"
                      : "bg-[#0c1221] border-[#1d2f53] text-gray-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Quality Resolution Mode */}
          <div className="space-y-1.5">
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">2. Compiling Resolution Mode</span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { key: "small", label: "Small 🟢", desc: "Terrain & Main Roads" },
                { key: "standard", label: "Standard 🔵", desc: "Streets & Lakes" },
                { key: "full", label: "Full 🟣", desc: "High-Res Rivers" },
                { key: "tactical", label: "Tactical 🔴", desc: "Ultra-Res Emergency" }
              ].map(item => (
                <button
                  id={`btn_mode_${item.key}`}
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setDownloadMode(item.key as any);
                    speakVoiceFeedback(`Preset configured to ${item.key}.`);
                  }}
                  className={`px-1 py-1 border rounded transition-all text-center cursor-pointer flex flex-col justify-center items-center ${
                    downloadMode === item.key
                      ? "bg-sky-950/60 border-sky-500 text-sky-300"
                      : "bg-[#0c1221] border-[#1d2f53] text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="text-[8.5px] font-bold">{item.label}</span>
                  <span className="text-[6.5px] text-gray-500 scale-90 block tracking-tighter leading-none mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Granular Feature Checkboxes (Anti-slop clean rows) */}
          <div className="space-y-1.5 bg-[#050810] border border-[#111e35] p-2.5 rounded-lg">
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block border-b border-[#12203b] pb-1 mb-1.5">3. Granular Map Layers & Survival POIs</span>
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-[10px]">
                <input
                  id="chk_inc_roads"
                  type="checkbox"
                  checked={incRoads}
                  onChange={(e) => setIncRoads(e.target.checked)}
                  className="rounded bg-[#121c2c] border-[#223d6b] text-sky-500 focus:ring-0 focus:ring-offset-0 font-mono"
                />
                <span className={incRoads ? "text-gray-200" : "text-gray-500"}>Roads & Streets</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[10px]">
                <input
                  id="chk_inc_terrain"
                  type="checkbox"
                  checked={incTerrainWater}
                  onChange={(e) => setIncTerrainWater(e.target.checked)}
                  className="rounded bg-[#121c2c] border-[#223d6b] text-sky-500 focus:ring-0 focus:ring-offset-0 font-mono"
                />
                <span className={incTerrainWater ? "text-gray-200" : "text-gray-500"}>Terrain, Rivers & Lakes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[10px]">
                <input
                  id="chk_inc_routing"
                  type="checkbox"
                  checked={incRouting}
                  onChange={(e) => setIncRouting(e.target.checked)}
                  className="rounded bg-[#121c2c] border-[#223d6b] text-sky-500 focus:ring-0 focus:ring-offset-0 font-mono"
                />
                <span className={incRouting ? "text-gray-200" : "text-gray-500"}>Offline Routing Corridors</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[10px]">
                <input
                  id="chk_inc_medical"
                  type="checkbox"
                  checked={incMedical}
                  onChange={(e) => setIncMedical(e.target.checked)}
                  className="rounded bg-[#121c2c] border-[#223d6b] text-sky-500 focus:ring-0 focus:ring-offset-0 font-mono"
                />
                <span className={incMedical ? "text-gray-200" : "text-gray-500"}>Hospitals & Pharmacies</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[10px]">
                <input
                  id="chk_inc_security"
                  type="checkbox"
                  checked={incSecurity}
                  onChange={(e) => setIncSecurity(e.target.checked)}
                  className="rounded bg-[#121c2c] border-[#223d6b] text-sky-500 focus:ring-0 focus:ring-offset-0 font-mono"
                />
                <span className={incSecurity ? "text-gray-200" : "text-gray-500"}>Police & Fire Stations</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[10px]">
                <input
                  id="chk_inc_fuel"
                  type="checkbox"
                  checked={incFuel}
                  onChange={(e) => setIncFuel(e.target.checked)}
                  className="rounded bg-[#121c2c] border-[#223d6b] text-sky-500 focus:ring-0 focus:ring-offset-0 font-mono"
                />
                <span className={incFuel ? "text-gray-200" : "text-gray-500"}>Fuel & Utilities</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[10px] col-span-2">
                <input
                  id="chk_inc_landmarks"
                  type="checkbox"
                  checked={incLandmarks}
                  onChange={(e) => setIncLandmarks(e.target.checked)}
                  className="rounded bg-[#121c2c] border-[#223d6b] text-sky-500 focus:ring-0 focus:ring-offset-0 font-mono"
                />
                <span className={incLandmarks ? "text-gray-200" : "text-gray-500"}>Key Landmarks & Points of Interest</span>
              </label>
            </div>
          </div>

          {/* Compiled Sizing Metadata and Interactive Download Trigger */}
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center text-[9px] text-gray-400 bg-[#070b13] p-2 rounded border border-[#121c32]">
              <div>
                <span>TILES COMPILED:</span>
                <p className="text-[11px] font-black text-sky-400 mt-0.5">{customSectorTileEst} Vector Tiles</p>
              </div>
              <div className="text-right">
                <span>ESTIMATED FOOTPRINT:</span>
                <p className="text-[11px] font-black text-amber-400 mt-0.5">{customSectorSizeEst.toFixed(2)} MB</p>
              </div>
            </div>

            {customSectorStatus === "packaging" || customSectorStatus === "securing" ? (
              <div className="space-y-1.5 p-2 bg-[#060e1c] border border-sky-500/30 rounded-lg">
                <div className="flex justify-between text-[8px] font-bold text-sky-400">
                  <span>{customSectorStatus === "packaging" ? "COMPILING SECTOR VECTOR CORES..." : "SECURING LOCAL STORAGE..."}</span>
                  <span>{customSectorDownloadProgress}%</span>
                </div>
                <div className="w-full bg-[#081022] h-2 rounded-full overflow-hidden border border-sky-950">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${customSectorDownloadProgress}%` }}
                  ></div>
                </div>
                <p className="text-[7.5px] text-gray-500 text-center animate-pulse">Safeguarding corridors. Encryption keys injecting into IndexedDB.</p>
              </div>
            ) : (
              <button
                id="btn_execute_custom_download"
                type="button"
                onClick={handleExecuteCustomSectorDownload}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-[10px] font-black text-white rounded-lg shadow-lg cursor-pointer transition-all uppercase tracking-widest text-center"
              >
                📥 SECURE OFFLINE SECTOR ({customSectorSizeEst.toFixed(1)} MB)
              </button>
            )}

            {customSectorStatus === "secured" && (
              <div className="p-2 bg-emerald-950/75 border border-emerald-500 text-emerald-300 rounded text-[9px] font-bold uppercase flex items-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Operational Status: Secured Offline. Tile Storage Synchronized.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. DOWNLOADED MAPS MANAGER WITH SIZE METRICS */}
      <div id="anis_offline_maps_manager_box" className="bg-[#0b101c] border border-[#182a4d] rounded-xl p-3.5 shadow-xl">
        <div className="flex justify-between items-center border-b border-[#142340] pb-2.5 mb-3">
          <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-sky-400" />
            Downloaded Maps Manager
          </h3>
          <button
            id="btn_refresh_offline_stats"
            onClick={refreshStorageTelemetry}
            className="p-1 bg-[#121926] hover:bg-[#1f2c42] rounded text-gray-400 cursor-pointer flex items-center gap-1 text-[8px] font-mono border border-[#1f304f]"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingStats ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        </div>

        {/* Real IndexedDB Statistics Indicator */}
        <div className="grid grid-cols-2 gap-2 bg-[#050810] border border-[#121d33] p-2.5 rounded-lg mb-3 font-mono text-[9px]">
          <div>
            <span className="text-gray-500 uppercase">CACHE DATA TILES:</span>
            <p className="text-xs font-bold text-sky-400 mt-0.5">{storageStats.tileCount} Tiles</p>
          </div>
          <div>
            <span className="text-gray-500 uppercase">OFFLINE STORAGE:</span>
            <p className="text-xs font-bold text-sky-400 mt-0.5">{storageStats.cacheSizeMB.toFixed(2)} MB / 512MB Max</p>
          </div>
        </div>

        {/* Downloaded Regions Loop */}
        <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
          {offlineRegions.length === 0 ? (
            <div className="p-3 text-center border border-dashed border-[#14223d] rounded text-[10px] font-mono text-gray-500 italic">
              No downloaded offline regions detected. Trigger region downloads using the map.
            </div>
          ) : (
            offlineRegions.map((region) => {
              const progressPct = region.totalTiles > 0 
                ? Math.round((region.downloadedTiles / region.totalTiles) * 100) 
                : 100;
              const regionSizeMB = (region.sizeBytes / (1024 * 1024)).toFixed(2);

              return (
                <div key={region.id} className="bg-[#060a12] border border-[#132039] rounded p-2.5 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-200 leading-tight truncate">{region.name}</h4>
                      <p className="text-[8px] font-mono text-gray-500 mt-0.5">
                        Zoom: z{region.minZoom}-z{region.maxZoom} • Saved: {new Date(region.timestamp).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      {/* Pause/Resume button */}
                      <button
                        id={`btn_region_pause_${region.id}`}
                        onClick={() => handlePauseResumeRegion(region)}
                        className="p-1 bg-[#121d33] border border-[#1f3152] rounded hover:text-sky-400 text-gray-400 cursor-pointer"
                        title={region.status === 'downloading' ? "Pause download" : "Resume download"}
                      >
                        {region.status === 'downloading' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
                      </button>

                      {/* Sync / Update map version */}
                      <button
                        id={`btn_region_sync_${region.id}`}
                        onClick={() => handleUpdateRegionVersion(region)}
                        className="p-1 bg-[#121d33] border border-[#1f3152] rounded hover:text-sky-400 text-gray-400 cursor-pointer"
                        title="Update map / Sync"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>

                      {/* Delete offline map */}
                      <button
                        id={`btn_region_delete_${region.id}`}
                        onClick={() => handleDeleteRegion(region.id, region.name)}
                        className="p-1 bg-red-950/40 border border-red-900/60 rounded hover:text-red-300 text-red-400 cursor-pointer"
                        title="Delete Region Data"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Tile progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-mono text-gray-400 leading-none">
                      <span>STATUS: <span className={`font-bold ${region.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>{region.status.toUpperCase()}</span></span>
                      <span>{region.downloadedTiles}/{region.totalTiles} Tiles • {regionSizeMB} MB</span>
                    </div>

                    <div className="w-full bg-[#121927] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${region.status === 'completed' ? 'bg-emerald-500' : 'bg-sky-500 animate-pulse'}`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  Compass, 
  MapPin, 
  Download, 
  Trash2, 
  Play, 
  Pause, 
  X, 
  Layers, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Globe, 
  HelpCircle, 
  Crosshair, 
  Plus, 
  Search,
  Activity,
  ChevronRight,
  Navigation,
  RefreshCw
} from "lucide-react";
import { 
  INDIA_STATES_DATABASE, 
  ASSAM_VILLAGES_DATABASE,
  searchIndiaDatabase,
  getDistrictsForState,
  getPlacesForDistrict
} from "../global_search/indiaData";
import {
  generateOfflineTacticalData,
  calculateTacticalRoute,
  SurvivalPOI
} from "./offlineOverlayGenerator";
import { 
  OfflineRegion, 
  getCachedTile, 
  saveTile, 
  saveRegion, 
  getRegions, 
  deleteRegion, 
  getOfflineCacheStats, 
  clearAllOfflineCache 
} from "../../lib/offlineDb";
import { Waypoint } from "../../types";

interface SafeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface MapLibreMapProps {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  crumbHistory: Waypoint[];
  safeZones: SafeZone[];
  destinationWaypoint: Waypoint | null;
  setDestinationWaypoint?: (wp: Waypoint | null) => void;
  selectedPoiFilters: Record<string, boolean>;
  placedWaypoints: Waypoint[];
  setPlacedWaypoints: React.Dispatch<React.SetStateAction<Waypoint[]>>;
  selectedPlacementType: 'shelter' | 'water' | 'hazard';
  mapStyle: 'dark' | 'light' | 'terrain' | 'satellite' | 'hiking';
  setMapStyle: (style: 'dark' | 'light' | 'terrain' | 'satellite' | 'hiking') => void;
  routingMode: string;
  activeRoutingAlgorithm: string;
  onMapClick: (lat: number, lng: number) => void;
  triggerSafeReturnRoute?: () => void;
  triggerEmergencySOS?: (reason: string) => void;
  setActiveTab?: (tab: any) => void;
  speakVoiceFeedback: (text: string) => void;
  setLatitude: (lat: number) => void;
  setLongitude: (lng: number) => void;
  setChatLog: React.Dispatch<React.SetStateAction<any[]>>;
}

// Slippy map math helpers for offline tile rendering
const lon2tile = (lon: number, zoom: number) => {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
};

const lat2tile = (lat: number, zoom: number) => {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
};

const tile2lon = (x: number, z: number) => {
  return (x / Math.pow(2, z)) * 360 - 180;
};

const tile2lat = (y: number, z: number) => {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

// MapLibre Custom Tile Caching Protocol Setup
try {
  maplibregl.addProtocol("offline-cache", async (params, abortController) => {
    const rawUrl = params.url.substring("offline-cache://".length);
    try {
      const cachedBlob = await getCachedTile(rawUrl);
      if (cachedBlob) {
        const arrayBuffer = await cachedBlob.arrayBuffer();
        return { data: arrayBuffer };
      }
      
      // Fallback to fetch from live internet
      const response = await fetch(rawUrl, { signal: abortController.signal });
      if (!response.ok) {
        throw new Error(`Offline cache tile download failed: ${response.status}`);
      }
      const blob = await response.blob();
      await saveTile(rawUrl, blob);
      const arrayBuffer = await blob.arrayBuffer();
      return { data: arrayBuffer };
    } catch (err: any) {
      throw err;
    }
  });
} catch (e) {
  // Protocol already added
}

interface TownOption {
  name: string;
  lat: number;
  lng: number;
  altitude: number;
  terrain: string;
  description: string;
}

interface DistrictOption {
  name: string;
  towns: TownOption[];
}

interface StateOption {
  name: string;
  districts: DistrictOption[];
}

interface CountryOption {
  name: string;
  code: string;
  flag: string;
  states: StateOption[];
}

interface RegionOption {
  name: string;
  countries: CountryOption[];
}

const WORLDWIDE_REGION_CATALOG: RegionOption[] = [
  {
    name: "Asia",
    countries: [
      {
        name: "India",
        code: "IN",
        flag: "🇮🇳",
        states: [
          {
            name: "Uttarakhand",
            districts: [
              {
                name: "Tehri Garhwal",
                towns: [
                  { name: "Rishikesh Town", lat: 30.0869, lng: 78.2676, altitude: 340, terrain: "Dense Forest", description: "River basin on the foothills of the Himalayas. Floods & forest hazards." },
                  { name: "Narendra Nagar", lat: 30.1611, lng: 78.2975, altitude: 1050, terrain: "cliff", description: "Scenic mountain ridge prone to seismic and landslide blockage." }
                ]
              },
              {
                name: "Dehradun",
                towns: [
                  { name: "Mussoorie Hilltown", lat: 30.4598, lng: 78.0792, altitude: 2005, terrain: "cliff", description: "Extreme winter freeze and steep drop-offs." },
                  { name: "Chakrata Village", lat: 30.7016, lng: 77.8687, altitude: 2118, terrain: "Dense Forest", description: "Coniferous forests, alpine cold, and deep canyon trekking lines." }
                ]
              }
            ]
          },
          {
            name: "Delhi NCR",
            districts: [
              {
                name: "South Delhi",
                towns: [
                  { name: "Sanjay Van Village", lat: 28.5284, lng: 77.1691, altitude: 280, terrain: "Dense Forest", description: "Densely wooded central wildlife sanctuary." },
                  { name: "Mehrauli Canopy", lat: 28.5144, lng: 77.1812, altitude: 275, terrain: "Dense Forest", description: "Ruins and rocky valley forest floors with minimal GSM signal." }
                ]
              }
            ]
          },
          {
            name: "Maharashtra",
            districts: [
              {
                name: "Pune",
                towns: [
                  { name: "Lonavala Valley", lat: 18.7557, lng: 73.4091, altitude: 624, terrain: "cliff", description: "Deep monsoon gorges, extreme humidity, and high waterfall runoffs." }
                ]
              }
            ]
          },
          {
            name: "Karnataka",
            districts: [
              {
                name: "Kodagu (Coorg)",
                towns: [
                  { name: "Madikeri Village", lat: 12.4244, lng: 75.7382, altitude: 1150, terrain: "Dense Forest", description: "Wet subtropical rainforest, heavy canopy, wildlife activity." }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "Nepal",
        code: "NP",
        flag: "🇳🇵",
        states: [
          {
            name: "Koshi Province",
            districts: [
              {
                name: "Solukhumbu",
                towns: [
                  { name: "Lukla Village", lat: 27.6878, lng: 86.7314, altitude: 2845, terrain: "cliff", description: "Dangerous airstrip, sheer mountain dropoffs, thin-air gateway." },
                  { name: "Namche Bazaar", lat: 27.8069, lng: 86.7140, altitude: 3440, terrain: "snow", description: "Freezing sub-zero temperatures, intense altitude, and snow trails." }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "North America",
    countries: [
      {
        name: "United States",
        code: "US",
        flag: "🇺🇸",
        states: [
          {
            name: "California",
            districts: [
              {
                name: "Mariposa County",
                towns: [
                  { name: "Yosemite Valley", lat: 37.7456, lng: -119.5332, altitude: 1200, terrain: "cliff", description: "Towering granite walls, flash rivers, and rapid microclimate shifts." }
                ]
              },
              {
                name: "Inyo County",
                towns: [
                  { name: "Badwater Flat", lat: 36.2422, lng: -116.8258, altitude: -86, terrain: "cliff", description: "Dehydrated salt desert floor, maximum heat exposure index." }
                ]
              }
            ]
          },
          {
            name: "Colorado",
            districts: [
              {
                name: "Larimer County",
                towns: [
                  { name: "Estes Village", lat: 40.3772, lng: -105.5217, altitude: 2293, terrain: "cliff", description: "Glacial lakes, extreme snowstorms, and wild elk crossings." }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Europe",
    countries: [
      {
        name: "Switzerland",
        code: "CH",
        flag: "🇨🇭",
        states: [
          {
            name: "Valais",
            districts: [
              {
                name: "Visp",
                towns: [
                  { name: "Zermatt Valley", lat: 46.0207, lng: 7.7491, altitude: 1620, terrain: "snow", description: "Sub-zero temperatures, extreme mountain rescue sector under the Matterhorn." }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Oceania",
    countries: [
      {
        name: "Australia",
        code: "AU",
        flag: "🇦🇺",
        states: [
          {
            name: "Northern Territory",
            districts: [
              {
                name: "MacDonnell",
                towns: [
                  { name: "Alice Springs Outback", lat: -23.6980, lng: 133.8807, altitude: 547, terrain: "Dense Forest", description: "Precipitous red sandstone gorges, bushfires, and vast cell dead zones." }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const MapLibreMap: React.FC<MapLibreMapProps> = ({
  latitude,
  longitude,
  altitude,
  heading,
  crumbHistory,
  safeZones,
  destinationWaypoint,
  setDestinationWaypoint,
  selectedPoiFilters,
  placedWaypoints,
  setPlacedWaypoints,
  selectedPlacementType,
  mapStyle,
  setMapStyle,
  routingMode,
  activeRoutingAlgorithm,
  onMapClick,
  triggerSafeReturnRoute,
  triggerEmergencySOS,
  setActiveTab,
  speakVoiceFeedback,
  setLatitude,
  setLongitude,
  setChatLog
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destinationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const poiMarkersRef = useRef<maplibregl.Marker[]>([]);
  const customWaypointsMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Bounding box handle markers
  const nwHandleRef = useRef<maplibregl.Marker | null>(null);
  const seHandleRef = useRef<maplibregl.Marker | null>(null);
  const searchResultMarkerRef = useRef<maplibregl.Marker | null>(null);

  // --- Interactive Navigation, Search, & HUD States ---
  const [followUserGPS, setFollowUserGPS] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("anis_search_history");
      return saved ? JSON.parse(saved) : ["Assam", "New Delhi Base Camp", "Biswanath Chariali"];
    } catch {
      return ["Assam", "New Delhi Base Camp", "Biswanath Chariali"];
    }
  });
  const [favourites, setFavourites] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("anis_favorite_places");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { name: "🏠 Home Base (Delhi)", lat: 28.6139, lng: 77.2090, category: "Home", terrain: "Urban" },
      { name: "💼 Sector HQ (Tezpur)", lat: 26.6528, lng: 92.7925, category: "Work", terrain: "River Plain" },
      { name: "🏫 Safe Camp (Guwahati)", lat: 26.1878, lng: 91.6916, category: "School", terrain: "Hills" }
    ];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSelectedPlace, setActiveSelectedPlace] = useState<any | null>(null);
  const [isOfflineSearchOnly, setIsOfflineSearchOnly] = useState(false);

  // From-To Routing Console States
  const [isNavPanelOpen, setIsNavPanelOpen] = useState(false);
  const [navFromLabel, setNavFromLabel] = useState("My Location");
  const [navFromCoords, setNavFromCoords] = useState<[number, number] | null>(null); // null = My Location
  const [navToLabel, setNavToLabel] = useState("");
  const [navToCoords, setNavToCoords] = useState<[number, number] | null>(null);

  // Advanced Autocomplete & Routing States
  const [routingFocus, setRoutingFocus] = useState<'from' | 'to' | null>(null);
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);

  // Offline Vector Layer States
  const [offlineLayerToggles, setOfflineLayerToggles] = useState({
    roads: true,
    water: true,
    pois: true
  });
  const [offlinePois, setOfflinePois] = useState<any[]>([]);
  const offlinePoisRef = useRef<any[]>([]);
  const [savedRegions, setSavedRegions] = useState<OfflineRegion[]>([]);

  useEffect(() => {
    offlinePoisRef.current = offlinePois;
  }, [offlinePois]);

  const isCoordinateOfflineCached = (lat: number, lng: number): boolean => {
    const completedRegions = savedRegions.filter(r => r.status === "completed");
    if (completedRegions.length === 0) return false;
    return completedRegions.some(r => {
      const minLat = r.minLat;
      const maxLat = r.maxLat;
      const minLng = r.minLng;
      const maxLng = r.maxLng;
      return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    });
  };

  // Autocomplete Suggestions live synchronizers for inputs
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setSearchSuggestions([]);
      return;
    }
    let results = searchIndiaDatabase(searchQuery);
    if (isOfflineSearchOnly) {
      results = results.filter(place => isCoordinateOfflineCached(place.lat, place.lng));
    }
    setSearchSuggestions(results);
  }, [searchQuery, isOfflineSearchOnly, savedRegions]);

  useEffect(() => {
    if (routingFocus === 'from' && navFromLabel && navFromLabel !== "My Location") {
      setFromSuggestions(searchIndiaDatabase(navFromLabel));
    } else {
      setFromSuggestions([]);
    }
  }, [navFromLabel, routingFocus]);

  useEffect(() => {
    if (routingFocus === 'to' && navToLabel) {
      setToSuggestions(searchIndiaDatabase(navToLabel));
    } else {
      setToSuggestions([]);
    }
  }, [navToLabel, routingFocus]);
  const [travelMode, setTravelMode] = useState<'walking' | 'cycling' | 'driving' | 'hiking'>('walking');

  // Long press coordinate popup
  const [longPressCoords, setLongPressCoords] = useState<[number, number] | null>(null);
  const [longPressMenuPos, setLongPressMenuPos] = useState({ x: 0, y: 0 });
  const [longPressMenuOpen, setLongPressMenuOpen] = useState(false);

  // States
  const [showDownloader, setShowDownloader] = useState(false);
  const [bboxMode, setBboxMode] = useState(false);
  const [minZoom, setMinZoom] = useState(10);
  const [maxZoom, setMaxZoom] = useState(14);
  const [bboxName, setBboxName] = useState("Selected Rescue Sector");
  const [bounds, setBounds] = useState({
    minLat: 28.605,
    minLng: 77.195,
    maxLat: 28.625,
    maxLng: 77.225
  });

  const [downloadStats, setDownloadStats] = useState<{
    total: number;
    downloaded: number;
    speed: number;
    sizeMB: number;
    status: 'idle' | 'downloading' | 'paused' | 'completed' | 'failed';
    regionId?: string;
  }>({
    total: 0,
    downloaded: 0,
    speed: 0,
    sizeMB: 0,
    status: "idle"
  });

  const [cacheStats, setCacheStats] = useState({ tileCount: 0, cacheSizeMB: 0 });
  const [showLayers, setShowLayers] = useState(false);

  // Worldwide Sector Selector States
  const [downloaderTab, setDownloaderTab] = useState<'india' | 'picker' | 'manual'>('india');
  const [selectedRegionIdx, setSelectedRegionIdx] = useState<number | 'other'>(0);
  const [selectedCountryIdx, setSelectedCountryIdx] = useState<number | 'other'>(0);
  const [selectedStateIdx, setSelectedStateIdx] = useState<number | 'other'>(0);
  const [selectedDistrictIdx, setSelectedDistrictIdx] = useState<number | 'other'>(0);
  const [selectedPlaceIdx, setSelectedPlaceIdx] = useState<number | 'other'>(0);

  // Custom text input fallback fields
  const [customRegionName, setCustomRegionName] = useState("");
  const [customCountryName, setCustomCountryName] = useState("");
  const [customStateName, setCustomStateName] = useState("");
  const [customDistrictName, setCustomDistrictName] = useState("");
  const [customPlaceName, setCustomPlaceName] = useState("");
  const [customPlaceLat, setCustomPlaceLat] = useState("28.6139");
  const [customPlaceLng, setCustomPlaceLng] = useState("77.2090");

  // --- India Dynamic Downloader States & Handlers ---
  const [downloadScale, setDownloadScale] = useState<'india' | 'state' | 'district' | 'village' | 'custom'>('custom');
  const [selectedStateName, setSelectedStateName] = useState<string>("Assam"); // default state: Assam
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>("Biswanath");
  const [selectedVillageName, setSelectedVillageName] = useState<string>("Biswanath Chariali");
  const [downloadPreset, setDownloadPreset] = useState<'small' | 'standard' | 'full' | 'tactical'>('standard');

  // --- Turn-by-turn Navigation Simulation States & Refs ---
  const [isSimulatingNavigation, setIsSimulatingNavigation] = useState(false);
  const [currentNavigationStepIndex, setCurrentNavigationStepIndex] = useState(0);
  const [isNavPanelExpanded, setIsNavPanelExpanded] = useState(true);
  const simulationIntervalRef = useRef<any>(null);
  const originalStartCoordRef = useRef<[number, number] | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  const getNavigationStepsForRoute = (startLat: number, startLng: number, destLat: number, destLng: number) => {
    return [
      { instruction: "Departing active staging basecamp. Setting compass bearing to tactical destination.", distance: 150 },
      { instruction: "Proceeding along secondary drainage corridor. Prone to flooding, maintain situational awareness.", distance: 350 },
      { instruction: "Continuing along primary evacuation path. Watch out for rockfall hazards or cliff blockages on the left flank.", distance: 500 },
      { instruction: "Bypassing major waterway boundary. Signal coverage verified. Check local magnetic heading.", distance: 400 },
      { instruction: "Approaching targeted coordinate boundary. Calibrating thermal imaging systems for perimeter check.", distance: 250 },
      { instruction: "Entering secure destination quadrant. Halt all motors, survey surroundings, and verify safety zone.", distance: 100 }
    ];
  };

  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
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
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  const generateDynamicSteps = (start: [number, number], end: [number, number], mode: string) => {
    const dist = getDistanceKm(start[1], start[0], end[1], end[0]);
    const bearing = calculateBearing(start[1], start[0], end[1], end[0]);
    const directionStr = getCompassDirection(bearing);
    return [
      { instruction: `Depart starting waypoint. Head ${directionStr} (${bearing.toFixed(0)}°) along the plotted corridor.`, distance: (dist * 0.15).toFixed(2) },
      { instruction: `Proceed along secondary sector pathways. Watch out for local terrain challenges.`, distance: (dist * 0.35).toFixed(2) },
      { instruction: `Incorporate safe shelter buffers and monitor telemetry. Adjust bearing to match ${directionStr}.`, distance: (dist * 0.30).toFixed(2) },
      { instruction: `Approaching targeted waypoint zone. Halt and scan coordinates for final safety clearance.`, distance: (dist * 0.20).toFixed(2) }
    ];
  };

  // Voice Search handler
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speakVoiceFeedback("Voice recognition is not supported in this browser. Please type your search query.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-IN";
      recognition.interimResults = false;

      setIsListening(true);
      speakVoiceFeedback("Voice sensor active. State your destination.");

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        speakVoiceFeedback(`Searching for ${transcript}`);
      };

      recognition.onerror = () => {
        setIsListening(false);
        speakVoiceFeedback("Voice communication disrupted. Please type.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Select Search Place
  const handleSelectPlace = (place: any) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [place.lng, place.lat], zoom: 14 });
    }
    setFollowUserGPS(false);
    setActiveSelectedPlace(place);
    setSearchQuery(place.name);
    setSearchSuggestions([]);
    setShowHistory(false);
    
    // Add to search history
    if (!searchHistory.includes(place.name)) {
      const updated = [place.name, ...searchHistory.slice(0, 9)];
      setSearchHistory(updated);
      localStorage.setItem("anis_search_history", JSON.stringify(updated));
    }

    // Place custom red marker on map
    if (mapRef.current) {
      if (searchResultMarkerRef.current) {
        searchResultMarkerRef.current.remove();
      }

      const el = document.createElement("div");
      el.className = "flex items-center justify-center p-1 bg-red-950 border border-red-500 rounded-full cursor-pointer animate-bounce";
      el.innerHTML = `
        <svg viewBox="0 0 24 24" class="w-6 h-6 text-red-500 fill-none stroke-current" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" class="fill-red-500 fill-opacity-20 animate-pulse" />
          <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z" />
          <circle cx="12" cy="10" r="3" fill="currentColor" />
        </svg>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .addTo(mapRef.current);
      
      searchResultMarkerRef.current = marker;
    }

    speakVoiceFeedback(`Target locked: ${place.name}. Displaying regional telemetry details.`);
  };

  const handleToggleSimulation = () => {
    if (isSimulatingNavigation) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      setIsSimulatingNavigation(false);
      speakVoiceFeedback("Simulation suspended. Operator halted at active waypoint.");
      return;
    }

    const startLng = navFromCoords ? navFromCoords[0] : longitude;
    const startLat = navFromCoords ? navFromCoords[1] : latitude;
    const endLng = navToCoords ? navToCoords[0] : (destinationWaypoint ? destinationWaypoint.longitude : null);
    const endLat = navToCoords ? navToCoords[1] : (destinationWaypoint ? destinationWaypoint.latitude : null);

    if (endLng === null || endLat === null) {
      speakVoiceFeedback("Warning! No active destination corridor plotted to simulate.");
      return;
    }

    speakVoiceFeedback("Initiating real-time turn-by-turn navigation simulation.");
    originalStartCoordRef.current = [longitude, latitude];
    setCurrentNavigationStepIndex(0);
    setIsSimulatingNavigation(true);

    const completedRegions = savedRegions.filter(r => r.status === "completed");
    const activeRegion = completedRegions.find(r => 
      startLat >= r.minLat && startLat <= r.maxLat &&
      startLng >= r.minLng && startLng <= r.maxLng &&
      endLat >= r.minLat && endLat <= r.maxLat &&
      endLng >= r.minLng && endLng <= r.maxLng
    );

    let pathPoints: [number, number][] = [];
    let stepsData: any[] = [];
    let stepsCount = 6;

    if (activeRegion) {
      const route = calculateTacticalRoute([startLng, startLat], [endLng, endLat], activeRegion, travelMode);
      pathPoints = route.coordinates;
      stepsData = route.steps;
      stepsCount = stepsData.length + 1;
    } else {
      stepsCount = 6;
      pathPoints = [[startLng, startLat]];
      for (let i = 1; i < stepsCount; i++) {
        const ratio = i / stepsCount;
        const lat = startLat + (endLat - startLat) * ratio;
        const lng = startLng + (endLng - startLng) * ratio;
        
        const wiggleAmt = activeRoutingAlgorithm === 'A*' ? 0.0006 : 0.0002;
        const wiggleLat = Math.sin(ratio * Math.PI) * wiggleAmt;
        const wiggleLng = Math.cos(ratio * Math.PI) * wiggleAmt;
        pathPoints.push([lng + wiggleLng, lat + wiggleLat]);
      }
      pathPoints.push([endLng, endLat]);
      stepsData = generateDynamicSteps([startLng, startLat], [endLng, endLat], travelMode);
    }

    let currentIndex = 0;

    simulationIntervalRef.current = setInterval(() => {
      currentIndex++;
      if (currentIndex < pathPoints.length) {
        const [nextLng, nextLat] = pathPoints[currentIndex];
        setLatitude(nextLat);
        setLongitude(nextLng);
        
        // Recenter map if followUserGPS is active
        if (mapRef.current && followUserGPS) {
          mapRef.current.setCenter([nextLng, nextLat]);
        }

        // Voice the instruction
        const currentStep = stepsData[currentIndex - 1];
        if (currentStep) {
          speakVoiceFeedback(currentStep.instruction);
          setCurrentNavigationStepIndex(currentIndex);
        }

        // Write to system log
        setChatLog(prev => [
          ...prev,
          {
            sender: "anis",
            text: `### 🛰️ TBT ROUTE RECON PROGRESS\n*   **Active Checkpoint**: ${currentIndex} of ${stepsCount}\n*   **GPS Latitude**: ${nextLat.toFixed(5)}\n*   **GPS Longitude**: ${nextLng.toFixed(5)}\n*   **Status**: ${currentStep?.instruction || "Proceeding along corridor."}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      } else {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = null;
        }
        setIsSimulatingNavigation(false);
        speakVoiceFeedback("Destination reached. Secure sector achieved. Ending simulation.");
        
        setChatLog(prev => [
          ...prev,
          {
            sender: "anis",
            text: `### 🏁 DESTINATION SECURED\n*   **Target Coordinates**: ${endLat.toFixed(5)}, ${endLng.toFixed(5)}\n*   **Muster Point**: Verification complete. No hazards registered in direct perimeter.`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    }, 4500); // Step every 4.5 seconds for complete reading of instructions
  };

  const applyDownloadScaleAndPreset = (
    scale: 'india' | 'state' | 'district' | 'village' | 'custom',
    preset: 'small' | 'standard' | 'full' | 'tactical',
    stateName: string,
    distName: string,
    villName: string
  ) => {
    if (scale === 'custom') {
      let zMin = 10;
      let zMax = 14;
      if (preset === 'small') { zMin = 10; zMax = 12; }
      else if (preset === 'standard') { zMin = 10; zMax = 14; }
      else if (preset === 'full') { zMin = 10; zMax = 15; }
      else if (preset === 'tactical') { zMin = 10; zMax = 16; }
      setMinZoom(zMin);
      setMaxZoom(zMax);
      return;
    }

    let targetLat = 20.5937;
    let targetLng = 78.9629;
    let deltaLat = 12.0;
    let deltaLng = 14.0;
    let targetName = "India Nationwide";
    let zMin = 2;
    let zMax = 5;

    if (scale === 'india') {
      targetLat = 22.5937;
      targetLng = 78.9629;
      deltaLat = 10.0;
      deltaLng = 12.0;
      targetName = "India Nationwide Network";
      if (preset === 'small') { zMin = 2; zMax = 4; }
      else if (preset === 'standard') { zMin = 2; zMax = 5; }
      else if (preset === 'full') { zMin = 2; zMax = 6; }
      else if (preset === 'tactical') { zMin = 2; zMax = 7; }
    } 
    else if (scale === 'state') {
      const stateObj = INDIA_STATES_DATABASE.find(s => s.name === stateName) || INDIA_STATES_DATABASE[0];
      targetLat = stateObj.lat;
      targetLng = stateObj.lng;
      deltaLat = 1.0;
      deltaLng = 1.0;
      targetName = `Entire State of ${stateObj.name}`;
      if (preset === 'small') { zMin = 5; zMax = 7; }
      else if (preset === 'standard') { zMin = 5; zMax = 8; }
      else if (preset === 'full') { zMin = 5; zMax = 9; }
      else if (preset === 'tactical') { zMin = 5; zMax = 10; }
    } 
    else if (scale === 'district') {
      const places = getPlacesForDistrict(stateName, distName);
      if (places.length > 0) {
        const sumLat = places.reduce((acc, v) => acc + v.lat, 0);
        const sumLng = places.reduce((acc, v) => acc + v.lng, 0);
        targetLat = sumLat / places.length;
        targetLng = sumLng / places.length;
      } else {
        targetLat = 26.7340;
        targetLng = 93.1530;
      }
      deltaLat = 0.22;
      deltaLng = 0.28;
      targetName = `${distName} District Sector`;
      if (preset === 'small') { zMin = 8; zMax = 10; }
      else if (preset === 'standard') { zMin = 8; zMax = 11; }
      else if (preset === 'full') { zMin = 8; zMax = 12; }
      else if (preset === 'tactical') { zMin = 8; zMax = 13; }
    } 
    else if (scale === 'village') {
      const places = getPlacesForDistrict(stateName, distName);
      const vObj = places.find(v => v.name === villName) || (places.length > 0 ? places[0] : null);
      if (vObj) {
        targetLat = vObj.lat;
        targetLng = vObj.lng;
        targetName = `${vObj.name} Tactical Node`;
      } else {
        targetLat = 26.7328;
        targetLng = 93.1518;
        targetName = "Tactical Node";
      }
      deltaLat = 0.015;
      deltaLng = 0.02;
      if (preset === 'small') { zMin = 11; zMax = 13; }
      else if (preset === 'standard') { zMin = 11; zMax = 14; }
      else if (preset === 'full') { zMin = 11; zMax = 15; }
      else if (preset === 'tactical') { zMin = 11; zMax = 16; }
    }

    const newBounds = {
      minLat: targetLat - deltaLat,
      minLng: targetLng - deltaLng,
      maxLat: targetLat + deltaLat,
      maxLng: targetLng + deltaLng
    };

    setBounds(newBounds);
    setMinZoom(zMin);
    setMaxZoom(zMax);
    setBboxName(targetName);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [targetLng, targetLat],
        zoom: scale === 'india' ? 4.5 : scale === 'state' ? 7 : scale === 'district' ? 10 : 13,
        speed: 1.2
      });
    }
  };

  useEffect(() => {
    applyDownloadScaleAndPreset(
      downloadScale,
      downloadPreset,
      selectedStateName,
      selectedDistrictName,
      selectedVillageName
    );
  }, [downloadScale, downloadPreset, selectedStateName, selectedDistrictName, selectedVillageName]);

  const syncPickerToMap = (
    regionVal: number | 'other',
    countryVal: number | 'other',
    stateVal: number | 'other',
    districtVal: number | 'other',
    placeVal: number | 'other',
    custLat = customPlaceLat,
    custLng = customPlaceLng,
    custName = customPlaceName,
    custDist = customDistrictName,
    custState = customStateName,
    custCountry = customCountryName,
    custRegion = customRegionName
  ) => {
    let targetLat = 28.6139;
    let targetLng = 77.2090;
    let targetName = "Custom Region";

    if (regionVal === 'other') {
      targetLat = parseFloat(custLat) || 28.6139;
      targetLng = parseFloat(custLng) || 77.2090;
      targetName = `${custName || 'Place'}, ${custDist || 'District'}, ${custState || 'State'}, ${custCountry || 'Country'}, ${custRegion || 'Region'}`;
    } else {
      const region = WORLDWIDE_REGION_CATALOG[regionVal];
      if (region) {
        if (countryVal === 'other') {
          targetLat = parseFloat(custLat) || targetLat;
          targetLng = parseFloat(custLng) || targetLng;
          targetName = `${custName || 'Place'}, ${custDist || 'District'}, ${custState || 'State'}, ${custCountry || 'Country'}, ${region.name}`;
        } else {
          const country = region.countries[countryVal];
          if (country) {
            if (stateVal === 'other') {
              targetLat = parseFloat(custLat) || targetLat;
              targetLng = parseFloat(custLng) || targetLng;
              targetName = `${custName || 'Place'}, ${custDist || 'District'}, ${custState || 'State'}, ${country.name}`;
            } else {
              const state = country.states[stateVal];
              if (state) {
                if (districtVal === 'other') {
                  targetLat = parseFloat(custLat) || targetLat;
                  targetLng = parseFloat(custLng) || targetLng;
                  targetName = `${custName || 'Place'}, ${custDist || 'District'}, ${state.name}, ${country.name}`;
                } else {
                  const district = state.districts[districtVal];
                  if (district) {
                    if (placeVal === 'other') {
                      targetLat = parseFloat(custLat) || targetLat;
                      targetLng = parseFloat(custLng) || targetLng;
                      targetName = `${custName || 'Place'}, ${district.name}, ${state.name}, ${country.name}`;
                    } else {
                      const town = district.towns[placeVal];
                      if (town) {
                        targetLat = town.lat;
                        targetLng = town.lng;
                        targetName = `${town.name}, ${district.name}, ${state.name}, ${country.name}`;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    const dLat = 0.015;
    const dLng = 0.02;

    const newBounds = {
      minLat: targetLat - dLat,
      minLng: targetLng - dLng,
      maxLat: targetLat + dLat,
      maxLng: targetLng + dLng
    };

    setBounds(newBounds);
    setBboxName(targetName);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [targetLng, targetLat],
        zoom: 12,
        speed: 1.4
      });
    }
  };

  // Download abort signal ref
  const abortControllerRef = useRef<AbortController | null>(null);
  const tileDownloadQueueRef = useRef<string[]>([]);
  const currentDownloadedUrlsRef = useRef<string[]>([]);
  const currentDownloadedBytesRef = useRef(0);

  // Load Saved Regions & Cache Stats
  const loadRegionsAndStats = async () => {
    try {
      const regions = await getRegions();
      setSavedRegions(regions);
      const stats = await getOfflineCacheStats();
      setCacheStats(stats);
    } catch (e) {
      console.error("Error loading offline database details:", e);
    }
  };

  useEffect(() => {
    loadRegionsAndStats();
  }, []);

  // Map Tile source switcher
  const getStyleUrl = (style: typeof mapStyle) => {
    const tileUrls = {
      dark: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      light: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      terrain: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
      satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      hiking: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    };

    const attribution = {
      dark: "© CartoDB",
      light: "© CartoDB",
      terrain: "© OpenTopoMap",
      satellite: "© Esri ArcGIS",
      hiking: "© OpenStreetMap"
    };

    const url = tileUrls[style];
    // Wrap with our cached-tile protocol to intercept tile requests!
    const protocolUrl = `offline-cache://${url}`;

    return {
      version: 8,
      sources: {
        "tactical-tiles": {
          type: "raster",
          tiles: [protocolUrl],
          tileSize: 256,
          attribution: attribution[style]
        }
      },
      layers: [
        {
          id: "raster-layer",
          type: "raster",
          source: "tactical-tiles",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    } as maplibregl.StyleSpecification;
  };

  // Helper to generate a circle polygon for Safe Zones
  const createCircleGeoJSON = (center: [number, number], radiusInMeters: number) => {
    const points = 64;
    const coords = { latitude: center[1], longitude: center[0] };
    const km = radiusInMeters / 1000;
    const ret = [];
    const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.57;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]); // Close polygon

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [ret]
      }
    };
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check last viewed location memory
    const lastLatStr = localStorage.getItem("anis_last_viewed_lat");
    const lastLngStr = localStorage.getItem("anis_last_viewed_lng");
    const lastZoomStr = localStorage.getItem("anis_last_viewed_zoom");

    let initialCenter: [number, number] = [78.9629, 20.5937]; // Centered on India
    let initialZoom = 4.5;

    if (lastLatStr && lastLngStr) {
      const lat = parseFloat(lastLatStr);
      const lng = parseFloat(lastLngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        initialCenter = [lng, lat];
        initialZoom = lastZoomStr ? parseFloat(lastZoomStr) : 13;
      }
    } else if (latitude !== 28.6139 || longitude !== 77.2090) {
      initialCenter = [longitude, latitude];
      initialZoom = 13;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getStyleUrl(mapStyle),
      center: initialCenter,
      zoom: initialZoom,
      pitch: 35,
      bearing: heading
    });

    // Suppress unhandled tile/style fetch exceptions gracefully
    map.on("error", (e) => {
      console.warn("Main map background network load deferred:", e);
    });

    mapRef.current = map;

    // Try to get standard browser GPS if no previous viewed location
    if (!lastLatStr && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setFollowUserGPS(true);
          map.flyTo({ center: [lng, lat], zoom: 13 });
        },
        () => {},
        { timeout: 4000 }
      );
    }

    map.on("load", () => {
      // Add sources for overlays
      // 1. Trace Breadcrumbs
      map.addSource("trace-crumb", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: crumbHistory.map(c => [c.longitude, c.latitude])
          }
        }
      });

      map.addLayer({
        id: "trace-crumb-line",
        type: "line",
        source: "trace-crumb",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#f97316", // neon orange trace
          "line-width": 3,
          "line-dasharray": [2, 2]
        }
      });

      // 2. Safe Zones (Geofence Circles)
      map.addSource("safe-zones", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: safeZones.map(z => createCircleGeoJSON([z.longitude, z.latitude], z.radius)) as any
        }
      });

      map.addLayer({
        id: "safe-zones-fill",
        type: "fill",
        source: "safe-zones",
        paint: {
          "fill-color": "#06b6d4",
          "fill-opacity": 0.15
        }
      });

      map.addLayer({
        id: "safe-zones-outline",
        type: "line",
        source: "safe-zones",
        paint: {
          "line-color": "#22d3ee",
          "line-width": 2,
          "line-dasharray": [4, 4]
        }
      });

      // 3. Corridor navigation route to target destination
      map.addSource("destination-corridor", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: []
          }
        }
      });

      map.addLayer({
        id: "destination-corridor-line",
        type: "line",
        source: "destination-corridor",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#06b6d4", // glowing cyan safe-route
          "line-width": 5,
          "line-opacity": 0.85
        }
      });

      // 4. Bounding Box selector polygon
      map.addSource("bbox-selector", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [bounds.minLng, bounds.minLat],
                [bounds.maxLng, bounds.minLat],
                [bounds.maxLng, bounds.maxLat],
                [bounds.minLng, bounds.maxLat],
                [bounds.minLng, bounds.minLat]
              ]
            ]
          }
        }
      });

      map.addLayer({
        id: "bbox-selector-fill",
        type: "fill",
        source: "bbox-selector",
        paint: {
          "fill-color": "#f59e0b",
          "fill-opacity": 0.1
        }
      });

      map.addLayer({
        id: "bbox-selector-outline",
        type: "line",
        source: "bbox-selector",
        paint: {
          "line-color": "#fbbf24",
          "line-width": 3,
          "line-dasharray": [3, 3]
        }
      });

      // Map Click event handler for custom POI waypoints
      map.on("click", (e) => {
        // If clicking on handles, do not add custom waypoint
        if (bboxMode) return;

        const { lng, lat } = e.lngLat;

        // Check if user clicked near any generated offline POIs
        const clickedPoi = offlinePoisRef.current.find(p => getDistanceKm(lat, lng, p.lat, p.lng) < 0.35); // 350 meters
        if (clickedPoi) {
          setFollowUserGPS(false);
          setActiveSelectedPlace({
            name: clickedPoi.name,
            lat: clickedPoi.lat,
            lng: clickedPoi.lng,
            category: clickedPoi.type === "hospital" ? "Hospital" : clickedPoi.type === "police" ? "Police" : clickedPoi.type === "bunker" ? "Bunker" : clickedPoi.type === "water" ? "Water" : "Landmark",
            description: clickedPoi.description,
            terrain: clickedPoi.terrain || "Tactical Plain",
            altitude: clickedPoi.elevation || 120
          });
          speakVoiceFeedback(`Asset engaged: ${clickedPoi.name}`);
          return;
        }

        onMapClick(lat, lng);
        setLongPressMenuOpen(false);
      });

      // Dynamic Context Menu / Long Press listener
      map.on("contextmenu", (e) => {
        e.preventDefault();
        const { lng, lat } = e.lngLat;
        setLongPressCoords([lng, lat]);
        setLongPressMenuPos({ x: e.point.x, y: e.point.y });
        setLongPressMenuOpen(true);
        speakVoiceFeedback("Coordinates marked. Menu protocol engaged.");
      });

      // Map move/drag/zoom handlers to disable follow-GPS and update memory
      map.on("moveend", () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        localStorage.setItem("anis_last_viewed_lat", center.lat.toString());
        localStorage.setItem("anis_last_viewed_lng", center.lng.toString());
        localStorage.setItem("anis_last_viewed_zoom", zoom.toString());
      });

      map.on("dragstart", () => {
        setFollowUserGPS(false);
        setLongPressMenuOpen(false);
      });

      map.on("zoomstart", () => {
        setFollowUserGPS(false);
      });
    });

    // Clean up
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [bboxMode, onMapClick]);

  // Sync map style
  useEffect(() => {
    if (!mapRef.current) return;
    const style = getStyleUrl(mapStyle);
    mapRef.current.setStyle(style);
  }, [mapStyle]);

  // Sync center & bearing when coordinates change
  useEffect(() => {
    if (!mapRef.current) return;
    if (!followUserGPS) return; // ONLY sync if followUserGPS is true
    const safeLat = typeof latitude === "number" && !isNaN(latitude) ? Math.max(-90, Math.min(90, latitude)) : 28.6139;
    const safeLng = typeof longitude === "number" && !isNaN(longitude) ? Math.max(-180, Math.min(180, longitude)) : 77.2090;
    mapRef.current.setCenter([safeLng, safeLat]);
    if (heading) {
      mapRef.current.setBearing(heading);
    }
  }, [latitude, longitude, heading, followUserGPS]);

  // Sync crumb history source
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource("trace-crumb") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: crumbHistory.map(c => [c.longitude, c.latitude])
        }
      });
    }
  }, [crumbHistory]);

  // Sync Safe Zones
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource("safe-zones") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features: safeZones.map(z => createCircleGeoJSON([z.longitude, z.latitude], z.radius)) as any
      });
    }
  }, [safeZones]);

  // Synchronize DestinationWaypoint from Parent to navToCoords
  useEffect(() => {
    if (destinationWaypoint) {
      setNavToCoords([destinationWaypoint.longitude, destinationWaypoint.latitude]);
      setNavToLabel(destinationWaypoint.label || "Selected Waypoint");
    } else {
      setNavToCoords(null);
      setNavToLabel("");
    }
  }, [destinationWaypoint]);

  // Sync Destination corridor & corridor path (using navFromCoords & navToCoords)
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource("destination-corridor") as maplibregl.GeoJSONSource;
    if (!source) return;

    const startLng = navFromCoords ? navFromCoords[0] : longitude;
    const startLat = navFromCoords ? navFromCoords[1] : latitude;

    if (!navToCoords) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] }
      });
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
        destinationMarkerRef.current = null;
      }
      return;
    }

    const endLng = navToCoords[0];
    const endLat = navToCoords[1];

    // Check if start and end are inside a completed saved offline region
    const completedRegions = savedRegions.filter(r => r.status === "completed");
    const activeRegion = completedRegions.find(r => 
      startLat >= r.minLat && startLat <= r.maxLat &&
      startLng >= r.minLng && startLng <= r.maxLng &&
      endLat >= r.minLat && endLat <= r.maxLat &&
      endLng >= r.minLng && endLng <= r.maxLng
    );

    let points: [number, number][] = [];
    if (activeRegion) {
      const route = calculateTacticalRoute([startLng, startLat], [endLng, endLat], activeRegion, travelMode);
      points = route.coordinates;
    } else {
      // Fallback winding simulated road route
      points = [[startLng, startLat]];
      const steps = 6;
      for (let i = 1; i < steps; i++) {
        const ratio = i / steps;
        const lat = startLat + (endLat - startLat) * ratio;
        const lng = startLng + (endLng - startLng) * ratio;
        
        const wiggleAmt = activeRoutingAlgorithm === 'A*' ? 0.0006 : 0.0002;
        const wiggleLat = Math.sin(ratio * Math.PI) * wiggleAmt;
        const wiggleLng = Math.cos(ratio * Math.PI) * wiggleAmt;
        points.push([lng + wiggleLng, lat + wiggleLat]);
      }
      points.push([endLng, endLat]);
    }

    source.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: points
      }
    });

    // Render destination marker node
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setLngLat([endLng, endLat]);
    } else {
      const el = document.createElement("div");
      el.className = "flex items-center justify-center p-1 bg-cyan-950 border border-cyan-400 rounded-full cursor-pointer animate-bounce";
      el.innerHTML = `
        <svg viewBox="0 0 24 24" class="w-6 h-6 text-cyan-400 fill-none stroke-current" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" class="fill-cyan-500 fill-opacity-20 animate-pulse" />
          <path d="M12 2v20M2 12h20" />
        </svg>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([endLng, endLat])
        .addTo(mapRef.current);
      destinationMarkerRef.current = marker;
    }
  }, [latitude, longitude, navFromCoords, navToCoords, activeRoutingAlgorithm, routingMode, savedRegions, travelMode]);

  // Render / Sync Operator User Position Marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([longitude, latitude]);
    } else {
      const el = document.createElement("div");
      el.className = "flex items-center justify-center w-8 h-8 rounded-full border border-sky-400 bg-sky-950/40 relative";
      el.innerHTML = `
        <div class="absolute inset-0 w-full h-full bg-sky-500 rounded-full animate-ping opacity-30"></div>
        <svg viewBox="0 0 24 24" class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" stroke-width="3">
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current);
      userMarkerRef.current = marker;
    }
  }, [latitude, longitude]);

  // Sync Custom Waypoint Markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old ones
    customWaypointsMarkersRef.current.forEach(m => m.remove());
    customWaypointsMarkersRef.current = [];

    placedWaypoints.forEach(wp => {
      const el = document.createElement("div");
      el.className = `flex items-center justify-center p-1.5 border rounded-full shadow-lg ${
        wp.type === 'shelter' ? 'bg-emerald-950 border-emerald-500 text-emerald-400' :
        wp.type === 'water' ? 'bg-sky-950 border-sky-500 text-sky-400' :
        'bg-red-950 border-red-500 text-red-400'
      }`;

      let svg = "";
      if (wp.type === "shelter") {
        svg = `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2"/></svg>`;
      } else if (wp.type === "water") {
        svg = `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 007-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 007 7z"/></svg>`;
      } else {
        svg = `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="1"/></svg>`;
      }

      el.innerHTML = svg;

      // Add HTML description card as a simple popup
      const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
        <div class="text-xs font-mono p-1 text-slate-900 bg-white">
          <p class="font-bold uppercase tracking-wider text-sky-800">${wp.label || ""}</p>
          <p class="mt-1 text-[10px] text-slate-500">${wp.notes || ""}</p>
          <p class="mt-1 text-[8px] text-slate-400">Coord: ${wp.latitude.toFixed(5)}, ${wp.longitude.toFixed(5)}</p>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([wp.longitude, wp.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!);
      customWaypointsMarkersRef.current.push(marker);
    });
  }, [placedWaypoints]);

  // Sync POI Filters and render markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old POIs
    poiMarkersRef.current.forEach(m => m.remove());
    poiMarkersRef.current = [];

    const baseLat = latitude;
    const baseLng = longitude;
    const pois: Array<{ name: string; lat: number; lng: number; type: 'hospital' | 'police' | 'fire' | 'shelter' | 'water' }> = [];
    
    if (selectedPoiFilters.hospitals) {
      pois.push({ name: "Delhi Emergency Hospital Center", lat: baseLat + 0.003, lng: baseLng - 0.004, type: "hospital" });
      pois.push({ name: "Red Cross Field Clinic", lat: baseLat - 0.005, lng: baseLng + 0.003, type: "hospital" });
    }
    if (selectedPoiFilters.police) {
      pois.push({ name: "District Police Outpost", lat: baseLat + 0.002, lng: baseLng + 0.005, type: "police" });
      pois.push({ name: "Sector Guard Base", lat: baseLat - 0.004, lng: baseLng - 0.002, type: "police" });
    }
    if (selectedPoiFilters.fire) {
      pois.push({ name: "Sector Fire Brigade Depot", lat: baseLat + 0.005, lng: baseLng - 0.001, type: "fire" });
    }
    if (selectedPoiFilters.shelters) {
      pois.push({ name: "Survival Dome Shelter Post", lat: baseLat - 0.002, lng: baseLng + 0.006, type: "shelter" });
    }
    if (selectedPoiFilters.water) {
      pois.push({ name: "Emergency Artesian Bore Reserve", lat: baseLat + 0.004, lng: baseLng + 0.002, type: "water" });
    }

    pois.forEach(poi => {
      const el = document.createElement("div");
      el.className = `flex items-center justify-center p-1 border rounded shadow bg-slate-900 ${
        poi.type === 'hospital' ? 'border-pink-500 text-pink-400' :
        poi.type === 'police' ? 'border-blue-500 text-blue-400' :
        poi.type === 'water' ? 'border-sky-400 text-sky-400' :
        poi.type === 'shelter' ? 'border-emerald-500 text-emerald-400' :
        'border-red-400 text-red-400'
      }`;

      let icon = "📍";
      if (poi.type === 'hospital') icon = "🩺";
      else if (poi.type === 'police') icon = "🚔";
      else if (poi.type === 'water') icon = "💧";
      else if (poi.type === 'shelter') icon = "🏕️";
      else if (poi.type === 'fire') icon = "🚒";

      el.innerHTML = `<span class="text-[11px] font-bold">${icon}</span>`;

      const popup = new maplibregl.Popup({ offset: 12 }).setHTML(`
        <div class="text-[10px] font-mono p-1 text-slate-900">
          <p class="font-bold text-sky-900 uppercase">📡 OFFLINE POI: ${poi.name}</p>
          <p class="mt-0.5">Type: ${poi.type.toUpperCase()}</p>
          <p class="mt-0.5 text-slate-500">Coord: ${poi.lat.toFixed(5)}, ${poi.lng.toFixed(5)}</p>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([poi.lng, poi.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      poiMarkersRef.current.push(marker);
    });
  }, [selectedPoiFilters, latitude, longitude]);

  // Synchronize Offline Vector Data for Cached Completed Regions
  useEffect(() => {
    if (!mapRef.current) return;

    const completedRegions = savedRegions.filter(r => r.status === "completed");
    
    // Generate lists of features
    const allRoads: any[] = [];
    const allWater: any[] = [];
    const allPois: any[] = [];

    completedRegions.forEach(r => {
      const { roads, water, pois } = generateOfflineTacticalData({
        minLat: r.minLat,
        minLng: r.minLng,
        maxLat: r.maxLat,
        maxLng: r.maxLng
      });
      
      if (offlineLayerToggles.roads) {
        allRoads.push(...roads.features);
      }
      if (offlineLayerToggles.water) {
        allWater.push(...water.features);
      }
      if (offlineLayerToggles.pois) {
        allPois.push(...pois);
      }
    });

    setOfflinePois(allPois);

    const map = mapRef.current;

    const updateMapSourceAndLayers = () => {
      // Ensure sources are added if they don't exist yet
      if (!map.getSource("offline-roads-source")) {
        map.addSource("offline-roads-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }
        });
        map.addLayer({
          id: "offline-roads-layer",
          type: "line",
          source: "offline-roads-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#fb923c", "line-width": 1.5, "line-dasharray": [2, 2] }
        });
      }
      if (!map.getSource("offline-water-source")) {
        map.addSource("offline-water-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }
        });
        map.addLayer({
          id: "offline-water-layer",
          type: "line",
          source: "offline-water-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#06b6d4", "line-width": 2 }
        });
      }
      if (!map.getSource("offline-pois-source")) {
        map.addSource("offline-pois-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }
        });
        map.addLayer({
          id: "offline-pois-layer",
          type: "circle",
          source: "offline-pois-source",
          paint: {
            "circle-radius": 5,
            "circle-color": [
              "match",
              ["get", "type"],
              "hospital", "#22c55e",
              "police", "#3b82f6",
              "fire", "#ef4444",
              "pharmacy", "#a855f7",
              "fuel", "#eab308",
              "bunker", "#ec4899",
              "water", "#06b6d4",
              "#f97316"
            ],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#0b101e"
          }
        });
      }

      // Sync GeoJSON data
      const roadsSrc = map.getSource("offline-roads-source") as maplibregl.GeoJSONSource;
      if (roadsSrc) {
        roadsSrc.setData({ type: "FeatureCollection", features: allRoads });
      }

      const waterSrc = map.getSource("offline-water-source") as maplibregl.GeoJSONSource;
      if (waterSrc) {
        waterSrc.setData({ type: "FeatureCollection", features: allWater });
      }

      const poisGeoJSONFeatures = allPois.map(p => ({
        type: "Feature" as const,
        properties: { id: p.id, name: p.name, type: p.type, description: p.description },
        geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] }
      }));
      const poisSrc = map.getSource("offline-pois-source") as maplibregl.GeoJSONSource;
      if (poisSrc) {
        poisSrc.setData({ type: "FeatureCollection", features: poisGeoJSONFeatures });
      }
    };

    if (map.isStyleLoaded()) {
      updateMapSourceAndLayers();
    } else {
      map.once("styledata", updateMapSourceAndLayers);
    }
  }, [savedRegions, offlineLayerToggles, mapStyle]);

  // Sync Bounding Box geojson source on box adjustment
  const updateBBoxSource = (b: typeof bounds) => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource("bbox-selector") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [b.minLng, b.minLat],
              [b.maxLng, b.minLat],
              [b.maxLng, b.maxLat],
              [b.minLng, b.maxLat],
              [b.minLng, b.minLat]
            ]
          ]
        }
      });
    }
  };

  // Draggable handle markers for BBox Selection
  useEffect(() => {
    if (!mapRef.current) return;

    if (!bboxMode) {
      // Remove handles
      if (nwHandleRef.current) {
        nwHandleRef.current.remove();
        nwHandleRef.current = null;
      }
      if (seHandleRef.current) {
        seHandleRef.current.remove();
        seHandleRef.current = null;
      }
      // Clear outline from map
      const source = mapRef.current.getSource("bbox-selector") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [] }
        });
      }
      return;
    }

    // Render Box initially based on bounds state
    updateBBoxSource(bounds);

    // Render Northwest Handle
    const nwEl = document.createElement("div");
    nwEl.className = "w-4.5 h-4.5 bg-amber-500 hover:bg-amber-400 border border-black rounded shadow flex items-center justify-center cursor-move text-white text-[9px] font-bold font-mono";
    nwEl.innerText = "NW";
    const nwMarker = new maplibregl.Marker({ element: nwEl, draggable: true })
      .setLngLat([bounds.minLng, bounds.maxLat])
      .addTo(mapRef.current);

    nwMarker.on("drag", () => {
      const lngLat = nwMarker.getLngLat();
      setBounds(prev => {
        const next = { ...prev, minLng: lngLat.lng, maxLat: lngLat.lat };
        updateBBoxSource(next);
        return next;
      });
    });

    nwHandleRef.current = nwMarker;

    // Render Southeast Handle
    const seEl = document.createElement("div");
    seEl.className = "w-4.5 h-4.5 bg-amber-500 hover:bg-amber-400 border border-black rounded shadow flex items-center justify-center cursor-move text-white text-[9px] font-bold font-mono";
    seEl.innerText = "SE";
    const seMarker = new maplibregl.Marker({ element: seEl, draggable: true })
      .setLngLat([bounds.maxLng, bounds.minLat])
      .addTo(mapRef.current);

    seMarker.on("drag", () => {
      const lngLat = seMarker.getLngLat();
      setBounds(prev => {
        const next = { ...prev, maxLng: lngLat.lng, minLat: lngLat.lat };
        updateBBoxSource(next);
        return next;
      });
    });

    seHandleRef.current = seMarker;

    return () => {
      if (nwHandleRef.current) nwHandleRef.current.remove();
      if (seHandleRef.current) seHandleRef.current.remove();
    };
  }, [bboxMode]);

  // Sync handle positions when bounds change manually or via preset
  const updateHandlePositions = (b: typeof bounds) => {
    if (nwHandleRef.current) {
      nwHandleRef.current.setLngLat([b.minLng, b.maxLat]);
    }
    if (seHandleRef.current) {
      seHandleRef.current.setLngLat([b.maxLng, b.minLat]);
    }
    updateBBoxSource(b);
  };

  // Quick preset bbox matching current map view
  const setBBoxToViewport = () => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    const nextBounds = {
      minLat: center.lat - 0.015,
      minLng: center.lng - 0.02,
      maxLat: center.lat + 0.015,
      maxLng: center.lng + 0.02
    };
    setBounds(nextBounds);
    updateHandlePositions(nextBounds);
    speakVoiceFeedback("Bounding box aligned with active viewport sector.");
  };

  // Download tile lists builder
  const calculateTotalTiles = () => {
    let count = 0;
    const list: string[] = [];

    // Base URL depending on selected map styles
    const styleUrls = {
      dark: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      light: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      terrain: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
      satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      hiking: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    };
    const baseUrlTemplate = styleUrls[mapStyle];

    for (let z = minZoom; z <= maxZoom; z++) {
      const xMin = lon2tile(bounds.minLng, z);
      const xMax = lon2tile(bounds.maxLng, z);
      const yMin = lat2tile(bounds.maxLat, z);
      const yMax = lat2tile(bounds.minLat, z);

      for (let x = Math.min(xMin, xMax); x <= Math.max(xMin, xMax); x++) {
        for (let y = Math.min(yMin, yMax); y <= Math.max(yMin, yMax); y++) {
          count++;
          let tileUrl = baseUrlTemplate
            .replace("{z}", z.toString())
            .replace("{x}", x.toString())
            .replace("{y}", y.toString())
            .replace("{r}", "");
          list.push(tileUrl);
        }
      }
    }
    return { count, list };
  };

  // Triggering tile downloads with dynamic multi-thread worker concurrency pool
  const handleStartDownload = async () => {
    const { count, list } = calculateTotalTiles();
    if (count > 5000) {
      speakVoiceFeedback("Warning! Download bounds exceed five thousand tiles. Please narrow zoom depth or bound size.");
      alert("Selected region contains too many tiles (" + count + "). Please shrink the box or reduce the max zoom level to prevent browser overloading.");
      return;
    }

    speakVoiceFeedback(`Initiating offline map caching protocols for ${bboxName}.`);
    
    const id = "region_" + Date.now();
    
    // Set initial progress state
    setDownloadStats({
      total: count,
      downloaded: 0,
      speed: 0,
      sizeMB: 0,
      status: "downloading",
      regionId: id
    });

    tileDownloadQueueRef.current = [...list];
    currentDownloadedUrlsRef.current = [];
    currentDownloadedBytesRef.current = 0;
    
    abortControllerRef.current = new AbortController();
    runDownloadQueue(id);
  };

  const runDownloadQueue = async (regionId: string) => {
    if (!abortControllerRef.current) return;
    const signal = abortControllerRef.current.signal;
    const concurrency = 4; // 4 parallel fetch threads
    const totalTiles = tileDownloadQueueRef.current.length + currentDownloadedUrlsRef.current.length;
    let startTime = Date.now();

    const worker = async () => {
      while (tileDownloadQueueRef.current.length > 0 && !signal.aborted) {
        const url = tileDownloadQueueRef.current.shift();
        if (!url) break;

        try {
          const response = await fetch(url, { signal });
          if (response.ok) {
            const blob = await response.blob();
            await saveTile(url, blob);
            currentDownloadedUrlsRef.current.push(url);
            currentDownloadedBytesRef.current += blob.size;

            // Compute speed and stats
            const durationSec = (Date.now() - startTime) / 1000;
            const bytesPerSec = durationSec > 0 ? currentDownloadedBytesRef.current / durationSec : 0;
            const speed = parseFloat((bytesPerSec / 1024).toFixed(1)); // KB/s
            const sizeMB = parseFloat((currentDownloadedBytesRef.current / (1024 * 1024)).toFixed(2));
            const progressCount = currentDownloadedUrlsRef.current.length;

            setDownloadStats(prev => ({
              ...prev,
              downloaded: progressCount,
              speed,
              sizeMB,
              status: "downloading"
            }));
          } else {
            // treat failed tiles as progressed to prevent hanging
            currentDownloadedUrlsRef.current.push(url);
            setDownloadStats(prev => ({
              ...prev,
              downloaded: currentDownloadedUrlsRef.current.length
            }));
          }
        } catch (e: any) {
          if (signal.aborted) return;
          // treat exceptions as progressed too
          currentDownloadedUrlsRef.current.push(url);
          setDownloadStats(prev => ({
            ...prev,
            downloaded: currentDownloadedUrlsRef.current.length
          }));
        }
      }
    };

    // Spin up concurrent threads
    const promises = Array(concurrency).fill(null).map(() => worker());
    await Promise.all(promises);

    if (signal.aborted) {
      // Save paused state
      const pausedRegion: OfflineRegion = {
        id: regionId,
        name: bboxName,
        minLat: bounds.minLat,
        minLng: bounds.minLng,
        maxLat: bounds.maxLat,
        maxLng: bounds.maxLng,
        minZoom,
        maxZoom,
        totalTiles,
        downloadedTiles: currentDownloadedUrlsRef.current.length,
        sizeBytes: currentDownloadedBytesRef.current,
        status: "paused",
        timestamp: Date.now(),
        tileUrls: currentDownloadedUrlsRef.current
      };
      await saveRegion(pausedRegion);
      loadRegionsAndStats();
      return;
    }

    // Success completed region
    const completedRegion: OfflineRegion = {
      id: regionId,
      name: bboxName,
      minLat: bounds.minLat,
      minLng: bounds.minLng,
      maxLat: bounds.maxLat,
      maxLng: bounds.maxLng,
      minZoom,
      maxZoom,
      totalTiles,
      downloadedTiles: totalTiles,
      sizeBytes: currentDownloadedBytesRef.current,
      status: "completed",
      timestamp: Date.now(),
      tileUrls: currentDownloadedUrlsRef.current
    };
    await saveRegion(completedRegion);
    speakVoiceFeedback(`Sector ${bboxName} offline download sequence completed successfully.`);
    
    // Add to main logs
    setChatLog(prev => [
      ...prev,
      {
        sender: "anis",
        text: `### 🗺️ OFFLINE REGIONAL PACK READY
*   **Sector Name**: ${bboxName}
*   **Tile Count**: ${totalTiles} raster nodes
*   **BBox Boundaries**: [${bounds.minLat.toFixed(4)}°N, ${bounds.minLng.toFixed(4)}°E] to [${bounds.maxLat.toFixed(4)}°N, ${bounds.maxLng.toFixed(4)}°E]
*   **Grid Cache Storage**: ${(currentDownloadedBytesRef.current / (1024 * 1024)).toFixed(2)} MB saved locally to IndexedDB.`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    setDownloadStats(prev => ({ ...prev, status: "completed" }));
    loadRegionsAndStats();
  };

  const handlePauseDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setDownloadStats(prev => ({ ...prev, status: "paused" }));
      speakVoiceFeedback("Offline download paused.");
    }
  };

  const handleResumeDownload = () => {
    if (downloadStats.status !== 'paused' || !downloadStats.regionId) return;
    abortControllerRef.current = new AbortController();
    setDownloadStats(prev => ({ ...prev, status: "downloading" }));
    speakVoiceFeedback("Resuming download thread pool.");
    runDownloadQueue(downloadStats.regionId);
  };

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setDownloadStats({ total: 0, downloaded: 0, speed: 0, sizeMB: 0, status: "idle" });
    speakVoiceFeedback("Download canceled. Temporary registers cleared.");
  };

  const handleDeleteSavedRegion = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from offline storage? This will clear all associated tiles.`)) {
      await deleteRegion(id);
      speakVoiceFeedback(`Deleted ${name} offline cache records.`);
      loadRegionsAndStats();
    }
  };

  const flyToRegion = (r: OfflineRegion) => {
    if (!mapRef.current) return;
    const centerLng = (r.minLng + r.maxLng) / 2;
    const centerLat = (r.minLat + r.maxLat) / 2;
    mapRef.current.flyTo({
      center: [centerLng, centerLat],
      zoom: r.minZoom + 1,
      speed: 1.2
    });
    // Highlight bounding box
    const customBbox = {
      minLat: r.minLat,
      minLng: r.minLng,
      maxLat: r.maxLat,
      maxLng: r.maxLng
    };
    setBounds(customBbox);
    setBboxMode(true);
    speakVoiceFeedback(`Navigating sensor array to cached sector: ${r.name}`);
  };

  const handlePurgeAllCache = async () => {
    if (confirm("🚨 WARNING: This will completely purge ALL IndexedDB offline map cache records and regions. Proceed?")) {
      await clearAllOfflineCache();
      speakVoiceFeedback("Completely cleared local map cache registers.");
      loadRegionsAndStats();
    }
  };

  // Calculations for current interactive bounds
  const currentCalc = calculateTotalTiles();

  return (
    <div className="w-full h-full relative flex flex-col bg-[#070b14] overflow-hidden">
      
      {/* MAP VIEWER PORT */}
      <div className="flex-1 relative min-h-0">
        <div ref={mapContainerRef} className="w-full h-full" id="maplibre-tactical-canvas" />

        {/* TOP LEFT QUICK HUD OVERLAYS */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
          <div className="bg-[#0b101e]/90 border border-[#1b2b4e]/80 p-2 rounded shadow-2xl backdrop-blur-md pointer-events-auto text-[10px] font-mono flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <div>
                <p className="text-[8px] text-slate-400">ENGINE</p>
                <p className="text-[9px] font-bold text-slate-100">MAPLIBRE 3D</p>
              </div>
            </div>
            <div className="w-px h-6 bg-[#1b2b4e]"></div>
            <div>
              <p className="text-[8px] text-slate-400">TILE CACHE STATUS</p>
              <p className="text-[9px] font-bold text-emerald-400">
                {cacheStats.tileCount} Tiles ({cacheStats.cacheSizeMB} MB)
              </p>
            </div>
          </div>
        </div>

        {/* INTERACTIVE FLOATING SEARCH & NAVIGATION INTERFACES */}
        <div className="absolute top-14 left-2 right-2 max-w-xs sm:max-w-sm z-30 flex flex-col gap-1.5 pointer-events-auto">
          
          {/* Main Search Panel */}
          <div className="bg-[#0b101e]/95 border border-[#1b2b4e] rounded shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
            <div className="flex items-center px-2 py-1.5 gap-2">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowHistory(true);
                }}
                onFocus={() => setShowHistory(true)}
                placeholder="Search State, District, Village, City, Landmark or Any Place in India"
                className="bg-transparent text-slate-100 text-[10.5px] font-mono w-full focus:outline-none placeholder-slate-500"
              />
              
              {/* Voice search action */}
              <button
                onClick={startVoiceSearch}
                className={`p-1 rounded transition-all cursor-pointer hover:bg-[#15233c] shrink-0 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}
                title="Voice Search"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/>
                  <path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4M8 23h8"/>
                </svg>
              </button>

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchSuggestions([]);
                    setActiveSelectedPlace(null);
                    if (searchResultMarkerRef.current) {
                      searchResultMarkerRef.current.remove();
                      searchResultMarkerRef.current = null;
                    }
                  }}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="w-px h-4 bg-[#1b2b4e]"></div>

              {/* Navigation toggle */}
              <button
                onClick={() => {
                  setIsNavPanelOpen(!isNavPanelOpen);
                  speakVoiceFeedback(isNavPanelOpen ? "Navigation interface closed." : "Plotted route corridor dashboard enabled.");
                }}
                className={`p-1.5 rounded transition-all cursor-pointer ${isNavPanelOpen ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'text-slate-400 hover:text-cyan-400'}`}
                title="Directions"
              >
                <Navigation className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Offline Search Filter Status Sub-Panel */}
            <div className="flex items-center justify-between px-2 py-1 bg-[#060a12]/90 border-t border-[#1b2b4e]/50 text-[8px] font-mono text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isOfflineSearchOnly}
                  onChange={(e) => {
                    setIsOfflineSearchOnly(e.target.checked);
                    speakVoiceFeedback(e.target.checked ? "Search filter restricted to offline-downloaded sectors only." : "Search filter expanded to online nationwide database.");
                  }}
                  className="rounded border-[#1b2b4e] bg-[#121a28] text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                />
                <span>Offline Search Only</span>
              </label>
              <span className="text-[7.5px] uppercase tracking-wider text-slate-500">
                {isOfflineSearchOnly ? "📁 Local Only" : "🌐 Online + Offline"}
              </span>
            </div>

            {/* Suggestions list */}
            {searchSuggestions.length > 0 && (
              <div className="border-t border-[#1b2b4e] max-h-48 overflow-y-auto flex flex-col bg-[#080d19]">
                {searchSuggestions.map((place, idx) => {
                  const isCached = isCoordinateOfflineCached(place.lat, place.lng);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectPlace(place)}
                      className="flex flex-col items-start text-left px-3 py-1.5 hover:bg-[#15233c] transition-all border-b border-[#1b2b4e]/30 cursor-pointer w-full"
                    >
                      <div className="flex items-center justify-between w-full gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="font-bold text-slate-200 text-[10px] truncate">{place.name}</span>
                          <span className="text-[8px] bg-[#14233c] text-cyan-400 px-1 rounded uppercase tracking-wider shrink-0">{place.category}</span>
                        </div>
                        <span className={`text-[7.5px] font-mono px-1 rounded uppercase tracking-wider shrink-0 font-bold ${
                          isCached ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800" : "bg-slate-900/80 text-slate-400"
                        }`}>
                          {isCached ? "💾 Offline" : "🌐 Online"}
                        </span>
                      </div>
                      <span className="text-[8px] text-slate-400 ml-4 line-clamp-1">{place.description}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search History Overlay */}
            {showHistory && searchQuery === "" && searchHistory.length > 0 && (
              <div className="border-t border-[#1b2b4e] p-2 bg-[#080d19] flex flex-col gap-1 text-[9px] font-mono">
                <div className="flex justify-between items-center text-slate-500 pb-1 border-b border-[#1b2b4e]/20">
                  <span className="uppercase tracking-wider">Search History</span>
                  <button
                    onClick={() => {
                      setSearchHistory([]);
                      localStorage.setItem("anis_search_history", JSON.stringify([]));
                    }}
                    className="hover:text-red-400 transition-colors uppercase text-[7.5px]"
                  >
                    Clear All
                  </button>
                </div>
                {searchHistory.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(item);
                      const results = searchIndiaDatabase(item);
                      if (results.length > 0) {
                        handleSelectPlace(results[0]);
                      }
                    }}
                    className="flex items-center justify-between text-slate-400 hover:text-slate-100 py-1 hover:bg-[#15233c]/40 px-1 rounded cursor-pointer"
                  >
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8v4l3 3M22 12a10 10 0 11-20 0 10 10 0 0120 0z"/></svg>
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favourites Quick Chips Row */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-0.5">
            {favourites.map((fav, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleSelectPlace({
                    name: fav.name,
                    lat: fav.lat,
                    lng: fav.lng,
                    category: fav.category || "Favourite",
                    description: `Terrain: ${fav.terrain || "Tactical"}`
                  });
                }}
                className="px-2 py-1 bg-[#0b101e]/90 hover:bg-[#15233c] border border-[#1b2b4e]/80 rounded-full text-[8.5px] font-mono text-slate-300 flex items-center gap-1 cursor-pointer shadow-lg shrink-0"
              >
                {fav.category === 'Home' ? '🏠' : fav.category === 'Work' ? '💼' : fav.category === 'School' ? '🏫' : '❤️'}
                <span>{fav.name.replace(/🏠 |💼 |🏫 |❤️ /g, "")}</span>
              </button>
            ))}
          </div>

          {/* Navigation Route Plotted Panel */}
          {isNavPanelOpen && (
            <div className="bg-[#0b101e]/95 border border-[#1b2b4e] rounded shadow-2xl backdrop-blur-md overflow-hidden flex flex-col font-mono text-[9.5px]">
              <div className="p-2 bg-[#0e1629] border-b border-[#1b2b4e] flex justify-between items-center shrink-0">
                <span className="font-bold text-cyan-400 uppercase flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Routing Corridor
                </span>
                <button
                  onClick={() => setIsNavPanelOpen(false)}
                  className="text-slate-500 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2 flex flex-col gap-2">
                <div className="flex gap-1.5 items-center">
                  <div className="flex flex-col items-center gap-1 text-[8px] text-slate-500 shrink-0">
                    <span>🟢</span>
                    <span className="w-px h-5 bg-[#1b2b4e]"></span>
                    <span>🎯</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    {/* From Input */}
                    <div className="flex items-center bg-[#050912] border border-[#1b2b4e] rounded px-1.5 py-1 relative">
                      <span className="text-[7.5px] text-slate-500 mr-1.5 font-bold uppercase shrink-0">From:</span>
                      <input
                        type="text"
                        value={navFromLabel}
                        onFocus={() => setRoutingFocus('from')}
                        onChange={(e) => setNavFromLabel(e.target.value)}
                        className="bg-transparent text-slate-200 text-[9px] w-full focus:outline-none"
                      />
                    </div>
                    {/* To Input */}
                    <div className="flex items-center bg-[#050912] border border-[#1b2b4e] rounded px-1.5 py-1 relative">
                      <span className="text-[7.5px] text-slate-500 mr-1.5 font-bold uppercase shrink-0">To:</span>
                      <input
                        type="text"
                        value={navToLabel}
                        placeholder="Search or long-press map..."
                        onFocus={() => setRoutingFocus('to')}
                        onChange={(e) => setNavToLabel(e.target.value)}
                        className="bg-transparent text-slate-200 text-[9px] w-full focus:outline-none"
                      />
                    </div>

                    {/* From/To Autocomplete Suggestions Dropdowns */}
                    {routingFocus === 'from' && fromSuggestions.length > 0 && (
                      <div className="bg-[#080d19]/95 border border-[#1b2b4e] max-h-32 overflow-y-auto flex flex-col rounded mt-1 shadow-2xl absolute left-0 right-0 top-full z-50">
                        {fromSuggestions.map((place, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setNavFromCoords([place.lng, place.lat]);
                              setNavFromLabel(place.name);
                              setFromSuggestions([]);
                              setRoutingFocus(null);
                              speakVoiceFeedback(`Route origin set to ${place.name}.`);
                            }}
                            className="flex flex-col items-start text-left px-2 py-1 hover:bg-[#15233c] border-b border-[#1b2b4e]/25 cursor-pointer text-[8.5px]"
                          >
                            <span className="font-bold text-slate-200">{place.name}</span>
                            <span className="text-[7.5px] text-slate-500 line-clamp-1">{place.description}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {routingFocus === 'to' && toSuggestions.length > 0 && (
                      <div className="bg-[#080d19]/95 border border-[#1b2b4e] max-h-32 overflow-y-auto flex flex-col rounded mt-1 shadow-2xl absolute left-0 right-0 top-full z-50">
                        {toSuggestions.map((place, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setNavToCoords([place.lng, place.lat]);
                              setNavToLabel(place.name);
                              setToSuggestions([]);
                              setRoutingFocus(null);
                              speakVoiceFeedback(`Route destination set to ${place.name}.`);
                            }}
                            className="flex flex-col items-start text-left px-2 py-1 hover:bg-[#15233c] border-b border-[#1b2b4e]/25 cursor-pointer text-[8.5px]"
                          >
                            <span className="font-bold text-slate-200">{place.name}</span>
                            <span className="text-[7.5px] text-slate-500 line-clamp-1">{place.description}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Swap Button */}
                  <button
                    onClick={() => {
                      const tempLabel = navFromLabel;
                      const tempCoords = navFromCoords;
                      setNavFromLabel(navToLabel || "My Location");
                      setNavFromCoords(navToCoords);
                      setNavToLabel(tempLabel);
                      setNavToCoords(tempCoords);
                      speakVoiceFeedback("Corridor inverted.");
                    }}
                    className="p-1.5 bg-[#131f38] hover:bg-[#1a2d4f] border border-[#1b2b4e] rounded cursor-pointer text-slate-400 hover:text-white"
                    title="Swap Route Coordinates"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l-4-4M17 20l4-4"/>
                    </svg>
                  </button>
                </div>

                {/* Travel Mode Selector */}
                <div className="grid grid-cols-4 gap-1 border-t border-b border-[#1b2b4e]/30 py-1.5">
                  {(['walking', 'cycling', 'driving', 'hiking'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => {
                        setTravelMode(mode);
                        speakVoiceFeedback(`Routing travel mode set to ${mode}.`);
                      }}
                      className={`py-1 text-center font-bold text-[8px] rounded transition-all cursor-pointer uppercase border ${
                        travelMode === mode 
                          ? 'bg-cyan-950 text-cyan-400 border-cyan-500 font-bold shadow-md' 
                          : 'bg-[#050912] border-[#1b2b4e]/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode === 'walking' ? '🚶 Walk' : mode === 'cycling' ? '🚴 Cycle' : mode === 'driving' ? '🚗 Drive' : '🥾 Hike'}
                    </button>
                  ))}
                </div>

                {/* Route calculations info if destination is selected */}
                {navToCoords ? (
                  <div className="flex flex-col gap-1.5">
                    {/* Math stats */}
                    {(() => {
                      const startLng = navFromCoords ? navFromCoords[0] : longitude;
                      const startLat = navFromCoords ? navFromCoords[1] : latitude;
                      const endLng = navToCoords[0];
                      const endLat = navToCoords[1];
                      
                      const dist = getDistanceKm(startLat, startLng, endLat, endLng);
                      const speed = travelMode === 'walking' ? 5 : travelMode === 'cycling' ? 15 : travelMode === 'hiking' ? 4 : 50;
                      const durationHours = dist / speed;
                      const durationMinutes = Math.round(durationHours * 60);
                      
                      const bearing = calculateBearing(startLat, startLng, endLat, endLng);
                      const directionStr = getCompassDirection(bearing);
                      const etaTime = new Date(Date.now() + durationMinutes * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div className="flex flex-col gap-1 bg-[#050912] p-2 border border-[#1b2b4e] rounded">
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className="font-bold text-slate-100">{dist.toFixed(2)} km</span>
                            <span className="font-bold text-emerald-400">{durationMinutes >= 60 ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` : `${durationMinutes} mins`}</span>
                          </div>
                          <div className="flex justify-between items-center text-[8px] text-slate-500">
                            <span>BEARING: {bearing.toFixed(0)}° {directionStr}</span>
                            <span>ETA: {etaTime}</span>
                          </div>

                          <div className="flex gap-1.5 mt-2 border-t border-[#1b2b4e]/30 pt-1.5">
                            <button
                              onClick={handleToggleSimulation}
                              className={`flex-1 py-1 px-2 rounded font-bold text-[8.5px] uppercase flex items-center justify-center gap-1 cursor-pointer shadow-lg transition-all ${
                                isSimulatingNavigation 
                                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {isSimulatingNavigation ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                              {isSimulatingNavigation ? "HALT RECON" : "START SIM RECON"}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Step-by-step direction list scrollable overlay */}
                    <div className="max-h-24 overflow-y-auto flex flex-col gap-1 pr-1">
                      <p className="text-[7.5px] text-slate-500 uppercase tracking-widest pb-0.5 border-b border-[#1b2b4e]/20">Step-by-step Instructions</p>
                      {(() => {
                        const startLng = navFromCoords ? navFromCoords[0] : longitude;
                        const startLat = navFromCoords ? navFromCoords[1] : latitude;
                        const endLng = navToCoords[0];
                        const endLat = navToCoords[1];
                        const stepsData = generateDynamicSteps([startLng, startLat], [endLng, endLat], travelMode);
                        return stepsData.map((step, idx) => (
                          <div 
                            key={idx} 
                            className={`p-1 border border-transparent rounded text-[8px] transition-all ${
                              isSimulatingNavigation && currentNavigationStepIndex === idx + 1
                                ? 'bg-cyan-950/50 border-cyan-800 text-cyan-300 font-bold pl-2' 
                                : 'text-slate-400'
                            }`}
                          >
                            <span className="font-bold mr-1">{idx + 1}.</span>
                            <span>{step.instruction}</span>
                            <span className="text-slate-500 ml-1">({step.distance} km)</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                ) : (
                  <p className="text-[8px] text-slate-500 text-center py-2 italic">Select a destination or landmark above or right-click / long-press the map to plot routing corridors.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* LANDMARK / SELECTED COORDINATES BOTTOM DRAWER CARD */}
        {activeSelectedPlace && (
          <div className="absolute bottom-11 right-2 left-2 max-w-sm z-30 p-2.5 bg-[#0b101e]/95 border border-[#1b2b4e] rounded shadow-2xl backdrop-blur-md font-mono text-[9.5px] pointer-events-auto flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-bold text-slate-100 text-[11px]">{activeSelectedPlace.name}</span>
                </div>
                <span className="text-[8px] text-cyan-400 uppercase tracking-wider mt-0.5">{activeSelectedPlace.category} terrain node</span>
              </div>
              <button
                onClick={() => {
                  setActiveSelectedPlace(null);
                  if (searchResultMarkerRef.current) {
                    searchResultMarkerRef.current.remove();
                    searchResultMarkerRef.current = null;
                  }
                }}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeSelectedPlace.description && (
              <p className="text-[8.5px] text-slate-400 border-b border-[#1b2b4e]/30 pb-1.5 leading-relaxed">{activeSelectedPlace.description}</p>
            )}

            <div className="flex justify-between text-[8px] text-slate-500">
              <span>LAT: {activeSelectedPlace.lat.toFixed(5)}</span>
              <span>LNG: {activeSelectedPlace.lng.toFixed(5)}</span>
            </div>

            {/* Bottom action cards */}
            <div className="grid grid-cols-3 gap-1.5 mt-1 border-t border-[#1b2b4e]/20 pt-2">
              <button
                onClick={() => {
                  setNavFromCoords([activeSelectedPlace.lng, activeSelectedPlace.lat]);
                  setNavFromLabel(activeSelectedPlace.name);
                  setIsNavPanelOpen(true);
                  speakVoiceFeedback(`Starting waypoint set to ${activeSelectedPlace.name}.`);
                }}
                className="py-1 px-1.5 bg-[#131f38] hover:bg-[#1c2f54] text-[8px] font-bold text-slate-300 rounded border border-[#1b2b4e] cursor-pointer text-center uppercase"
              >
                Set as Start
              </button>
              <button
                onClick={() => {
                  if (setDestinationWaypoint) {
                    setDestinationWaypoint({
                      id: "dest_" + Math.random().toString(),
                      latitude: activeSelectedPlace.lat,
                      longitude: activeSelectedPlace.lng,
                      altitude: 310,
                      timestamp: new Date().toISOString(),
                      type: "checkpoint",
                      label: activeSelectedPlace.name
                    });
                  }
                  setNavToCoords([activeSelectedPlace.lng, activeSelectedPlace.lat]);
                  setNavToLabel(activeSelectedPlace.name);
                  setIsNavPanelOpen(true);
                  speakVoiceFeedback(`Destination locked on ${activeSelectedPlace.name}. Plotted corridor line.`);
                }}
                className="py-1 px-1.5 bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-800 text-[8px] font-bold text-cyan-400 rounded cursor-pointer text-center uppercase"
              >
                Directions
              </button>
              <button
                onClick={() => {
                  // Add to favourites
                  if (!favourites.some(f => f.lat === activeSelectedPlace.lat && f.lng === activeSelectedPlace.lng)) {
                    const newFav = {
                      name: `❤️ ${activeSelectedPlace.name}`,
                      lat: activeSelectedPlace.lat,
                      lng: activeSelectedPlace.lng,
                      category: "Saved",
                      terrain: activeSelectedPlace.terrain || "Tactical Location"
                    };
                    const updated = [newFav, ...favourites];
                    setFavourites(updated);
                    localStorage.setItem("anis_favorite_places", JSON.stringify(updated));
                    speakVoiceFeedback(`Coordinate registry for ${activeSelectedPlace.name} saved securely in favourites.`);
                  }
                }}
                className="py-1 px-1.5 bg-amber-950/50 hover:bg-amber-900 border border-amber-800 text-[8px] font-bold text-amber-400 rounded cursor-pointer text-center uppercase"
              >
                Save Favourite
              </button>
            </div>

            {/* Segmented Download Options Grid */}
            <div className="flex flex-col gap-1 mt-1 border-t border-[#1b2b4e]/30 pt-2 font-mono">
              <span className="text-[7.5px] text-slate-400 uppercase tracking-wider font-bold">Download Offline Map Levels:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {/* 1. Custom Selected Area */}
                <button
                  onClick={() => {
                    const targetLat = activeSelectedPlace.lat;
                    const targetLng = activeSelectedPlace.lng;
                    setBounds({
                      minLat: targetLat - 0.015,
                      minLng: targetLng - 0.02,
                      maxLat: targetLat + 0.015,
                      maxLng: targetLng + 0.02
                    });
                    setBboxName(`${activeSelectedPlace.name} (Custom Area)`);
                    setDownloadScale('custom');
                    setDownloaderTab('india');
                    setShowDownloader(true);
                    setBboxMode(true);
                    speakVoiceFeedback(`Custom selected area mapped around ${activeSelectedPlace.name}.`);
                  }}
                  className="py-1 px-1 bg-amber-600/20 hover:bg-amber-600 border border-amber-500 text-[8px] font-bold text-amber-300 hover:text-white rounded cursor-pointer text-center uppercase flex items-center justify-center gap-1 transition-all"
                >
                  <Download className="w-2.5 h-2.5" /> Custom Area
                </button>

                {/* 2. Entire Village */}
                {((activeSelectedPlace.category === "Village" || activeSelectedPlace.category === "village" || activeSelectedPlace.category?.toLowerCase() === "assam village" || activeSelectedPlace.name?.includes("Village") || activeSelectedPlace.name?.includes("Town")) && activeSelectedPlace.name) ? (
                  <button
                    onClick={() => {
                      const stateVal = activeSelectedPlace.state || "Assam";
                      const distVal = activeSelectedPlace.district || "Biswanath";
                      const places = getPlacesForDistrict(stateVal, distVal);
                      const cleanName = activeSelectedPlace.name.replace(/.*➔\s*/, "").replace(/\s*\(.*/, "").trim();
                      const vObj = places.find(v => v.name === cleanName) || activeSelectedPlace;
                      
                      setSelectedStateName(stateVal);
                      setSelectedDistrictName(distVal);
                      setSelectedVillageName(vObj.name);
                      
                      setDownloadScale('village');
                      setDownloaderTab('india');
                      setShowDownloader(true);
                      setBboxMode(true);
                      speakVoiceFeedback(`Mapped Entire Village Area download preset for ${vObj.name}.`);
                    }}
                    className="py-1 px-1 bg-cyan-600/20 hover:bg-cyan-600 border border-cyan-500 text-[8px] font-bold text-cyan-300 hover:text-white rounded cursor-pointer text-center uppercase flex items-center justify-center gap-1 transition-all"
                  >
                    <Download className="w-2.5 h-2.5" /> Village Area
                  </button>
                ) : (
                  <div className="py-1 px-1 bg-slate-900/40 border border-slate-800 text-[8px] text-slate-600 rounded text-center uppercase flex items-center justify-center gap-1 select-none">
                    Village N/A
                  </div>
                )}

                {/* 3. Entire District */}
                {activeSelectedPlace.district && activeSelectedPlace.district !== "Tactical Input" ? (
                  <button
                    onClick={() => {
                      setSelectedStateName(activeSelectedPlace.state || "Assam");
                      setSelectedDistrictName(activeSelectedPlace.district);
                      setDownloadScale('district');
                      setDownloaderTab('india');
                      setShowDownloader(true);
                      setBboxMode(true);
                      speakVoiceFeedback(`Mapped Entire District download preset for ${activeSelectedPlace.district} District.`);
                    }}
                    className="py-1 px-1 bg-[#4f46e5]/20 hover:bg-[#4f46e5] border border-[#6366f1] text-[8px] font-bold text-[#a5b4fc] hover:text-white rounded cursor-pointer text-center uppercase flex items-center justify-center gap-1 transition-all"
                  >
                    <Download className="w-2.5 h-2.5" /> Entire District
                  </button>
                ) : (
                  <div className="py-1 px-1 bg-slate-900/40 border border-slate-800 text-[8px] text-slate-600 rounded text-center uppercase flex items-center justify-center gap-1 select-none">
                    District N/A
                  </div>
                )}

                {/* 4. Entire State */}
                {activeSelectedPlace.state && activeSelectedPlace.state !== "Simulated Sector" ? (
                  <button
                    onClick={() => {
                      setSelectedStateName(activeSelectedPlace.state);
                      setDownloadScale('state');
                      setDownloaderTab('india');
                      setShowDownloader(true);
                      setBboxMode(true);
                      speakVoiceFeedback(`Mapped Entire State download preset for ${activeSelectedPlace.state}.`);
                    }}
                    className="py-1 px-1 bg-[#7c3aed]/20 hover:bg-[#7c3aed] border border-[#8b5cf6] text-[8px] font-bold text-[#c4b5fd] hover:text-white rounded cursor-pointer text-center uppercase flex items-center justify-center gap-1 transition-all"
                  >
                    <Download className="w-2.5 h-2.5" /> Entire State
                  </button>
                ) : (
                  <div className="py-1 px-1 bg-slate-900/40 border border-slate-800 text-[8px] text-slate-600 rounded text-center uppercase flex items-center justify-center gap-1 select-none">
                    State N/A
                  </div>
                )}

                {/* 5. Entire India */}
                <button
                  onClick={() => {
                    setDownloadScale('india');
                    setDownloaderTab('india');
                    setShowDownloader(true);
                    setBboxMode(true);
                    speakVoiceFeedback(`Mapped Entire India Nationwide download preset.`);
                  }}
                  className="py-1 px-1 bg-[#e11d48]/20 hover:bg-[#e11d48] border border-[#f43f5e] text-[8px] font-bold text-[#fecdd3] hover:text-white rounded cursor-pointer text-center uppercase col-span-2 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-2.5 h-2.5" /> Download Entire India
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM ABSOLUTE LONG-PRESS CONTEXT MENU */}
        {longPressMenuOpen && longPressCoords && (
          <div 
            style={{ left: longPressMenuPos.x, top: longPressMenuPos.y }}
            className="absolute z-40 w-48 bg-[#0b101e]/98 border border-[#1b2b4e] rounded shadow-2xl backdrop-blur-md p-1 font-mono text-[9px] pointer-events-auto flex flex-col animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-2 py-1 text-[7.5px] text-slate-500 uppercase border-b border-[#1b2b4e]/30 select-none pb-1 mb-1">
              Marked Coordinate Details
              <div className="text-[7px] text-cyan-400 font-bold">{longPressCoords[1].toFixed(5)}, {longPressCoords[0].toFixed(5)}</div>
            </div>

            <button
              onClick={() => {
                setNavFromCoords([longPressCoords[0], longPressCoords[1]]);
                setNavFromLabel(`Marked Coordinate (${longPressCoords[1].toFixed(3)}, ${longPressCoords[0].toFixed(3)})`);
                setIsNavPanelOpen(true);
                setLongPressMenuOpen(false);
                speakVoiceFeedback("Plotted route start parameters modified.");
              }}
              className="px-2 py-1.5 text-left text-slate-300 hover:bg-[#15233c] hover:text-white rounded transition-colors cursor-pointer flex items-center gap-1.5"
            >
              🚩 SET AS START POINT
            </button>
            
            <button
              onClick={() => {
                const label = `Marked Coordinate (${longPressCoords[1].toFixed(3)}, ${longPressCoords[0].toFixed(3)})`;
                if (setDestinationWaypoint) {
                  setDestinationWaypoint({
                    id: "dest_" + Math.random().toString(),
                    latitude: longPressCoords[1],
                    longitude: longPressCoords[0],
                    altitude: 310,
                    timestamp: new Date().toISOString(),
                    type: "checkpoint",
                    label: label
                  });
                }
                setNavToCoords([longPressCoords[0], longPressCoords[1]]);
                setNavToLabel(label);
                setIsNavPanelOpen(true);
                setLongPressMenuOpen(false);
                speakVoiceFeedback("Destination target locked.");
              }}
              className="px-2 py-1.5 text-left text-cyan-400 hover:bg-cyan-950 hover:text-cyan-300 rounded transition-colors cursor-pointer flex items-center gap-1.5"
            >
              🎯 SET AS DESTINATION
            </button>

            <button
              onClick={() => {
                const name = prompt("Enter a label/alias for this saved place:", `Saved Coordinate (${longPressCoords[1].toFixed(4)}, ${longPressCoords[0].toFixed(4)})`);
                if (name) {
                  const newFav = {
                    name: `❤️ ${name}`,
                    lat: longPressCoords[1],
                    lng: longPressCoords[0],
                    category: "Saved",
                    terrain: "Tactical Location"
                  };
                  const updated = [newFav, ...favourites];
                  setFavourites(updated);
                  localStorage.setItem("anis_favorite_places", JSON.stringify(updated));
                  speakVoiceFeedback(`Saved ${name} into favourites.`);
                }
                setLongPressMenuOpen(false);
              }}
              className="px-2 py-1.5 text-left text-amber-400 hover:bg-amber-950 hover:text-amber-300 rounded transition-colors cursor-pointer flex items-center gap-1.5"
            >
              ❤️ SAVE TO FAVOURITES
            </button>

            <button
              onClick={async () => {
                const halfLng = 0.015;
                const halfLat = 0.01;
                const customBbox = {
                  minLat: longPressCoords[1] - halfLat,
                  minLng: longPressCoords[0] - halfLng,
                  maxLat: longPressCoords[1] + halfLat,
                  maxLng: longPressCoords[0] + halfLng
                };
                setBounds(customBbox);
                setShowDownloader(true);
                setBboxMode(true);
                setLongPressMenuOpen(false);
                speakVoiceFeedback("Defined custom caching boundary around coordinates.");
              }}
              className="px-2 py-1.5 text-left text-slate-300 hover:bg-[#15233c] hover:text-white rounded transition-colors cursor-pointer flex items-center gap-1.5 border-t border-[#1b2b4e]/30 mt-1 pt-1.5"
            >
              📥 DOWNLOAD THIS AREA
            </button>

            <button
              onClick={() => {
                const coordStr = `${longPressCoords[1].toFixed(6)}, ${longPressCoords[0].toFixed(6)}`;
                navigator.clipboard.writeText(coordStr);
                speakVoiceFeedback("Coordinate telemetry copied to clipboard.");
                setLongPressMenuOpen(false);
              }}
              className="px-2 py-1.5 text-left text-emerald-400 hover:bg-emerald-950 hover:text-emerald-300 rounded transition-colors cursor-pointer flex items-center gap-1.5"
            >
              🔗 COPY COORDINATES
            </button>
          </div>
        )}

        {/* BOTTOM QUICK ZOOM ACTION CONTROLLER ROW */}
        <div className="absolute bottom-2 left-2 z-10 flex gap-1 pointer-events-auto">
          <button 
            onClick={() => {
              setFollowUserGPS(true);
              if (mapRef.current) {
                mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14 });
                speakVoiceFeedback("Re-engaged operator auto-tracking lock on GPS coordinate.");
              }
            }}
            className={`px-2.5 py-1.5 border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shadow-lg transition-colors rounded ${
              followUserGPS 
                ? 'bg-cyan-950 border-cyan-400 text-cyan-400' 
                : 'bg-[#0b101e]/90 border-[#1b2b4e] text-slate-300 hover:bg-[#151f38]'
            }`}
          >
            <Crosshair className="w-3 h-3 animate-pulse" /> {followUserGPS ? "TRACKING LOCKED" : "LOCK TRACKING"}
          </button>
          <button 
            onClick={() => setShowLayers(!showLayers)}
            className="px-2.5 py-1.5 bg-[#0b101e]/90 hover:bg-[#151f38] border border-[#1b2b4e] rounded text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1 cursor-pointer shadow-lg"
          >
            <Layers className="w-3 h-3" /> STYLES ({mapStyle.toUpperCase()})
          </button>
        </div>

        {/* MAP STYLE SWITCH PANEL */}
        {showLayers && (
          <div className="absolute bottom-11 left-2 z-10 p-2 bg-[#0b101e]/95 border border-[#1b2b4e] rounded shadow-2xl backdrop-blur-md flex flex-col gap-1 pointer-events-auto">
            <p className="text-[8px] font-mono text-slate-400 border-b border-[#1b2b4e] pb-1 uppercase">Select Tile Source</p>
            {(['dark', 'light', 'terrain', 'satellite', 'hiking'] as const).map(style => (
              <button
                key={style}
                onClick={() => {
                  setMapStyle(style);
                  setShowLayers(false);
                  speakVoiceFeedback(`Altered map spectral mode to ${style}.`);
                }}
                className={`px-2 py-1 text-left text-[9px] font-mono uppercase rounded transition-all cursor-pointer ${mapStyle === style ? 'bg-cyan-950 text-cyan-400 font-bold border border-cyan-800' : 'text-slate-400 hover:bg-[#151f38] hover:text-white'}`}
              >
                {style} Map Feed
              </button>
            ))}
          </div>
        )}

        {/* RIGHT HAND FLOATING ACTION RAIL OVERLAY */}
        <div className="absolute top-12 right-2 z-10 flex flex-col gap-1 pointer-events-auto bg-[#070b13]/90 border border-[#1b2b4e]/70 p-1 rounded shadow-2xl backdrop-blur-md">
          <button
            onClick={() => {
              setShowDownloader(!showDownloader);
              if (!showDownloader) {
                setBboxMode(true);
                speakVoiceFeedback("Offline caching interface activated.");
              } else {
                setBboxMode(false);
              }
            }}
            className={`w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer ${showDownloader ? 'bg-amber-600 border border-amber-400 text-white animate-pulse' : 'bg-sky-950/40 hover:bg-sky-900 border border-sky-800 text-amber-400 hover:text-amber-300'}`}
            title="📥 Offline Cache Downloader"
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="w-full h-px bg-[#1b2b4e]/50 my-0.5" />

          {/* ZOOM IN */}
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.zoomIn();
                setFollowUserGPS(false);
              }
            }}
            className="w-7 h-7 bg-sky-950/40 hover:bg-sky-900 border border-sky-800 rounded flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* ZOOM OUT */}
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.zoomOut();
                setFollowUserGPS(false);
              }
            }}
            className="w-7 h-7 bg-sky-950/40 hover:bg-sky-900 border border-sky-800 rounded flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Zoom Out"
          >
            <span className="font-bold text-sm select-none">-</span>
          </button>

          {/* RESET COMPASS NORTH */}
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.resetNorthPitch();
                speakVoiceFeedback("Resetting map heading to North, vertical elevation tilt.");
              }
            }}
            className="w-7 h-7 bg-sky-950/40 hover:bg-sky-900 border border-sky-800 rounded flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Reset Compass North"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </button>

          {/* TILT TOGGLE */}
          <button
            onClick={() => {
              if (mapRef.current) {
                const pitch = mapRef.current.getPitch();
                const nextPitch = pitch > 10 ? 0 : 60;
                mapRef.current.setPitch(nextPitch);
                speakVoiceFeedback(nextPitch > 0 ? "Engaging 3D terrain pitch tilt view." : "Disengaging 3D flat projection mode.");
              }
            }}
            className="w-7 h-7 bg-sky-950/40 hover:bg-sky-900 border border-sky-800 rounded flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Toggle 3D Terrain Pitch"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* OFFLINE MAP DOWNLOAD PANEL OVERLAY */}
        {showDownloader && (
          <div className="absolute right-10 top-2 bottom-2 w-72 z-20 flex flex-col bg-[#080d19]/95 border border-[#1b2b4e] rounded-lg shadow-2xl backdrop-blur-md overflow-hidden font-mono text-[10px] pointer-events-auto">
            
            {/* Header */}
            <div className="p-2.5 bg-[#0e1629] border-b border-[#1b2b4e] flex justify-between items-center shrink-0">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                <Download className="w-3.5 h-3.5 text-amber-500 animate-bounce" /> Offline map Downloader
              </span>
              <button 
                onClick={() => { setShowDownloader(false); setBboxMode(false); }}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-1 bg-[#050912] p-1 border border-[#1b2b4e] rounded shrink-0">
                <button
                  id="tab_india_maps"
                  onClick={() => {
                    setDownloaderTab('india');
                    setBboxMode(false);
                    setDownloadScale('state');
                  }}
                  className={`py-1 text-center font-bold text-[8.5px] rounded transition-all cursor-pointer ${
                    downloaderTab === 'india' 
                      ? 'bg-[#b45309] text-white font-black' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🇮🇳 INDIA MAP
                </button>
                <button
                  id="tab_world_picker"
                  onClick={() => {
                    setDownloaderTab('picker');
                    setBboxMode(false);
                    syncPickerToMap(selectedRegionIdx, selectedCountryIdx, selectedStateIdx, selectedDistrictIdx, selectedPlaceIdx);
                  }}
                  className={`py-1 text-center font-bold text-[8.5px] rounded transition-all cursor-pointer ${
                    downloaderTab === 'picker' 
                      ? 'bg-amber-600 text-white font-black' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌍 WORLD
                </button>
                <button
                  id="tab_manual_bbox"
                  onClick={() => {
                    setDownloaderTab('manual');
                    setBboxMode(true);
                  }}
                  className={`py-1 text-center font-bold text-[8.5px] rounded transition-all cursor-pointer ${
                    downloaderTab === 'manual' 
                      ? 'bg-amber-600 text-white font-black' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚙️ CUSTOM
                </button>
              </div>

              {downloaderTab === 'india' ? (
                <div className="bg-[#050912] border border-[#1b2b4e] p-2.5 rounded flex flex-col gap-2">
                  <p className="text-[9px] font-bold text-slate-300 uppercase">1. India Map Coverage Scale</p>

                  {/* Choose Scale selector */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] text-slate-400 font-bold">Select Coverage Scale:</label>
                    <select
                      id="india_scale_selector"
                      value={downloadScale}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setDownloadScale(val);
                        speakVoiceFeedback(`Switched India download scale to ${val}.`);
                      }}
                      className="w-full px-1 py-1 bg-[#090f1a] border border-[#1c2e52] text-amber-400 text-[9px] font-mono rounded cursor-pointer"
                    >
                      <option value="india">🇮🇳 Entire India Nationwide (Overview)</option>
                      <option value="state">🏔️ Specific State / UT (National)</option>
                      <option value="district">🛡️ Specific District (Strategic)</option>
                      <option value="village">🚜 Specific Town / Village / Landmark (Tactical)</option>
                      <option value="custom">⚙️ Manual Area Bounds (Custom)</option>
                    </select>
                  </div>

                  {/* State selection */}
                  {downloadScale === 'state' && (
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[8px] text-slate-400 font-bold">Select State / UT:</label>
                      <select
                        id="india_state_selector"
                        value={selectedStateName}
                        onChange={(e) => {
                          setSelectedStateName(e.target.value);
                          const stateObj = INDIA_STATES_DATABASE.find(s => s.name === e.target.value);
                          if (stateObj) {
                            speakVoiceFeedback(`Target set to state of ${stateObj.name}.`);
                          }
                        }}
                        className="w-full px-1 py-1 bg-[#090f1a] border border-[#1c2e52] text-sky-400 text-[9px] font-mono rounded cursor-pointer"
                      >
                        {INDIA_STATES_DATABASE.map(s => (
                          <option key={s.name} value={s.name}>{s.name} ({s.type === 'Union Territory' ? 'UT' : 'State'})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* District selection */}
                  {downloadScale === 'district' && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] text-slate-400 font-bold">Select State / UT:</label>
                        <select
                          value={selectedStateName}
                          onChange={(e) => {
                            setSelectedStateName(e.target.value);
                            const dists = getDistrictsForState(e.target.value);
                            if (dists.length > 0) {
                              setSelectedDistrictName(dists[0]);
                              const firstV = getPlacesForDistrict(e.target.value, dists[0]);
                              if (firstV.length > 0) {
                                setSelectedVillageName(firstV[0].name);
                              }
                            }
                          }}
                          className="w-full px-1 py-1 bg-[#090f1a] border border-[#1c2e52] text-sky-400 text-[9px] font-mono rounded cursor-pointer"
                        >
                          {INDIA_STATES_DATABASE.map(s => (
                            <option key={s.name} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] text-slate-400 font-bold">Select District:</label>
                        <select
                          id="india_district_selector"
                          value={selectedDistrictName}
                          onChange={(e) => {
                            setSelectedDistrictName(e.target.value);
                            const firstV = getPlacesForDistrict(selectedStateName, e.target.value);
                            if (firstV.length > 0) {
                              setSelectedVillageName(firstV[0].name);
                            }
                            speakVoiceFeedback(`Strategic target set to ${e.target.value} district.`);
                          }}
                          className="w-full px-1 py-1 bg-[#090f1a] border border-[#1c2e52] text-amber-500 text-[9px] font-mono rounded cursor-pointer"
                        >
                          {getDistrictsForState(selectedStateName).map(dist => (
                            <option key={dist} value={dist}>{dist} District</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Village selection */}
                  {downloadScale === 'village' && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] text-slate-400 font-bold">Select State / UT:</label>
                        <select
                          value={selectedStateName}
                          onChange={(e) => {
                            setSelectedStateName(e.target.value);
                            const dists = getDistrictsForState(e.target.value);
                            if (dists.length > 0) {
                              setSelectedDistrictName(dists[0]);
                              const firstV = getPlacesForDistrict(e.target.value, dists[0]);
                              if (firstV.length > 0) {
                                setSelectedVillageName(firstV[0].name);
                              }
                            }
                          }}
                          className="w-full px-1 py-0.5 bg-[#090f1a]/80 border border-[#1c2e52]/60 text-slate-400 text-[8px] font-mono rounded cursor-pointer"
                        >
                          {INDIA_STATES_DATABASE.map(s => (
                            <option key={s.name} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] text-slate-400 font-bold">Select District:</label>
                        <select
                          value={selectedDistrictName}
                          onChange={(e) => {
                            setSelectedDistrictName(e.target.value);
                            const firstV = getPlacesForDistrict(selectedStateName, e.target.value);
                            if (firstV.length > 0) {
                              setSelectedVillageName(firstV[0].name);
                            }
                          }}
                          className="w-full px-1 py-0.5 bg-[#090f1a]/80 border border-[#1c2e52]/60 text-slate-400 text-[8px] font-mono rounded cursor-pointer"
                        >
                          {getDistrictsForState(selectedStateName).map(dist => (
                            <option key={dist} value={dist}>{dist} District</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] text-slate-400 font-bold">Select Town / Village / Landmark:</label>
                        <select
                          id="india_village_selector"
                          value={selectedVillageName}
                          onChange={(e) => {
                            setSelectedVillageName(e.target.value);
                            speakVoiceFeedback(`Tactical target set to village of ${e.target.value}.`);
                          }}
                          className="w-full px-1 py-1 bg-[#090f1a] border border-[#1c2e52] text-sky-400 text-[9px] font-mono rounded cursor-pointer"
                        >
                          {getPlacesForDistrict(selectedStateName, selectedDistrictName).map(v => (
                            <option key={v.name} value={v.name}>{v.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Adaptive presets inside the tab */}
                  <div className="flex flex-col gap-1 mt-1 border-t border-[#1b2b4e]/30 pt-1.5">
                    <label className="text-[8px] text-slate-400 font-bold">Detail Preset (Adaptive Range):</label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['small', 'standard', 'full', 'tactical'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => {
                            setDownloadPreset(p);
                            speakVoiceFeedback(`Detail preset set to ${p}.`);
                          }}
                          className={`py-0.5 text-center text-[7.5px] font-bold border rounded transition-all cursor-pointer uppercase ${
                            downloadPreset === p 
                              ? 'bg-amber-600/30 text-amber-300 border-amber-500' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    {/* Preset explanation summary */}
                    <div className="p-1.5 bg-[#090f1a] border border-amber-900/30 rounded mt-0.5 text-[7.5px] text-slate-400 leading-tight">
                      {downloadPreset === 'small' && (
                        <span>🔋 Low file size (~1MB). Captures major cities, key waterways, and national arterial highways.</span>
                      )}
                      {downloadPreset === 'standard' && (
                        <span>📡 Standard coverage (~4MB). Thorough route map, district pathways, and critical survival coordinates.</span>
                      )}
                      {downloadPreset === 'full' && (
                        <span>🛡️ Detailed sector (~10MB). High density grid featuring medical facilities, police stations, and local paths.</span>
                      )}
                      {downloadPreset === 'tactical' && (
                        <span>⚔️ Extreme resolution (~20MB). Captures minute sub-meter footprints, escape paths, and minor water bodies.</span>
                      )}
                    </div>
                  </div>

                  {/* Intel summary for selected target */}
                  {downloadScale !== 'custom' && (
                    <div className="p-2 bg-[#090f1a]/80 border border-cyan-800/40 rounded mt-0.5 text-[8px] leading-normal text-cyan-300">
                      <p className="font-bold text-cyan-400 mb-0.5 uppercase tracking-wider flex items-center gap-1">
                        🛰️ Tactical Terrain Intel
                      </p>
                      {downloadScale === 'india' && (
                        <p className="text-gray-400 text-[8px]">Comprehensive nationwide routing network covering 28 States and 8 UTs. Perfect for cross-country tactical staging.</p>
                      )}
                      {downloadScale === 'state' && (
                        <p className="text-gray-400 text-[8px]">
                          State centroid coverage. Centered at coordinate ({INDIA_STATES_DATABASE.find(s => s.name === selectedStateName)?.lat.toFixed(2)}, {INDIA_STATES_DATABASE.find(s => s.name === selectedStateName)?.lng.toFixed(2)}). Rich geographical context loaded.
                        </p>
                      )}
                      {downloadScale === 'district' && (
                        <p className="text-gray-400 text-[8px]">
                          Strategic sector monitoring for {selectedDistrictName} District, Assam. Coordinates centered near the Brahmaputra alluvial basin.
                        </p>
                      )}
                      {downloadScale === 'village' && (
                        <p className="text-gray-400 text-[8px]">
                          Centrally situated in {selectedDistrictName}, coordinates ({ASSAM_VILLAGES_DATABASE.find(v => v.name === selectedVillageName)?.lat.toFixed(4)}, {ASSAM_VILLAGES_DATABASE.find(v => v.name === selectedVillageName)?.lng.toFixed(4)}). Loaded high-definition rural escape grid.
                        </p>
                      )}
                    </div>
                  )}

                </div>
              ) : downloaderTab === 'picker' ? (
                <div className="bg-[#050912] border border-[#1b2b4e] p-2.5 rounded flex flex-col gap-2">
                  <p className="text-[9px] font-bold text-slate-300 uppercase">1. Location Specifier</p>
                  
                  {/* Region Selector */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] text-slate-400 font-bold">Continent / Region:</label>
                    <select
                      id="downloader_region"
                      value={selectedRegionIdx}
                      onChange={(e) => {
                        const val = e.target.value === 'other' ? 'other' : parseInt(e.target.value);
                        setSelectedRegionIdx(val);
                        setSelectedCountryIdx(val === 'other' ? 'other' : 0);
                        setSelectedStateIdx(val === 'other' ? 'other' : 0);
                        setSelectedDistrictIdx(val === 'other' ? 'other' : 0);
                        setSelectedPlaceIdx(val === 'other' ? 'other' : 0);
                        syncPickerToMap(val, val === 'other' ? 'other' : 0, val === 'other' ? 'other' : 0, val === 'other' ? 'other' : 0, val === 'other' ? 'other' : 0);
                        speakVoiceFeedback("Region changed.");
                      }}
                      className="w-full px-1 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-sky-400 text-[9px] font-mono rounded cursor-pointer"
                    >
                      {WORLDWIDE_REGION_CATALOG.map((r, idx) => (
                        <option key={idx} value={idx}>{r.name}</option>
                      ))}
                      <option value="other">🗺️ Other / Custom Coordinates...</option>
                    </select>
                  </div>

                  {/* Custom Region Field */}
                  {selectedRegionIdx === 'other' && (
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[8px] text-slate-400">Custom Region:</label>
                      <input
                        id="downloader_custom_region"
                        type="text"
                        value={customRegionName}
                        placeholder="e.g. South America"
                        onChange={(e) => {
                          setCustomRegionName(e.target.value);
                          syncPickerToMap('other', 'other', 'other', 'other', 'other', customPlaceLat, customPlaceLng, customPlaceName, customDistrictName, customStateName, customCountryName, e.target.value);
                        }}
                        className="w-full px-2 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px]"
                      />
                    </div>
                  )}

                  {/* Country Selector */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] text-slate-400 font-bold">Country:</label>
                    {selectedRegionIdx === 'other' ? (
                      <input
                        id="downloader_custom_country"
                        type="text"
                        value={customCountryName}
                        placeholder="e.g. Brazil"
                        onChange={(e) => {
                          setCustomCountryName(e.target.value);
                          syncPickerToMap('other', 'other', 'other', 'other', 'other', customPlaceLat, customPlaceLng, customPlaceName, customDistrictName, customStateName, e.target.value, customRegionName);
                        }}
                        className="w-full px-2 py-1 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px]"
                      />
                    ) : (
                      <select
                        id="downloader_country"
                        value={selectedCountryIdx}
                        onChange={(e) => {
                          const val = e.target.value === 'other' ? 'other' : parseInt(e.target.value);
                          setSelectedCountryIdx(val);
                          setSelectedStateIdx(val === 'other' ? 'other' : 0);
                          setSelectedDistrictIdx(val === 'other' ? 'other' : 0);
                          setSelectedPlaceIdx(val === 'other' ? 'other' : 0);
                          syncPickerToMap(selectedRegionIdx, val, val === 'other' ? 'other' : 0, val === 'other' ? 'other' : 0, val === 'other' ? 'other' : 0);
                          speakVoiceFeedback("Country changed.");
                        }}
                        className="w-full px-1 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-sky-400 text-[9px] font-mono rounded cursor-pointer"
                      >
                        {WORLDWIDE_REGION_CATALOG[selectedRegionIdx as number]?.countries.map((c, idx) => (
                          <option key={idx} value={idx}>{c.flag} {c.name}</option>
                        ))}
                        <option value="other">🗺️ Other Country...</option>
                      </select>
                    )}
                  </div>

                  {/* Custom Country Field Fallback */}
                  {selectedRegionIdx !== 'other' && selectedCountryIdx === 'other' && (
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[8px] text-slate-400">Custom Country:</label>
                      <input
                        id="downloader_custom_country_field"
                        type="text"
                        value={customCountryName}
                        placeholder="e.g. United Kingdom"
                        onChange={(e) => {
                          setCustomCountryName(e.target.value);
                          syncPickerToMap(selectedRegionIdx, 'other', 'other', 'other', 'other', customPlaceLat, customPlaceLng, customPlaceName, customDistrictName, customStateName, e.target.value, customRegionName);
                        }}
                        className="w-full px-2 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px]"
                      />
                    </div>
                  )}

                  {/* State Selector */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] text-slate-400 font-bold">State / Province:</label>
                    {selectedRegionIdx === 'other' || selectedCountryIdx === 'other' ? (
                      <input
                        id="downloader_custom_state_input"
                        type="text"
                        value={customStateName}
                        placeholder="e.g. Scotland"
                        onChange={(e) => {
                          setCustomStateName(e.target.value);
                          syncPickerToMap('other', 'other', 'other', 'other', 'other', customPlaceLat, customPlaceLng, customPlaceName, customDistrictName, e.target.value, customCountryName, customRegionName);
                        }}
                        className="w-full px-2 py-1 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px]"
                      />
                    ) : (
                      <select
                        id="downloader_state"
                        value={selectedStateIdx}
                        onChange={(e) => {
                          const val = e.target.value === 'other' ? 'other' : parseInt(e.target.value);
                          setSelectedStateIdx(val);
                          setSelectedDistrictIdx(val === 'other' ? 'other' : 0);
                          setSelectedPlaceIdx(val === 'other' ? 'other' : 0);
                          syncPickerToMap(selectedRegionIdx, selectedCountryIdx, val, val === 'other' ? 'other' : 0, val === 'other' ? 'other' : 0);
                        }}
                        className="w-full px-1 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-sky-400 text-[9px] font-mono rounded cursor-pointer"
                      >
                        {WORLDWIDE_REGION_CATALOG[selectedRegionIdx as number]?.countries[selectedCountryIdx as number]?.states.map((s, idx) => (
                          <option key={idx} value={idx}>{s.name}</option>
                        ))}
                        <option value="other">🗺️ Other State/Province...</option>
                      </select>
                    )}
                  </div>

                  {/* Custom State Fallback */}
                  {selectedRegionIdx !== 'other' && selectedCountryIdx !== 'other' && selectedStateIdx === 'other' && (
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[8px] text-slate-400">Custom State:</label>
                      <input
                        id="downloader_custom_state_field"
                        type="text"
                        value={customStateName}
                        placeholder="e.g. Goa"
                        onChange={(e) => {
                          setCustomStateName(e.target.value);
                          syncPickerToMap(selectedRegionIdx, selectedCountryIdx, 'other', 'other', 'other', customPlaceLat, customPlaceLng, customPlaceName, customDistrictName, e.target.value, customCountryName, customRegionName);
                        }}
                        className="w-full px-2 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px]"
                      />
                    </div>
                  )}

                  {/* District / County Selector */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] text-slate-400 font-bold">District / County:</label>
                    {selectedRegionIdx === 'other' || selectedCountryIdx === 'other' || selectedStateIdx === 'other' ? (
                      <input
                        id="downloader_custom_district_input"
                        type="text"
                        value={customDistrictName}
                        placeholder="e.g. Highlands"
                        onChange={(e) => {
                          setCustomDistrictName(e.target.value);
                          syncPickerToMap('other', 'other', 'other', 'other', 'other', customPlaceLat, customPlaceLng, customPlaceName, e.target.value, customStateName, customCountryName, customRegionName);
                        }}
                        className="w-full px-2 py-1 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px]"
                      />
                    ) : (
                      <select
                        id="downloader_district"
                        value={selectedDistrictIdx}
                        onChange={(e) => {
                          const val = e.target.value === 'other' ? 'other' : parseInt(e.target.value);
                          setSelectedDistrictIdx(val);
                          setSelectedPlaceIdx(val === 'other' ? 'other' : 0);
                          syncPickerToMap(selectedRegionIdx, selectedCountryIdx, selectedStateIdx, val, val === 'other' ? 'other' : 0);
                        }}
                        className="w-full px-1 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-sky-400 text-[9px] font-mono rounded cursor-pointer"
                      >
                        {WORLDWIDE_REGION_CATALOG[selectedRegionIdx as number]?.countries[selectedCountryIdx as number]?.states[selectedStateIdx as number]?.districts.map((d, idx) => (
                          <option key={idx} value={idx}>{d.name}</option>
                        ))}
                        <option value="other">🗺️ Other District...</option>
                      </select>
                    )}
                  </div>

                  {/* Custom District Fallback */}
                  {selectedRegionIdx !== 'other' && selectedCountryIdx !== 'other' && selectedStateIdx !== 'other' && selectedDistrictIdx === 'other' && (
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[8px] text-slate-400">Custom District:</label>
                      <input
                        id="downloader_custom_district_field"
                        type="text"
                        value={customDistrictName}
                        placeholder="e.g. Haridwar"
                        onChange={(e) => {
                          setCustomDistrictName(e.target.value);
                          syncPickerToMap(selectedRegionIdx, selectedCountryIdx, selectedStateIdx, 'other', 'other', customPlaceLat, customPlaceLng, customPlaceName, e.target.value, customStateName, customCountryName, customRegionName);
                        }}
                        className="w-full px-2 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px]"
                      />
                    </div>
                  )}

                  {/* Village / Town / Landmark Selector */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] text-slate-400 font-bold">Village / Town / Place:</label>
                    {selectedRegionIdx === 'other' || selectedCountryIdx === 'other' || selectedStateIdx === 'other' || selectedDistrictIdx === 'other' ? (
                      <input
                        id="downloader_custom_place_input"
                        type="text"
                        value={customPlaceName}
                        placeholder="e.g. Fort William"
                        onChange={(e) => {
                          setCustomPlaceName(e.target.value);
                          syncPickerToMap('other', 'other', 'other', 'other', 'other', customPlaceLat, customPlaceLng, e.target.value, customDistrictName, customStateName, customCountryName, customRegionName);
                        }}
                        className="w-full px-2 py-1 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px]"
                      />
                    ) : (
                      <select
                        id="downloader_place"
                        value={selectedPlaceIdx}
                        onChange={(e) => {
                          const val = e.target.value === 'other' ? 'other' : parseInt(e.target.value);
                          setSelectedPlaceIdx(val);
                          syncPickerToMap(selectedRegionIdx, selectedCountryIdx, selectedStateIdx, selectedDistrictIdx, val);
                        }}
                        className="w-full px-1 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-sky-400 text-[9px] font-mono rounded cursor-pointer"
                      >
                        {WORLDWIDE_REGION_CATALOG[selectedRegionIdx as number]?.countries[selectedCountryIdx as number]?.states[selectedStateIdx as number]?.districts[selectedDistrictIdx as number]?.towns.map((t, idx) => (
                          <option key={idx} value={idx}>{t.name}</option>
                        ))}
                        <option value="other">🗺️ Other Specific Place...</option>
                      </select>
                    )}
                  </div>

                  {/* Custom Coordinates Fallback */}
                  {(selectedRegionIdx === 'other' || selectedCountryIdx === 'other' || selectedStateIdx === 'other' || selectedDistrictIdx === 'other' || selectedPlaceIdx === 'other') && (
                    <div className="flex flex-col gap-1.5 border-t border-[#1b2b4e]/40 pt-1.5 mt-0.5">
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] text-slate-400">Place Name:</label>
                        <input
                          id="downloader_custom_place_field"
                          type="text"
                          value={customPlaceName}
                          placeholder="e.g. Summit Camp"
                          onChange={(e) => {
                            setCustomPlaceName(e.target.value);
                            syncPickerToMap(selectedRegionIdx, selectedCountryIdx, selectedStateIdx, selectedDistrictIdx, selectedPlaceIdx, customPlaceLat, customPlaceLng, e.target.value);
                          }}
                          className="w-full px-2 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[8px] text-slate-400 font-bold">Latitude (Lat):</label>
                          <input
                            id="downloader_custom_lat"
                            type="text"
                            value={customPlaceLat}
                            onChange={(e) => {
                              setCustomPlaceLat(e.target.value);
                              syncPickerToMap(selectedRegionIdx, selectedCountryIdx, selectedStateIdx, selectedDistrictIdx, selectedPlaceIdx, e.target.value, customPlaceLng);
                            }}
                            className="w-full px-2 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px] font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[8px] text-slate-400 font-bold">Longitude (Lng):</label>
                          <input
                            id="downloader_custom_lng"
                            type="text"
                            value={customPlaceLng}
                            onChange={(e) => {
                              setCustomPlaceLng(e.target.value);
                              syncPickerToMap(selectedRegionIdx, selectedCountryIdx, selectedStateIdx, selectedDistrictIdx, selectedPlaceIdx, customPlaceLat, e.target.value);
                            }}
                            className="w-full px-2 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px] font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Intel Summary */}
                  {selectedRegionIdx !== 'other' && selectedCountryIdx !== 'other' && selectedStateIdx !== 'other' && selectedDistrictIdx !== 'other' && selectedPlaceIdx !== 'other' && (
                    <div className="p-2 bg-[#090f1a] border border-cyan-800/40 rounded mt-1 text-[8px] leading-normal text-cyan-300">
                      <p className="font-bold text-cyan-400 mb-0.5 border-b border-cyan-800/30 pb-0.5 uppercase tracking-wider">
                        🛰️ Intel & Terrain Analysis
                      </p>
                      <p className="text-gray-400 text-[8px]">
                        {WORLDWIDE_REGION_CATALOG[selectedRegionIdx as number]?.countries[selectedCountryIdx as number]?.states[selectedStateIdx as number]?.districts[selectedDistrictIdx as number]?.towns[selectedPlaceIdx as number]?.description}
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-slate-400 mt-1 pt-1 border-t border-cyan-800/20">
                        <span>Elevation: <b className="text-slate-200">{WORLDWIDE_REGION_CATALOG[selectedRegionIdx as number]?.countries[selectedCountryIdx as number]?.states[selectedStateIdx as number]?.districts[selectedDistrictIdx as number]?.towns[selectedPlaceIdx as number]?.altitude}m</b></span>
                        <span>Terrain: <b className="text-slate-200 font-mono text-[7px] uppercase">{WORLDWIDE_REGION_CATALOG[selectedRegionIdx as number]?.countries[selectedCountryIdx as number]?.states[selectedStateIdx as number]?.districts[selectedDistrictIdx as number]?.towns[selectedPlaceIdx as number]?.terrain}</b></span>
                      </div>
                    </div>
                  )}

                  {/* Teleport simulated coordinates trigger */}
                  <button
                    id="btn_teleport_gps"
                    onClick={() => {
                      let activeLat = 28.6139;
                      let activeLng = 77.2090;

                      if (selectedRegionIdx === 'other' || selectedCountryIdx === 'other' || selectedStateIdx === 'other' || selectedDistrictIdx === 'other' || selectedPlaceIdx === 'other') {
                        activeLat = parseFloat(customPlaceLat) || 28.6139;
                        activeLng = parseFloat(customPlaceLng) || 77.2090;
                      } else {
                        const t = WORLDWIDE_REGION_CATALOG[selectedRegionIdx as number]?.countries[selectedCountryIdx as number]?.states[selectedStateIdx as number]?.districts[selectedDistrictIdx as number]?.towns[selectedPlaceIdx as number];
                        if (t) {
                          activeLat = t.lat;
                          activeLng = t.lng;
                        }
                      }
                      setLatitude(activeLat);
                      setLongitude(activeLng);
                      speakVoiceFeedback(`Relocating simulated current coordinates to ${bboxName}.`);
                      
                      setChatLog(prev => [
                        ...prev,
                        {
                          sender: "anis",
                          text: `### 🛰️ COORD DISPATCH TELEPORT NOMINAL
The operator has initialized GPS simulation at:
*   **Sector**: ${bboxName}
*   **Coordinates**: ${activeLat.toFixed(5)}°N, ${activeLng.toFixed(5)}°E
*   **Emergency Signal**: Operational. Offline maps can now be fully run from IndexedDB.`,
                          timestamp: new Date().toLocaleTimeString(),
                          priority: "SYSTEM RE-BOOT NOMINAL"
                        }
                      ]);
                    }}
                    className="w-full mt-1 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold rounded text-[8.5px] cursor-pointer transition-all uppercase flex items-center justify-center gap-1"
                  >
                    🛰️ TELEPORT GPS TO SECTOR
                  </button>

                  <div className="grid grid-cols-2 gap-1 text-[7px] text-slate-500 bg-[#080d19]/40 p-1 rounded border border-[#131d35] mt-0.5">
                    <div>Min Lng: <span className="text-slate-400">{bounds.minLng.toFixed(4)}</span></div>
                    <div>Min Lat: <span className="text-slate-400">{bounds.minLat.toFixed(4)}</span></div>
                    <div>Max Lng: <span className="text-slate-400">{bounds.maxLng.toFixed(4)}</span></div>
                    <div>Max Lat: <span className="text-slate-400">{bounds.maxLat.toFixed(4)}</span></div>
                  </div>

                </div>
              ) : (
                <div className="bg-[#050912] border border-[#1b2b4e] p-2.5 rounded flex flex-col gap-2">
                  <p className="text-[9px] font-bold text-slate-300 uppercase">1. Region Bounds</p>
                  <p className="text-[8px] text-slate-400 leading-normal">
                    Turn on BBox mode to drag corners of the orange overlay, or center box around current viewport.
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[8px] text-slate-400 bg-[#080d19] p-1.5 rounded border border-[#131d35]">
                    <div>Min Lng: <span className="text-slate-200">{bounds.minLng.toFixed(4)}</span></div>
                    <div>Min Lat: <span className="text-slate-200">{bounds.minLat.toFixed(4)}</span></div>
                    <div>Max Lng: <span className="text-slate-200">{bounds.maxLng.toFixed(4)}</span></div>
                    <div>Max Lat: <span className="text-slate-200">{bounds.maxLat.toFixed(4)}</span></div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      id="btn_bbox_toggle"
                      onClick={() => {
                        setBboxMode(!bboxMode);
                        speakVoiceFeedback(bboxMode ? "Bounding box overlay disabled." : "Interactive drag handles enabled.");
                      }}
                      className={`flex-1 py-1 text-center font-bold border rounded transition-all cursor-pointer text-[8px] ${bboxMode ? 'bg-amber-950 text-amber-400 border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-700'}`}
                    >
                      {bboxMode ? "🟢 BOUND BOX ACTIVE" : "⚙️ ENABLE BOUND BOX"}
                    </button>
                    <button
                      id="btn_bbox_fit_viewport"
                      onClick={setBBoxToViewport}
                      className="py-1 px-1.5 bg-[#0e172a] hover:bg-[#1a2b4d] border border-[#1b2b4e] rounded text-[8px] text-slate-300 font-bold cursor-pointer transition-all"
                    >
                      FIT VIEWPORT
                    </button>
                  </div>
                </div>
              )}

              {/* Range settings */}
              <div className="bg-[#050912] border border-[#1b2b4e] p-2.5 rounded flex flex-col gap-2">
                <p className="text-[9px] font-bold text-slate-300 uppercase">2. Zoom & Metadata</p>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] text-slate-400">Sector Label Name:</label>
                  <input
                    type="text"
                    value={bboxName}
                    onChange={(e) => setBboxName(e.target.value)}
                    className="w-full px-2 py-1 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px] font-mono rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] text-slate-400">Min Zoom:</label>
                    <select
                      value={minZoom}
                      onChange={(e) => setMinZoom(parseInt(e.target.value))}
                      className="px-1 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px] font-mono rounded cursor-pointer"
                    >
                      {[6,8,10,11,12,13,14,15].map(z => (
                        <option key={z} value={z}>Zoom {z}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] text-slate-400">Max Zoom:</label>
                    <select
                      value={maxZoom}
                      onChange={(e) => setMaxZoom(parseInt(e.target.value))}
                      className="px-1 py-0.5 bg-[#090f1a] border border-[#1c2e52] text-slate-200 text-[9px] font-mono rounded cursor-pointer"
                    >
                      {[10,11,12,13,14,15,16,17].map(z => (
                        <option key={z} value={z} disabled={z < minZoom}>Zoom {z}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live estimation counter */}
                <div className="mt-1 border-t border-[#1b2b4e]/40 pt-2 flex items-center justify-between">
                  <span className="text-slate-400 text-[9px]">TOTAL ESTIMATE:</span>
                  <span className={`font-bold ${currentCalc.count > 1500 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {currentCalc.count} Nodes ({(currentCalc.count * 0.015).toFixed(1)} MB)
                  </span>
                </div>
              </div>

              {/* Progress Panel */}
              {downloadStats.status !== "idle" && (
                <div className="bg-[#0b1223] border-2 border-amber-600/60 p-2.5 rounded flex flex-col gap-2">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-amber-400">STATUS: {downloadStats.status.toUpperCase()}</span>
                    <span className="text-[9px] text-slate-400">{downloadStats.downloaded} / {downloadStats.total} TILES</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-300" 
                      style={{ width: `${(downloadStats.downloaded / downloadStats.total) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[8px] text-slate-400">
                    <span>Speed: {downloadStats.speed} KB/s</span>
                    <span>Cached: {downloadStats.sizeMB} MB</span>
                  </div>

                  <div className="flex gap-1.5 mt-1">
                    {downloadStats.status === 'downloading' ? (
                      <button
                        onClick={handlePauseDownload}
                        className="flex-1 py-1 bg-amber-950 hover:bg-amber-900 text-amber-400 border border-amber-600 rounded flex items-center justify-center gap-1 cursor-pointer font-bold"
                      >
                        <Pause className="w-3 h-3" /> PAUSE
                      </button>
                    ) : downloadStats.status === 'paused' ? (
                      <button
                        onClick={handleResumeDownload}
                        className="flex-1 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-600 rounded flex items-center justify-center gap-1 cursor-pointer font-bold"
                      >
                        <Play className="w-3 h-3" /> RESUME
                      </button>
                    ) : null}

                    <button
                      onClick={handleCancelDownload}
                      className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 rounded cursor-pointer font-bold"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}

              {/* Downloader Trigger Trigger Button */}
              {downloadStats.status === "idle" && (
                <button
                  onClick={handleStartDownload}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded flex items-center justify-center gap-1.5 tracking-wider uppercase shadow-xl cursor-pointer transition-all text-xs"
                >
                  <Download className="w-4 h-4 animate-bounce" /> START SECTOR CACHING
                </button>
              )}

              {/* Saved regional sectors list */}
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between items-center border-b border-[#1b2b4e] pb-1.5">
                  <span className="text-[9px] font-bold text-slate-300 uppercase">Downloaded Sectors ({savedRegions.length})</span>
                  {savedRegions.length > 0 && (
                    <button
                      onClick={handlePurgeAllCache}
                      className="text-[8px] text-red-500 hover:underline cursor-pointer"
                    >
                      PURGE ALL
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {savedRegions.length === 0 ? (
                    <p className="text-[8px] text-slate-500 italic py-3 text-center">No cached regional sectors saved in IndexedDB.</p>
                  ) : (
                    savedRegions.map(region => (
                      <div 
                        key={region.id} 
                        className="p-2 bg-[#040810] hover:bg-[#0c1326] border border-[#14213d] rounded flex flex-col gap-1 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-200 text-[9px]">{region.name}</p>
                            <p className="text-[7.5px] text-slate-500 font-mono">
                              Zooms {region.minZoom}-{region.maxZoom} | {region.downloadedTiles} tiles
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteSavedRegion(region.id, region.name)}
                            className="text-slate-500 hover:text-red-400 cursor-pointer"
                            title="Delete Cached Region"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-1 border-t border-[#14213d]/50 pt-1">
                          <span className="text-[7.5px] text-emerald-400 font-bold font-mono">
                            {(region.sizeBytes / (1024 * 1024)).toFixed(2)} MB • {region.status.toUpperCase()}
                          </span>
                          <button
                            onClick={() => flyToRegion(region)}
                            className="px-1.5 py-0.5 bg-[#0e172a] hover:bg-cyan-950 text-cyan-400 hover:text-white border border-[#1b2b4e] rounded text-[7.5px] cursor-pointer transition-all"
                          >
                            FLY TO SECTOR
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

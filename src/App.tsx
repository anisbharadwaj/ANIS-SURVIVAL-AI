import React, { useState, useEffect, useRef } from "react";
import { MapLibreMap } from "./features/offline_maps/MapLibreMap";
import { MapErrorBoundary } from "./components/MapErrorBoundary";
import { INDIAN_VILLAGES } from "./data/indian_villages";

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
import { 
  Compass, 
  Battery, 
  Signal, 
  AlertTriangle, 
  ShieldAlert, 
  Navigation, 
  Settings, 
  MessageSquare, 
  Send, 
  Activity, 
  Thermometer, 
  Droplet, 
  Home as HomeIcon, 
  MapPin, 
  CheckCircle, 
  RotateCcw, 
  Zap, 
  FileText, 
  Cpu, 
  AlertOctagon, 
  Layers, 
  Eye, 
  HelpCircle,
  Heart,
  Search,
  Download,
  Trash2,
  Play,
  Pause,
  X,
  Plus,
  RefreshCw,
  Map,
  Mic,
  User,
  Users,
  Volume2,
  VolumeX,
  Check,
  Crosshair,
  ChevronRight,
  Bell,
  Lock,
  BookOpen,
  Award,
  AlertCircle,
  CheckSquare
} from "lucide-react";
import { Waypoint, SurvivalGuidance, EmergencyStatus, AISpecialization } from "./types";
import { startSiren, stopSiren, startLoudAlarm, stopLoudAlarm, stopAllEmergencyAudio } from "./lib/audio";
import { GuardianMirror } from "./features/guardian_mode/GuardianMirror";
import { GuardianDashboard } from "./features/guardian_mode/GuardianDashboard";
import { TelemetrySidebar } from "./features/dashboard/TelemetrySidebar";
import { AIAssistantConsole } from "./features/ai_assistant/AIAssistantConsole";
import { VoiceAssistantCore } from "./features/voice_assistant/VoiceAssistantCore";
import { GlobalSearchConsole } from "./features/global_search/GlobalSearchConsole";
import { PWAInstallConsole } from "./features/pwa/PWAInstallConsole";

interface RegionalPack {
  id: string;
  name: string;
  locationName: string;
  flag: string;
  size: string;
  police: string;
  medical: string;
  fire: string;
  terrain: string;
  temperature: number;
  altitude: number;
  latitude: number;
  longitude: number;
  description: string;
}

const REGIONAL_PACKS: RegionalPack[] = [
  {
    id: "india",
    name: "India (Delhi & Shivalik)",
    locationName: "New Delhi Base Camp",
    flag: "🇮🇳",
    size: "42.5 MB",
    police: "112 / 100",
    medical: "102 / 108",
    fire: "101",
    terrain: "Dense Forest",
    temperature: 24,
    altitude: 310,
    latitude: 28.6139,
    longitude: 77.2090,
    description: "Covers Delhi NCT, Haryana border and Himalayan foothills. Includes localized anti-venom guides."
  },
  {
    id: "usa",
    name: "USA (Rockies Grid)",
    locationName: "Colorado Mountain Base",
    flag: "🇺🇸",
    size: "84.1 MB",
    police: "911",
    medical: "911",
    fire: "911",
    terrain: "cliff",
    temperature: 8,
    altitude: 2450,
    latitude: 39.7392,
    longitude: -104.9903,
    description: "Steep elevations, cliff guides, high altitude medical rescue and extreme weather alerts."
  },
  {
    id: "europe",
    name: "Europe (Swiss Alps)",
    locationName: "Zermatt Valley Station",
    flag: "🇪🇺",
    size: "61.8 MB",
    police: "112",
    medical: "144",
    fire: "118",
    terrain: "snow",
    temperature: -4,
    altitude: 1620,
    latitude: 45.8326,
    longitude: 6.8652,
    description: "Glacier crevasse maps, sub-zero hypothermia guidance, avalanche emergency frequencies."
  },
  {
    id: "jungle",
    name: "Amazon Jungle Basin",
    locationName: "Manaus Amazon Outpost",
    flag: "🇧🇷",
    size: "95.4 MB",
    police: "190",
    medical: "192",
    fire: "193",
    terrain: "swamp",
    temperature: 31,
    altitude: 40,
    latitude: -3.4653,
    longitude: -62.2159,
    description: "Swampland pathogens, dangerous flora/fauna tracking, water purification and solar navigation."
  }
];

import { EmergencyConsole } from "./features/emergency_sos/EmergencyConsole";
import { BackpackManager } from "./features/backpack/BackpackManager";
import { KnowledgeBase } from "./features/library/KnowledgeBase";
import { SurvivalQuiz } from "./features/quiz/SurvivalQuiz";
import { DocumentVault } from "./features/vault/DocumentVault";
import { LiveStreamMonitor } from "./features/neural/LiveStreamMonitor";



// Web Audio API emergency siren synthesizer
let sirenOsc1: OscillatorNode | null = null;
let sirenOsc2: OscillatorNode | null = null;
let sirenGainNode: GainNode | null = null;
let sirenCtx: AudioContext | null = null;

const playTacticalSiren = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    sirenCtx = new AudioContextClass();
    
    sirenGainNode = sirenCtx.createGain();
    sirenGainNode.connect(sirenCtx.destination);
    sirenGainNode.gain.setValueAtTime(0.25, sirenCtx.currentTime);

    sirenOsc1 = sirenCtx.createOscillator();
    sirenOsc1.type = "sawtooth";
    sirenOsc1.frequency.setValueAtTime(440, sirenCtx.currentTime);

    sirenOsc2 = sirenCtx.createOscillator();
    sirenOsc2.type = "sine";
    sirenOsc2.frequency.setValueAtTime(1.8, sirenCtx.currentTime); // 1.8Hz wobble rate

    const modGain = sirenCtx.createGain();
    modGain.gain.setValueAtTime(180, sirenCtx.currentTime); // swept sweep range

    sirenOsc2.connect(modGain);
    modGain.connect(sirenOsc1.frequency);

    sirenOsc1.connect(sirenGainNode);
    sirenOsc1.start();
    sirenOsc2.start();
  } catch (e) {
    console.warn("Audio Context block or error starting siren:", e);
  }
};

const stopTacticalSiren = () => {
  try {
    if (sirenOsc1) { sirenOsc1.stop(); sirenOsc1.disconnect(); sirenOsc1 = null; }
    if (sirenOsc2) { sirenOsc2.stop(); sirenOsc2.disconnect(); sirenOsc2 = null; }
    if (sirenGainNode) { sirenGainNode.disconnect(); sirenGainNode = null; }
    if (sirenCtx) { sirenCtx.close(); sirenCtx = null; }
  } catch (e) {
    console.warn("Audio Context close error:", e);
  }
};



export default function App() {
  // Dual-mode Selection (Operator vs Guardian Parent view)
  const [appMode, setAppMode] = useState<'child' | 'guardian'>('child');

  // Mobile navigation panel state
  const [mobilePanel, setMobilePanel] = useState<'telemetry' | 'map' | 'search' | 'cockpit' | 'ai'>('map');

  // Offline AI Situational Safety & Sirens Core
  const [aiDangerDetected, setAiDangerDetected] = useState<boolean>(false);
  const [aiDangerCountdown, setAiDangerCountdown] = useState<number>(10);
  const [aiDangerReason, setAiDangerReason] = useState<string>("");
  const aiDangerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Secure Parenting Datalink Core
  const [pairingCode, setPairingCode] = useState<string>("");
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [childSessionId] = useState<string>(() => "child_" + Math.floor(Math.random() * 1000000).toString());
  const [remoteSirenActive, setRemoteSirenActive] = useState<boolean>(false);

  // Telemetry States
  const [latitude, setLatitude] = useState<number>(28.6139);
  const [longitude, setLongitude] = useState<number>(77.2090);
  const [altitude, setAltitude] = useState<number>(310); // meters
  const [terrain, setTerrain] = useState<string>("Dense Forest");
  const [temperature, setTemperature] = useState<number>(18); // Celsius
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  const [batterySaver, setBatterySaver] = useState<boolean>(false);
  const [signalStrength, setSignalStrength] = useState<string>("STRONG");

  // Environmental Resources
  const [hasWater, setHasWater] = useState<boolean>(true);
  const [hasShelter, setHasShelter] = useState<boolean>(false);

  // Return Path Engine (Crumb Tracking) State
  const [trackingActive, setTrackingActive] = useState<boolean>(true);
  const [crumbHistory, setCrumbHistory] = useState<Waypoint[]>([
    { id: "1", latitude: 28.6110, longitude: 77.2060, altitude: 300, timestamp: new Date(Date.now() - 3600000).toISOString(), type: "crumb" },
    { id: "2", latitude: 28.6122, longitude: 77.2075, altitude: 305, timestamp: new Date(Date.now() - 1800000).toISOString(), type: "crumb" },
    { id: "3", latitude: 28.6132, longitude: 77.2082, altitude: 308, timestamp: new Date(Date.now() - 900000).toISOString(), type: "crumb" },
  ]);
  const [placedWaypoints, setPlacedWaypoints] = useState<Waypoint[]>([]);
  const [selectedPlacementType, setSelectedPlacementType] = useState<"shelter" | "water" | "hazard">("shelter");

  // Dynamic Navigation Engine state
  const [activeRouting, setActiveRouting] = useState<"none" | "shortest" | "safest" | "battery">("none");

  // Active Tactical Safety Workspace Tab
  const [activeTab, setActiveTab] = useState<'sos' | 'backpack' | 'library' | 'quiz' | 'vault' | 'neural' | 'nav' | 'pwa'>('sos');

  // AI Specialization Brain Core Selection
  const [activeAiBrain, setActiveAiBrain] = useState<AISpecialization>("survival");

  // Regional Pack Deployment Systems
  const [deployedPackId, setDeployedPackId] = useState<string>("india");
  const [packDownloadProgress, setPackDownloadProgress] = useState<number | null>(null);
  const [installingPackId, setInstallingPackId] = useState<string | null>(null);

  // --- NEW HUD NAV & GUARDIAN CORE STATES ---
  const [guardianConsentGranted, setGuardianConsentGranted] = useState<boolean>(false);
  const [setupStep, setSetupStep] = useState<'consent' | 'guardians' | 'completed'>('consent');
  const [guardians, setGuardians] = useState<Array<{ id: string; name: string; phone: string; email: string; verified: boolean; activeAlerts: boolean }>>([
    { id: "g1", name: "Aria (Guardian)", phone: "+91 98765 43210", email: "aria.guard@secure.org", verified: true, activeAlerts: true },
    { id: "g2", name: "Emergency Dispatch", phone: "112 / 100", email: "dispatch@emergencies.gov", verified: true, activeAlerts: true },
    { id: "g3", name: "Sarah (Workspace)", phone: "+91 99887 76655", email: "sarah.s@work.com", verified: false, activeAlerts: true },
  ]);

  const [offlineDownloads, setOfflineDownloads] = useState<Array<{ id: string; name: string; type: string; progress: number; status: 'idle' | 'downloading' | 'paused' | 'completed' | 'failed'; size: string; downloadSpeed: string; estRemaining: string }>>([
    { id: "india", name: "India (Delhi & Shivalik)", type: "Country Pack", progress: 100, status: 'completed', size: "42.5 MB", downloadSpeed: "0 KB/s", estRemaining: "0s" },
    { id: "usa", name: "USA (Rockies Grid)", type: "National Park Pack", progress: 0, status: 'idle', size: "84.1 MB", downloadSpeed: "0 KB/s", estRemaining: "--" },
    { id: "europe", name: "Europe (Swiss Alps)", type: "Mountain Region Pack", progress: 0, status: 'idle', size: "61.8 MB", downloadSpeed: "0 KB/s", estRemaining: "--" },
    { id: "custom1", name: "Yosemite Forest Grid", type: "Custom Hike Area", progress: 0, status: 'idle', size: "18.3 MB", downloadSpeed: "0 KB/s", estRemaining: "--" },
  ]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<string[]>(["Delhi Medical Center", "Rockies Camp B", "Swiss Rescue Hut", "Sanjay Van Forest"]);
  const [favoritePlaces, setFavoritePlaces] = useState<Array<{ id: string; name: string; latitude: number; longitude: number; type: string }>>([
    { id: "f1", name: "Emergency Safe Shelter", latitude: 28.6150, longitude: 77.2080, type: "shelter" },
    { id: "f2", name: "Freshwater Well", latitude: 28.6120, longitude: 77.2100, type: "water" },
    { id: "f3", name: "St. Stephens Hospital", latitude: 28.6145, longitude: 77.2095, type: "hospital" },
  ]);

  const [selectedPoiFilters, setSelectedPoiFilters] = useState<Record<string, boolean>>({
    hospitals: true,
    police: true,
    fire: true,
    pharmacies: false,
    fuels: false,
    shelters: true,
    water: true,
    campsites: false,
    emergencyCenters: true,
  });

  const [safeZones, setSafeZones] = useState<Array<{ id: string; name: string; latitude: number; longitude: number; radius: number }>>([
    { id: "sz1", name: "Home Base Station", latitude: 28.6139, longitude: 77.2090, radius: 150 },
    { id: "sz2", name: "Regional Transit Command", latitude: 28.6190, longitude: 77.2150, radius: 200 },
  ]);

  const [destinationWaypoint, setDestinationWaypoint] = useState<Waypoint | null>(null);
  const [routingMode, setRoutingMode] = useState<'walking' | 'hiking' | 'cycling' | 'driving' | 'emergency' | 'return'>('walking');
  const [activeRoutingAlgorithm, setActiveRoutingAlgorithm] = useState<'A*' | 'Dijkstra'>('A*');
  const [continuousTracking, setContinuousTracking] = useState<boolean>(true);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'terrain' | 'satellite' | 'hiking'>('dark');
  const [followMode, setFollowMode] = useState<boolean>(true);
  const [compassMode, setCompassMode] = useState<boolean>(true);

  // Guardian safety checklists
  const [voiceSosEnabled, setVoiceSosEnabled] = useState<boolean>(true);
  const [shakeDetectionEnabled, setShakeDetectionEnabled] = useState<boolean>(true);
  const [fallDetectionEnabled, setFallDetectionEnabled] = useState<boolean>(true);
  const [missedCheckinsEnabled, setMissedCheckinsEnabled] = useState<boolean>(false);
  const [deviationRouteEnabled, setDeviationRouteEnabled] = useState<boolean>(false);
  const [riskAreaEntryEnabled, setRiskAreaEntryEnabled] = useState<boolean>(false);
  const [checkinMinutesLeft, setCheckinMinutesLeft] = useState<number>(30);
  const [panicPin, setPanicPin] = useState<string>("9911");

  const [safetyConfirmationActive, setSafetyConfirmationActive] = useState<boolean>(false);
  const [safetyConfirmationCountdown, setSafetyConfirmationCountdown] = useState<number>(10);
  const [sirenActive, setSirenActive] = useState<boolean>(false);
  const [offlineEmergencyQueue, setOfflineEmergencyQueue] = useState<Array<{ id: string; user: string; lat: number; lng: number; time: string; riskLevel: string; signalReason: string }>>([]);

  const [tapToSetDest, setTapToSetDest] = useState<boolean>(false);

  // Hidden Developer Diagnostics HUD
  const [showDevHud, setShowDevHud] = useState<boolean>(false);

  // Developer diagnostics variables
  const [fps, setFps] = useState<number>(59.4);
  const [cpuUsage, setCpuUsage] = useState<number>(2.4);
  const [ramUsage, setRamUsage] = useState<number>(24.2);
  const [luxValue, setLuxValue] = useState<number>(35);

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(parseFloat((59.1 + Math.random() * 0.9).toFixed(1)));
      setCpuUsage(parseFloat((1.1 + Math.random() * 3.5).toFixed(1)));
      setRamUsage(parseFloat((24.1 + Math.random() * 0.7).toFixed(1)));
      setLuxValue(Math.floor(25 + Math.random() * 15));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // SOS & Fall Detection Alerts
  const [emergency, setEmergency] = useState<EmergencyStatus>({
    isActive: false,
    beaconTimer: 0,
    beaconsSent: 0,
    contactsNotified: false
  });
  const [fallDetected, setFallDetected] = useState<boolean>(false);
  const [fallCountdown, setFallCountdown] = useState<number>(10);

  // AI Assistant Interaction
  const [chatInput, setChatInput] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<"idle" | "loading">("idle");
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "anis"; text: string; timestamp: string; priority?: string }>>([
    {
      sender: "anis",
      text: `### 📡 ANIS SURVIVAL AI ACTIVE
Operational readiness is at 100%. Ready to provide tactical terrain assessment, safe return path routing, and survival telemetry analysis. 

Use the panel below or issue commands directly.`,
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [tacticalGuidance, setTacticalGuidance] = useState<SurvivalGuidance>({
    guidance: "System initialized. Send a request to analyze current environment telemetry.",
    priority: "Ensure return-path tracking is active to prevent disorientation.",
    status: "NOMINAL"
  });

  // Sound / Speech Feedback
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [heading, setHeading] = useState<number>(45);

  // Refs for timers
  const fallTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sosBeaconTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat log
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  // Rotate Heading dynamically to simulate active movement
  useEffect(() => {
    const headingInterval = setInterval(() => {
      setHeading((prev) => (prev + (Math.random() * 10 - 5) + 360) % 360);
    }, 3000);
    return () => clearInterval(headingInterval);
  }, []);

  // Simulate active crumb placement when operator is "moving"
  useEffect(() => {
    if (!trackingActive || emergency.isActive) return;

    const interval = setInterval(() => {
      // Add small offset to coordinates to simulate slow path-finding
      setLatitude((prev) => prev + (Math.random() * 0.0006 - 0.0003));
      setLongitude((prev) => prev + (Math.random() * 0.0006 - 0.0003));
      setAltitude((prev) => Math.max(10, prev + Math.floor(Math.random() * 6 - 3)));
    }, 15000);

    return () => clearInterval(interval);
  }, [trackingActive, emergency.isActive]);

  // Log crumbs when user position shifts
  useEffect(() => {
    if (!trackingActive) return;
    
    // Throttle crumb dropping to unique positions
    const alreadyExists = crumbHistory.some(
      c => Math.abs(c.latitude - latitude) < 0.00005 && Math.abs(c.longitude - longitude) < 0.00005
    );
    if (alreadyExists) return;

    const newCrumb: Waypoint = {
      id: Math.random().toString(),
      latitude,
      longitude,
      altitude,
      timestamp: new Date().toISOString(),
      type: "crumb"
    };
    setCrumbHistory(prev => [...prev, newCrumb]);
  }, [latitude, longitude, trackingActive]);

  // Simulate Battery Drain based on settings & interval
  useEffect(() => {
    const drainInterval = setInterval(() => {
      setBatteryLevel((prev) => {
        if (prev <= 0) return 0;
        let drain = batterySaver ? 0.2 : 0.5;
        if (trackingActive) drain += 0.3;
        if (emergency.isActive) drain += 0.8;
        return Math.max(0, parseFloat((prev - drain).toFixed(1)));
      });
    }, 10000);
    return () => clearInterval(drainInterval);
  }, [batterySaver, trackingActive, emergency.isActive]);

  // Fall Detection Countdown Logic
  useEffect(() => {
    if (fallDetected) {
      setFallCountdown(10);
      fallTimerRef.current = setInterval(() => {
        setFallCountdown((prev) => {
          if (prev <= 1) {
            triggerEmergencySOS("FALL_DETECTION_AUTO_TRIGGER");
            setFallDetected(false);
            if (fallTimerRef.current) clearInterval(fallTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (fallTimerRef.current) clearInterval(fallTimerRef.current);
    }
    return () => {
      if (fallTimerRef.current) clearInterval(fallTimerRef.current);
    };
  }, [fallDetected]);

  // AI Danger Detection Countdown Logic
  useEffect(() => {
    if (aiDangerDetected) {
      setAiDangerCountdown(10);
      startSiren();
      aiDangerTimerRef.current = setInterval(() => {
        setAiDangerCountdown((prev) => {
          if (prev <= 1) {
            triggerEmergencySOS(`AI_THREAT_DETECTION_AUTO_TRIGGER: ${aiDangerReason}`);
            setAiDangerDetected(false);
            stopSiren();
            startLoudAlarm();
            if (aiDangerTimerRef.current) clearInterval(aiDangerTimerRef.current);
            speakVoiceFeedback("Countdown expired. Broadcasting live location coordinates to paired guardian and sounding emergency sirens.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      stopSiren();
      if (aiDangerTimerRef.current) clearInterval(aiDangerTimerRef.current);
    }
    return () => {
      stopSiren();
      if (aiDangerTimerRef.current) clearInterval(aiDangerTimerRef.current);
    };
  }, [aiDangerDetected]);

  // Bidirectional Telemetry Parent-Child Pairing Handshake
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const payload = {
          childId: childSessionId,
          latitude,
          longitude,
          altitude,
          batteryLevel,
          isEmergency: emergency.isActive,
          aiDangerDetected: aiDangerDetected,
          aiDangerReason: aiDangerReason
        };

        let res;
        if (!pairingCode) {
          res = await fetch("/api/pairing/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch("/api/pairing/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: pairingCode,
              ...payload
            })
          });
        }

        if (res.ok) {
          const data = await res.json();
          if (data.code && !pairingCode) {
            setPairingCode(data.code);
            setIsPaired(true);
          }
          
          // Bidirectional Remote Siren Trigger
          if (data.sirenTriggeredByParent) {
            if (!remoteSirenActive) {
              setRemoteSirenActive(true);
              setAiDangerDetected(true);
              setAiDangerReason("PARENT REMOTE SIREN ACTIVATION");
            }
          } else {
            if (remoteSirenActive) {
              setRemoteSirenActive(false);
              setAiDangerDetected(false);
            }
          }
        }
      } catch (err) {
        console.warn("Telemetry pairing sync failed:", err);
      }
    };

    // Fast sync intervals: 2s in emergency or danger, 5s in battery saver, 3s otherwise
    const syncIntervalTime = (emergency.isActive || aiDangerDetected) ? 1500 : (batterySaver ? 6000 : 3000);

    syncWithServer();
    const interval = setInterval(syncWithServer, syncIntervalTime);
    return () => clearInterval(interval);
  }, [latitude, longitude, altitude, batteryLevel, emergency.isActive, aiDangerDetected, aiDangerReason, pairingCode, remoteSirenActive, batterySaver]);

  // SOS Emergency Beacon Transmitter Timer
  useEffect(() => {
    if (emergency.isActive) {
      setEmergency((prev) => ({ ...prev, beaconTimer: 30 }));
      sosBeaconTimerRef.current = setInterval(() => {
        setEmergency((prev) => {
          if (prev.beaconTimer <= 1) {
            // Send another beacon
            speakVoiceFeedback("Emergency SOS beacon broadcast transmitted safely.");
            return {
              ...prev,
              beaconTimer: 30,
              beaconsSent: prev.beaconsSent + 1
            };
          }
          return {
            ...prev,
            beaconTimer: prev.beaconTimer - 1
          };
        });
      }, 1000);
    } else {
      if (sosBeaconTimerRef.current) clearInterval(sosBeaconTimerRef.current);
    }
    return () => {
      if (sosBeaconTimerRef.current) clearInterval(sosBeaconTimerRef.current);
    };
  }, [emergency.isActive]);

  // Safety Confirmation Countdown Timer & Siren Audio Loop
  useEffect(() => {
    let confirmTimer: NodeJS.Timeout | null = null;
    if (safetyConfirmationActive) {
      playTacticalSiren();
      setSirenActive(true);
      
      confirmTimer = setInterval(() => {
        setSafetyConfirmationCountdown(prev => {
          if (prev <= 1) {
            clearInterval(confirmTimer!);
            triggerEmergencySOS("AUTOMATIC_SENSOR_FUSION_TIMEOUT");
            setSafetyConfirmationActive(false);
            stopTacticalSiren();
            setSirenActive(false);
            return 10;
          }
          // Speak warning
          speakVoiceFeedback(`Warning! Automated beacon dispatching in ${prev - 1} seconds.`);
          return prev - 1;
        });
      }, 1000);
    } else {
      stopTacticalSiren();
      setSirenActive(false);
    }
    return () => {
      if (confirmTimer) clearInterval(confirmTimer);
    };
  }, [safetyConfirmationActive]);

  // Trigger Audio TTS voice feedback safely with neural calibration and clean cadence structures
  const speakVoiceFeedback = (text: string) => {
    if ((window as any).speakVoiceFeedbackCustom) {
      (window as any).speakVoiceFeedbackCustom(text);
      return;
    }
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      
      // Clean up basic markdown and insert natural pacing pauses
      let cleaned = text
        .replace(/#{1,6}\s+/g, "")
        .replace(/\*\*|__/g, "")
        .replace(/\*|_/g, "")
        .replace(/`[^`]+`/g, (m) => m.slice(1, -1))
        .replace(/:\s+/g, ", ")
        .replace(/\.\s+/g, "... ")
        .replace(/[🚨🗺️🧭🔊📡🛠️🔋❤️]/gu, "")
        .replace(/\s+/g, " ")
        .trim();

      if (!cleaned) return;
      const utterance = new SpeechSynthesisUtterance(cleaned);

      // Setup default premium voice search for fallback
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        return (
          v.lang.toLowerCase().startsWith("en") && 
          (name.includes("natural") || name.includes("neural") || name.includes("online") || name.includes("google"))
        );
      }) || voices.find(v => v.lang.toLowerCase().startsWith("en")) || null;

      if (premiumVoice) {
        utterance.voice = premiumVoice;
      } else {
        utterance.lang = "en-IN";
      }

      utterance.rate = premiumVoice && premiumVoice.name.toLowerCase().includes("natural") ? 0.94 : 0.96;
      utterance.pitch = 0.95; // Slightly lower tactical frequency for clean auditory comprehension
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS fallback failed:", e);
    }
  };

  // Trigger emergency mode
  const triggerEmergencySOS = (reason = "MANUAL_TRIGGER") => {
    setEmergency({
      isActive: true,
      beaconTimer: 30,
      beaconsSent: 1,
      contactsNotified: true
    });
    setSignalStrength("MEDIUM");
    speakVoiceFeedback("Emergency SOS mode activated. Satellites alerted. Broadcasting location beacon.");
    
    // Push emergency item into chat
    setChatLog((prev) => [
      ...prev,
      {
        sender: "anis",
        text: `### 🚨 EMERGENCY DISTRESS BEACON ACTIVE
*   **Trigger Protocol**: ${reason}
*   **Coordinates**: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
*   **Action Plan**: Emergency services notified. Dynamic satellite tracking beacon active. Do not depart current position unless shelter is highly compromised.`,
        timestamp: new Date().toLocaleTimeString(),
        priority: "CRITICAL STATUS"
      }
    ]);
  };

  // Cancel Emergency
  const cancelEmergencySOS = () => {
    setEmergency({
      isActive: false,
      beaconTimer: 0,
      beaconsSent: 0,
      contactsNotified: false
    });
    setAiDangerDetected(false);
    setRemoteSirenActive(false);
    stopAllEmergencyAudio();
    setSignalStrength("STRONG");
    speakVoiceFeedback("Emergency SOS deactivated. Standing down rescue team operations.");
  };

  // Simulate falling detection event
  const triggerFallSim = () => {
    setFallDetected(true);
    speakVoiceFeedback("Warning: Sudden high impact detected. Initiate emergency countdown.");
  };

  // Deploy an offline downloadable regional pack
  const handleDeployPack = (pack: RegionalPack) => {
    setInstallingPackId(pack.id);
    setPackDownloadProgress(0);
    speakVoiceFeedback(`Initiating installation of ${pack.name} offline package.`);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setPackDownloadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setDeployedPackId(pack.id);
          setPackDownloadProgress(null);
          setInstallingPackId(null);
          
          // Apply regional coordinates
          setLatitude(pack.latitude);
          setLongitude(pack.longitude);
          setAltitude(pack.altitude);
          setTerrain(pack.terrain);
          setTemperature(pack.temperature);
          
          speakVoiceFeedback(`Installation complete. ${pack.name} maps and tactical channels deployed.`);
          
          // Log inside the chat console
          setChatLog(prev => [
            ...prev,
            {
              sender: "anis",
              text: `### 🗺️ REGIONAL OFFLINE PACK ENGAGED: ${pack.name.toUpperCase()}
*   **Geographic Center**: ${pack.locationName}
*   **Active Telemetry**: ${pack.latitude.toFixed(4)}°N, ${pack.longitude.toFixed(4)}°E | Altitude: ${pack.altitude}m
*   **Regional Emergency Dispatch Numbers**:
    *   **Police/Guardians**: ${pack.police}
    *   **Medical Responders**: ${pack.medical}
    *   **Fire & Rescue**: ${pack.fire}
*   **Terrain Profile Analysis**: ${pack.terrain === 'cliff' ? 'HIGH CLIFF ELEVATIONS' : pack.terrain === 'snow' ? 'SUB-ZERO FREEEZING' : pack.terrain === 'swamp' ? 'WETLAND/SWAMP HAZARDS' : 'STANDARD FOREST DENSITY'}`,
              timestamp: new Date().toLocaleTimeString(),
              priority: "SYSTEM RE-BOOT NOMINAL"
            }
          ]);
        }, 500);
      }
    }, 120);
  };

  // Query server-side Gemini AI Survival Assistant
  const querySurvivalAI = async (customMessage?: string) => {
    const promptMessage = customMessage || chatInput;
    if (!promptMessage.trim()) return;

    if (!customMessage) {
      // Add user message to log
      setChatLog((prev) => [
        ...prev,
        {
          sender: "user",
          text: promptMessage,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      setChatInput("");
    }

    setAiStatus("loading");

    try {
      const response = await fetch("/api/survival/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude,
          longitude,
          altitude,
          terrain,
          temperature,
          batteryLevel,
          hasWater,
          hasShelter,
          isEmergency: emergency.isActive,
          message: promptMessage,
          aiBrain: activeAiBrain,
          lang: localStorage.getItem("anis_pref_lang") || "en",
        }),
      });

      if (!response.ok) throw new Error("Server error querying Gemini");

      const data = await response.json();
      
      setChatLog((prev) => [
        ...prev,
        {
          sender: "anis",
          text: data.guidance || "Tactical advisor was unable to resolve a detailed analysis. Maintain safety standard.",
          timestamp: new Date().toLocaleTimeString(),
          priority: data.priority,
        }
      ]);

      if (data.priority) {
        speakVoiceFeedback(data.priority);
      }

      setTacticalGuidance({
        guidance: data.guidance,
        priority: data.priority || "Monitor tactical compass.",
        status: data.status || "NOMINAL",
      });

    } catch (err) {
      console.error(err);
      setChatLog((prev) => [
        ...prev,
        {
          sender: "anis",
          text: "⚠️ **SYSTEM CONNECTION ERROR**: Failed to bridge communication with tactical satellite server. Defaulting to local offline protocols. Secure your water, shelter, and watch thermal conditions.",
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    } finally {
      setAiStatus("idle");
    }
  };

  // Direct Telemetry Queries
  const analyzeDanger = () => {
    let warningMsg = `Analyze current terrain danger for: ${terrain} terrain at ${altitude}m altitude. Highlight immediate risks.`;
    querySurvivalAI(warningMsg);
  };

  const checkLostStatus = () => {
    let msg = `Check if lost: I have traveled ${crumbHistory.length} checkpoints. My current location is ${latitude.toFixed(5)}, ${longitude.toFixed(5)}. I have water: ${hasWater ? 'Yes' : 'No'}, shelter: ${hasShelter ? 'Yes' : 'No'}. Calculate lost possibility score.`;
    querySurvivalAI(msg);
  };

  const estimateBatterySurvival = () => {
    let msg = `Provide battery survival estimation for ${batteryLevel}% charge. Active features: GPS Crumb tracking: ${trackingActive ? 'ON' : 'OFF'}, Voice Guidance: ${voiceEnabled ? 'ON' : 'OFF'}, Emergency Beacon: ${emergency.isActive ? 'ACTIVE' : 'INACTIVE'}.`;
    querySurvivalAI(msg);
  };

  // Reverse navigation along return path crumb track
  const triggerSafeReturnRoute = () => {
    if (crumbHistory.length === 0) {
      speakVoiceFeedback("No breadcrumb path logged. Unable to resolve return routing.");
      return;
    }
    setActiveRouting("safest");
    // Move user position back to the previous breadcrumb sequentially
    const nearest = crumbHistory[crumbHistory.length - 1];
    setLatitude(nearest.latitude);
    setLongitude(nearest.longitude);
    setAltitude(nearest.altitude);
    speakVoiceFeedback("Safe reverse route activated. Guiding operator back along established breadcrumb chain.");
    
    setChatLog((prev) => [
      ...prev,
      {
        sender: "anis",
        text: `### 🧭 REVERSE RETURN-PATH ENGAGED
Successfully tracking back along crumb trail. 
*   **Total Saved Waypoints**: ${crumbHistory.length} logged
*   **Safety Status**: Return path locked. Aligning coordinates to nearest previous waypoint.`,
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  };

  // Add custom map markers on click or set target destinations
  const handleMapClick = (lat: number, lng: number) => {
    if (tapToSetDest) {
      const destWp: Waypoint = {
        id: "dest_" + Math.random().toString(),
        latitude: lat,
        longitude: lng,
        altitude: altitude + Math.floor(Math.random() * 20 - 10),
        timestamp: new Date().toISOString(),
        type: "checkpoint",
        label: "TARGET DESTINATION",
        notes: `Selected via active map interface tap.`
      };
      setDestinationWaypoint(destWp);
      setTapToSetDest(false);
      speakVoiceFeedback("Target destination coordinates locked. Calculating optimized safe corridor.");
      
      setChatLog(prev => [
        ...prev,
        {
          sender: "anis",
          text: `### 🎯 TARGET DESTINATION COORDINATES LOCK
*   **Grid Coordinate**: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E
*   **Direct Line Vector**: ${getDistanceKm(latitude, longitude, lat, lng).toFixed(2)} km
*   **Active Guidance Profile**: ${routingMode.toUpperCase()} CORRIDOR
*   **Tactical Path Search Engine**: ${activeRoutingAlgorithm} shortest search corridor.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      return;
    }

    // If we click the map in default mode, place a dynamic tactical resource point
    const newWaypoint: Waypoint = {
      id: Math.random().toString(),
      latitude: lat,
      longitude: lng,
      altitude,
      timestamp: new Date().toISOString(),
      type: selectedPlacementType,
      label: `Tactical ${selectedPlacementType.toUpperCase()}`,
      notes: `Manually plotted at elevation ${altitude}m.`
    };

    setPlacedWaypoints((prev) => [...prev, newWaypoint]);
    speakVoiceFeedback(`Logged manual ${selectedPlacementType} resource waypoint.`);
  };

  // Reset Crumb Tracking
  const clearCrumbHistory = () => {
    setCrumbHistory([]);
    setPlacedWaypoints([]);
    setActiveRouting("none");
    speakVoiceFeedback("All crumbs and tactical navigation files cleared.");
  };

  // Helper to determine compass direction letter
  const getCompassDirection = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return "N";
    if (deg >= 22.5 && deg < 67.5) return "NE";
    if (deg >= 67.5 && deg < 112.5) return "E";
    if (deg >= 112.5 && deg < 157.5) return "SE";
    if (deg >= 157.5 && deg < 202.5) return "S";
    if (deg >= 202.5 && deg < 247.5) return "SW";
    if (deg >= 247.5 && deg < 292.5) return "W";
    return "NW";
  };

  return (
    <div className="flex flex-col h-screen bg-[#070a13] text-gray-100 font-sans tactical-grid">
      
      {/* Dynamic Warning: AI Danger Situation Countdown Banner */}
      {aiDangerDetected && (
        <div className="bg-red-950 border-b-2 border-red-500 py-4 px-6 flex flex-col md:flex-row items-center justify-between z-50 animate-pulse shrink-0">
          <div className="flex items-center gap-4">
            <ShieldAlert className="w-10 h-10 text-red-500 animate-spin" style={{ animationDuration: '4s' }} />
            <div>
              <p className="text-red-200 font-display font-black text-lg tracking-wider">⚠️ AI CRITICAL SITUATIONAL HAZARD ALERT ACTIVE</p>
              <p className="text-red-300 text-sm font-mono mt-0.5">
                Reason: <strong className="text-white uppercase">{aiDangerReason}</strong>
              </p>
              <p className="text-red-400 text-xs mt-1 font-mono">
                Broadcasting GPS location telemetry to all paired parent/guardian consoles in <strong className="text-white text-base font-mono bg-red-900 px-2 py-0.5 rounded">{aiDangerCountdown}s</strong>.
              </p>
            </div>
          </div>
          <button 
            id="btn_cancel_ai_danger_alarm"
            onClick={() => {
              setAiDangerDetected(false);
              stopAllEmergencyAudio();
              speakVoiceFeedback("Safety confirmation received. Disarming AI threat response protocol.");
            }}
            className="mt-3 md:mt-0 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all text-xs tracking-wider uppercase cursor-pointer border border-emerald-400 font-mono shadow-lg shadow-emerald-950"
          >
            ✅ I AM SAFE (DISMISS OVERRIDE)
          </button>
        </div>
      )}

      {/* Dynamic Warning: Fall Countdown Banner */}
      {fallDetected && (
        <div className="bg-red-950 border-b-2 border-red-500 py-3 px-4 flex flex-col md:flex-row items-center justify-between z-50 animate-bounce">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-red-500 animate-pulse" />
            <div>
              <p className="text-red-200 font-display font-bold text-lg">CRITICAL IMPACT DETECTED — POSSIBLE OPERATOR FALL</p>
              <p className="text-red-400 text-sm">Automatically broadcasting high-power SOS distress beacon to satellite array in <strong className="text-white text-lg font-mono">{fallCountdown}s</strong>.</p>
            </div>
          </div>
          <button 
            id="btn_cancel_fall_alarm"
            onClick={() => {
              setFallDetected(false);
              speakVoiceFeedback("Safety bypass verified. Standing down fall alarm.");
            }}
            className="mt-3 md:mt-0 px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-all text-sm uppercase cursor-pointer"
          >
            DISARM ALARM / OPERATOR SAFE
          </button>
        </div>
      )}

      {/* Top Cockpit Header */}
      <header className="border-b border-[#131d35] bg-[#0c1221]/90 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Cpu className="w-8 h-8 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-display font-black text-xl tracking-wider text-sky-400 flex items-center gap-2">
              ANIS SURVIVAL AI
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-1.5 py-0.2 rounded font-mono font-bold tracking-normal">MIL-COCKPIT v3.5</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-1">
              <p className="text-xs text-gray-400 tracking-wide font-medium">Elite Offline-First Environmental Tactical Nav Engine</p>
              <span className="text-gray-700 hidden sm:inline">|</span>
              <div className="flex bg-[#070b13] border border-[#14223d] rounded-lg p-0.5 text-[9px] font-mono font-bold">
                <button
                  id="btn_select_operator_mode"
                  onClick={() => {
                    setAppMode('child');
                    speakVoiceFeedback("Accessing operator tactical cockpit.");
                  }}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    appMode === 'child' ? 'bg-sky-950 border border-sky-600 text-sky-400 font-black' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  🛡️ OPERATOR COCKPIT
                </button>
                <button
                  id="btn_select_guardian_mode"
                  onClick={() => {
                    setAppMode('guardian');
                    speakVoiceFeedback("Accessing secure parent guardian mirror dashboard.");
                  }}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    appMode === 'guardian' ? 'bg-indigo-950 border border-indigo-600 text-indigo-400 font-black' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  👪 PARENT VIEW
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Audio TTS / System controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#121c32]/60 px-3 py-1.5 rounded-lg border border-[#1e2f50] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-300">COMMS STATUS:</span>
            <span className={`font-bold ${signalStrength === 'STRONG' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {signalStrength}
            </span>
          </div>

          <button
            id="toggle_voice"
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              speakVoiceFeedback(voiceEnabled ? "" : "Voice synthesizer tracking system activated.");
            }}
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
              voiceEnabled 
                ? "bg-sky-950/40 border-sky-600 text-sky-400" 
                : "bg-gray-900 border-gray-700 text-gray-500"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            VOICE: {voiceEnabled ? "ACTIVE" : "OFFLINE"}
          </button>

          <button
            id="toggle_dev_hud"
            onClick={() => {
              setShowDevHud(!showDevHud);
              speakVoiceFeedback(showDevHud ? "Developer diagnostics deactivated." : "Initiating hardware diagnostics and sensor fusion overview.");
            }}
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
              showDevHud 
                ? "bg-amber-950/40 border-amber-600 text-amber-400" 
                : "bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            DEV HUD: {showDevHud ? "ONLINE" : "HIDDEN"}
          </button>

          {emergency.isActive ? (
            <button
              id="cancel_sos_btn"
              onClick={cancelEmergencySOS}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs animate-pulse transition-all glow-danger uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 animate-spin" />
              CANCEL SOS BEACON
            </button>
          ) : (
            <button
              id="trigger_sos_btn"
              onClick={() => triggerEmergencySOS("MANUAL_SOS_BUTTON")}
              className="px-4 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-400 hover:text-red-200 font-bold rounded-lg text-xs transition-all uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              TRIGGER SOS BEACON
            </button>
          )}
        </div>
      </header>

      {/* Main Grid View */}
      {appMode === "guardian" ? (
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          <GuardianMirror speakVoiceFeedback={speakVoiceFeedback} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden relative pb-16 lg:pb-0">
        
        {/* Left Side Column: Sensors and Telemetry Sidebar */}
        <div className={`${mobilePanel === 'telemetry' ? 'flex flex-col h-full flex-1' : 'hidden'} lg:flex lg:flex-col lg:col-span-3 lg:h-full overflow-hidden`}>
          <TelemetrySidebar
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
            altitude={altitude}
            setAltitude={setAltitude}
            temperature={temperature}
            setTemperature={setTemperature}
            terrain={terrain}
            setTerrain={setTerrain}
            batteryLevel={batteryLevel}
            batterySaver={batterySaver}
            setBatterySaver={setBatterySaver}
            trackingActive={trackingActive}
            setTrackingActive={setTrackingActive}
            signalStrength={signalStrength}
            setSignalStrength={setSignalStrength}
            hasWater={hasWater}
            setHasWater={setHasWater}
            hasShelter={hasShelter}
            setHasShelter={setHasShelter}
            regionalPacks={REGIONAL_PACKS}
            deployedPackId={deployedPackId}
            packDownloadProgress={packDownloadProgress}
            installingPackId={installingPackId}
            handleDeployPack={handleDeployPack}
            showDevHud={showDevHud}
            setShowDevHud={setShowDevHud}
            fps={fps}
            cpuUsage={cpuUsage}
            ramUsage={ramUsage}
            luxValue={luxValue}
            heading={heading}
            getCompassDirection={getCompassDirection}
            triggerFallSim={triggerFallSim}
            clearCrumbHistory={clearCrumbHistory}
            speakVoiceFeedback={speakVoiceFeedback}
            setChatLog={setChatLog}
          />
        </div>

        {/* Center: Realtime Map & Tactical HUD Overlays */}
        <main className={`${(mobilePanel === 'map' || mobilePanel === 'cockpit') ? 'flex flex-col flex-1 h-full' : 'hidden'} lg:flex lg:col-span-5 lg:flex-col lg:h-full overflow-hidden border-r border-[#131d35]`}>
          
          {/* Map Layer Box */}
          <div className={`${mobilePanel === 'map' ? 'flex-1' : 'h-[300px] hidden'} lg:flex lg:h-[450px] w-full relative shrink-0 border-b border-[#131d35] overflow-hidden`}>
            
            {/* Map Engine Indicator */}
            <div className="absolute top-3 right-3 z-20 flex bg-[#060a12e0] border border-[#1d2f53] rounded-lg p-1 px-2.5 shadow-md backdrop-blur-md items-center gap-1.5 font-mono text-[8px] text-emerald-400 font-bold select-none uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              🗺️ MapLibre Online Engine Active
            </div>

            <MapLibreMap
              latitude={latitude}
              longitude={longitude}
              altitude={altitude}
              heading={heading}
              crumbHistory={crumbHistory}
              safeZones={safeZones}
              destinationWaypoint={destinationWaypoint}
              setDestinationWaypoint={setDestinationWaypoint}
              selectedPoiFilters={selectedPoiFilters}
              placedWaypoints={placedWaypoints}
              setPlacedWaypoints={setPlacedWaypoints}
              selectedPlacementType={selectedPlacementType}
              mapStyle={mapStyle}
              setMapStyle={setMapStyle}
              routingMode={routingMode}
              activeRoutingAlgorithm={activeRoutingAlgorithm}
              onMapClick={handleMapClick}
              triggerSafeReturnRoute={triggerSafeReturnRoute}
              triggerEmergencySOS={triggerEmergencySOS}
              setActiveTab={setActiveTab}
              speakVoiceFeedback={speakVoiceFeedback}
              setLatitude={setLatitude}
              setLongitude={setLongitude}
              setChatLog={setChatLog}
            />
          </div>

          {/* ADVANCED SAFETY COCKPIT TABS WORKSPACE */}
          <div className={`${mobilePanel === 'cockpit' ? 'flex-1' : 'hidden'} lg:flex lg:flex-1 min-h-0 flex flex-col bg-[#050912] overflow-hidden`}>
            
            {/* Global Flash Overlay for automated emergency countdown */}
            {safetyConfirmationActive && (
              <div className="fixed inset-0 bg-red-950/95 z-[9999] flex flex-col items-center justify-center p-8 text-center animate-pulse font-mono">
                <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center text-4xl mb-4 text-red-500 animate-bounce">
                  🚨
                </div>
                <h2 className="text-xl font-bold text-red-400 uppercase tracking-widest">
                  CRITICAL SENSOR ALERT DETECTED
                </h2>
                <p className="max-w-md text-xs text-gray-300 mt-2 leading-relaxed">
                  ANIS Sensor Fusion has detected multiple critical alerts (e.g. Impact Fall / Route Deviation / Signal Loss). 
                </p>
                <div className="bg-[#050912] border border-red-800 rounded-lg p-4 my-6 font-mono">
                  <p className="text-[10px] text-gray-500">AUTOMATIC DISTRESS TRANSMISSION IN</p>
                  <p className="text-4xl font-black text-red-500 mt-1">{safetyConfirmationCountdown}s</p>
                </div>
                <div className="flex gap-4 w-full max-w-sm">
                  <button
                    id="btn_confirm_safe"
                    onClick={() => {
                      setSafetyConfirmationActive(false);
                      setFallDetected(false);
                      setDeviationRouteEnabled(false);
                      setRiskAreaEntryEnabled(false);
                      stopTacticalSiren();
                      setSirenActive(false);
                      speakVoiceFeedback("Operator confirmed safe. Standing down alerts.");
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-400 cursor-pointer uppercase text-xs"
                  >
                    ✅ I'M SAFE (CANCEL)
                  </button>
                  <button
                    id="btn_confirm_help"
                    onClick={() => {
                      setSafetyConfirmationActive(false);
                      triggerEmergencySOS("DIRECT_USER_CONFIRMATION");
                      stopTacticalSiren();
                      setSirenActive(false);
                    }}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg border border-red-400 cursor-pointer uppercase text-xs"
                  >
                    🚨 SEND HELP NOW
                  </button>
                </div>
                <p className="text-[9px] text-gray-500 mt-6 italic">Siren synthesizer playing over active audio output channels.</p>
              </div>
            )}

            {/* Tab selection menu bar with glow indicators */}
            <div className="flex bg-[#080d19] border-b border-[#14213c] overflow-x-auto shrink-0 scrollbar-none">
              {(["sos", "nav", "backpack", "library", "quiz", "vault", "neural", "pwa"] as const).map(tab => (
                <button
                  id={`tab_nav_select_${tab}`}
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    speakVoiceFeedback(`Switched workspace to ${tab.toUpperCase()} protocols.`);
                  }}
                  className={`px-3 py-2.5 text-[9px] font-mono font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap uppercase flex items-center gap-1 ${
                    activeTab === tab 
                      ? 'border-sky-500 text-sky-400 bg-sky-950/10' 
                      : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#0c1223]/50'
                  }`}
                >
                  {tab === "sos" && "🚨 GUARDIAN CORE"}
                  {tab === "nav" && "🧭 TACTICAL NAV"}
                  {tab === "backpack" && "🎒 GEAR AUDIT"}
                  {tab === "library" && "📖 SAFETY FILE"}
                  {tab === "quiz" && "🧠 ASSESSMENT"}
                  {tab === "vault" && "🔒 SECURE VAULT"}
                  {tab === "neural" && "🎥 HUD CAMERA"}
                  {tab === "pwa" && "📱 DEVICE & APP"}
                </button>
              ))}
            </div>

            {/* Display active tab content */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {activeTab === 'sos' && (
                <GuardianDashboard
                  guardianConsentGranted={guardianConsentGranted}
                  setGuardianConsentGranted={setGuardianConsentGranted}
                  pairingCode={pairingCode}
                  isPaired={isPaired}
                  guardians={guardians}
                  setGuardians={setGuardians}
                  emergency={emergency}
                  triggerEmergencySOS={triggerEmergencySOS}
                  cancelEmergencySOS={cancelEmergencySOS}
                  panicPin={panicPin}
                  setPanicPin={setPanicPin}
                  voiceSosEnabled={voiceSosEnabled}
                  setVoiceSosEnabled={setVoiceSosEnabled}
                  fallDetected={fallDetected}
                  setFallDetected={setFallDetected}
                  missedCheckinsEnabled={missedCheckinsEnabled}
                  setMissedCheckinsEnabled={setMissedCheckinsEnabled}
                  deviationRouteEnabled={deviationRouteEnabled}
                  setDeviationRouteEnabled={setDeviationRouteEnabled}
                  riskAreaEntryEnabled={riskAreaEntryEnabled}
                  setRiskAreaEntryEnabled={setRiskAreaEntryEnabled}
                  sirenActive={sirenActive}
                  setSirenActive={setSirenActive}
                  playTacticalSiren={playTacticalSiren}
                  stopTacticalSiren={stopTacticalSiren}
                  setAiDangerReason={setAiDangerReason}
                  setAiDangerDetected={setAiDangerDetected}
                  offlineEmergencyQueue={offlineEmergencyQueue}
                  setOfflineEmergencyQueue={setOfflineEmergencyQueue}
                  speakVoiceFeedback={speakVoiceFeedback}
                  latitude={latitude}
                  longitude={longitude}
                  altitude={altitude}
                  setChatLog={setChatLog}
                  setSafetyConfirmationActive={setSafetyConfirmationActive}
                  setSafetyConfirmationCountdown={setSafetyConfirmationCountdown}
                />
              )}
              {activeTab === 'nav' && (
                <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
                  <GlobalSearchConsole
                    latitude={latitude}
                    longitude={longitude}
                    setLatitude={setLatitude}
                    setLongitude={setLongitude}
                    speakVoiceFeedback={speakVoiceFeedback}
                    destinationWaypoint={destinationWaypoint}
                    setDestinationWaypoint={setDestinationWaypoint}
                    setChatLog={setChatLog}
                  />
                </div>
              )}
              {activeTab === 'backpack' && (
                <BackpackManager 
                  terrain={terrain}
                  speakVoiceFeedback={speakVoiceFeedback}
                  querySurvivalAI={querySurvivalAI}
                />
              )}
              {activeTab === 'library' && (
                <KnowledgeBase 
                  speakVoiceFeedback={speakVoiceFeedback}
                  querySurvivalAI={querySurvivalAI}
                />
              )}
              {activeTab === 'quiz' && (
                <SurvivalQuiz 
                  speakVoiceFeedback={speakVoiceFeedback}
                />
              )}
              {activeTab === 'vault' && (
                <DocumentVault 
                  speakVoiceFeedback={speakVoiceFeedback}
                  sessionLogs={chatLog}
                  waypoints={{
                    crumbHistory,
                    placedWaypoints,
                    destinationWaypoint,
                    safeZones
                  }}
                  survivalStatus={{
                    emergency,
                    fallDetected,
                    aiDangerDetected,
                    aiDangerReason,
                    telemetry: {
                      latitude,
                      longitude,
                      altitude,
                      heading,
                      terrain,
                      temperature,
                      batteryLevel,
                      batterySaver,
                      signalStrength,
                      hasWater,
                      hasShelter
                    },
                    tacticalGuidance,
                    deployedPackId
                  }}
                />
              )}
              {activeTab === 'neural' && (
                <LiveStreamMonitor 
                  speakVoiceFeedback={speakVoiceFeedback}
                  onThreatDetected={(incident) => {
                    setChatLog((prev) => [
                      ...prev,
                      {
                        sender: "anis",
                        text: `### 🚨 NEURAL SCANNER THREAT ACQUIRED
*   **Incident Type**: ${incident.type}
*   **Safety Rating**: ${incident.threatLevel} STATUS
*   **Target Range**: ${incident.distance}
*   **Analysis**: ${incident.description}`,
                        timestamp: new Date().toLocaleTimeString(),
                        priority: incident.threatLevel === 'CRITICAL' ? "CRITICAL STATUS" : "WARNING STATUS"
                      }
                    ]);
                  }}
                />
              )}
              {activeTab === 'pwa' && (
                <PWAInstallConsole 
                  speakVoiceFeedback={speakVoiceFeedback}
                  batteryLevel={batteryLevel}
                  batterySaver={batterySaver}
                  signalStrength={signalStrength}
                />
              )}
            </div>

          </div>

        </main>

        {/* Dedicated Mobile Search & Favorites Panel */}
        <div className={`${mobilePanel === 'search' ? 'flex-1 overflow-y-auto p-4' : 'hidden'} lg:hidden bg-[#070b13] scrollbar-thin`}>
          <GlobalSearchConsole
            latitude={latitude}
            longitude={longitude}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
            speakVoiceFeedback={speakVoiceFeedback}
            destinationWaypoint={destinationWaypoint}
            setDestinationWaypoint={setDestinationWaypoint}
            setChatLog={setChatLog}
          />
        </div>

        {/* Right Side Column: Interactive Voice & Chat Tactical Assistant Console */}
        <div className={`${mobilePanel === 'ai' ? 'flex flex-col h-full flex-1' : 'hidden'} lg:flex lg:flex-col lg:col-span-4 lg:h-full overflow-hidden bg-[#090d18]/95 border-l border-[#131d35]`}>
          
          {/* Integrated voice control system at top of sidebar */}
          <div className="p-3 bg-[#0c1324]/60 border-b border-[#142340]">
            <VoiceAssistantCore
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              voiceEnabled={voiceEnabled}
              setVoiceEnabled={setVoiceEnabled}
              speakVoiceFeedback={speakVoiceFeedback}
              querySurvivalAI={querySurvivalAI}
              triggerEmergencySOS={triggerEmergencySOS}
              cancelEmergencySOS={cancelEmergencySOS}
              setLatitude={setLatitude}
              setLongitude={setLongitude}
              setMapStyle={setMapStyle}
              setTrackingActive={setTrackingActive}
              destinationWaypoint={destinationWaypoint}
              setDestinationWaypoint={setDestinationWaypoint}
              activeAiBrain={activeAiBrain}
              setActiveAiBrain={setActiveAiBrain}
              setChatLog={setChatLog}
              mobilePanel={mobilePanel}
              setMobilePanel={setMobilePanel}
              onSearchPlaceTriggered={(query) => {
                const lower = query.toLowerCase();
                if (lower.includes("delhi") || lower.includes("india")) {
                  setLatitude(28.6139); setLongitude(77.2090);
                  speakVoiceFeedback("Coordinate lock on Delhi headquarters camp.");
                } else if (lower.includes("rockies") || lower.includes("usa") || lower.includes("colorado")) {
                  setLatitude(39.7392); setLongitude(-104.9903);
                  speakVoiceFeedback("Coordinate lock on Rockies emergency ridge.");
                } else if (lower.includes("alps") || lower.includes("europe") || lower.includes("swiss")) {
                  setLatitude(45.8326); setLongitude(6.8652);
                  speakVoiceFeedback("Coordinate lock on Alps Swiss glacier post.");
                } else if (lower.includes("jungle") || lower.includes("amazon") || lower.includes("manaus")) {
                  setLatitude(-3.4653); setLongitude(-62.2159);
                  speakVoiceFeedback("Coordinate lock on Amazon basecamp camp.");
                } else if (lower.includes("rishikesh")) {
                  setLatitude(30.0869); setLongitude(78.2676);
                  speakVoiceFeedback("Coordinate lock on Rishikesh foothills.");
                } else if (lower.includes("mussoorie")) {
                  setLatitude(30.4598); setLongitude(78.0792);
                  speakVoiceFeedback("Coordinate lock on Mussoorie hillbase.");
                }
              }}
            />
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <AIAssistantConsole
              chatLog={chatLog}
              chatInput={chatInput}
              setChatInput={setChatInput}
              aiStatus={aiStatus}
              activeAiBrain={activeAiBrain}
              setActiveAiBrain={setActiveAiBrain}
              querySurvivalAI={querySurvivalAI}
              analyzeDanger={analyzeDanger}
              checkLostStatus={checkLostStatus}
              estimateBatterySurvival={estimateBatterySurvival}
              speakVoiceFeedback={speakVoiceFeedback}
            />
          </div>
        </div>

        {/* Sticky Mobile Bottom Navigation Rail */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#080d19]/95 border-t border-[#1a2d4f]/80 backdrop-blur-md z-[999] flex items-center justify-around px-2 py-1 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <button
            id="mobile_nav_btn_telemetry"
            onClick={() => {
              setMobilePanel('telemetry');
              speakVoiceFeedback("Accessing telemetry sensors.");
            }}
            className={`flex flex-col items-center gap-0.5 py-1 text-[9px] font-mono font-bold transition-all min-w-[50px] min-h-[44px] justify-center cursor-pointer ${
              mobilePanel === 'telemetry' ? 'text-sky-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>SENSORS</span>
          </button>

          <button
            id="mobile_nav_btn_map"
            onClick={() => {
              setMobilePanel('map');
              speakVoiceFeedback("Displaying navigation grid.");
            }}
            className={`flex flex-col items-center gap-0.5 py-1 text-[9px] font-mono font-bold transition-all min-w-[50px] min-h-[44px] justify-center cursor-pointer ${
              mobilePanel === 'map' ? 'text-sky-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Map className="w-5 h-5" />
            <span>MAP</span>
          </button>

          <button
            id="mobile_nav_btn_search"
            onClick={() => {
              setMobilePanel('search');
              speakVoiceFeedback("Opening worldwide search index.");
            }}
            className={`flex flex-col items-center gap-0.5 py-1 text-[9px] font-mono font-bold transition-all min-w-[50px] min-h-[44px] justify-center cursor-pointer ${
              mobilePanel === 'search' ? 'text-sky-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>SEARCH</span>
          </button>

          <button
            id="mobile_nav_btn_cockpit"
            onClick={() => {
              setMobilePanel('cockpit');
              speakVoiceFeedback("Opening survival checklist cockpits.");
            }}
            className={`flex flex-col items-center gap-0.5 py-1 text-[9px] font-mono font-bold transition-all min-w-[50px] min-h-[44px] justify-center cursor-pointer ${
              mobilePanel === 'cockpit' ? 'text-sky-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span>COCKPIT</span>
          </button>

          <button
            id="mobile_nav_btn_ai"
            onClick={() => {
              setMobilePanel('ai');
              speakVoiceFeedback("Focusing voice intelligence agent.");
            }}
            className={`flex flex-col items-center gap-0.5 py-1 text-[9px] font-mono font-bold transition-all min-w-[50px] min-h-[44px] justify-center cursor-pointer ${
              mobilePanel === 'ai' ? 'text-sky-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>ANIS AI</span>
          </button>
        </div>

      </div> )}

    </div>
  );
}

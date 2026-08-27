export interface Waypoint {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: string;
  type: 'user' | 'crumb' | 'hazard' | 'shelter' | 'water' | 'checkpoint' | 'geofence' | 'hotspot';
  label?: string;
  notes?: string;
  radius?: number; // for geofencing
  severity?: 'low' | 'medium' | 'high'; // for hotspots
}

export interface TerrainAnalysis {
  riskScore: number;
  warnings: string[];
  safeRoutingRecommended: boolean;
}

export interface LostDetection {
  isLost: boolean;
  lostProbability: number;
  indicators: string[];
}

export interface BatteryEstimate {
  estimatedHours: number;
  drainRatePerHour: number;
  recommendation: string;
}

export interface SurvivalGuidance {
  guidance: string;
  priority: string;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
}

export interface EmergencyStatus {
  isActive: boolean;
  beaconTimer: number;
  beaconsSent: number;
  contactsNotified: boolean;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  isSOSRecipient: boolean;
  isLiveLocationShared: boolean;
}

export interface BackpackItem {
  id: string;
  name: string;
  category: 'essential' | 'medical' | 'navigation' | 'tools' | 'sustenance';
  quantity: number;
  isSecured: boolean;
}

export interface SecureDocument {
  id: string;
  name: string;
  type: 'ID' | 'Medical' | 'Insurance' | 'Emergency Contact' | 'Other';
  fileName: string;
  uploadedAt: string;
  encryptedContent: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  category: 'First Aid' | 'Self Defense' | 'Wilderness Navigation' | 'Disaster Response';
}

export type AISpecialization = 
  | 'survival' 
  | 'medical' 
  | 'navigation' 
  | 'wildlife' 
  | 'disaster' 
  | 'security' 
  | 'mental' 
  | 'equipment';

export interface AISpecialistProfile {
  id: AISpecialization;
  name: string;
  icon: string;
  tagline: string;
  systemInstruction: string;
  avatarColor: string;
}

export interface IndiaState {
  name: string;
  capital: string;
  lat: number;
  lng: number;
  type: "State" | "Union Territory";
  description: string;
}

export interface AssamVillage {
  name: string;
  district: string;
  subdivision: string;
  lat: number;
  lng: number;
  altitude: number;
  terrain: string;
  populationEstimate: string;
  description: string;
}

export interface SearchResultPlace {
  name: string;
  lat: number;
  lng: number;
  category: "State" | "District" | "City" | "Village" | "Landmark" | "Hospital" | "Police" | "Bunker" | "Water" | "Shelter";
  description: string;
  state: string;
  district: string;
  terrain: string;
  altitude: number;
  populationEstimate: string;
}

export interface SessionExportData {
  exportTimestamp: string;
  appVersion: string;
  sessionSummary: {
    totalLogs: number;
    totalWaypoints: number;
    emergencyActive: boolean;
    batteryLevel: number;
    terrain: string;
    coordinates: string;
    status: string;
  };
  survivalStatus: {
    emergency: EmergencyStatus;
    fallDetected?: boolean;
    aiDangerDetected?: boolean;
    aiDangerReason?: string;
    telemetry: {
      latitude: number;
      longitude: number;
      altitude: number;
      heading: number;
      terrain: string;
      temperature: number;
      batteryLevel: number;
      batterySaver: boolean;
      signalStrength: string;
      hasWater: boolean;
      hasShelter: boolean;
    };
    tacticalGuidance?: SurvivalGuidance;
    deployedPackId?: string;
  };
  waypoints: {
    crumbHistory: Waypoint[];
    placedWaypoints: Waypoint[];
    destinationWaypoint: Waypoint | null;
    safeZones?: Array<{ id: string; name: string; latitude: number; longitude: number; radius: number }>;
  };
  sessionLogs: Array<{
    sender: "user" | "anis";
    text: string;
    timestamp: string;
    priority?: string;
  }>;
  vaultDocuments?: Array<{
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
  }>;
  emergencyMedicalProfile?: {
    bloodType: string;
    allergies: string;
    emergencyPhone: string;
    criticalNotes: string;
  };
}


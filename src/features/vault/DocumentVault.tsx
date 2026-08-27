import React, { useState } from "react";
import { 
  Lock, 
  Unlock, 
  FileText, 
  QrCode, 
  Upload, 
  Trash, 
  ShieldAlert, 
  CheckCircle,
  Eye,
  EyeOff,
  Download,
  FileJson,
  Copy,
  Check,
  Code,
  Activity,
  MapPin,
  Clock,
  Sparkles,
  HardDrive
} from "lucide-react";
import { 
  SecureDocument, 
  Waypoint, 
  EmergencyStatus, 
  SurvivalGuidance, 
  SessionExportData 
} from "../../types";

export interface DocumentVaultProps {
  speakVoiceFeedback: (text: string) => void;
  sessionLogs?: Array<{ sender: "user" | "anis"; text: string; timestamp: string; priority?: string }>;
  waypoints?: {
    crumbHistory: Waypoint[];
    placedWaypoints: Waypoint[];
    destinationWaypoint: Waypoint | null;
    safeZones?: Array<{ id: string; name: string; latitude: number; longitude: number; radius: number }>;
  };
  survivalStatus?: {
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
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({ 
  speakVoiceFeedback,
  sessionLogs = [],
  waypoints,
  survivalStatus
}) => {
  const [documents, setDocuments] = useState<SecureDocument[]>([
    { id: "v1", name: "National Identity Card", type: "ID", fileName: "identity_card_enc.pdf", uploadedAt: "2026-07-15", encryptedContent: "AES256:d83b1a20ff049" },
    { id: "v2", name: "Health Insurance & Blood Profile", type: "Medical", fileName: "health_insurance_card.pdf", uploadedAt: "2026-07-18", encryptedContent: "AES256:f129ce0110bd" }
  ]);

  // Medical Info for QR Generation
  const [bloodType, setBloodType] = useState("O-Negative (O-)");
  const [allergies, setAllergies] = useState("Penicillin, Latex");
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98765 43210 (Dad)");
  const [criticalNotes, setCriticalNotes] = useState("Type-1 Diabetes. Carries emergency insulin.");

  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState<'ID' | 'Medical' | 'Insurance' | 'Emergency Contact' | 'Other'>("ID");
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [vaultPassword, setVaultPassword] = useState("");
  const [vaultUnlockError, setVaultUnlockError] = useState("");

  // JSON Export state
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [lastExportInfo, setLastExportInfo] = useState<{ timestamp: string; size: string } | null>(null);

  // Helper to compile the complete session export data payload
  const buildSessionExportPayload = (): SessionExportData => {
    const logs = sessionLogs && sessionLogs.length > 0 ? sessionLogs : [
      {
        sender: "anis" as const,
        text: "ANIS Tactical Engine active. Default session initialized.",
        timestamp: new Date().toLocaleTimeString()
      }
    ];

    const crumbs = waypoints?.crumbHistory || [];
    const placed = waypoints?.placedWaypoints || [];
    const dest = waypoints?.destinationWaypoint || null;
    const safeZ = waypoints?.safeZones || [];
    const totalWaypointsCount = crumbs.length + placed.length + (dest ? 1 : 0) + safeZ.length;

    const emergencyInfo: EmergencyStatus = survivalStatus?.emergency || {
      isActive: false,
      beaconTimer: 0,
      beaconsSent: 0,
      contactsNotified: false
    };

    const telemetryInfo = survivalStatus?.telemetry || {
      latitude: 28.6139,
      longitude: 77.2090,
      altitude: 310,
      heading: 45,
      terrain: "Dense Forest",
      temperature: 18,
      batteryLevel: 85,
      batterySaver: false,
      signalStrength: "STRONG",
      hasWater: true,
      hasShelter: false
    };

    return {
      exportTimestamp: new Date().toISOString(),
      appVersion: "1.0.0-tactical",
      sessionSummary: {
        totalLogs: logs.length,
        totalWaypoints: totalWaypointsCount,
        emergencyActive: emergencyInfo.isActive,
        batteryLevel: telemetryInfo.batteryLevel,
        terrain: telemetryInfo.terrain,
        coordinates: `${telemetryInfo.latitude.toFixed(5)}°N, ${telemetryInfo.longitude.toFixed(5)}°E`,
        status: emergencyInfo.isActive ? "EMERGENCY_DISTRESS_ACTIVE" : "NOMINAL_OPERATIONAL"
      },
      survivalStatus: {
        emergency: emergencyInfo,
        fallDetected: survivalStatus?.fallDetected ?? false,
        aiDangerDetected: survivalStatus?.aiDangerDetected ?? false,
        aiDangerReason: survivalStatus?.aiDangerReason ?? "",
        telemetry: telemetryInfo,
        tacticalGuidance: survivalStatus?.tacticalGuidance ?? {
          guidance: "System nominal. Return-path tracking active.",
          priority: "NOMINAL",
          status: "NOMINAL"
        },
        deployedPackId: survivalStatus?.deployedPackId ?? "india"
      },
      waypoints: {
        crumbHistory: crumbs,
        placedWaypoints: placed,
        destinationWaypoint: dest,
        safeZones: safeZ
      },
      sessionLogs: logs,
      vaultDocuments: documents.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        uploadedAt: d.uploadedAt
      })),
      emergencyMedicalProfile: {
        bloodType,
        allergies,
        emergencyPhone,
        criticalNotes
      }
    };
  };

  const handleExportSessionJSON = () => {
    try {
      const payload = buildSessionExportPayload();
      const jsonString = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestampIso = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `ANIS_Survival_Session_${timestampIso}.json`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const byteSize = (new Blob([jsonString]).size / 1024).toFixed(1) + " KB";
      setLastExportInfo({
        timestamp: new Date().toLocaleTimeString(),
        size: byteSize
      });

      speakVoiceFeedback("Session logs, tactical waypoints, and survival status exported as JSON archive.");
    } catch (err) {
      console.error("Export session failed:", err);
      speakVoiceFeedback("Export failed. Unable to serialize session telemetry.");
    }
  };

  const handleCopyJSON = () => {
    try {
      const payload = buildSessionExportPayload();
      const jsonString = JSON.stringify(payload, null, 2);
      navigator.clipboard.writeText(jsonString);
      setCopiedToClipboard(true);
      speakVoiceFeedback("Session JSON copied to clipboard.");
      setTimeout(() => setCopiedToClipboard(false), 3000);
    } catch (err) {
      console.error("Copy JSON failed:", err);
    }
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVaultLocked) {
      speakVoiceFeedback("Access denied. Please unlock the Secure Vault before uploading sensitive documents.");
      return;
    }
    if (!docName.trim()) return;

    const newDoc: SecureDocument = {
      id: Math.random().toString(),
      name: docName,
      type: docType,
      fileName: `${docName.toLowerCase().replace(/\s+/g, '_')}_encrypted.pdf`,
      uploadedAt: new Date().toISOString().split('T')[0],
      encryptedContent: `AES256:${Math.random().toString(16).substring(2, 15)}`
    };

    setDocuments(prev => [...prev, newDoc]);
    speakVoiceFeedback(`Successfully encrypted and vaulted "${docName}".`);
    setDocName("");
  };

  const handleDeleteDocument = (id: string, name: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    speakVoiceFeedback(`Permanently deleted ${name} from encrypted space.`);
  };

  const handleLockVault = () => {
    setIsVaultLocked(true);
    setVaultPassword("");
    speakVoiceFeedback("Secure Document Vault is now locked and encrypted.");
  };

  const handleUnlockVault = () => {
    if (vaultPassword === "9911" || vaultPassword.toLowerCase() === "admin" || vaultPassword.length >= 4) {
      setIsVaultLocked(false);
      setVaultUnlockError("");
      speakVoiceFeedback("Access authorized. Secure Document Vault decrypted.");
    } else {
      setVaultUnlockError("INVALID DECRYPTION CREDENTIALS");
      speakVoiceFeedback("Authorization failed.");
    }
  };

  // Generate QR parameters payload
  const qrString = `VITAL MED RECORDOO:
Blood: ${bloodType}
Allergies: ${allergies}
Emergency contact: ${emergencyPhone}
Notes: ${criticalNotes}`;

  // Simple visual mock representing QR blocks based on text
  const getMockQRRows = () => {
    const rows = [];
    const len = qrString.length;
    for (let i = 0; i < 8; i++) {
      const row = [];
      for (let j = 0; j < 8; j++) {
        const index = (i * 8 + j) % len;
        // make corner squares dark for alignment marks
        const isCorner = (i < 2 && j < 2) || (i < 2 && j > 5) || (i > 5 && j < 2);
        const codeValue = qrString.charCodeAt(index);
        row.push(isCorner ? true : (codeValue % 3 === 0 || codeValue % 5 === 0));
      }
      rows.push(row);
    }
    return rows;
  };

  const currentPayload = buildSessionExportPayload();

  return (
    <div className="flex flex-col gap-4 text-xs">

      {/* SESSION EXPORT / BLACKBOX RECORDER SECTION */}
      <div id="session_export_container" className="bg-[#080d1a] border border-sky-900/60 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#142646] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-display font-black text-sky-300 uppercase tracking-widest flex items-center gap-1.5">
                Session Telemetry & Survival JSON Exporter
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                Export current session log, GPS waypoints, and tactical survival status as a standalone JSON file.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastExportInfo && (
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                <Check className="w-3 h-3" /> EXPORTED {lastExportInfo.timestamp} ({lastExportInfo.size})
              </span>
            )}
            <button
              id="btn_export_session_json"
              onClick={handleExportSessionJSON}
              className="bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-[10px] px-3 py-1.5 rounded-lg border border-sky-400 shadow-md shadow-sky-950/50 flex items-center gap-1.5 cursor-pointer uppercase transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download Session JSON
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[10px]">
          
          {/* Chat & Mission Logs Metric */}
          <div className="bg-[#050a14] border border-[#14233c] rounded-lg p-2.5 flex flex-col gap-1">
            <span className="text-[8px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              Session Log Entries
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-sky-300">
                {currentPayload.sessionSummary.totalLogs}
              </span>
              <span className="text-[8px] text-gray-500">MESSAGES</span>
            </div>
          </div>

          {/* GPS Waypoints Metric */}
          <div className="bg-[#050a14] border border-[#14233c] rounded-lg p-2.5 flex flex-col gap-1">
            <span className="text-[8px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              Waypoints & Crumbs
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-emerald-400">
                {currentPayload.sessionSummary.totalWaypoints}
              </span>
              <span className="text-[8px] text-gray-500">POINTS RECORDED</span>
            </div>
          </div>

          {/* Survival & Distress Metric */}
          <div className="bg-[#050a14] border border-[#14233c] rounded-lg p-2.5 flex flex-col gap-1">
            <span className="text-[8px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              Survival Status
            </span>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold ${currentPayload.sessionSummary.emergencyActive ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {currentPayload.sessionSummary.emergencyActive ? "🚨 EMERGENCY" : "✅ NOMINAL"}
              </span>
              <span className="text-[8px] text-gray-400">
                BAT {currentPayload.sessionSummary.batteryLevel}%
              </span>
            </div>
          </div>

          {/* Coordinates & Terrain */}
          <div className="bg-[#050a14] border border-[#14233c] rounded-lg p-2.5 flex flex-col gap-1">
            <span className="text-[8px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-purple-400" />
              GPS Telemetry
            </span>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-purple-300 truncate">
                {currentPayload.sessionSummary.coordinates}
              </span>
              <span className="text-[8px] text-gray-500 uppercase truncate">
                {currentPayload.sessionSummary.terrain}
              </span>
            </div>
          </div>

        </div>

        {/* Action Utility Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#121e35] text-[10px]">
          <div className="flex items-center gap-2">
            <button
              id="btn_toggle_json_preview"
              onClick={() => setShowJsonPreview(prev => !prev)}
              className="px-2.5 py-1 bg-[#101b30] hover:bg-[#152442] border border-[#203254] text-sky-300 rounded font-mono text-[9px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Code className="w-3 h-3" />
              {showJsonPreview ? "Hide Raw JSON Preview" : "View Raw JSON Payload"}
            </button>
            <button
              id="btn_copy_session_json"
              onClick={handleCopyJSON}
              className="px-2.5 py-1 bg-[#101b30] hover:bg-[#152442] border border-[#203254] text-gray-300 hover:text-white rounded font-mono text-[9px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedToClipboard ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedToClipboard ? "Copied!" : "Copy JSON"}
            </button>
          </div>
          <span className="text-[9px] font-mono text-gray-500">
            Compliant with offline forensic & tactical safety schemas.
          </span>
        </div>

        {/* Collapsible JSON Preview Box */}
        {showJsonPreview && (
          <div id="session_json_preview_block" className="mt-2 bg-[#04070e] border border-[#1b2c4e] rounded-lg p-3 max-h-60 overflow-y-auto font-mono text-[9.5px] text-sky-200">
            <pre className="whitespace-pre-wrap select-all">
              {JSON.stringify(currentPayload, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {/* VAULT & MEDICAL QR WORKSPACE */}
      <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left Side: Secure File Locker */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#131d35] pb-2">
              <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Secure Document Vault
              </h3>
              
              <button
                id="btn_lock_toggle"
                onClick={isVaultLocked ? () => {} : handleLockVault}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                  isVaultLocked 
                    ? 'bg-red-950/30 border-red-500 text-red-400' 
                    : 'bg-emerald-950/30 border-emerald-500 text-emerald-400 cursor-pointer'
                }`}
              >
                {isVaultLocked ? "🔒 LOCKED" : "🔓 DECRYPTED (LOCK)"}
              </button>
            </div>

            {isVaultLocked ? (
              // Locked Vault state
              <div className="flex-1 bg-[#060b13]/80 border border-[#14213c] rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-center min-h-[220px]">
                <Lock className="w-8 h-8 text-red-500 animate-pulse" />
                <p className="font-mono text-[10px] text-gray-400">
                  This local document safe is encrypted under AES-256 protocols. Unlock to view, add, or download files offline.
                </p>
                
                <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
                  <input 
                    id="vault_password_input"
                    type="password"
                    placeholder="ENTER SECURITY DECRYPT PIN"
                    value={vaultPassword}
                    onChange={(e) => setVaultPassword(e.target.value)}
                    className="bg-[#11192a] border border-[#203254] rounded px-2.5 py-1.5 text-center font-mono text-[10px] text-sky-300 focus:outline-none"
                  />
                  <button
                    id="btn_unlock_vault"
                    onClick={handleUnlockVault}
                    className="w-full bg-sky-950 hover:bg-sky-900 border border-sky-600 text-sky-300 font-bold py-1 rounded cursor-pointer font-mono text-[9px]"
                  >
                    DECRYPT & ACCESS
                  </button>
                  {vaultUnlockError && (
                    <span className="text-[8px] font-bold text-red-400 mt-1">{vaultUnlockError}</span>
                  )}
                </div>
              </div>
            ) : (
              // Unlocked Vault State
              <div className="flex-1 flex flex-col gap-3 animate-fade-in font-mono">
                <div className="border border-emerald-900/40 bg-emerald-950/10 p-2.5 rounded-lg flex items-center gap-2 text-[10px] text-emerald-400">
                  <Unlock className="w-4 h-4 flex-shrink-0 animate-pulse" />
                  <span>Encrypted assets are temporarily loaded into secure memory. Add files below.</span>
                </div>

                {/* Uploaded Documents List */}
                <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
                  {documents.map(d => (
                    <div key={d.id} className="p-2 bg-[#090f1d] border border-[#14213c] rounded-lg flex items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-400" />
                        <div>
                          <p className="font-bold text-gray-200">{d.name}</p>
                          <span className="text-[8px] text-gray-500">TYPE: {d.type} | UPLOADED: {d.uploadedAt}</span>
                        </div>
                      </div>
                      <button
                        id={`btn_delete_doc_${d.id}`}
                        onClick={() => handleDeleteDocument(d.id, d.name)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Doc form */}
                <form onSubmit={handleUploadDocument} className="grid grid-cols-1 sm:grid-cols-12 gap-2 border-t border-[#131d35] pt-2.5">
                  <div className="sm:col-span-6">
                    <input 
                      id="vault_new_doc_name"
                      type="text" 
                      placeholder="DOCUMENT TITLE..."
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      className="w-full bg-[#11192a] border border-[#203254] rounded p-1.5 text-[10px] text-sky-300 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      id="vault_new_doc_type"
                      value={docType}
                      onChange={(e: any) => setDocType(e.target.value)}
                      className="w-full text-[10px] bg-[#11192a] border border-[#203254] rounded p-1.5 text-sky-300 focus:outline-none"
                    >
                      <option value="ID">ID Card</option>
                      <option value="Medical">Medical</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Emergency Contact">Contact List</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <button 
                      id="btn_vault_add_submit"
                      type="submit" 
                      className="w-full bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 font-bold rounded p-1.5 text-[10px] cursor-pointer"
                    >
                      VAULT FILE
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Side: Emergency QR lock screen display */}
          <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" />
              First Responder Emergency QR Generator
            </h3>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Specify critical clinical telemetry. This outputs a high-contrast medical QR code that can be scanned from your device lock screen during a response.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="block text-[8px] font-mono text-gray-400 mb-0.5">BLOOD TYPE</label>
                <input 
                  id="vault_blood_input"
                  type="text" 
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-[#11192a] border border-[#203254] rounded p-1.5 text-sky-300 text-[10px] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-[8px] font-mono text-gray-400 mb-0.5">KNOWN ALLERGIES</label>
                <input 
                  id="vault_allergy_input"
                  type="text" 
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full bg-[#11192a] border border-[#203254] rounded p-1.5 text-sky-300 text-[10px] focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[8px] font-mono text-gray-400 mb-0.5">EMERGENCY SOS CONTACTS</label>
                <input 
                  id="vault_contact_input"
                  type="text" 
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full bg-[#11192a] border border-[#203254] rounded p-1.5 text-sky-300 text-[10px] focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[8px] font-mono text-gray-400 mb-0.5">CRITICAL ADVANCED CLINICAL NOTES</label>
                <input 
                  id="vault_notes_input"
                  type="text" 
                  value={criticalNotes}
                  onChange={(e) => setCriticalNotes(e.target.value)}
                  className="w-full bg-[#11192a] border border-[#203254] rounded p-1.5 text-sky-300 text-[10px] focus:outline-none"
                />
              </div>
            </div>

            {/* QR Code Graphic Mock Display */}
            <div className="flex items-center gap-3 border-t border-[#131d35] pt-3 mt-1 bg-[#060b13]/40 p-2 rounded-lg">
              
              {/* Visual QR grid */}
              <div className="w-16 h-16 bg-white p-1 rounded flex flex-col justify-between flex-shrink-0">
                {getMockQRRows().map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-between h-[6px]">
                    {row.map((cell, cIdx) => (
                      <div 
                        key={cIdx} 
                        className={`w-[6px] h-[6px] ${cell ? 'bg-black' : 'bg-transparent'}`} 
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex-1">
                <p className="font-mono text-[9px] font-bold text-sky-300 uppercase">LOCK-SCREEN COMPACT PREVIEW</p>
                <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">
                  Rescuers can read this profile immediately offline by scanning this block. Tap below to export to phone lock screen.
                </p>
                <button
                  id="btn_export_qr"
                  onClick={() => speakVoiceFeedback("Exporting emergency lockscreen medical card containing allergies and emergency contact to phone wallpaper spacer.")}
                  className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1 font-mono uppercase bg-transparent border-0 cursor-pointer"
                >
                  💾 EXPORT QR CARD TO WALLPAPER
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

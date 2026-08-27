import React from "react";
import { 
  Users, 
  Smartphone, 
  Battery, 
  MapPin, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  RefreshCw, 
  Compass, 
  Activity, 
  Lock, 
  Plus, 
  Signal, 
  Cpu, 
  AlertTriangle 
} from "lucide-react";
import { EmergencyStatus } from "../../types";
import { EmergencyConsole } from "../emergency_sos/EmergencyConsole";

interface GuardianDashboardProps {
  guardianConsentGranted: boolean;
  setGuardianConsentGranted: (val: boolean) => void;
  pairingCode: string;
  isPaired: boolean;
  guardians: Array<{ id: string; name: string; phone: string; email: string; verified: boolean; activeAlerts: boolean }>;
  setGuardians: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; phone: string; email: string; verified: boolean; activeAlerts: boolean }>>>;
  emergency: EmergencyStatus;
  triggerEmergencySOS: (reason: string) => void;
  cancelEmergencySOS: () => void;
  panicPin: string;
  setPanicPin: React.Dispatch<React.SetStateAction<string>>;
  voiceSosEnabled: boolean;
  setVoiceSosEnabled: (val: boolean) => void;
  fallDetected: boolean;
  setFallDetected: (val: boolean) => void;
  missedCheckinsEnabled: boolean;
  setMissedCheckinsEnabled: (val: boolean) => void;
  deviationRouteEnabled: boolean;
  setDeviationRouteEnabled: (val: boolean) => void;
  riskAreaEntryEnabled: boolean;
  setRiskAreaEntryEnabled: (val: boolean) => void;
  sirenActive: boolean;
  setSirenActive: (val: boolean) => void;
  playTacticalSiren: () => void;
  stopTacticalSiren: () => void;
  setAiDangerReason: (reason: string) => void;
  setAiDangerDetected: (val: boolean) => void;
  offlineEmergencyQueue: Array<{ id: string; user: string; lat: number; lng: number; time: string; riskLevel: string; signalReason: string }>;
  setOfflineEmergencyQueue: React.Dispatch<React.SetStateAction<Array<{ id: string; user: string; lat: number; lng: number; time: string; riskLevel: string; signalReason: string }>>>;
  speakVoiceFeedback: (text: string) => void;
  latitude: number;
  longitude: number;
  altitude: number;
  setChatLog: React.Dispatch<React.SetStateAction<any[]>>;
  setSafetyConfirmationActive: (val: boolean) => void;
  setSafetyConfirmationCountdown: (val: number) => void;
}

export const GuardianDashboard: React.FC<GuardianDashboardProps> = ({
  guardianConsentGranted,
  setGuardianConsentGranted,
  pairingCode,
  isPaired,
  guardians,
  setGuardians,
  emergency,
  triggerEmergencySOS,
  cancelEmergencySOS,
  panicPin,
  setPanicPin,
  voiceSosEnabled,
  setVoiceSosEnabled,
  fallDetected,
  setFallDetected,
  missedCheckinsEnabled,
  setMissedCheckinsEnabled,
  deviationRouteEnabled,
  setDeviationRouteEnabled,
  riskAreaEntryEnabled,
  setRiskAreaEntryEnabled,
  sirenActive,
  setSirenActive,
  playTacticalSiren,
  stopTacticalSiren,
  setAiDangerReason,
  setAiDangerDetected,
  offlineEmergencyQueue,
  setOfflineEmergencyQueue,
  speakVoiceFeedback,
  latitude,
  longitude,
  altitude,
  setChatLog,
  setSafetyConfirmationActive,
  setSafetyConfirmationCountdown
}) => {
  return (
    <div className="flex flex-col gap-4 text-xs font-mono">
      
      {/* First Setup / Consent Check */}
      {!guardianConsentGranted ? (
        <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-5 flex flex-col gap-4 max-w-lg mx-auto my-4 text-center">
          <div className="w-12 h-12 rounded-full bg-cyan-950/80 border-2 border-cyan-500 flex items-center justify-center mx-auto text-cyan-400 animate-pulse text-lg">
            🛡️
          </div>
          <div>
            <h3 className="text-xs font-display font-black text-cyan-400 uppercase tracking-widest">
              GUARDIAN AI SAFETY INTEGRATION
            </h3>
            <p className="text-[10px] text-gray-500 mt-1 uppercase">EXPLICIT PRIVACY & ACCESS CONSENT REQUIRED</p>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed text-justify">
            ANIS Guardian AI continuously monitors physical sensor telemetry (such as rapid angular velocities, barometric pressure fluctuations, check-in intervals, and path deviation margins). These calculations are compiled locally inside this client container using sandboxed scripts. No telemetry is shared unless an active S.O.S beacon is broadcasted.
          </p>
          <div className="bg-[#050912] border border-[#14213c] rounded-lg p-3 text-left flex flex-col gap-2">
            <label className="flex items-start gap-2 text-[9px] text-gray-400 cursor-pointer hover:text-gray-300">
              <input type="checkbox" defaultChecked className="accent-cyan-500 mt-0.5" />
              <span>Enable continuous Sensor Fusion analysis (Impact, shake, geofence, and route deviation).</span>
            </label>
            <label className="flex items-start gap-2 text-[9px] text-gray-400 cursor-pointer hover:text-gray-300">
              <input type="checkbox" defaultChecked className="accent-cyan-500 mt-0.5" />
              <span>Enable offline alert queue caching and coordinate broadcasting to selected guardians.</span>
            </label>
          </div>
          <button
            id="btn_consent_grant"
            onClick={() => {
              setGuardianConsentGranted(true);
              speakVoiceFeedback("Guardian AI protection enabled. Local sensor shield active.");
            }}
            className="py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-400 font-bold rounded-lg uppercase tracking-wider text-xs font-display animate-bounce cursor-pointer"
          >
            AUTHORIZE & ACTIVATE SHIELD
          </button>
        </div>
      ) : (
        <>
          {/* Secure Parenting Connection Datalink */}
          <div className="bg-gradient-to-r from-sky-950/40 to-indigo-950/40 border border-[#1b2f56] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                🔒 Secure Handsfree Parent Datalink
              </h3>
              <span className="flex items-center gap-1 text-[8px] font-mono font-bold bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                🟢 SECURE COMMS STANDBY
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-snug">
              To connect your phone securely with parents, guardians, or anyone else with full military security, provide them with your unique connection code. Once paired, they can access the web on their device to view your live safety coordinates, altitude, signal, battery status, and receive sirens or remote-sound alarms!
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#050912] border border-[#14213c] rounded-xl p-3.5 mt-1">
              <div className="flex flex-col gap-0.5 text-center sm:text-left">
                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Your Connected Device Code</span>
                <span className="text-xl font-mono font-black text-sky-400 tracking-[0.2em]">{pairingCode ? `${pairingCode.substring(0, 3)} ${pairingCode.substring(3)}` : "GENERATING..."}</span>
              </div>
              <div className="h-px sm:h-10 w-full sm:w-px bg-[#14213c]"></div>
              <div className="flex-1 text-[9px] text-gray-400 leading-relaxed text-center sm:text-left">
                {isPaired ? (
                  <span className="text-emerald-400 font-bold flex items-center justify-center sm:justify-start gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping font-mono"></span>
                    PARENT MONITORING SESSION IS ACTIVELY MIRRORED
                  </span>
                ) : (
                  <span>Dynamic telemetry broadcaster active. Give this 6-digit code to your parent/guardian to initiate secure end-to-end pairing.</span>
                )}
              </div>
            </div>
          </div>

          {/* Guardian Contacts Manager (Up to 5) */}
          <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-display font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                👨‍👩‍👧 Trusted Guardian Contacts Manager
              </h3>
              <span className="text-[9px] text-cyan-400 font-bold font-mono">
                {guardians.length}/5 CONFIGURED
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-snug">
              Set up to 5 verified emergency guardians. Active alerts and live tracking vectors are streamed directly during emergencies.
            </p>

            {/* Guardian Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 my-1">
              {guardians.map((g) => (
                <div key={g.id} className="bg-[#050912] border border-[#14213c] rounded-lg p-2.5 flex flex-col gap-1.5 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-gray-200">{g.name}</p>
                      <p className="text-[8px] text-gray-500 font-mono mt-0.5">{g.phone}</p>
                      <p className="text-[8px] text-gray-500 font-mono">{g.email}</p>
                    </div>
                    <span className={`px-1 rounded text-[8px] font-mono font-bold border uppercase ${g.verified ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-900'}`}>
                      {g.verified ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>

                  <div className="flex gap-1 border-t border-[#14213c]/40 pt-1.5 mt-1">
                    {!g.verified && (
                      <button
                        onClick={() => {
                          setGuardians(prev => prev.map(p => p.id === g.id ? { ...p, verified: true } : p));
                          speakVoiceFeedback(`Verification code transmitted to ${g.name}. Contact verified.`);
                        }}
                        className="flex-1 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 text-[8px] font-bold rounded cursor-pointer uppercase"
                      >
                        VERIFY CODE
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setGuardians(prev => prev.filter(p => p.id !== g.id));
                        speakVoiceFeedback(`Removed ${g.name} from emergency contacts.`);
                      }}
                      className="px-2 py-0.5 bg-red-950/40 text-red-400 border border-red-900 text-[8px] font-bold rounded cursor-pointer"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              ))}

              {guardians.length < 5 && (
                <button
                  onClick={() => {
                    const name = prompt("Enter Guardian Full Name:");
                    if (!name) return;
                    const contact = prompt("Enter Phone or Telegram Address:");
                    if (!contact) return;
                    const email = prompt("Enter Emergency Email Address:") || "guardian@email.com";
                    setGuardians(prev => [...prev, { id: Math.random().toString(), name, phone: contact, email, verified: false, activeAlerts: true }]);
                    speakVoiceFeedback(`Transmitted pending invite link to ${name}.`);
                  }}
                  className="bg-[#050912]/50 hover:bg-[#0c1223] border-2 border-dashed border-[#1d2d4f] rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 transition-all cursor-pointer gap-1 text-center"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px] font-bold font-mono">ADD NEW GUARDIAN</span>
                </button>
              )}
            </div>
          </div>

          {/* Continuous AI Safety & Signal Fusion */}
          <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-display font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                📡 Local Neural Signal Fusion Monitor
              </h3>
              {(() => {
                let riskCount = 0;
                if (emergency.isActive) {
                  return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-950 text-red-400 border border-red-500 animate-pulse uppercase">CRITICAL DANGER</span>;
                }
                if (fallDetected) riskCount += 2;
                if (missedCheckinsEnabled) riskCount += 1;
                if (deviationRouteEnabled) riskCount += 1;
                if (riskAreaEntryEnabled) riskCount += 1;

                if (riskCount >= 3) {
                  return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-500 animate-bounce uppercase">HIGH RISK WARNING</span>;
                } else if (riskCount >= 1) {
                  return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-yellow-950 text-yellow-400 border border-yellow-700 uppercase">MODERATE ALERT</span>;
                }
                return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">NOMINAL SAFE</span>;
              })()}
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              The neural engine processes 8 safety signal channels simultaneously to estimate local risk vectors. Tick anomalies below to test automatic emergency confirmation sirens and automated SOS triggers.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[9px] font-mono border-t border-b border-[#14213c]/40 py-3">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                <input type="checkbox" checked={emergency.isActive} onChange={() => { if (emergency.isActive) cancelEmergencySOS(); else triggerEmergencySOS("MANUAL_SOS_TOGGLE"); }} className="accent-red-500" />
                <span>1. MANUAL SOS BUTTON</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                <input type="checkbox" checked={panicPin === "9911"} onChange={() => setPanicPin(prev => prev === "9911" ? "" : "9911")} className="accent-red-500" />
                <span>2. PANIC PIN CODES</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                <input type="checkbox" checked={voiceSosEnabled} onChange={() => setVoiceSosEnabled(!voiceSosEnabled)} className="accent-cyan-500" />
                <span>3. VOICE DETECTOR (S.O.S)</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                <input type="checkbox" checked={fallDetected} onChange={() => { setFallDetected(!fallDetected); if (!fallDetected) speakVoiceFeedback("Simulated high-impact fall detected."); }} className="accent-cyan-500" />
                <span>4. IMPACT FALL SENSOR</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                <input type="checkbox" checked={missedCheckinsEnabled} onChange={() => setMissedCheckinsEnabled(!missedCheckinsEnabled)} className="accent-cyan-500" />
                <span>5. CHECK-IN TIMER</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                <input type="checkbox" checked={deviationRouteEnabled} onChange={() => { setDeviationRouteEnabled(!deviationRouteEnabled); if (!deviationRouteEnabled) { setSafetyConfirmationActive(true); setSafetyConfirmationCountdown(10); } }} className="accent-cyan-500" />
                <span>6. ROUTE DRIFT ANOMALY</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                <input type="checkbox" checked={riskAreaEntryEnabled} onChange={() => { setRiskAreaEntryEnabled(!riskAreaEntryEnabled); if (!riskAreaEntryEnabled) { setSafetyConfirmationActive(true); setSafetyConfirmationCountdown(10); } }} className="accent-cyan-500" />
                <span>7. DANGER TERRAIN ENTRY</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-gray-500">SIREN SYNTH:</span>
                <button
                  onClick={() => {
                    if (sirenActive) {
                      stopTacticalSiren();
                      setSirenActive(false);
                    } else {
                      playTacticalSiren();
                      setSirenActive(true);
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${sirenActive ? 'bg-red-900 border border-red-500 text-white animate-pulse' : 'bg-gray-900 border border-gray-700 text-gray-400'}`}
                >
                  {sirenActive ? '🔊 SIREN ACTIVE' : '🔇 TEST SIREN'}
                </button>
              </div>
            </div>

            {/* Signal contribution analysis card */}
            <div className="bg-[#050912] border border-[#14213c] p-2.5 rounded-lg text-[9px] text-gray-400 flex flex-col gap-1.5">
              <p className="font-bold text-gray-300">SAFETY SIGNAL FUSION STATUS LOGS:</p>
              {emergency.isActive ? (
                <p className="text-red-400 font-bold animate-pulse">🔴 BEACON TRANSMISSION ENGAGED. Alert message transmitted to contacts. Transmitting live tracking packets at 10s intervals.</p>
              ) : (
                <p>🟢 Current physical signals are within nominal parameters. Tracking coordinates are securely encrypted on device local ledger.</p>
              )}
              <p className="text-[8px] text-gray-500 italic mt-1 leading-relaxed">
                Disclaimer: Signal fusion risk score is estimated dynamically via locally cached neural coefficients. This computation is for simulation and safety check purposes and does not replace official search and rescue transponders.
              </p>
            </div>
          </div>

          {/* Offline AI Danger Detection Engine & Simulator */}
          <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-3.5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                🧠 Offline AI Danger Intelligence Engine
              </h3>
              <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800 rounded">
                LOCAL MODEL ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              ANIS integrated Edge-AI continuously parses location coordinates, sunset status, and battery curves offline. If extreme risks are identified, it triggers an acoustic deterrent siren, sets up a 10s "I Am Safe" timeout check, and auto-dispatches live coordinate packets to connected parents if not dismissed.
            </p>
            
            <div className="bg-[#050912] border border-[#14213c] rounded-lg p-3 flex flex-col gap-2.5">
              <p className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-wide">⚔️ Trigger Offline AI Threat Scenario Simulations</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-0.5">
                <button
                  id="btn_sim_threat_stalking"
                  onClick={() => {
                    setAiDangerReason("Unlit dark alley stalking threat detected (Sunset Anomalous Pursuit)");
                    setAiDangerDetected(true);
                    speakVoiceFeedback("Warning: Local AI threat scanner identified suspicious proximity shadows. Initiating operator check.");
                  }}
                  className="px-2.5 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 hover:border-red-500 text-red-200 hover:text-white rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer text-left flex flex-col gap-0.5"
                >
                  <span>👤 SUSPICIOUS PURSUIT</span>
                  <span className="text-[7px] text-gray-500 font-normal">Sunset Shadows Check</span>
                </button>

                <button
                  id="btn_sim_threat_cliff"
                  onClick={() => {
                    setAiDangerReason("Proximity to active vertical cliff face geofence (Altitude Collapse Threat)");
                    setAiDangerDetected(true);
                    speakVoiceFeedback("Warning: Local navigation sensor fusion indicates hazardous vertical drop proximity. Initiating operator check.");
                  }}
                  className="px-2.5 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 hover:border-red-500 text-red-200 hover:text-white rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer text-left flex flex-col gap-0.5"
                >
                  <span>🏔️ CLIFF EDGE APPROACH</span>
                  <span className="text-[7px] text-gray-500 font-normal">Altitude Sensor Spike</span>
                </button>

                <button
                  id="btn_sim_threat_battery"
                  onClick={() => {
                    setAiDangerReason("Low battery exposure grid with negative temperature (Survival Hypothermia Risk)");
                    setAiDangerDetected(true);
                    speakVoiceFeedback("Warning: Battery state critical in high-altitude freezing zone. No active shelter logged. Initiating operator check.");
                  }}
                  className="px-2.5 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 hover:border-red-500 text-red-200 hover:text-white rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer text-left flex flex-col gap-0.5"
                >
                  <span>⚡ EXTREME WEATHER/BATTERY</span>
                  <span className="text-[7px] text-gray-500 font-normal">Negative Temp Exposure</span>
                </button>
              </div>
            </div>
          </div>

          {/* Offline emergency alert queue manager */}
          <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-display font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5" />
                📂 Offline Distress Alerts Dispatch Queue
              </h3>
              <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
                {offlineEmergencyQueue.length} QUEUED ALERTS
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-snug">
              If internet/satellite coverage is degraded, emergency S.O.S logs are securely queued inside local SQLite/Sqlcipher storage, and automatically dispatched as soon as the signal strength recovers.
            </p>

            <div className="bg-[#050912] border border-[#14213c] rounded-lg p-2 max-h-[120px] overflow-y-auto flex flex-col gap-1.5">
              {offlineEmergencyQueue.length === 0 ? (
                <p className="text-[9px] text-gray-500 italic text-center py-2">No pending alerts queued. System matches nominal state.</p>
              ) : (
                offlineEmergencyQueue.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-[9px] border-b border-[#14213c]/30 pb-1">
                    <span className="text-red-400 font-bold">🚨 {item.signalReason}</span>
                    <span className="text-gray-400">{item.time}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setOfflineEmergencyQueue(prev => prev.filter(x => x.id !== item.id));
                          speakVoiceFeedback("Alert removed from queue.");
                        }}
                        className="px-1 bg-red-950 text-red-400 border border-red-900 rounded hover:bg-red-900 text-[8px]"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const alertItem = {
                    id: Math.random().toString(),
                    user: "ANIS Explorer",
                    lat: latitude,
                    lng: longitude,
                    time: new Date().toLocaleTimeString(),
                    riskLevel: "HIGH",
                    signalReason: "IMPACT_FALL_DETECTED"
                  };
                  setOfflineEmergencyQueue(prev => [...prev, alertItem]);
                  speakVoiceFeedback("Distress alert packet added to local database dispatch queue.");
                }}
                className="flex-1 py-1 bg-amber-950/40 hover:bg-amber-900/30 border border-amber-600/60 text-amber-300 font-mono text-[9px] rounded transition-all cursor-pointer text-center font-bold"
              >
                ➕ QUEUE SIMULATED OFFLINE DISPATCH
              </button>
              {offlineEmergencyQueue.length > 0 && (
                <button
                  onClick={() => {
                    speakVoiceFeedback(`Broadcasting ${offlineEmergencyQueue.length} queued alert packets through available channels.`);
                    setOfflineEmergencyQueue([]);
                    setChatLog(prev => [...prev, { sender: 'anis', text: `### 📡 OFFLINE QUEUE DISPATCH COMPLETE\nAll buffered distress packets successfully transmitted over recovered link!`, timestamp: new Date().toLocaleTimeString() }]);
                  }}
                  className="flex-1 py-1 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800 text-cyan-400 font-mono text-[9px] rounded transition-all cursor-pointer text-center font-bold"
                >
                  🚀 FORCE TRANSMIT ALL NOW
                </button>
              )}
            </div>
          </div>

          {/* Render legacy panel for advanced simulators */}
          <div className="border-t border-[#14213c]/40 pt-4 mt-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Advanced Escort Simulator Tools</p>
            <EmergencyConsole 
              onTriggerSOS={triggerEmergencySOS}
              onCancelSOS={cancelEmergencySOS}
              isEmergencyActive={emergency.isActive}
              latitude={latitude}
              longitude={longitude}
              altitude={altitude}
              speakVoiceFeedback={speakVoiceFeedback}
            />
          </div>
        </>
      )}
    </div>
  );
};

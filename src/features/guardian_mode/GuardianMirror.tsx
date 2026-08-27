import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Smartphone, 
  Battery, 
  MapPin, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Map as MapIcon, 
  ShieldCheck, 
  RefreshCw, 
  Compass, 
  Activity, 
  ExternalLink,
  Lock,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { startLoudAlarm, stopLoudAlarm, stopAllEmergencyAudio } from "../../lib/audio";
import maplibregl from "maplibre-gl";

interface GuardianMirrorProps {
  speakVoiceFeedback: (text: string) => void;
}

interface PairedChildStatus {
  code: string;
  childId: string;
  latitude: number;
  longitude: number;
  altitude: number;
  batteryLevel: number;
  isEmergency: boolean;
  aiDangerDetected: boolean;
  aiDangerReason: string;
  sirenTriggeredByParent: boolean;
  lastUpdated: number;
}

export const GuardianMirror: React.FC<GuardianMirrorProps> = ({ speakVoiceFeedback }) => {
  const [pairingCodeInput, setPairingCodeInput] = useState<string>("");
  const [connectedCode, setConnectedCode] = useState<string | null>(null);
  const [childStatus, setChildStatus] = useState<PairedChildStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [parentSirenOverride, setParentSirenOverride] = useState<boolean>(false);
  const [showLiveMap, setShowLiveMap] = useState<boolean>(true);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Poll server for child status
  useEffect(() => {
    if (!connectedCode) {
      setChildStatus(null);
      setIsPolling(false);
      setIsReconnecting(false);
      stopLoudAlarm();
      return;
    }

    setIsPolling(true);
    setErrorMsg(null);
    let consecutiveFailures = 0;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/pairing/status/${connectedCode}`);
        if (!res.ok) {
          throw new Error("Connection lost or pairing code expired.");
        }
        const data: PairedChildStatus = await res.json();
        setChildStatus(data);
        setParentSirenOverride(data.sirenTriggeredByParent);
        setIsReconnecting(false);
        consecutiveFailures = 0;
        setErrorMsg(null);

        // TRIGGER PARENT LOUD ALARM IF CHILD IS IN DANGER
        if (data.isEmergency || data.aiDangerDetected) {
          startLoudAlarm();
        } else {
          stopLoudAlarm();
        }
      } catch (err: any) {
        consecutiveFailures++;
        if (consecutiveFailures >= 5 || !childStatus) {
          setErrorMsg(err.message || "Failed to sync status.");
          setIsReconnecting(false);
          stopLoudAlarm();
          if (!childStatus) {
            setConnectedCode(null);
          }
        } else {
          setIsReconnecting(true);
        }
      }
    };

    // Initial fetch
    fetchStatus();

    const interval = setInterval(fetchStatus, 1500); // Fast real-time updates every 1.5s
    return () => {
      clearInterval(interval);
      stopLoudAlarm();
    };
  }, [connectedCode]);

  // Map Synchronization Effect
  useEffect(() => {
    if (!connectedCode || !childStatus || !mapContainerRef.current || !showLiveMap) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    const { latitude, longitude } = childStatus;

    if (!mapRef.current) {
      // Initialize Mini map for parent view
      try {
        mapRef.current = new maplibregl.Map({
          container: mapContainerRef.current,
          style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json", // High-contrast dark style
          center: [longitude, latitude],
          zoom: 14,
          interactive: true,
          attributionControl: false
        });

        // Suppress unhandled tile/style fetch exceptions gracefully
        mapRef.current.on("error", (e) => {
          console.warn("Guardian map background network load deferred:", e);
        });

        const el = document.createElement("div");
        el.className = "flex items-center justify-center w-8 h-8 rounded-full border bg-red-950/90 border-red-500 animate-pulse";
        el.innerHTML = `
          <span class="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping"></span>
        `;

        markerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
      } catch (e) {
        console.warn("Failed to init parent map:", e);
      }
    } else {
      // Dynamic move marker and pan
      mapRef.current.easeTo({ center: [longitude, latitude], duration: 800 });
      if (markerRef.current) {
        markerRef.current.setLngLat([longitude, latitude]);
      }
    }
  }, [childStatus?.latitude, childStatus?.longitude, connectedCode, showLiveMap]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopLoudAlarm();
    };
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = pairingCodeInput.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit secure numeric code.");
      return;
    }

    setConnectedCode(cleanCode);
    speakVoiceFeedback("Establishing secure encryption channel to operator cockpit...");
  };

  const handleDisconnect = () => {
    setConnectedCode(null);
    setChildStatus(null);
    setErrorMsg(null);
    stopLoudAlarm();
    speakVoiceFeedback("Parent secure mirror console deactivated.");
  };

  // Toggle Remote Siren Trigger
  const handleToggleRemoteSiren = async () => {
    if (!connectedCode) return;
    const nextState = !parentSirenOverride;
    try {
      const res = await fetch("/api/pairing/parent-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: connectedCode, triggerSiren: nextState })
      });
      if (res.ok) {
        setParentSirenOverride(nextState);
        speakVoiceFeedback(nextState ? "Broadcasting remote siren trigger signal to operator phone." : "Sending remote siren mute protocol.");
      }
    } catch (e) {
      console.warn("Remote control error:", e);
    }
  };

  return (
    <div className="bg-[#090e1a]/80 border border-[#142340] rounded-2xl p-6 flex flex-col gap-5 text-gray-100 font-sans backdrop-blur-md">
      
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-[#1b2f56] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-950/80 border border-sky-500/30 rounded-xl text-sky-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-display font-black uppercase tracking-widest text-sky-400">PARENT & GUARDIAN SECURE MIRROR</h2>
            <p className="text-[10px] text-gray-400">Zero-Trust Real-time Safety Telemetry Mirroring & Remote Siren Control</p>
          </div>
        </div>
        {connectedCode && (
          isReconnecting ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 border border-amber-500/40 rounded-full text-[9px] font-mono text-amber-400 font-bold uppercase animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              RECONNECTING...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-500/40 rounded-full text-[9px] font-mono text-emerald-400 font-bold uppercase animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Real-time Connected
            </span>
          )
        )}
      </div>

      {/* Connection Setup (If NOT Connected) */}
      {!connectedCode ? (
        <div className="flex flex-col gap-4">
          <div className="bg-[#0d1425]/75 border border-[#182d54] rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-mono font-bold text-sky-300 flex items-center gap-1.5 uppercase">
              <Lock className="w-4 h-4 text-sky-400" />
              Pair with Operator Phone
            </h3>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              To mirror a family member's phone securely, request their 6-Digit connection code (located in their tactical cockpit under the Comms or SOS panel) and input it below.
            </p>

            <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-3 mt-2">
              <input 
                id="pairing_code_input"
                type="text"
                maxLength={6}
                placeholder="ENTER 6-DIGIT CODE (E.G. 482103)"
                value={pairingCodeInput}
                onChange={(e) => setPairingCodeInput(e.target.value.replace(/\D/g, ""))}
                className="flex-1 bg-[#0a0f1d] border border-[#233d71] rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-[0.25em] text-sky-400 focus:outline-none focus:border-sky-500 font-bold"
              />
              <button 
                id="btn_pair_parent"
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
              >
                CONNECT DEPLOYED COCKPIT
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {errorMsg && (
              <p className="text-[10px] font-mono font-bold text-red-400 mt-1">⚠️ {errorMsg}</p>
            )}
          </div>

          {/* Quick instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] text-gray-400">
            <div className="bg-[#0b101f]/40 border border-[#121c32] p-3 rounded-xl flex flex-col gap-1">
              <span className="font-bold text-sky-400">1. Generate Code</span>
              <span>The operator taps "Generate Pairing Key" in their tactical COMMS dashboard.</span>
            </div>
            <div className="bg-[#0b101f]/40 border border-[#121c32] p-3 rounded-xl flex flex-col gap-1">
              <span className="font-bold text-sky-400">2. Secure Handshake</span>
              <span>Enter the 6-digit code on this device to establish a direct secure sync channel.</span>
            </div>
            <div className="bg-[#0b101f]/40 border border-[#121c32] p-3 rounded-xl flex flex-col gap-1">
              <span className="font-bold text-sky-400">3. Active Safeguards</span>
              <span>Receive automatic coordinates, battery warnings, and sound the sirens remotely!</span>
            </div>
          </div>
        </div>
      ) : (
        // ACTIVE GUARDIAN TELEMETRY MONITORING VIEW
        <div className="flex flex-col gap-5">
          
          {/* Critical Emergency Banner (Flashes when child in distress) */}
          {(childStatus?.isEmergency || childStatus?.aiDangerDetected) && (
            <div className="bg-red-950 border-2 border-red-500 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse text-white">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div>
                  <h3 className="font-display font-black text-sm tracking-wide text-red-200">🚨 OPERATOR IN CRITICAL DISTRESS!</h3>
                  <p className="text-[10px] text-red-300">
                    {childStatus.aiDangerDetected ? `AI Danger Alert: "${childStatus.aiDangerReason}"` : "SOS Beacon Broadcaster Active."}
                  </p>
                </div>
              </div>
              
              <a 
                id="parent_maps_link"
                href={`https://www.google.com/maps/search/?api=1&query=${childStatus.latitude},${childStatus.longitude}`}
                target="_blank" 
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all"
              >
                OPEN GOOGLE MAPS COORD
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Connected Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Left Column: Live Telemetry Metrics */}
            <div className="md:col-span-5 flex flex-col gap-4">
              
              <div className="bg-[#0a0f1d] border border-[#1c305a] rounded-xl p-4 flex flex-col gap-3.5">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">DEVICE HARNESS DATALINK</span>
                
                {/* ID & Update State */}
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-400">OPERATOR ID:</span>
                  <span className="text-sky-300 font-bold">{childStatus?.childId || "LOADING..."}</span>
                </div>

                {/* Battery Status */}
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-400">BATTERY CHARGE:</span>
                  <div className="flex items-center gap-1.5">
                    <Battery className={`w-4 h-4 ${childStatus && childStatus.batteryLevel < 20 ? 'text-red-500 animate-bounce' : 'text-emerald-400'}`} />
                    <span className={`font-bold ${childStatus && childStatus.batteryLevel < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {childStatus ? `${childStatus.batteryLevel}%` : "LOADING..."}
                    </span>
                  </div>
                </div>

                {/* Safe Status */}
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-400">AI THREAT RATING:</span>
                  {childStatus ? (
                    <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${
                      childStatus.isEmergency ? 'bg-red-950 border border-red-500 text-red-400' :
                      childStatus.aiDangerDetected ? 'bg-amber-950 border border-amber-500 text-amber-400' :
                      'bg-emerald-950 border border-emerald-500 text-emerald-400'
                    }`}>
                      {childStatus.isEmergency ? 'CRITICAL DISTRESS' :
                       childStatus.aiDangerDetected ? 'AI DANGER THREAT' :
                       'NOMINAL/SECURE'}
                    </span>
                  ) : "LOADING..."}
                </div>

                {/* Live Coordinates */}
                <div className="flex justify-between items-center text-[11px] font-mono border-t border-[#14213d] pt-2.5">
                  <span className="text-gray-400">POSITION:</span>
                  <span className="text-sky-300 font-bold">
                    {childStatus ? `${childStatus.latitude.toFixed(5)}°N, ${childStatus.longitude.toFixed(5)}°E` : "LOADING..."}
                  </span>
                </div>

                {/* Altitude */}
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-400">ALTITUDE PROFILE:</span>
                  <span className="text-gray-300">{childStatus ? `${childStatus.altitude} m` : "LOADING..."}</span>
                </div>

                {/* Last Synced */}
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                  <span>DATA LATENCY:</span>
                  <span>{childStatus ? `${Math.floor((Date.now() - childStatus.lastUpdated) / 1000)}s ago` : "LOADING..."}</span>
                </div>
              </div>

              {/* Secure Siren Control Panel */}
              <div className="bg-[#0c1426] border border-[#1e345e] rounded-xl p-4 flex flex-col gap-3">
                <span className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-widest">REMOTE COMBAT TRIGGER</span>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  You can remotely trigger a full-blast defensive siren on your child's phone to deter physical threat, signal rescue teams, or alert loiterers.
                </p>

                <button 
                  id="btn_trigger_remote_siren"
                  onClick={handleToggleRemoteSiren}
                  className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    parentSirenOverride 
                      ? "bg-red-600 border-red-500 text-white animate-pulse" 
                      : "bg-sky-950/40 hover:bg-sky-900/40 border-sky-600 text-sky-400"
                  }`}
                >
                  {parentSirenOverride ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {parentSirenOverride ? "MUTING OPERATOR PHONE SIREN..." : "🔊 TRIGGER REMOTE PHONE SIREN"}
                </button>
              </div>

              {/* Stop Parent Siren */}
              <button 
                id="btn_disconnect_parent"
                onClick={handleDisconnect}
                className="w-full py-2 bg-gray-900 border border-gray-700 text-gray-400 rounded-xl font-mono text-xs hover:text-white transition-all cursor-pointer"
              >
                🔌 SEVER TELEMETRY PAIRING LINK
              </button>

            </div>

            {/* Right Column: Live Map */}
            <div className="md:col-span-7 flex flex-col gap-2 h-[340px] md:h-auto min-h-[300px]">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">REAL-TIME TACTICAL RADAR</span>
                <button
                  onClick={() => setShowLiveMap(!showLiveMap)}
                  className="text-[9px] font-mono text-sky-400 hover:underline"
                >
                  {showLiveMap ? "Hide Map Grid" : "Show Map Grid"}
                </button>
              </div>

              {showLiveMap ? (
                <div 
                  ref={mapContainerRef} 
                  className="flex-1 rounded-xl border border-[#1b2f5c] overflow-hidden min-h-[220px]"
                />
              ) : (
                <div className="flex-1 rounded-xl border border-dashed border-gray-800 bg-[#060a12] flex flex-col items-center justify-center text-center p-6">
                  <MapIcon className="w-12 h-12 text-gray-700 mb-2" />
                  <p className="text-xs text-gray-500 font-mono">Radar Visualizer Throttled</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

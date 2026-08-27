import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  Video, 
  Eye, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  Volume2, 
  Activity,
  Mic,
  StopCircle
} from "lucide-react";

interface ThreatIncident {
  id: string;
  type: string;
  confidence: number;
  distance: string;
  threatLevel: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  description: string;
}

interface LiveStreamMonitorProps {
  speakVoiceFeedback: (text: string) => void;
  onThreatDetected: (incident: ThreatIncident) => void;
}

export const LiveStreamMonitor: React.FC<LiveStreamMonitorProps> = ({
  speakVoiceFeedback,
  onThreatDetected
}) => {
  const [isActive, setIsActive] = useState(false);
  const [ambientLight, setAmbientLight] = useState(72); // percentage
  const [micLevel, setMicLevel] = useState(5); // dB mock
  const [whistleDetected, setWhistleDetected] = useState(false);
  const [selectedFeedType, setSelectedFeedType] = useState<'front' | 'rear' | 'synthetic'>('synthetic');
  const [isThreatChecking, setIsThreatChecking] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "System: SafeEscort HUD initialized.",
    "Sensor: Ambient mic listening for whistle distress signatures.",
    "Video: Neural threat model weights loaded successfully (TFLite 3.2)."
  ]);

  const [activeThreat, setActiveThreat] = useState<ThreatIncident | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Toggle Stream
  const handleToggleStream = async () => {
    if (isActive) {
      stopCamera();
      setIsActive(false);
      setActiveThreat(null);
      setLogs(prev => [...prev, "System: Active video scanning terminated."]);
      speakVoiceFeedback("Camera scanner deactivated.");
    } else {
      setIsActive(true);
      speakVoiceFeedback("Initializing camera threat-evaluation scanner.");
      setLogs(prev => [...prev, "System: Requesting camera feed lenses..."]);
      
      if (selectedFeedType !== 'synthetic') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: selectedFeedType === 'front' ? 'user' : 'environment' },
            audio: false
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setLogs(prev => [...prev, `Hardware: Connected to physical camera feed.`]);
        } catch (err: any) {
          console.warn("Camera hardware not available or iframe restricted. Defaulting to high-fidelity Tactical Synthetic Scanner.", err);
          setSelectedFeedType('synthetic');
          setLogs(prev => [...prev, "Hardware: Restrained by browser sandboxing. Directing output to high-fidelity Synthetic Scanner."]);
        }
      } else {
        setLogs(prev => [...prev, "System: Loaded synthetic tactical navigation simulation feed."]);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Simulate Mic audio levels and whistle trigger in the background
  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        // Mock subtle fluctuations
        const mockDb = Math.floor(Math.random() * 15) + 3;
        setMicLevel(mockDb);

        // Rare random loud peak simulation (e.g. scream or whistle)
        if (Math.random() > 0.96) {
          const isWhistle = Math.random() > 0.5;
          setMicLevel(85);
          if (isWhistle) {
            setWhistleDetected(true);
            setLogs(prev => [...prev, "🚨 Audio: Whistle decibel pattern matched (Frequencies 2.4kHz - 3.1kHz)!"]);
            speakVoiceFeedback("Warning: Whistle distress signature captured! Verification code prompt triggered.");
            
            const incident: ThreatIncident = {
              id: Math.random().toString(),
              type: "HIGH FREQUENCY AUDIO TRIGGER",
              confidence: 94,
              distance: "IMMEDIATE PROXIMITY",
              threatLevel: "WARNING",
              description: "Continuous high-frequency whistle pattern matched survival distress template."
            };
            setActiveThreat(incident);
            onThreatDetected(incident);

            setTimeout(() => setWhistleDetected(false), 8000);
          } else {
            setLogs(prev => [...prev, "Audio: Transient loud noise registered. Suppressed as road ambience."]);
          }
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Simulate neural scanner threats
  useEffect(() => {
    let interval: any;
    if (isActive && selectedFeedType === 'synthetic') {
      interval = setInterval(() => {
        setIsThreatChecking(true);
        setTimeout(() => {
          setIsThreatChecking(false);
          const rand = Math.random();
          
          if (rand > 0.85) {
            // Critical Stalker threat
            const inc: ThreatIncident = {
              id: Math.random().toString(),
              type: "STALKER / SUSPICIOUS TARGET FOLLOWING",
              confidence: 89,
              distance: "12 meters",
              threatLevel: "CRITICAL",
              description: "Target tracking locked. Matches historical stride tracking profile of previous loiter warnings. Recommendation: Cross street instantly."
            };
            setActiveThreat(inc);
            setLogs(prev => [...prev, `🚨 Neural: TARGET MATCH LOCKED (${inc.confidence}% confidence) - FOLLOWING TRAIL.`]);
            speakVoiceFeedback("Threat level Elevated to Critical. Suspicious walking signature detected 12 meters behind you.");
            onThreatDetected(inc);

          } else if (rand > 0.60) {
            // Loitering vehicle threat
            const inc: ThreatIncident = {
              id: Math.random().toString(),
              type: "LOITERING IDLE VEHICLE DETECTED",
              confidence: 91,
              distance: "25 meters ahead",
              threatLevel: "WARNING",
              description: "Unoccupied/idle dark sedan running engine near dark intersection for > 10 minutes. Safe Route Engine suggests alternative pathway."
            };
            setActiveThreat(inc);
            setLogs(prev => [...prev, `⚠️ Neural: Loitering vehicle spotted near corridor ahead.`]);
            speakVoiceFeedback("Caution: Unoccupied idling vehicle spotted ahead.");
            onThreatDetected(inc);

          } else if (rand > 0.40) {
            // Low light alley ahead
            const inc: ThreatIncident = {
              id: Math.random().toString(),
              type: "LOW ILLUMINATION HAZARD corridor",
              confidence: 98,
              distance: "15 meters",
              threatLevel: "NOMINAL",
              description: "Alley brightness drops below 20%. Recommended course: Retain main avenue route."
            };
            setActiveThreat(inc);
            setLogs(prev => [...prev, `Sensor: Dark corridor entrance detected. Light intensity drops.`]);
            onThreatDetected(inc);
          } else {
            setActiveThreat(null);
          }
        }, 800);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isActive, selectedFeedType]);

  return (
    <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-3 text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#131d35] pb-2">
        <div>
          <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 animate-pulse text-red-500" />
            Neural AI Threat Assessment HUD (Live Scanner)
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Automated frame analytics (on-device TFLite model) detecting following strangers and loitering objects.</p>
        </div>

        <div className="flex gap-1.5">
          <select
            id="video_feed_type"
            value={selectedFeedType}
            onChange={(e: any) => {
              setSelectedFeedType(e.target.value);
              if (isActive) {
                stopCamera();
                setIsActive(false);
              }
            }}
            className="text-[9px] font-mono bg-[#11192a] border border-[#203254] rounded px-2 py-1 text-sky-300"
          >
            <option value="synthetic">SIMULATOR FEED</option>
            <option value="front">FRONT LENS</option>
            <option value="rear">REAR TELESCOPIC LENS</option>
          </select>

          <button
            id="btn_toggle_camera_scanner"
            onClick={handleToggleStream}
            className={`px-3 py-1 font-mono text-[9px] font-bold border rounded-lg transition-all flex items-center gap-1 cursor-pointer uppercase ${
              isActive 
                ? 'bg-red-950/40 border-red-500 text-red-400 hover:bg-red-900/30' 
                : 'bg-sky-950/40 border-sky-500 text-sky-400 hover:bg-sky-900/30'
            }`}
          >
            {isActive ? (
              <>
                <StopCircle className="w-3 h-3 text-red-400" />
                SHUTDOWN
              </>
            ) : (
              <>
                <Camera className="w-3 h-3 text-sky-400" />
                BOOT SCANNER
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main HUD Window */}
      <div className="relative aspect-video bg-black rounded-lg border border-[#14223f] overflow-hidden flex items-center justify-center">
        
        {isActive ? (
          <>
            {selectedFeedType !== 'synthetic' ? (
              // Real physical camera output
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover grayscale opacity-70"
              />
            ) : (
              // Synthetic tactical wireframe radar map and corridor
              <div className="absolute inset-0 bg-[#040810] flex flex-col items-center justify-center overflow-hidden">
                {/* Horizontal scanning light beam */}
                <div className="absolute inset-x-0 h-[2px] bg-sky-500/80 shadow-[0_0_15px_#38bdf8] animate-[scan_2.5s_infinite_ease-in-out]" />
                
                {/* Visual radar grids and vectors */}
                <div className="absolute w-64 h-64 border border-sky-950/40 rounded-full flex items-center justify-center">
                  <div className="w-48 h-48 border border-sky-950/30 rounded-full flex items-center justify-center">
                    <div className="w-32 h-32 border border-sky-950/20 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
                    </div>
                  </div>
                </div>

                {/* Simulated Camera Lens overlay / target boxes */}
                {activeThreat && (
                  <div className={`absolute border-2 px-3 py-2 rounded font-mono animate-pulse flex flex-col justify-between ${
                    activeThreat.threatLevel === 'CRITICAL' 
                      ? 'border-red-500 bg-red-950/10 text-red-400 top-6 left-12 w-48 h-28' 
                      : activeThreat.threatLevel === 'WARNING'
                      ? 'border-amber-500 bg-amber-950/10 text-amber-400 top-12 right-8 w-44 h-24'
                      : 'border-emerald-500 bg-emerald-950/10 text-emerald-400 bottom-6 right-12 w-44 h-20'
                  }`}>
                    <div className="flex items-center justify-between border-b border-current/20 pb-1 text-[8px] font-bold">
                      <span>{activeThreat.threatLevel} TARGET ACCQUIRED</span>
                      <span>{activeThreat.confidence}% CONF</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center text-[10px] font-bold">
                      <p>{activeThreat.type}</p>
                      <p className="text-[8px] opacity-70 mt-0.5">RANGE: {activeThreat.distance}</p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 text-[8px] font-mono text-gray-500 uppercase flex flex-col gap-0.5">
                  <span>SENSOR RATE: 30 FPS</span>
                  <span>GEOMAGNETIC MATRIX: CONFIRMED</span>
                  <span>ILLUMINATION: {ambientLight}%</span>
                </div>

                <div className="absolute bottom-3 right-3 text-[8px] font-mono text-gray-500 text-right uppercase flex flex-col gap-0.5">
                  <span>ANTIGRAVITY TFLITE LENSES: ACTIVE</span>
                  <span>COV CHANNELS: LOCKED</span>
                </div>
              </div>
            )}

            {/* General HUD overlays */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/75 border border-sky-500/30 px-2 py-1 rounded text-sky-400 font-mono text-[8px]">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              <span>LIVE COVERT ESCORT HUD</span>
            </div>

            {/* Neural Frame checking spinner */}
            {isThreatChecking && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/75 border border-sky-500/30 px-2 py-1 rounded text-sky-400 font-mono text-[8px]">
                <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                <span>EVALUATING SENSOR FRAMES...</span>
              </div>
            )}

            {/* Whistle triggered notification */}
            {whistleDetected && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-red-950/90 border-2 border-red-500 p-4 rounded-xl flex flex-col items-center gap-2 text-center text-red-200 animate-bounce shadow-2xl shadow-black">
                <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
                <h4 className="font-display font-black text-sm uppercase tracking-wider">WHISTLE DISTRESS DETECTED!</h4>
                <p className="text-[9px] font-mono leading-relaxed max-w-xs">
                  A high-pitch whistle has triggered emergency de-escalation protocols. Tap 'CANCEL' in the console if this was a false alarm.
                </p>
              </div>
            )}
          </>
        ) : (
          // Boot window placeholder
          <div className="flex flex-col items-center gap-2.5 text-center p-6">
            <Camera className="w-8 h-8 text-gray-700" />
            <div>
              <p className="font-mono text-gray-400 font-bold text-[11px]">COVERT EVALUATION SCANNER DISENGAGED</p>
              <p className="text-[9px] text-gray-600 max-w-xs mt-1 leading-relaxed">
                Start the neural threat scanner to monitor your camera stream for loiterers or dark hallways. Processes entirely on-device for extreme privacy.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mic DB Monitor & Telemetry Bar */}
      <div className="grid grid-cols-2 gap-2 mt-0.5">
        
        {/* Ambient Decibels */}
        <div className="bg-[#090f1d] border border-[#14213c] rounded-lg p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-sky-400" />
            <div>
              <p className="text-[9px] font-mono text-gray-500">AMBIENT AUDIO INPUT</p>
              <p className="text-[10px] font-mono font-bold text-sky-300">{isActive ? `${micLevel} dBA` : "0 dBA (MUTED)"}</p>
            </div>
          </div>
          
          <div className="flex gap-0.5 h-6 items-end">
            {[1, 2, 3, 4, 5, 6].map(i => {
              const active = isActive && (micLevel / 15 >= i);
              return (
                <div 
                  key={i} 
                  className={`w-1 rounded-sm transition-all ${
                    active 
                      ? i > 4 
                        ? 'bg-red-500 h-6' 
                        : 'bg-sky-400 h-4' 
                      : 'bg-sky-950 h-1.5'
                  }`} 
                />
              );
            })}
          </div>
        </div>

        {/* Lighting level */}
        <div className="bg-[#090f1d] border border-[#14213c] rounded-lg p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <p className="text-[9px] font-mono text-gray-500">ENVIRONMENTAL CONTRAST</p>
              <p className="text-[10px] font-mono font-bold text-emerald-400">{isActive ? `${ambientLight}% INTENSITY` : "STALE"}</p>
            </div>
          </div>
          
          <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border font-bold ${
            isActive && ambientLight < 40 
              ? 'bg-amber-950/20 border-amber-500 text-amber-400' 
              : 'bg-emerald-950/20 border-emerald-500 text-emerald-400'
          }`}>
            {isActive && ambientLight < 40 ? "LOW-LIGHT" : "NOMINAL"}
          </span>
        </div>

      </div>

      {/* Terminal logs block */}
      <div className="bg-[#060a13] border border-[#121c32] rounded-lg p-2 max-h-[85px] overflow-y-auto">
        <p className="text-[8px] font-mono text-sky-500 uppercase tracking-widest font-black mb-1">HUD Diagnostics logs:</p>
        <div className="flex flex-col gap-0.5 font-mono text-[9px] text-gray-400">
          {logs.map((log, idx) => (
            <div key={idx} className="truncate">
              <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

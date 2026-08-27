import React from "react";
import { 
  Compass, 
  Battery, 
  Signal, 
  Thermometer, 
  Droplet, 
  Home as HomeIcon, 
  MapPin, 
  Zap, 
  Cpu, 
  Layers, 
  Activity, 
  AlertTriangle, 
  RotateCcw,
  Settings
} from "lucide-react";

interface TelemetrySidebarProps {
  // Coordinates & Sliders
  latitude: number;
  setLatitude: (lat: number) => void;
  longitude: number;
  setLongitude: (lng: number) => void;
  altitude: number;
  setAltitude: (alt: number) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  terrain: string;
  setTerrain: (terrain: string) => void;

  // Battery & Resources
  batteryLevel: number;
  batterySaver: boolean;
  setBatterySaver: (val: boolean) => void;
  trackingActive: boolean;
  setTrackingActive: (val: boolean) => void;
  signalStrength: string;
  setSignalStrength: (strength: string) => void;
  hasWater: boolean;
  setHasWater: (val: boolean) => void;
  hasShelter: boolean;
  setHasShelter: (val: boolean) => void;

  // Offline Packs
  regionalPacks: Array<{
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
  }>;
  deployedPackId: string;
  packDownloadProgress: number | null;
  installingPackId: string | null;
  handleDeployPack: (pack: any) => void;

  // Diagnostics HUD
  showDevHud: boolean;
  setShowDevHud: (val: boolean) => void;
  fps: number;
  cpuUsage: number;
  ramUsage: number;
  luxValue: number;
  heading: number;
  getCompassDirection: (h: number) => string;

  // Simulator actions
  triggerFallSim: () => void;
  clearCrumbHistory: () => void;
  speakVoiceFeedback: (text: string) => void;
  setChatLog: React.Dispatch<React.SetStateAction<any[]>>;
}

export const TelemetrySidebar: React.FC<TelemetrySidebarProps> = ({
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  altitude,
  setAltitude,
  temperature,
  setTemperature,
  terrain,
  setTerrain,
  batteryLevel,
  batterySaver,
  setBatterySaver,
  trackingActive,
  setTrackingActive,
  signalStrength,
  setSignalStrength,
  hasWater,
  setHasWater,
  hasShelter,
  setHasShelter,
  regionalPacks,
  deployedPackId,
  packDownloadProgress,
  installingPackId,
  handleDeployPack,
  showDevHud,
  setShowDevHud,
  fps,
  cpuUsage,
  ramUsage,
  luxValue,
  heading,
  getCompassDirection,
  triggerFallSim,
  clearCrumbHistory,
  speakVoiceFeedback,
  setChatLog
}) => {
  return (
    <aside className="lg:col-span-3 border-r border-[#131d35] bg-[#090d18]/95 p-4 flex flex-col gap-4 overflow-y-auto h-full scrollbar-thin">
      
      {/* Telemetry Simulator Sliders */}
      <div className="bg-[#0c1221]/70 border border-[#14203a] p-4 rounded-xl flex flex-col gap-3.5">
        <h2 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          Telemetry Simulator
        </h2>
        
        {/* Latitude Slider */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">LATITUDE</span>
            <span className="text-sky-300 font-bold">{latitude.toFixed(5)}°N</span>
          </div>
          <input 
            id="simulator_latitude"
            type="range" 
            min="28.60" 
            max="28.63" 
            step="0.0001"
            value={latitude} 
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
            className="w-full accent-sky-500"
          />
        </div>

        {/* Longitude Slider */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">LONGITUDE</span>
            <span className="text-sky-300 font-bold">{longitude.toFixed(5)}°E</span>
          </div>
          <input 
            id="simulator_longitude"
            type="range" 
            min="77.20" 
            max="77.23" 
            step="0.0001"
            value={longitude} 
            onChange={(e) => setLongitude(parseFloat(e.target.value))}
            className="w-full accent-sky-500"
          />
        </div>

        {/* Elevation Slider */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">ALTITUDE / ELEVATION</span>
            <span className="text-sky-300 font-bold">{altitude}m</span>
          </div>
          <input 
            id="simulator_altitude"
            type="range" 
            min="0" 
            max="5000" 
            step="50"
            value={altitude} 
            onChange={(e) => setAltitude(parseInt(e.target.value))}
            className="w-full accent-sky-500"
          />
        </div>

        {/* Temperature Slider */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">TEMPERATURE</span>
            <span className={`${temperature < 5 || temperature > 35 ? 'text-red-400' : 'text-sky-300'} font-bold`}>
              {temperature}°C
            </span>
          </div>
          <input 
            id="simulator_temperature"
            type="range" 
            min="-10" 
            max="45" 
            step="1"
            value={temperature} 
            onChange={(e) => setTemperature(parseInt(e.target.value))}
            className="w-full accent-sky-500"
          />
        </div>

        {/* Terrain Profile Selector */}
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-1">TERRAIN PROFILE</label>
          <select
            id="simulator_terrain"
            value={terrain}
            onChange={(e) => {
              setTerrain(e.target.value);
              speakVoiceFeedback(`Terrain danger parameters adjusted to ${e.target.value}.`);
            }}
            className="w-full text-xs font-mono bg-[#11192a] border border-[#203254] rounded-lg p-2 text-sky-400 focus:outline-none"
          >
            <option value="Dense Forest">Dense Forest (Risk of orientation loss)</option>
            <option value="cliff">Cliff Terrain (High fall danger)</option>
            <option value="swamp">Wetland/Swamp (Disease & mud hazard)</option>
            <option value="snow">Glacier/Snow (Sub-zero freeze risk)</option>
            <option value="water">Deep Water Body (Rafting hazard)</option>
            <option value="open_field">Open field (Low risk baseline)</option>
          </select>
        </div>

        {/* Resource status checkmarks */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <label className="flex items-center gap-2 bg-[#121c32]/30 p-2 rounded border border-[#1e2f50] cursor-pointer hover:bg-[#121c32]/50">
            <input 
              id="chk_water"
              type="checkbox" 
              checked={hasWater} 
              onChange={(e) => {
                setHasWater(e.target.checked);
                speakVoiceFeedback(e.target.checked ? "Freshwater resource locked." : "Warning: water supply depleted.");
              }}
              className="rounded text-sky-500 accent-sky-500" 
            />
            <span className="text-[10px] font-mono text-gray-300">WATER SECURED</span>
          </label>

          <label className="flex items-center gap-2 bg-[#121c32]/30 p-2 rounded border border-[#1e2f50] cursor-pointer hover:bg-[#121c32]/50">
            <input 
              id="chk_shelter"
              type="checkbox" 
              checked={hasShelter} 
              onChange={(e) => {
                setHasShelter(e.target.checked);
                speakVoiceFeedback(e.target.checked ? "Shelter footprint validated." : "Warning: Exposure alert. Construct temporary shelter.");
              }}
              className="rounded text-sky-500 accent-sky-500" 
            />
            <span className="text-[10px] font-mono text-gray-300">SHELTER SECURED</span>
          </label>
        </div>
      </div>

      {/* Device Charge Status */}
      <div className="bg-[#0c1221]/70 border border-[#14203a] p-4 rounded-xl flex flex-col gap-3">
        <h2 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
          <Battery className="w-3.5 h-3.5" />
          Device Charge Status
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-6 bg-gray-800 border-2 border-gray-600 rounded flex items-center px-0.5">
              <div 
                className={`h-full rounded-sm transition-all ${
                  batteryLevel > 50 ? 'bg-emerald-500' : batteryLevel > 20 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                }`} 
                style={{ width: `${batteryLevel}%` }}
              ></div>
              <div className="absolute -right-1 top-1.5 w-1 h-2 bg-gray-600 rounded-r"></div>
            </div>
            <span className="text-sm font-mono font-bold text-gray-200">{batteryLevel}%</span>
          </div>
          <span className="text-xs font-mono text-gray-400">
            ~{((batteryLevel * (batterySaver ? 0.45 : 0.25))).toFixed(1)} hrs left
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-[#131d35] pt-2 mt-1">
          <div className="text-[10px] font-mono text-gray-400">
            BATTERY POWER SAVER MODE
          </div>
          <button
            id="toggle_battery_saver"
            onClick={() => {
              setBatterySaver(!batterySaver);
              speakVoiceFeedback(batterySaver ? "Power saver deactivated." : "Ultra low-power battery optimization activated.");
            }}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
              batterySaver ? 'bg-sky-500 flex justify-end' : 'bg-gray-700 flex justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white"></div>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#131d35] pt-2">
          <div className="text-[10px] font-mono text-gray-400">
            CRUMB GPS POLE ENGINE
          </div>
          <button
            id="toggle_tracking"
            onClick={() => {
              setTrackingActive(!trackingActive);
              speakVoiceFeedback(trackingActive ? "GPS route logging paused." : "Realtime route tracking and crumb drop engaged.");
            }}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border cursor-pointer ${
              trackingActive 
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' 
                : 'bg-gray-900 border-gray-700 text-gray-500'
            }`}
          >
            {trackingActive ? "TRACKING ACTIVE" : "PAUSED"}
          </button>
        </div>

        {/* Power meters */}
        <div className="border-t border-[#131d35] pt-3 mt-1 flex flex-col gap-2 bg-[#050912] rounded-lg p-2.5">
          <div className="flex justify-between items-center text-[9px] font-mono text-gray-400">
            <span>⚡ MIL-SPEC POWER METERS</span>
            <span className={batterySaver ? "text-emerald-400 font-bold animate-pulse" : "text-amber-500"}>
              {batterySaver ? "ULTRA OPTIMIZED" : "STANDARD DRAIN"}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
            <div className="flex flex-col gap-0.5">
              <span className="text-gray-500">Screen Output Draw:</span>
              <span className={`font-bold ${batterySaver ? "text-emerald-400" : "text-amber-500"}`}>
                {batterySaver ? "12 mW (OLED Pitch Black)" : "420 mW (Full WebGL RGB)"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-gray-500">GPS Polling Rate:</span>
              <span className="text-gray-300 font-bold">
                {batterySaver ? "Every 120s (Throttled)" : "Every 1s (Constant)"}
              </span>
            </div>
          </div>

          {batterySaver && (
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded p-1.5 text-[8px] font-mono text-emerald-400 leading-normal">
              🟢 OLED energy optimization active. Heavy rendering canvases have been blacked out and state polling has been throttled to minimize hardware heating.
            </div>
          )}
        </div>
      </div>

      {/* Offline Regional Packs Manager */}
      <div className="bg-[#0c1221]/70 border border-[#14203a] p-4 rounded-xl flex flex-col gap-3">
        <h2 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          Downloadable Regions
        </h2>
        <p className="text-[11px] text-gray-400 leading-snug">Deploy pre-packaged regional maps, dispatch data, and localized survival assets.</p>
        
        <div className="flex flex-col gap-2 mt-1">
          {regionalPacks.map(pack => {
            const isDeployed = deployedPackId === pack.id;
            const isDownloading = packDownloadProgress !== null && installingPackId === pack.id;
            
            return (
              <div 
                key={pack.id}
                className={`p-2.5 rounded-lg border transition-all text-xs font-mono flex flex-col gap-1.5 ${
                  isDeployed 
                    ? 'bg-emerald-950/20 border-emerald-500/60' 
                    : 'bg-[#11192a]/60 border-[#203254] hover:border-[#354e7d]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-200">{pack.flag} {pack.name}</span>
                  <span className="text-[9px] text-gray-500">{pack.size}</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-snug">{pack.description}</p>
                
                <div className="grid grid-cols-2 gap-1 text-[9px] text-sky-400 border-t border-[#1b2b4e]/40 pt-1.5">
                  <span>Police: {pack.police}</span>
                  <span>Medic: {pack.medical}</span>
                </div>

                {isDownloading ? (
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div 
                      className="bg-sky-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${packDownloadProgress}%` }}
                    ></div>
                  </div>
                ) : (
                  <button
                    id={`btn_deploy_pack_${pack.id}`}
                    onClick={() => handleDeployPack(pack)}
                    disabled={isDeployed || packDownloadProgress !== null}
                    className={`w-full mt-1 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer uppercase ${
                      isDeployed 
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 cursor-default' 
                        : 'bg-sky-950/30 hover:bg-sky-900/30 border-sky-800 text-sky-300'
                    }`}
                  >
                    {isDeployed ? "DEPLOYED & SECURED" : "DEPLOY PACK OFFLINE"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden Developer Diagnostics HUD */}
      {showDevHud && (
        <div className="bg-[#050913] border-2 border-amber-600/40 p-4 rounded-xl flex flex-col gap-2.5 font-mono text-[10px] text-emerald-400">
          <div className="flex items-center justify-between border-b border-amber-600/30 pb-1.5">
            <span className="font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <Activity className="w-3.5 h-3.5" />
              DEV TELEMETRY MONITOR
            </span>
            <span className="text-[9px] text-gray-500 font-bold">SQLCIPHER: NOMINAL</span>
          </div>

          <div className="grid grid-cols-3 gap-2 border-b border-[#14213d] pb-2 text-[9px] text-gray-400">
            <div>
              <p>FPS STATUS</p>
              <p className="text-emerald-400 font-bold">{fps} Hz</p>
            </div>
            <div>
              <p>CPU LOAD</p>
              <p className="text-emerald-400 font-bold">{cpuUsage}%</p>
            </div>
            <div>
              <p>RAM ALLOC</p>
              <p className="text-emerald-400 font-bold">{ramUsage} MB</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 leading-normal border-b border-[#14213d] pb-2 text-gray-300">
            <p className="font-bold text-amber-500 text-[9px] tracking-wide uppercase">Hardware Sensor Fusion Output:</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-0.5">
              <p>ACCEL_X: <span className="text-emerald-400">{(Math.random() * 0.04 - 0.02).toFixed(2)}G</span></p>
              <p>GYRO_X: <span className="text-emerald-400">{(Math.random() * 0.02 - 0.01).toFixed(3)}r/s</span></p>
              <p>ACCEL_Y: <span className="text-emerald-400">{(0.96 + Math.random() * 0.04).toFixed(2)}G</span></p>
              <p>GYRO_Y: <span className="text-emerald-400">{(Math.random() * 0.02 - 0.01).toFixed(3)}r/s</span></p>
              <p>ACCEL_Z: <span className="text-emerald-400">{(0.12 + Math.random() * 0.04).toFixed(2)}G</span></p>
              <p>GYRO_Z: <span className="text-emerald-400">{(Math.random() * 0.02 - 0.01).toFixed(3)}r/s</span></p>
            </div>
          </div>

          <div className="flex flex-col gap-1 leading-normal text-gray-300">
            <p>MAGNETOMETER: <span className="text-emerald-400 font-bold">{heading.toFixed(0)}° {getCompassDirection(heading)}</span></p>
            <p>BAROMETER: <span className="text-emerald-400 font-bold">{(1013 - (altitude / 8.5)).toFixed(0)} hPa</span> (Elev. {altitude}m)</p>
            <p className="flex items-center justify-between">
              <span>LIGHT INTENSITY: <span className="text-emerald-400 font-bold">{luxValue} lux</span></span>
              {luxValue < 30 && <span className="text-amber-500 animate-pulse text-[8px] font-bold border border-amber-600 px-1 py-0.2 rounded">DARKNESS ALERT</span>}
            </p>
            <p>PROXIMITY RADAR: <span className="text-emerald-400 font-bold">5.0 cm</span> (NOMINAL)</p>
            <p>GPS COVERAGE PRECISION: <span className="text-sky-400 font-bold">{signalStrength === 'WEAK' ? '±45m (MARGIN ERROR)' : '±1.8m (TACTICAL)'}</span></p>
            <p>AI SAT LATENCY: <span className="text-emerald-400 font-bold">342 ms</span> (SATELLITE LINK)</p>
            <p>DB LOG HEALTH: <span className="text-emerald-400 font-bold">NOMINAL</span> (142 SQLite records ciphered)</p>
            <p>CRASH EXCEPTIONS: <span className="text-emerald-400 font-bold">0 critical errors</span></p>
          </div>
        </div>
      )}

      {/* Quick Simulation Action Triggers */}
      <div className="bg-[#0c1221]/70 border border-[#14203a] p-4 rounded-xl flex flex-col gap-2">
        <h2 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          Sensor Alert Scenarios
        </h2>
        <p className="text-[11px] text-gray-400 leading-snug">Simulate instant physical sensors or environmental emergency events.</p>
        
        <button
          id="btn_sim_fall"
          onClick={triggerFallSim}
          className="mt-1 w-full px-3 py-2 bg-amber-950/60 hover:bg-amber-900 border border-amber-600 text-amber-300 font-mono text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          SIMULATE SUDDEN FALL
        </button>

        <button
          id="btn_simulate_gps_weak"
          onClick={() => {
            setSignalStrength("WEAK");
            speakVoiceFeedback("Warning. Low GPS Satellite Coverage detected.");
            setChatLog((prev) => [
              ...prev,
              {
                sender: "anis",
                text: "⚠️ **TELEMETRY SIGNAL LOSS**: Satellite telemetry link is degraded. Positional updates may carry up to 50 meters of margin error.",
                timestamp: new Date().toLocaleTimeString(),
              }
            ]);
          }}
          className="w-full px-3 py-2 bg-[#121c32] hover:bg-[#1b2b4d] border border-[#233863] text-gray-300 font-mono text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Signal className="w-4 h-4" />
          SIMULATE WEAK SIGNAL
        </button>
      </div>

      {/* Clear Map database */}
      <button
        id="btn_clear_data"
        onClick={clearCrumbHistory}
        className="w-full mt-auto px-3 py-2 border border-red-950 text-red-500 hover:text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        CLEAR LOCAL TRACE DATA
      </button>
    </aside>
  );
};

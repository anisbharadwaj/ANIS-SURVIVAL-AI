import React, { useState, useEffect } from "react";
import { 
  Phone, 
  ShieldAlert, 
  Mail, 
  Plus, 
  Trash, 
  Smartphone, 
  VolumeX, 
  Shield,
  HelpCircle, 
  AlertTriangle, 
  Check, 
  X,
  UserCheck,
  Send,
  Lock,
  Compass
} from "lucide-react";
import { TrustedContact } from "../../types";

interface EmergencyConsoleProps {
  onTriggerSOS: (reason: string) => void;
  onCancelSOS: () => void;
  isEmergencyActive: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  speakVoiceFeedback: (text: string) => void;
}

export const EmergencyConsole: React.FC<EmergencyConsoleProps> = ({
  onTriggerSOS,
  onCancelSOS,
  isEmergencyActive,
  latitude,
  longitude,
  altitude,
  speakVoiceFeedback
}) => {
  // Contacts State
  const [contacts, setContacts] = useState<TrustedContact[]>([
    { id: "1", name: "Aria (Guardian)", phone: "+91 98765 43210", email: "aria.guard@secure.org", isSOSRecipient: true, isLiveLocationShared: true },
    { id: "2", name: "Emergency Dispatch", phone: "112 / 100", email: "dispatch@emergencies.gov", isSOSRecipient: true, isLiveLocationShared: false },
    { id: "3", name: "Sarah (Workspace)", phone: "+91 99887 76655", email: "sarah.s@work.com", isSOSRecipient: true, isLiveLocationShared: true },
  ]);

  // Add Contact Form State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Fake Call State
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCaller, setFakeCaller] = useState("Dad");
  const [callTimer, setCallTimer] = useState<number | null>(null);
  const [callTriggerDelay, setCallTriggerDelay] = useState(3); // seconds

  // Panic PIN state
  const [enteredPin, setEnteredPin] = useState("");
  const [pinMessage, setPinMessage] = useState("");

  // Shake simulation state
  const [shakeCount, setShakeCount] = useState(0);

  // Fake SMS
  const [smsSentNotice, setSmsSentNotice] = useState<string | null>(null);

  // Auto-trigger headphone simulator state
  const [headphonesPlugged, setHeadphonesPlugged] = useState(true);

  // Reset shake counter after inactivity
  useEffect(() => {
    if (shakeCount > 0) {
      const timer = setTimeout(() => setShakeCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [shakeCount]);

  // Handle fake call countdown
  useEffect(() => {
    if (callTimer !== null) {
      if (callTimer === 0) {
        setFakeCallActive(true);
        setCallTimer(null);
        speakVoiceFeedback(`Incoming call simulation initiated from ${fakeCaller}. Press answer to exit the situation.`);
      } else {
        const t = setTimeout(() => setCallTimer(callTimer - 1), 1000);
        return () => clearTimeout(t);
      }
    }
  }, [callTimer, fakeCaller]);

  // Simulate Shake Detection
  const handleSimulateShake = () => {
    setShakeCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        speakVoiceFeedback("Emergency automatic shake detection triggered!");
        onTriggerSOS("AUTOMATIC_SHAKE_DETECTION");
        return 0;
      }
      speakVoiceFeedback(`Shake detected. ${3 - next} more shakes needed.`);
      return next;
    });
  };

  // Add Trusted Contact
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newContact: TrustedContact = {
      id: Math.random().toString(),
      name: newName,
      phone: newPhone,
      email: newEmail || "not-supplied@email.com",
      isSOSRecipient: true,
      isLiveLocationShared: true
    };

    setContacts(prev => [...prev, newContact]);
    speakVoiceFeedback(`Added ${newName} to your trusted guardian circle.`);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
  };

  // Remove Contact
  const handleDeleteContact = (id: string, name: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    speakVoiceFeedback(`Removed ${name} from trusted circle.`);
  };

  // Panic PIN Verification
  const handleVerifyPin = () => {
    if (enteredPin === "9911") {
      setPinMessage("⚠️ CRITICAL SOS TRIGGERED SECURELY");
      speakVoiceFeedback("Stealth SOS protocol activated via emergency bypass code.");
      onTriggerSOS("STEALTH_PANIC_PIN_9911");
      setEnteredPin("");
    } else {
      setPinMessage("❌ INCORRECT ROUTINE PIN: Unlocked profile standard layout.");
      speakVoiceFeedback("Routine profile unlocked.");
      setTimeout(() => setPinMessage(""), 4000);
      setEnteredPin("");
    }
  };

  // Trigger Fake Call Delay
  const triggerFakeCall = () => {
    setCallTimer(callTriggerDelay);
    speakVoiceFeedback(`Fake call scheduled in ${callTriggerDelay} seconds.`);
  };

  // Simulated SMS Send
  const sendFakeSMS = (messageText: string) => {
    setSmsSentNotice("Sending encrypted SOS coordinates to Trusted Circle...");
    setTimeout(() => {
      setSmsSentNotice(`✅ Coordinates transmitted to ${contacts.length} guardians! SMS message: "${messageText}"`);
      speakVoiceFeedback("Coordinates sent to trusted contacts.");
      setTimeout(() => setSmsSentNotice(null), 5000);
    }, 15000);
  };

  // Pull headphones auto-call
  const toggleHeadphones = () => {
    const nextState = !headphonesPlugged;
    setHeadphonesPlugged(nextState);
    if (!nextState) {
      speakVoiceFeedback("Headphone unplugged. Emergency fake ringing active.");
      setFakeCaller("Safety Patrol Office");
      setCallTimer(1);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      
      {/* Fake Call Simulated Screen Overlay */}
      {fakeCallActive && (
        <div className="fixed inset-0 bg-[#070b14]/98 z-[9999] flex flex-col items-center justify-between p-12 text-white animate-fade-in font-sans">
          <div className="flex flex-col items-center mt-12">
            <div className="w-24 h-24 rounded-full bg-sky-500/10 border border-sky-400 flex items-center justify-center text-4xl animate-pulse">
              👤
            </div>
            <h3 className="mt-6 text-2xl font-display font-bold text-sky-400">{fakeCaller}</h3>
            <p className="text-sm text-gray-400 mt-2 tracking-widest animate-pulse">INCOMING PHONE CALL...</p>
          </div>

          <div className="flex flex-col items-center gap-2 mb-4 max-w-xs text-center text-gray-400">
            <p className="text-[11px] leading-relaxed italic bg-sky-950/30 border border-sky-800/40 p-2.5 rounded-lg">
              "Answer this call to exit uncomfortable situations. Keep speaking naturally as if describing your location to a friend."
            </p>
          </div>

          <div className="flex gap-16 mb-12">
            <button 
              id="decline_fake_call"
              onClick={() => {
                setFakeCallActive(false);
                speakVoiceFeedback("Fake call ended.");
              }}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white font-bold hover:bg-red-500 transition-all cursor-pointer shadow-lg shadow-red-900/50"
            >
              <X className="w-6 h-6" />
            </button>
            <button 
              id="answer_fake_call"
              onClick={() => {
                setFakeCallActive(false);
                speakVoiceFeedback("Call connected. Speak confidently. De-escalating environment.");
              }}
              className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold hover:bg-emerald-500 transition-all cursor-pointer animate-bounce shadow-lg shadow-emerald-900/50"
            >
              <Phone className="w-6 h-6 animate-pulse" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Multi-Safety Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Stealth Panic Pin & Shake Triggers */}
        <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Silent Guard & PIN Bypass
          </h3>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Enter a stealth passcode below. Typing the custom Panic PIN <strong className="text-sky-300 font-mono">9911</strong> triggers an immediate high-power SOS broadcast secretly.
          </p>

          <div className="flex gap-2">
            <input 
              id="stealth_pin_input"
              type="password"
              placeholder="ENTER PASSCODE (E.G. 9911)"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className="flex-1 bg-[#121c32]/50 border border-[#20345b] rounded-lg px-3 py-1.5 font-mono text-center text-sky-300 focus:outline-none focus:border-sky-500 text-xs"
            />
            <button 
              id="btn_submit_pin"
              onClick={handleVerifyPin}
              className="px-4 py-1.5 bg-sky-950/60 border border-sky-600 text-sky-400 font-bold rounded-lg hover:bg-sky-900/50 cursor-pointer"
            >
              UNLOCK
            </button>
          </div>
          {pinMessage && (
            <p className="text-[10px] text-center font-bold text-amber-400 mt-1">{pinMessage}</p>
          )}

          {/* Shake Trigger Simulator */}
          <div className="border-t border-[#131d35] pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400">RAPID SHAKE AUTO-TRIGGER</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-sky-950 text-sky-400 border border-sky-800 rounded font-mono font-bold">
                {shakeCount}/3 SHAKES
              </span>
            </div>
            <button 
              id="btn_simulate_shake"
              onClick={handleSimulateShake}
              className="w-full py-2 bg-amber-950/40 hover:bg-amber-900/30 border border-amber-600/60 text-amber-300 font-mono text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              📳 SIMULATE EMERGENCY SHAKE
            </button>
          </div>
        </div>

        {/* Fake Escort Engine */}
        <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            Fake Caller & SMS Escort
          </h3>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Generate an authentic caller profile to escape uncomfortable social settings instantly.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-mono text-gray-400 mb-1">CALLER IDENTITY</label>
              <select
                id="fake_caller_selector"
                value={fakeCaller}
                onChange={(e) => setFakeCaller(e.target.value)}
                className="w-full text-[10px] font-mono bg-[#11192a] border border-[#203254] rounded-lg p-1.5 text-sky-300 focus:outline-none"
              >
                <option value="Dad">Father (Dad)</option>
                <option value="Mom">Mother (Mom)</option>
                <option value="Safety Patrol Office">Safety Patrol Office</option>
                <option value="Captain John">Captain John</option>
                <option value="Transit Inspector">Transit Inspector</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-mono text-gray-400 mb-1">CALL IN (SECONDS)</label>
              <select
                id="fake_call_delay"
                value={callTriggerDelay}
                onChange={(e) => setCallTriggerDelay(parseInt(e.target.value))}
                className="w-full text-[10px] font-mono bg-[#11192a] border border-[#203254] rounded-lg p-1.5 text-sky-300 focus:outline-none"
              >
                <option value="3">3 seconds</option>
                <option value="5">5 seconds</option>
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              id="btn_trigger_fake_call"
              onClick={triggerFakeCall}
              className="flex-1 py-1.5 bg-sky-950/50 hover:bg-sky-900/40 border border-sky-700 text-sky-300 font-mono text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Phone className="w-3 h-3 text-sky-400" />
              {callTimer !== null ? `RINGING IN ${callTimer}s...` : "FAKE INCOMING CALL"}
            </button>

            <button
              id="btn_send_fake_sms"
              onClick={() => sendFakeSMS(`I feel unsafe. Tracking my coordinates live: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}. Emergency fallback active.`)}
              className="flex-1 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/40 border border-indigo-700 text-indigo-300 font-mono text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3 h-3 text-indigo-400" />
              TRANSMIT LIVE SMS
            </button>
          </div>

          {/* Headphone Pull trigger */}
          <div className="flex justify-between items-center border-t border-[#131d35] pt-2 mt-1">
            <span className="text-[9px] font-mono text-gray-400">PULL HEADPHONES AUTO-RING</span>
            <button
              id="toggle_headphone_jack"
              onClick={toggleHeadphones}
              className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                headphonesPlugged 
                  ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400' 
                  : 'bg-red-950/30 border-red-500 text-red-400'
              }`}
            >
              {headphonesPlugged ? "🔌 WIRED HEADPHONES CONNECTED" : "⚠️ UNPLUGGED: CALL AUTO-FIRED"}
            </button>
          </div>
        </div>

      </div>

      {smsSentNotice && (
        <div className="bg-indigo-950/60 border border-indigo-500 p-2.5 rounded-lg text-indigo-200 font-mono text-center text-[10px] animate-pulse">
          {smsSentNotice}
        </div>
      )}

      {/* Trusted circle & Contacts Vault */}
      <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            Trusted Guardian Circle (Contacts)
          </h3>
          <span className="text-[10px] text-gray-400 font-mono">{contacts.length}/5 GUARDIANS</span>
        </div>
        <p className="text-[10px] text-gray-400">
          The contacts registered below will receive automatic location coordinates, live-tracking links, and instant alert notification broadcasts upon triggering an SOS.
        </p>

        {/* Contacts Table */}
        <div className="border border-[#131d35] rounded-lg overflow-hidden bg-[#070b13]/60">
          <table className="w-full text-left font-mono text-[10px] text-gray-300">
            <thead className="bg-[#0f172a] text-sky-400 border-b border-[#131d35]">
              <tr>
                <th className="p-2">NAME</th>
                <th className="p-2">PHONE NUMBER</th>
                <th className="p-2">EMAIL STATUS</th>
                <th className="p-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#131d35]">
              {contacts.map(c => (
                <tr key={c.id} className="hover:bg-[#121c32]/30">
                  <td className="p-2 font-bold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {c.name}
                  </td>
                  <td className="p-2 text-sky-300 font-bold">{c.phone}</td>
                  <td className="p-2 text-gray-400">{c.email}</td>
                  <td className="p-2 text-right">
                    <button
                      id={`btn_delete_contact_${c.id}`}
                      onClick={() => handleDeleteContact(c.id, c.name)}
                      className="text-red-400 hover:text-red-300 font-bold"
                    >
                      <Trash className="w-3.5 h-3.5 inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Contact Form */}
        <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t border-[#131d35] pt-3">
          <input 
            id="input_contact_name"
            type="text" 
            placeholder="GUARDIAN NAME"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-[#11192a] border border-[#203254] rounded p-1.5 text-[10px] text-sky-300 focus:outline-none"
            required
          />
          <input 
            id="input_contact_phone"
            type="text" 
            placeholder="PHONE (E.G. +91 9988)"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="bg-[#11192a] border border-[#203254] rounded p-1.5 text-[10px] text-sky-300 focus:outline-none"
            required
          />
          <input 
            id="input_contact_email"
            type="email" 
            placeholder="EMAIL (OPTIONAL)"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="bg-[#11192a] border border-[#203254] rounded p-1.5 text-[10px] text-sky-300 focus:outline-none"
          />
          <button 
            id="btn_add_contact"
            type="submit" 
            className="bg-sky-950 hover:bg-sky-900 border border-sky-600 text-sky-300 font-bold rounded p-1.5 transition-all flex items-center justify-center gap-1 cursor-pointer text-[10px]"
          >
            <Plus className="w-3.5 h-3.5" />
            REGISTER GUARDIAN
          </button>
        </form>

      </div>

    </div>
  );
};

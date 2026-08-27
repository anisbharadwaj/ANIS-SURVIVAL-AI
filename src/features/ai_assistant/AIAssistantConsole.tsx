import React, { useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Cpu, 
  Heart, 
  Compass, 
  Eye, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Layers, 
  Send 
} from "lucide-react";
import { AISpecialization } from "../../types";

interface AIAssistantConsoleProps {
  chatLog: Array<{ sender: "user" | "anis"; text: string; timestamp: string; priority?: string }>;
  chatInput: string;
  setChatInput: (val: string) => void;
  aiStatus: "idle" | "loading";
  activeAiBrain: AISpecialization;
  setActiveAiBrain: (brain: AISpecialization) => void;
  querySurvivalAI: (customMessage?: string) => void;
  analyzeDanger: () => void;
  checkLostStatus: () => void;
  estimateBatterySurvival: () => void;
  speakVoiceFeedback: (text: string) => void;
}

export const AIAssistantConsole: React.FC<AIAssistantConsoleProps> = ({
  chatLog,
  chatInput,
  setChatInput,
  aiStatus,
  activeAiBrain,
  setActiveAiBrain,
  querySurvivalAI,
  analyzeDanger,
  checkLostStatus,
  estimateBatterySurvival,
  speakVoiceFeedback
}) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [prefLang, setPrefLang] = React.useState<string>(() => localStorage.getItem("anis_pref_lang") || "en");

  const changeLanguage = (lang: string) => {
    localStorage.setItem("anis_pref_lang", lang);
    setPrefLang(lang);
    if (lang === "hi") {
      speakVoiceFeedback("हिंदी भाषा सक्रिय।");
    } else if (lang === "en") {
      speakVoiceFeedback("English language activated.");
    } else {
      speakVoiceFeedback("Bilingual Hinglish mode engaged.");
    }
  };

  // Auto-scroll chat log
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  return (
    <section className="lg:col-span-4 border-l border-[#131d35] bg-[#090d18]/95 flex flex-col h-full overflow-hidden">
      
      {/* AI Advisor Status summary */}
      <div className="bg-[#0b101d] border-b border-[#131d35] p-4">
        
        <div className="flex items-center justify-between border-b border-[#142341] pb-3.5">
          <div>
            <h2 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              ANIS Survival Tactical AI
            </h2>
            <p className="text-[10px] text-gray-400 mt-1 leading-snug">Active telemetry expert system model.</p>
          </div>
          
          {/* HIGH-TECH LANGUAGE SELECTOR PILLS */}
          <div className="flex bg-[#050912] border border-[#1d2c49] rounded-lg p-0.5 shrink-0 ml-2">
            {[
              { id: "en", label: "EN" },
              { id: "hi", label: "हिंदी" },
              { id: "both", label: "BOTH" }
            ].map(lang => (
              <button
                id={`btn_lang_pref_${lang.id}`}
                key={lang.id}
                onClick={() => changeLanguage(lang.id)}
                className={`px-2 py-1 text-[8px] font-mono font-bold uppercase rounded transition-all cursor-pointer whitespace-nowrap ${
                  prefLang === lang.id
                    ? "bg-sky-600 text-white font-extrabold border border-sky-400/40"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI SPECIALIST BRAIN SELECTOR */}
        <div className="bg-[#090e17] border border-[#1b2b4e] rounded-lg p-2.5 mt-3 flex flex-col gap-1.5">
          <p className="text-[9px] font-mono text-sky-300 uppercase tracking-wider font-bold">SELECT SPECIALIZED AI BRAIN CORE:</p>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: "survival", name: "Core", icon: Cpu, color: "text-sky-400", bg: "bg-sky-950/10", border: "border-sky-800/30" },
              { id: "medical", name: "Med/Safety", icon: Heart, color: "text-red-400", bg: "bg-red-950/10", border: "border-red-800/30" },
              { id: "navigation", name: "Terrain", icon: Compass, color: "text-emerald-400", bg: "bg-emerald-950/10", border: "border-emerald-800/30" },
              { id: "wildlife", name: "Botany", icon: Eye, color: "text-orange-400", bg: "bg-orange-950/10", border: "border-orange-800/30" },
              { id: "disaster", name: "Disaster", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-950/10", border: "border-amber-800/30" },
              { id: "security", name: "Threats", icon: ShieldAlert, color: "text-teal-400", bg: "bg-teal-950/10", border: "border-teal-800/30" },
              { id: "mental", name: "Calm", icon: Activity, color: "text-indigo-400", bg: "bg-indigo-950/10", border: "border-[#1d2c49]" },
              { id: "equipment", name: "Gear", icon: Layers, color: "text-purple-400", bg: "bg-purple-950/10", border: "border-purple-800/30" }
            ].map(brain => {
              const isSelected = activeAiBrain === brain.id;
              const IconComponent = brain.icon;
              return (
                <button
                  id={`btn_select_brain_${brain.id}`}
                  key={brain.id}
                  onClick={() => {
                    setActiveAiBrain(brain.id as AISpecialization);
                    speakVoiceFeedback(`ANIS AI core successfully switched to ${brain.name} specialized instructions.`);
                  }}
                  className={`p-1.5 rounded border transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#121c32] border-sky-500 text-sky-400 shadow-md shadow-sky-950/30' 
                      : 'bg-[#0a0e17]/40 border-[#1d2c49]/60 text-gray-500 hover:text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isSelected ? brain.color : 'text-gray-500'}`} />
                  <span className="text-[8px] font-mono font-bold leading-none">{brain.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Quick tactical shortcuts */}
        <div className="grid grid-cols-3 gap-1.5 mt-3">
          <button
            id="btn_danger_check"
            onClick={analyzeDanger}
            className="px-2.5 py-1 bg-sky-950/30 hover:bg-sky-950/60 border border-sky-800 text-sky-300 text-[10px] font-mono rounded transition-all cursor-pointer"
          >
            TERRAIN ANALYSIS
          </button>
          <button
            id="btn_lost_check"
            onClick={checkLostStatus}
            className="px-2.5 py-1 bg-sky-950/30 hover:bg-sky-950/60 border border-sky-800 text-sky-300 text-[10px] font-mono rounded transition-all cursor-pointer"
          >
            LOST CO-EFFICIENT
          </button>
          <button
            id="btn_batt_check"
            onClick={estimateBatterySurvival}
            className="px-2.5 py-1 bg-sky-950/30 hover:bg-sky-950/60 border border-sky-800 text-sky-300 text-[10px] font-mono rounded transition-all cursor-pointer"
          >
            BATTERY ESTIMATE
          </button>
        </div>
      </div>

      {/* Chat log with scrolling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatLog.map((chat, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col max-w-[90%] ${
              chat.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono text-gray-500">{chat.timestamp}</span>
              <span className={`text-[10px] font-mono font-bold ${
                chat.sender === "user" ? "text-sky-400" : "text-sky-300"
              }`}>
                {chat.sender === "user" ? "OPERATOR" : "ANIS ADVISOR"}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
              chat.sender === "user" 
                ? "bg-[#14203a] border-[#253e70] text-gray-100 rounded-tr-none" 
                : chat.priority ? "bg-red-950/40 border-red-500/30 text-gray-100 rounded-tl-none glow-danger" : "bg-[#0b101d] border-[#182a4d] text-gray-200 rounded-tl-none"
            }`}>
              {/* Handle markdown guidance simply in text representation */}
              <div className="space-y-2 whitespace-pre-wrap">
                {chat.text}
              </div>

              {chat.priority && (
                <div className="mt-2 pt-2 border-t border-[#253e70]/50 flex items-center gap-1.5 text-[10px] font-mono text-amber-400 font-bold uppercase">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  TOP PRIORITY: {chat.priority}
                </div>
              )}
            </div>
          </div>
        ))}
        {aiStatus === "loading" && (
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono animate-pulse">
            <Cpu className="w-4 h-4 animate-spin" />
            Querying tactical satellite array...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input control */}
      <div className="border-t border-[#131d35] p-3.5 bg-[#0b101c]">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            querySurvivalAI();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="chat_input"
            type="text"
            placeholder="Ask ANIS Survival AI for guidance..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 text-xs bg-[#121927] border border-[#203253] rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:border-sky-500"
          />
          <button
            id="chat_submit"
            type="submit"
            className="p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </section>
  );
};

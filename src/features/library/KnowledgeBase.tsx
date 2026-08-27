import React, { useState } from "react";
import { 
  Search, 
  BookOpen, 
  Heart, 
  ShieldAlert, 
  Compass, 
  Flame, 
  Sparkles,
  AlertOctagon,
  Award,
  Zap,
  CheckCircle2
} from "lucide-react";

interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'medical' | 'defense' | 'navigation' | 'disaster' | 'survival';
  shortDesc: string;
  steps: string[];
  hack: string;
}

interface KnowledgeBaseProps {
  speakVoiceFeedback: (text: string) => void;
  querySurvivalAI: (message: string) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  speakVoiceFeedback,
  querySurvivalAI
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<'all' | 'medical' | 'defense' | 'navigation' | 'disaster' | 'survival'>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const library: KnowledgeArticle[] = [
    {
      id: "med-1",
      title: "Venomous Snake Bite Response",
      category: "medical",
      shortDesc: "Urgent protocols for cobra, viper, or krait bites. Neutralize movement to stop lymph flow.",
      steps: [
        "Keep the victim completely calm and physically motionless. Movement speeds venom circulation.",
        "Immobilize the bitten limb below heart level using a splint or light wrapping.",
        "Do NOT cut, suction, apply ice, or use a tight arterial tourniquet.",
        "Remove rings, bracelets, or boots before rapid swelling starts.",
        "Identify the snake's color patterns or take a photo if safe. Deliver to medical team immediately."
      ],
      hack: "Write the EXACT time of the bite on the skin near the wound using a pen or dirt to help doctors measure venom progression."
    },
    {
      id: "med-2",
      title: "Active Severe Hemorrhage Control",
      category: "medical",
      shortDesc: "Stop life-threatening bleeding within seconds. Direct manual pressure and occlusion.",
      steps: [
        "Place sterile gauze or the cleanest cloth on hand directly over the bleeding point.",
        "Apply your body weight as hard direct pressure. Do not lift to check if bleeding has stopped.",
        "If blood is spurting or pulsing, locate the nearest pressure point (brachial for arm, femoral for leg) and press hard against the bone.",
        "Pack wounds in deep crevices with sterile dressing before applying pressure.",
        "If a limb is severed or bleeding won't stop, apply a commercial tourniquet 2 inches above the wound."
      ],
      hack: "If no bandages are present, use the inner elastic band of clean apparel as a high-compression compression dressing."
    },
    {
      id: "def-1",
      title: "Active Escape & Self-Defense Stance",
      category: "defense",
      shortDesc: "Women's personal safety: Escape holds, break tracking, and utilize biomechanical weakness.",
      steps: [
        "Maintain base structure: Stand with feet shoulder-width apart, knees slightly bent, hands held up defensively level with chest, open palms (signaling de-escalation while protecting head).",
        "Target vulnerable pressure zones: Stomp heels directly into attacker's instep, drive fingers straight into eyes, or execute palm-heel strikes to nose.",
        "If grabbed from behind (bear hug): Drop your weight low instantly (makes you twice as heavy to lift), stomp backward, and bite or headbutt backward.",
        "To break a wrist grab: Rotate your hand forcefully toward the opponent's weak thumb-finger opening. This is the anatomical weak spot.",
        "Do not run home if tracked: Navigate directly into a crowded 24-hour retail store, police precinct, or hotel lobby."
      ],
      hack: "Hold keys between your fingers extending outwards, or carry a metal water container or a heavy-duty torch as a high-density hammer-fist extension."
    },
    {
      id: "def-2",
      title: "De-Escalation & Verbal Boundaries",
      category: "defense",
      shortDesc: "Use vocal authority to deter predators and notify surrounding crowds instantly.",
      steps: [
        "Use deep, commanding, non-apologetic chest voice. Do not scream hysterically; shout specific commands.",
        "Shout 'BACK OFF!' or 'STOP TOUCHING ME!' instead of 'HELP!'. Hysterical screams are sometimes ignored as domestic arguments.",
        "Maintain direct, unbroken eye-contact. Do not look down or look submissive.",
        "Point directly to a specific bystander and command: 'YOU in the red jacket, call the Police right now!'"
      ],
      hack: "If followed closely, simulate a loud, authoritative phone speakerphone conversation: 'Hi Dad, I see your police vehicle parked 30 meters ahead, I will be right there in 5 seconds!'"
    },
    {
      id: "nav-1",
      title: "Night Navigation & Hazard Avoidance",
      category: "navigation",
      shortDesc: "Safe pathfinding after sunset. Avoid thermal exposure and navigate without visible landmarks.",
      steps: [
        "Map your heading by locking the tactical compass or tracking North using Polaris (North Star).",
        "If in urban settings, stick exclusively to populated, well-lit main avenues even if the route is 3x longer.",
        "If in wilderness, construct a solid shelter or encampment before total darkness. Navigating woods at night is high risk for falls.",
        "Ensure device screens are dimmed to conserve battery and avoid drawing unwanted long-range focus."
      ],
      hack: "To retain dark-adapted night vision, keep one eye closed or use a red-light filter. It takes 30 minutes to regain full night-adaptation."
    },
    {
      id: "dis-1",
      title: "High-Magnitude Earthquake Protocol",
      category: "disaster",
      shortDesc: "Immediate actions during active seismic shaking. Drop, cover, and hold.",
      steps: [
        "DROP immediately to your hands and knees to prevent being thrown down.",
        "COVER your head and neck under a sturdy table, desk, or robust piece of furniture.",
        "HOLD ON to your shelter until the shaking stops completely. Be prepared for major aftershocks.",
        "Do NOT run outdoors while the ground is shaking. Falling masonry and glass are the highest casualty risks.",
        "If outdoors, move immediately away from buildings, power cables, and brick walls."
      ],
      hack: "If trapped inside a collapsed structure, do not scream constantly. It fills lungs with toxic concrete dust. Tap rhythmically (3-3-3 pattern) on metal pipes instead."
    },
    {
      id: "dis-2",
      title: "Flash Flood & River Crossing Safety",
      category: "disaster",
      shortDesc: "Avoid hydrological currents. Six inches of rapid water can sweep a fully grown adult.",
      steps: [
        "Immediately move to high altitude. Do not enter low-lying culverts, creek beds, or underground structures.",
        "Never attempt to drive or walk through flooded roadways ('Turn around, don't drown').",
        "If forced to cross a rising river, always use a long vertical staff to check depth and footing ahead.",
        "Face upstream during crossings to lean against the flow, keeping body profile angled."
      ],
      hack: "Fill an empty backpack with empty, sealed plastic water bottles. It creates a highly floating emergency life jacket."
    },
    {
      id: "surv-1",
      title: "Solar Water Disinfection (SODIS)",
      category: "survival",
      shortDesc: "Purify contaminated water using natural solar UV-A radiation. Zero-equipment required.",
      steps: [
        "Obtain clear, food-grade PET plastic bottles (no glass, no dark colors).",
        "Filter muddy water through a clean t-shirt to remove larger silt and sediment.",
        "Fill the bottles completely, seal them tightly, and shake vigorously for 30 seconds to oxygenate.",
        "Expose the bottles to direct sunlight on a dark metal sheet or rock for at least 6 hours (or 2 days if cloudy).",
        "The synergistic action of UV radiation and solar heating neutralizes 99.9% of biological pathogens."
      ],
      hack: "Wrapping the back of the bottle in dark plastic or placing it on black corrugated roofing doubles heat absorption, accelerating disinfection."
    }
  ];

  const filteredLibrary = library.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          art.hack.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAskAIAboutArticle = (art: KnowledgeArticle) => {
    const msg = `Expand on the tactical survival guide for: "${art.title}". 
Category is ${art.category}. 
Summary: ${art.shortDesc}
Core steps: ${art.steps.join(" | ")}
Emergency Hack: ${art.hack}
Please provide an elite, clinical, and complete step-by-step masterclass instruction detailing the physics, emergency psychology, and field-tested variations of this tactic.`;
    speakVoiceFeedback(`Connecting with specialized intelligence to expand on ${art.title}.`);
    querySurvivalAI(msg);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "medical": return <Heart className="w-3.5 h-3.5 text-red-400" />;
      case "defense": return <ShieldAlert className="w-3.5 h-3.5 text-sky-400 animate-pulse" />;
      case "navigation": return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
      case "disaster": return <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />;
      case "survival": return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      default: return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-4 text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Offline Safety & Self-Defense Library
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Instant, high-fidelity safety instructions and medical protocols loaded entirely on-device.</p>
        </div>
        
        <div className="flex items-center gap-1 bg-[#090f1d] border border-[#14213c] px-2 py-0.5 rounded-lg text-emerald-400 font-mono text-[9px] font-bold">
          <CheckCircle2 className="w-3 h-3" />
          DATABASE FULLY CACHED (100% OFFLINE)
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
          <input 
            id="search_library_input"
            type="text" 
            placeholder="SEARCH SURVIVAL PATHWAYS, ESCAPES, MEDIC PROTOCOLS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#11192a] border border-[#203254] rounded-lg pl-8 pr-3 py-2 text-[10px] text-sky-300 placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {(["all", "medical", "defense", "navigation", "disaster", "survival"] as const).map(cat => (
            <button
              id={`tab_cat_${cat}`}
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[9px] font-bold border transition-all cursor-pointer uppercase ${
                activeCategory === cat 
                  ? 'bg-sky-950 border-sky-500 text-sky-300' 
                  : 'bg-[#11192a] border-[#203254] text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
        {filteredLibrary.map(art => {
          const isExpanded = expandedId === art.id;
          return (
            <div 
              key={art.id}
              className={`p-3 rounded-xl border transition-all flex flex-col gap-2.5 ${
                isExpanded 
                  ? 'bg-[#0f1930] border-sky-500/80' 
                  : 'bg-[#080d19]/80 border-[#14213c] hover:border-[#1d3058]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {getCategoryIcon(art.category)}
                  <h4 className="font-display font-black text-xs text-gray-200 uppercase tracking-tight">{art.title}</h4>
                </div>
                <span className="text-[8px] font-mono px-1.5 py-0.2 bg-[#121d33] text-sky-400 border border-sky-800/40 rounded uppercase font-bold">
                  {art.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                {art.shortDesc}
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  id={`btn_read_steps_${art.id}`}
                  onClick={() => {
                    setExpandedId(isExpanded ? null : art.id);
                    speakVoiceFeedback(`Opening steps for ${art.title}.`);
                  }}
                  className="px-2.5 py-1 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/60 text-sky-300 font-mono text-[9px] rounded font-bold cursor-pointer transition-all"
                >
                  {isExpanded ? "COLLAPSE STEPS" : "READ PROCEDURES"}
                </button>
                <button
                  id={`btn_ask_ai_article_${art.id}`}
                  onClick={() => handleAskAIAboutArticle(art)}
                  className="px-2.5 py-1 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-800/60 text-indigo-300 font-mono text-[9px] rounded font-bold cursor-pointer transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  EXPAND WITH AI
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-2 border-t border-[#1a2d53] pt-2.5 flex flex-col gap-2.5 animate-fade-in text-[10px]">
                  <p className="font-mono font-bold text-sky-400 uppercase tracking-wider text-[9px]">STANDARD OPERATION STEPS:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-300 font-mono leading-relaxed pl-1">
                    {art.steps.map((st, idx) => (
                      <li key={idx} className="marker:text-sky-400 pl-1">{st}</li>
                    ))}
                  </ol>

                  <div className="bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-lg flex items-start gap-2 mt-1">
                    <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-mono font-bold text-amber-300 text-[9px] uppercase tracking-wider">CRITICAL FIELD HACK:</p>
                      <p className="text-[10px] text-amber-100 font-mono leading-relaxed mt-0.5">{art.hack}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredLibrary.length === 0 && (
          <div className="col-span-2 text-center py-8 bg-[#080d19]/40 border border-[#14213c] rounded-xl text-gray-500 font-mono">
            ⚠️ No survival files match the search criteria. Try matching "snake", "bleed", "holds", "shout", or "water".
          </div>
        )}
      </div>

    </div>
  );
};

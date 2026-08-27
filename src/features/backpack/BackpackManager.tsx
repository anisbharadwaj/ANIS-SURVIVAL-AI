import React, { useState } from "react";
import { 
  Briefcase, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Plus, 
  Trash, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import { BackpackItem } from "../../types";

interface BackpackManagerProps {
  terrain: string;
  speakVoiceFeedback: (text: string) => void;
  querySurvivalAI: (message: string) => void;
}

export const BackpackManager: React.FC<BackpackManagerProps> = ({
  terrain,
  speakVoiceFeedback,
  querySurvivalAI
}) => {
  const [items, setItems] = useState<BackpackItem[]>([
    { id: "1", name: "High-capacity external battery (20,000mAh)", category: "navigation", quantity: 1, isSecured: true },
    { id: "2", name: "Ration blocks (3-day standard loadout)", category: "sustenance", quantity: 1, isSecured: true },
    { id: "3", name: "Water purification tablets (Chlorine Dioxide)", category: "sustenance", quantity: 50, isSecured: true },
    { id: "4", name: "Tactical LED Torch with SOS strobe mode", category: "essential", quantity: 1, isSecured: true },
    { id: "5", name: "Friction matches & Magnesium fire striker", category: "essential", quantity: 1, isSecured: false },
    { id: "6", name: "Trauma dressing & sterile compression gauze", category: "medical", quantity: 2, isSecured: true },
    { id: "7", name: "Surgical scalpel & antibiotic ointment", category: "medical", quantity: 1, isSecured: false },
    { id: "8", name: "Paracord cordage (550-type, 50 feet)", category: "tools", quantity: 1, isSecured: false },
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<'essential' | 'medical' | 'navigation' | 'tools' | 'sustenance'>("essential");
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  // Toggle item secure status
  const handleToggleItem = (id: string, name: string, isSecured: boolean) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isSecured: !item.isSecured };
      }
      return item;
    }));
    speakVoiceFeedback(`${name} ${!isSecured ? "logged and secured" : "marked missing"}.`);
  };

  // Add Item to Checklist
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: BackpackItem = {
      id: Math.random().toString(),
      name: newItemName,
      category: newItemCategory,
      quantity: newItemQuantity,
      isSecured: true
    };

    setItems(prev => [...prev, newItem]);
    speakVoiceFeedback(`Added ${newItemName} to kit checklist.`);
    setNewItemName("");
    setNewItemQuantity(1);
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    speakVoiceFeedback("Item removed from gear roster.");
  };

  // Analyze Kit with AI
  const handleAnalyzeKit = () => {
    const missing = items.filter(i => !i.isSecured).map(i => i.name).join(", ");
    const present = items.filter(i => i.isSecured).map(i => i.name).join(", ");
    
    const analysisMsg = `Analyze my survival backpack contents. Current terrain profile is ${terrain}.
Secured equipment on hand: ${present || "None"}.
Missing or unverified gear: ${missing || "None"}.
Provide clear survival recommendations, what critical items are absent for this terrain, and 3 smart alternative makeshift hacks if I am missing a vital tool.`;
    
    speakVoiceFeedback("Formulating smart tactical gear audit analysis.");
    querySurvivalAI(analysisMsg);
  };

  // Reset gear to baseline
  const handleResetKit = () => {
    setItems(prev => prev.map(i => ({ ...i, isSecured: true })));
    speakVoiceFeedback("Tactical kit checklist reset to nominal baseline.");
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "essential": return "text-amber-400 border-amber-800/40 bg-amber-950/20";
      case "medical": return "text-red-400 border-red-800/40 bg-red-950/20";
      case "navigation": return "text-sky-400 border-sky-800/40 bg-sky-950/20";
      case "sustenance": return "text-emerald-400 border-emerald-800/40 bg-emerald-950/20";
      case "tools": return "text-purple-400 border-purple-800/40 bg-purple-950/20";
      default: return "text-gray-400 border-gray-800 bg-gray-900";
    }
  };

  const securedCount = items.filter(i => i.isSecured).length;

  return (
    <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-4 text-xs">
      
      {/* Roster Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#131d35] pb-3">
        <div>
          <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            Tactical Backpack & Gear Manager
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Verify essential equipment loadout. Cross-reference with terrain profiles.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-[#111c34] text-sky-400 border border-sky-800/60 px-2 py-0.5 rounded-md">
            {securedCount}/{items.length} SECURED
          </span>
          <button 
            id="btn_reset_backpack"
            onClick={handleResetKit}
            className="p-1 border border-gray-700 rounded text-gray-400 hover:text-white hover:bg-gray-800"
            title="Reset checklist"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
        {items.map(item => (
          <div 
            key={item.id}
            className={`p-2 rounded-lg border transition-all flex items-center justify-between gap-3 ${
              item.isSecured 
                ? 'bg-[#0a1120]/40 border-[#152445]/60 hover:bg-[#0a1120]/60' 
                : 'bg-amber-950/10 border-amber-900/30 hover:bg-amber-950/20'
            }`}
          >
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <button
                id={`btn_toggle_item_${item.id}`}
                onClick={() => handleToggleItem(item.id, item.name, item.isSecured)}
                className="mt-0.5 focus:outline-none cursor-pointer"
              >
                {item.isSecured ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-amber-500 animate-pulse" />
                )}
              </button>
              
              <div className="min-w-0 flex-1">
                <p className={`font-mono font-medium text-[11px] truncate leading-tight ${item.isSecured ? 'text-gray-200' : 'text-amber-300'}`}>
                  {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                </p>
                <span className={`inline-block text-[8px] font-mono px-1 py-0.1 border rounded uppercase mt-1 ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
              </div>
            </div>

            <button
              id={`btn_delete_item_${item.id}`}
              onClick={() => handleDeleteItem(item.id)}
              className="text-gray-500 hover:text-red-400 p-1"
            >
              <Trash className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Item form */}
      <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-12 gap-2 border-t border-[#131d35] pt-3">
        <div className="sm:col-span-5">
          <input 
            id="backpack_item_name"
            type="text" 
            placeholder="ADD NEW EQUIPMENT ITEM..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full bg-[#11192a] border border-[#203254] rounded p-1.5 text-[10px] text-sky-300 focus:outline-none"
            required
          />
        </div>
        <div className="sm:col-span-3">
          <select
            id="backpack_item_category"
            value={newItemCategory}
            onChange={(e: any) => setNewItemCategory(e.target.value)}
            className="w-full text-[10px] font-mono bg-[#11192a] border border-[#203254] rounded p-1.5 text-sky-300 focus:outline-none"
          >
            <option value="essential">Essential</option>
            <option value="medical">Medical / Safe</option>
            <option value="navigation">Nav / Power</option>
            <option value="sustenance">Food / Water</option>
            <option value="tools">Tools / Rope</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <input 
            id="backpack_item_qty"
            type="number" 
            min="1" 
            max="100"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
            className="w-full bg-[#11192a] border border-[#203254] rounded p-1.5 text-[10px] text-sky-300 text-center focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <button 
            id="btn_add_gear"
            type="submit" 
            className="w-full bg-sky-950 hover:bg-sky-900 border border-sky-600 text-sky-300 font-bold rounded p-1.5 cursor-pointer text-[10px]"
          >
            ADD GEAR
          </button>
        </div>
      </form>

      {/* Action Analysis Footer */}
      <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-[#131d35] pt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>Active terrain is <strong className="text-amber-400 uppercase">{terrain}</strong>. Verify you hold custom water and signaling assets.</span>
        </div>
        
        <button
          id="btn_analyze_gear_ai"
          onClick={handleAnalyzeKit}
          className="sm:ml-auto px-4 py-2 bg-gradient-to-r from-sky-900/60 to-indigo-900/60 hover:from-sky-900 hover:to-indigo-900 border border-sky-500/80 rounded-lg text-sky-300 font-bold transition-all flex items-center gap-1.5 shadow-md shadow-sky-950/40 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          AI GEAR QUALITY AUDIT
        </button>
      </div>

    </div>
  );
};

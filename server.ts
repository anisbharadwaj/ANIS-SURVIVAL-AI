import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "undefined" && apiKey.trim() !== "") {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined or is empty. AI Assistant features will run in mock offline fallback mode.");
}

// System Instruction Selectors based on Multi-AI Specialization
const getSystemInstruction = (aiBrain: string, params: any) => {
  const { latitude, longitude, altitude, terrain, temperature, batteryLevel, hasWater, hasShelter, isEmergency, lang = "en" } = params;
  
  let languageDirective = `
[CRITICAL BILINGUAL HUMAN CONVERSATIONAL MANDATE]
1. You MUST talk like a highly friendly, reassuring, warm, and clear human companion. Speak naturally as if talking directly to a friend in need.
2. Provide answers that are extremely easy to understand. Avoid complex terminology, mechanical phrasing, or clinical jargon unless explicitly asked. Break down actions into short, simple bullet points.
3. Bilingual Mode: Seamlessly comprehend and converse in BOTH Hindi (हिंदी) and English, including natural Hinglish (a warm blend of Hindi and English widely spoken in India).
   - If the user writes or speaks in Hindi, reply in fluent, natural Devanagari script Hindi.
   - If the user writes or speaks in English, reply in friendly, conversational Indian English.
   - If the user mixes languages, reply in a warm, comforting, and highly natural bilingual Hinglish.
4. Express genuine empathy and care. Always prioritize safety, reassure the operator first, and keep your survival guidance highly actionable, fast, and simple.`;

  const telemetryContext = `
[TACTICAL ENVIRONMENTAL TELEMETRY]
* Position: ${latitude?.toFixed(5)}°N, ${longitude?.toFixed(5)}°E | Altitude: ${altitude}m
* Terrain Profile: ${terrain}
* Ambient Temperature: ${temperature}°C
* Battery Status: ${batteryLevel}% | Water Secured: ${hasWater ? 'YES' : 'NO'} | Shelter Secured: ${hasShelter ? 'YES' : 'NO'}
* SOS Distress Status: ${isEmergency ? 'ACTIVE (CRITICAL)' : 'INACTIVE (NOMINAL)'}`;

  let baseInstruction = "";
  switch (aiBrain) {
    case "medical":
      baseInstruction = `You are "ANIS MEDICAL & SAFETY AI", an elite emergency medical responder and personal safety advisor, specializing in urgent first aid, crisis intervention, and women's self-defense strategy.
Your voice is firm, reassuring, highly clinical, and ultra-practical.
Provide precise medical actions (e.g. CPR rate, arterial pressure points, snake bite immobility, wound packing) or proactive physical safety techniques (de-escalation, self-defense posture, escaping holds, finding immediate crowded safe spaces).
${telemetryContext}`;
      break;

    case "navigation":
      baseInstruction = `You are "ANIS NAVIGATION AI", an expert tactical terrain navigator and pathway engineer.
Your specialty is dead reckoning, safe route calculations, night-mode hazard avoidance, geofencing guidelines, and tracking back using the breadcrumb return-path engine.
Guide the operator step-by-step through dense cover, steep slopes, or dark streets. Emphasize well-lit, populated paths, and how to verify compass heading.
${telemetryContext}`;
      break;

    case "wildlife":
      baseInstruction = `You are "ANIS WILDLIFE & FLORA AI", a tactical zoologist and wilderness botanist.
Identify dangerous reptiles, insects, venomous snakes (e.g., vipers, cobras), wild predators, and poisonous/medicinal plants.
Provide exact behavioral deterrent protocols (e.g., black bear vs brown bear, snake strike distances) and identification cues.
${telemetryContext}`;
      break;

    case "disaster":
      baseInstruction = `You are "ANIS DISASTER RESPONSE AI", a specialist in high-impact natural disasters (earthquakes, flash floods, cyclones, severe blizzards, active fires).
Provide immediate structural safety guidelines, evacuation timelines, high-ground route selection, and smoke/water inhalation avoidance.
${telemetryContext}`;
      break;

    case "security":
      baseInstruction = `You are "ANIS SECURITY & THREAT ASSESSMENT AI". You specialize in analyzing on-device camera feeds, situational awareness, and profiling surrounding threats (e.g., spotting loitering vehicles, tracking shadows, evaluating dark alleys, crossing paths with groups of strangers).
Instruct the user on how to walk confidently, keep head high, simulate phone calls, find immediate safe havens (shops, lobbies), and use everyday objects for defense.
${telemetryContext}`;
      break;

    case "mental":
      baseInstruction = `You are "ANIS MENTAL CALM & REGULATION AI", a tactical psychologist specializing in performance under high-stress, panic mitigation, and verbal defense.
Guide the operator through box-breathing (4s inhale, 4s hold, 4s exhale, 4s hold), somatic grounding (5-4-3-2-1), and clear, assertive verbal commands to deter threats.
${telemetryContext}`;
      break;

    case "equipment":
      baseInstruction = `You are "ANIS SURVIVAL BACKPACK & GEAR AI", an expert quartermaster and improviser.
Analyze current equipment checklist, highlight missing essentials, and teach the operator how to improvise tools (e.g., using phone battery for fire, plastic bottle for solar water disinfection).
${telemetryContext}`;
      break;

    case "survival":
    default:
      baseInstruction = `You are "ANIS SURVIVAL AI", an advanced, elite, tactical military-grade survival assistant.
Provide direct, hyper-practical, and precise survival instruction. Analyze risks, coordinates, and resources, and deliver a comprehensive action plan.
${telemetryContext}`;
      break;
  }

  return `${baseInstruction}\n\n${languageDirective}`;
};

interface ActivePairing {
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

const activePairings = new Map<string, ActivePairing>();

// Clear stale pairings (older than 6 hours) periodically
setInterval(() => {
  const now = Date.now();
  for (const [code, pairing] of activePairings.entries()) {
    if (now - pairing.lastUpdated > 6 * 60 * 60 * 1000) {
      activePairings.delete(code);
    }
  }
}, 15 * 60 * 1000);

// API Routes
app.post("/api/pairing/register", (req, res) => {
  const { childId, latitude, longitude, altitude, batteryLevel, isEmergency, aiDangerDetected, aiDangerReason } = req.body;
  if (!childId) {
    return res.status(400).json({ error: "childId is required" });
  }

  // Check if child already has an active pairing
  let existingPairing: ActivePairing | null = null;
  for (const pairing of activePairings.values()) {
    if (pairing.childId === childId) {
      existingPairing = pairing;
      break;
    }
  }

  if (existingPairing) {
    existingPairing.latitude = latitude ?? existingPairing.latitude;
    existingPairing.longitude = longitude ?? existingPairing.longitude;
    existingPairing.altitude = altitude ?? existingPairing.altitude;
    existingPairing.batteryLevel = batteryLevel ?? existingPairing.batteryLevel;
    existingPairing.isEmergency = isEmergency ?? existingPairing.isEmergency;
    existingPairing.aiDangerDetected = aiDangerDetected ?? existingPairing.aiDangerDetected;
    existingPairing.aiDangerReason = aiDangerReason ?? existingPairing.aiDangerReason;
    existingPairing.lastUpdated = Date.now();
    return res.json({
      code: existingPairing.code,
      sirenTriggeredByParent: existingPairing.sirenTriggeredByParent
    });
  }

  // Generate a new unique 6-digit code
  let code = "";
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (activePairings.has(code));

  const newPairing: ActivePairing = {
    code,
    childId,
    latitude: latitude ?? 28.6139,
    longitude: longitude ?? 77.2090,
    altitude: altitude ?? 310,
    batteryLevel: batteryLevel ?? 100,
    isEmergency: !!isEmergency,
    aiDangerDetected: !!aiDangerDetected,
    aiDangerReason: aiDangerReason || "",
    sirenTriggeredByParent: false,
    lastUpdated: Date.now()
  };

  activePairings.set(code, newPairing);
  return res.json({
    code,
    sirenTriggeredByParent: false
  });
});

app.post("/api/pairing/update", (req, res) => {
  const { code, latitude, longitude, altitude, batteryLevel, isEmergency, aiDangerDetected, aiDangerReason } = req.body;
  if (!code) {
    return res.status(400).json({ error: "code is required" });
  }

  const pairing = activePairings.get(code.toString().trim());
  if (!pairing) {
    return res.status(404).json({ error: "Active connection code not found or expired" });
  }

  pairing.latitude = latitude ?? pairing.latitude;
  pairing.longitude = longitude ?? pairing.longitude;
  pairing.altitude = altitude ?? pairing.altitude;
  pairing.batteryLevel = batteryLevel ?? pairing.batteryLevel;
  pairing.isEmergency = isEmergency ?? pairing.isEmergency;
  pairing.aiDangerDetected = aiDangerDetected ?? pairing.aiDangerDetected;
  pairing.aiDangerReason = aiDangerReason ?? pairing.aiDangerReason;
  pairing.lastUpdated = Date.now();

  return res.json({
    sirenTriggeredByParent: pairing.sirenTriggeredByParent
  });
});

app.get("/api/pairing/status/:code", (req, res) => {
  const code = req.params.code?.trim();
  const pairing = activePairings.get(code);
  if (!pairing) {
    return res.status(404).json({ error: "Connection code not found" });
  }
  return res.json(pairing);
});

app.post("/api/pairing/parent-control", (req, res) => {
  const { code, triggerSiren } = req.body;
  if (!code) {
    return res.status(400).json({ error: "code is required" });
  }

  const pairing = activePairings.get(code.toString().trim());
  if (!pairing) {
    return res.status(404).json({ error: "Connection code not found" });
  }

  pairing.sirenTriggeredByParent = !!triggerSiren;
  pairing.lastUpdated = Date.now();
  return res.json({ success: true, sirenTriggeredByParent: pairing.sirenTriggeredByParent });
});

// API Routes
app.post("/api/survival/guidance", async (req, res) => {
  try {
    const {
      latitude = 28.6139,
      longitude = 77.2090,
      altitude = 250,
      terrain = "Dense Forest",
      temperature = 22,
      batteryLevel = 100,
      hasWater = true,
      hasShelter = true,
      isEmergency = false,
      message = "Give me a current tactical status check and survival guidance.",
      aiBrain = "survival",
      lang = "en"
    } = req.body;

    const systemPrompt = getSystemInstruction(aiBrain, {
      latitude,
      longitude,
      altitude,
      terrain,
      temperature,
      batteryLevel,
      hasWater,
      hasShelter,
      isEmergency,
      lang
    });

    if (!ai) {
      // Fallback response when API key is missing
      let offlineTitle = "### 📡 OFFLINE AI ENGINE ACTIVE";
      let offlineGuidance = "";

      if (aiBrain === "medical") {
        offlineTitle = "### 🩺 OFFLINE MEDICAL & SAFETY BRAIN";
        offlineGuidance = `
*   **Emergency Contact Alert**: In a true crisis, dial local emergency dispatchers immediately.
*   **Physical Defense Action**: If followed, do not go home. Move immediately to a highly-populated area (24-hour convenience store, pharmacy, hotel lobby, or gas station).
*   **First Aid Protocols**:
    *   *Bleeding Control*: Apply direct, hard, continuous pressure on the wound. Use clean cloth or bandage. Elevate above heart.
    *   *Snake Bite*: Immobilize the limb below heart level. Do NOT cut, suction, or apply a tight tourniquet. Note the snake's color pattern and length.
    *   *CPR*: Give 100-120 hard and fast compressions per minute at the center of the chest (to the beat of "Stayin' Alive").
`;
      } else if (aiBrain === "security") {
        offlineTitle = "### 🛡️ OFFLINE SECURITY & THREAT ASSESSMENT";
        offlineGuidance = `
*   **Camera Scan Simulation**: Threat analysis mode active. Evaluated local lighting: 30% intensity (Caution: high shadows).
*   **Personal Escort Protocol**:
    *   Maintain active visual scanning of your 360-degree radius. Avoid wearing headphones or staring at your phone while walking.
    *   Walk with long, purposeful strides. Hold your head high, shoulders back.
    *   If followed, cross the street immediately or reverse direction. Actively seek populated avenues.
`;
      } else if (aiBrain === "mental") {
        offlineTitle = "### 🧠 OFFLINE MENTAL CALM & GROUNDING ENGINE";
        offlineGuidance = `
*   **Box Breathing Cycle**: Initiating 4-4-4-4 tactical relaxation rhythm. 
    *   *Inhale* slowly for 4 seconds.
    *   *Hold* your breath for 4 seconds.
    *   *Exhale* steadily for 4 seconds.
    *   *Hold* empty for 4 seconds.
    *   Repeat 4-5 times to lower cortisol and regain mechanical focus.
*   **Somatic Grounding Exercise (5-4-3-2-1)**:
    *   Name **5** things you can see right now.
    *   Name **4** physical sensations (e.g. cold wind, heavy boots).
    *   Name **3** distinct sounds (e.g. rustling leaves, remote traffic).
    *   Name **2** things you can smell.
    *   Name **1** positive resource or memory.
`;
      } else if (aiBrain === "navigation") {
        offlineTitle = "### 🧭 OFFLINE NAVIGATION INTEL";
        offlineGuidance = `
*   **Breadcrumb Guidance**: Return Path trace is fully active. Follow back along orange breadcrumbs.
*   **Night Nav Warning**: After sunset, avoid forested shortcuts. Stick to primary paths, keep tactical compass locked on North or target azimuth.
*   **Safe Havens**: Check POIs marked with green/blue icons on the map tracker.
`;
      } else {
        offlineGuidance = `
*   **Coordinates**: ${latitude?.toFixed(5)}°N, ${longitude?.toFixed(5)}°E
*   **Terrain danger**: Selected profile: **${terrain}**. Avoid ledges and dense marshes.
*   **Hydration Alert**: Ensure water levels are checked hourly. Dehydration can cause disorientation within 6 hours.
`;
      }

      return res.json({
        guidance: `${offlineTitle} (Backup Mode)
Your specialized AI Brain module **"${aiBrain.toUpperCase()}"** is running on local offline intelligence.

${offlineGuidance}
**Recommendations**:
1. ${!hasWater ? "⚠️ **CRITICAL**: Dehydration hazard. Prioritize securing freshwater." : "💧 **Water Secured**: Ratio wisely."}
2. ${!hasShelter ? "⚠️ **CRITICAL**: Exposure warning. Erect temporary frame-shelter." : "🏕️ **Shelter Secured**: Stable platform."}
3. ${isEmergency ? "🚨 **SOS BROADCASTING**: Satellite beacon active on backup channels." : "🟢 **System Nominal**: Tracking crumbs."}
`,
        priority: isEmergency ? "🚨 STAY IN PLACE: Emergency broadcast active" : "🧭 Check tactical compass and proceed safely.",
        status: isEmergency ? "CRITICAL" : (!hasWater || !hasShelter) ? "WARNING" : "NOMINAL"
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            guidance: {
              type: Type.STRING,
              description: "Complete, highly professional markdown-formatted survival advice, instructions, actions, or de-escalation scripts.",
            },
            priority: {
              type: Type.STRING,
              description: "A short, 1-sentence urgent action item representing the absolute highest priority.",
            },
            status: {
              type: Type.STRING,
              description: "One of 'NOMINAL', 'WARNING', or 'CRITICAL'.",
            }
          },
          required: ["guidance", "priority", "status"],
        }
      },
    });

    let parsedData;
    const rawText = response.text?.trim() || "{}";
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      console.warn("Failed to parse response as JSON. Raw text was:", rawText);
      parsedData = {
        guidance: rawText || "No response text received from server.",
        priority: isEmergency ? "🚨 STAY SEATED: SOS distress beacon active" : "🧭 Monitor tactical compass and secure resources.",
        status: isEmergency ? "CRITICAL" : "NOMINAL"
      };
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to query ANIS Survival AI.", details: error.message });
  }
});

// Start server with Vite support
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ANIS SURVIVAL AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

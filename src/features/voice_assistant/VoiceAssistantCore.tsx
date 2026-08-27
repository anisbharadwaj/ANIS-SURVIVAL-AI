import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Settings, 
  Languages, 
  HelpCircle, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Square,
  RefreshCw,
  X,
  VolumeX,
  Compass
} from "lucide-react";
import { AISpecialization } from "../../types";

interface VoiceAssistantCoreProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  speakVoiceFeedback: (text: string) => void;
  querySurvivalAI: (msg?: string) => void;
  triggerEmergencySOS: (reason?: string) => void;
  cancelEmergencySOS: () => void;
  setLatitude: (lat: number) => void;
  setLongitude: (lng: number) => void;
  setMapStyle: (style: 'dark' | 'light' | 'terrain' | 'satellite' | 'hiking') => void;
  setTrackingActive: (active: boolean) => void;
  destinationWaypoint: any;
  setDestinationWaypoint: (wp: any) => void;
  activeAiBrain: AISpecialization;
  setActiveAiBrain: (brain: AISpecialization) => void;
  setChatLog: React.Dispatch<React.SetStateAction<any[]>>;
  mobilePanel: 'telemetry' | 'map' | 'search' | 'cockpit' | 'ai';
  setMobilePanel: (panel: 'telemetry' | 'map' | 'search' | 'cockpit' | 'ai') => void;
  onSearchPlaceTriggered?: (query: string) => void;
}

export const VoiceAssistantCore: React.FC<VoiceAssistantCoreProps> = ({
  activeTab,
  setActiveTab,
  voiceEnabled,
  setVoiceEnabled,
  speakVoiceFeedback,
  querySurvivalAI,
  triggerEmergencySOS,
  cancelEmergencySOS,
  setLatitude,
  setLongitude,
  setMapStyle,
  setTrackingActive,
  destinationWaypoint,
  setDestinationWaypoint,
  activeAiBrain,
  setActiveAiBrain,
  setChatLog,
  mobilePanel,
  setMobilePanel,
  onSearchPlaceTriggered
}) => {
  // Saved options in local state (synced with localStorage)
  const [prefLanguage, setPrefLanguage] = useState<"en" | "hi" | "as">(() => {
    return (localStorage.getItem("anis_pref_lang") as "en" | "hi" | "as") || "en";
  });
  const [wakeWord, setWakeWord] = useState<string>(() => {
    return localStorage.getItem("anis_wake_word") || "ANIS";
  });
  const [alwaysListening, setAlwaysListening] = useState<boolean>(() => {
    return localStorage.getItem("anis_always_listening") === "true";
  });
  const [handsFreeMode, setHandsFreeMode] = useState<boolean>(() => {
    return localStorage.getItem("anis_hands_free") === "true";
  });
  const [voiceRate, setVoiceRate] = useState<number>(() => {
    return parseFloat(localStorage.getItem("anis_voice_rate") || "1.0");
  });
  const [voiceVolume, setVoiceVolume] = useState<number>(() => {
    return parseFloat(localStorage.getItem("anis_voice_volume") || "0.95");
  });
  const [voiceGender, setVoiceGender] = useState<"female" | "male">(() => {
    return (localStorage.getItem("anis_voice_gender") as "female" | "male") || "female";
  });

  // Web Speech API references
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [isListeningActive, setIsListeningActive] = useState(false);
  const [recognitionLogs, setRecognitionLogs] = useState<string[]>(["Voice subsystems ready."]);
  const [lastHeardPhrase, setLastHeardPhrase] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const recognitionRef = useRef<any>(null);
  const micPermissionCheckedRef = useRef(false);

  // Sync preferences to localStorage
  useEffect(() => {
    localStorage.setItem("anis_pref_lang", prefLanguage);
  }, [prefLanguage]);

  useEffect(() => {
    localStorage.setItem("anis_wake_word", wakeWord);
  }, [wakeWord]);

  useEffect(() => {
    localStorage.setItem("anis_always_listening", String(alwaysListening));
    if (alwaysListening) {
      requestMicAndStart();
    } else {
      stopListeningEngine();
    }
  }, [alwaysListening]);

  useEffect(() => {
    localStorage.setItem("anis_hands_free", String(handsFreeMode));
  }, [handsFreeMode]);

  useEffect(() => {
    localStorage.setItem("anis_voice_rate", String(voiceRate));
  }, [voiceRate]);

  useEffect(() => {
    localStorage.setItem("anis_voice_volume", String(voiceVolume));
  }, [voiceVolume]);

  useEffect(() => {
    localStorage.setItem("anis_voice_gender", voiceGender);
  }, [voiceGender]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setRecognitionLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 19)]);
  };

  // Setup synthesized speaker for preferred languages with high-quality neural voice parameters and natural timing pauses
  const speakWithCustomEngine = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();

      // CLEAN TEXT TO ENSURE CONVERSATIONAL QUALITY AND REMOVE DISTRACTING MARKDOWN/METADATA
      const cleanTextForSpeech = (rawText: string): string => {
        if (!rawText) return "";

        let cleaned = rawText;

        // 1. Strip raw markdown artifacts
        cleaned = cleaned.replace(/#{1,6}\s+/g, ""); // Remove markdown headers
        cleaned = cleaned.replace(/\*\*|__/g, "");   // Remove bold formatting symbols
        cleaned = cleaned.replace(/\*|_/g, "");     // Remove italics or general asterisks
        cleaned = cleaned.replace(/`[^`]+`/g, (match) => match.slice(1, -1)); // Remove code brackets

        // 2. Format bullet lists into pleasant conversational sentences
        cleaned = cleaned.replace(/-\s+([A-Za-z\s]+):\s*([0-9a-zA-Z\s\.]+)/gi, "$1 is $2. ");
        cleaned = cleaned.replace(/\*\s+([A-Za-z\s]+):\s*([0-9a-zA-Z\s\.]+)/gi, "$1 is $2. ");

        // 3. Convert abrupt colons to friendly commas/pauses
        cleaned = cleaned.replace(/:\s+/g, ", ");

        // 4. Translate mathematical symbols and abbreviations to spoken counterparts
        cleaned = cleaned.replace(/(\d+)\s*m\b/gi, "$1 meters");
        cleaned = cleaned.replace(/(\d+)\s*km\b/gi, "$1 kilometers");
        cleaned = cleaned.replace(/(\d+\.\d+)°\s*N/gi, "$1 degrees North");
        cleaned = cleaned.replace(/(\d+\.\d+)°\s*E/gi, "$1 degrees East");
        cleaned = cleaned.replace(/(\d+\.\d+)°\s*S/gi, "$1 degrees South");
        cleaned = cleaned.replace(/(\d+\.\d+)°\s*W/gi, "$1 degrees West");
        cleaned = cleaned.replace(/\s*\/\s*/g, " or ");

        // 5. Transform standard period markers into natural pacing breaks (ellipses)
        cleaned = cleaned.replace(/\.\s+/g, "... ");

        // 6. Purge UI icon symbols
        cleaned = cleaned.replace(/[🚨🗺️🧭🔊📡🛠️🔋❤️]/gu, "");

        // 7. Consolidate whitespace
        cleaned = cleaned.replace(/\s+/g, " ").trim();

        return cleaned;
      };

      const cleanedText = cleanTextForSpeech(text);
      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);

      // Select matching voices
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;

      // Map language codes
      const langMap = {
        en: "en-IN",
        hi: "hi-IN",
        as: "as-IN"
      };
      const preferredLangCode = langMap[prefLanguage];

      // Step 1: Filter voices by target language with localized fallback cascading
      let possibleVoices = [];
      if (prefLanguage === "as") {
        // Native Assamese voice is rare; cascade to Bengali (linguistically related) or Indian English/Hindi
        possibleVoices = voices.filter(v => 
          v.lang.toLowerCase().startsWith("as") || 
          v.lang.toLowerCase().startsWith("bn") || 
          v.lang.toLowerCase().startsWith("en-in") || 
          v.lang.toLowerCase().startsWith("hi")
        );
      } else if (prefLanguage === "hi") {
        possibleVoices = voices.filter(v => v.lang.toLowerCase().startsWith("hi"));
      } else {
        possibleVoices = voices.filter(v => 
          v.lang.toLowerCase().startsWith("en-in") || 
          v.lang.toLowerCase().startsWith("en-us") || 
          v.lang.toLowerCase().startsWith("en-gb") || 
          v.lang.toLowerCase().startsWith("en")
        );
      }

      // Step 2: Calculate voice suitability based on high-quality neural / natural keyword properties
      const checkVoicePremiumScore = (voice: SpeechSynthesisVoice): number => {
        const nameLower = voice.name.toLowerCase();
        let score = 0;
        
        if (nameLower.includes("natural")) score += 15;
        if (nameLower.includes("neural")) score += 12;
        if (nameLower.includes("online")) score += 10;
        if (nameLower.includes("google")) score += 8;
        if (nameLower.includes("premium")) score += 6;
        if (nameLower.includes("siri")) score += 5;
        if (nameLower.includes("wavenet")) score += 4;
        
        // Prioritize targeted regional properties (e.g. en-IN, hi-IN, bn-IN)
        const langLower = voice.lang.toLowerCase();
        if (prefLanguage === "as") {
          if (langLower.includes("as-in") || langLower.includes("as")) score += 20;
          else if (langLower.includes("bn-in") || langLower.includes("bn")) score += 10;
        } else if (prefLanguage === "hi" && langLower.includes("hi-in")) {
          score += 20;
        } else if (prefLanguage === "en" && langLower.includes("en-in")) {
          score += 15; // Reassuring local Indian English accent
        }
        
        return score;
      };

      // Apply preferred Gender filter
      let genderFiltered = [...possibleVoices];
      if (voiceGender === "female") {
        genderFiltered = possibleVoices.filter(v => 
          v.name.toLowerCase().includes("female") || 
          v.name.toLowerCase().includes("google") || 
          v.name.toLowerCase().includes("zira") || 
          v.name.toLowerCase().includes("karen") || 
          v.name.toLowerCase().includes("sangeeta") || 
          v.name.toLowerCase().includes("priya") || 
          v.name.toLowerCase().includes("swara") || 
          v.name.toLowerCase().includes("hazel") ||
          v.name.toLowerCase().includes("kalpana") ||
          v.name.toLowerCase().includes("heera") ||
          v.name.toLowerCase().includes("neerja") ||
          v.name.toLowerCase().includes("aria")
        );
      } else if (voiceGender === "male") {
        genderFiltered = possibleVoices.filter(v => 
          v.name.toLowerCase().includes("male") || 
          v.name.toLowerCase().includes("david") || 
          v.name.toLowerCase().includes("george") || 
          v.name.toLowerCase().includes("ravi") || 
          v.name.toLowerCase().includes("harsh") ||
          v.name.toLowerCase().includes("madhur") ||
          v.name.toLowerCase().includes("sam")
        );
      }

      // Default back if gender subset is empty
      if (genderFiltered.length === 0) {
        genderFiltered = possibleVoices;
      }

      // Sort candidate voices by premium score
      genderFiltered.sort((a, b) => checkVoicePremiumScore(b) - checkVoicePremiumScore(a));
      selectedVoice = genderFiltered[0] || null;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`[ANIS Neural Voice Engine] Initialized: ${selectedVoice.name} (${selectedVoice.lang})`);
      } else {
        utterance.lang = preferredLangCode;
      }

      // Step 3: Natural cadence adjustment
      const isNeural = selectedVoice && (
        selectedVoice.name.toLowerCase().includes("natural") || 
        selectedVoice.name.toLowerCase().includes("neural") || 
        selectedVoice.name.toLowerCase().includes("online")
      );

      // Relax standard speeds to improve organic inflection and conversational intake
      if (prefLanguage === "hi" || prefLanguage === "as") {
        utterance.rate = isNeural ? (voiceRate * 0.92) : (voiceRate * 0.94);
      } else {
        utterance.rate = isNeural ? (voiceRate * 0.94) : (voiceRate * 0.96);
      }

      // Pitch mapping to balance warm acoustics (reducing metallic robot buzzes)
      if (voiceGender === "female") {
        utterance.pitch = isNeural ? 1.02 : 1.06;
      } else if (voiceGender === "male") {
        utterance.pitch = isNeural ? 0.95 : 0.90;
      } else {
        utterance.pitch = 1.0;
      }

      utterance.volume = voiceVolume;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis failed:", e);
    }
  };

  // Re-route normal App speakVoiceFeedback to our voice assistant synthesizer
  useEffect(() => {
    (window as any).speakVoiceFeedbackCustom = speakWithCustomEngine;
    return () => {
      delete (window as any).speakVoiceFeedbackCustom;
    };
  }, [prefLanguage, voiceRate, voiceVolume, voiceGender, voiceEnabled]);

  // Request Microphone Permissions
  const checkMicPermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: "microphone" as any });
      setMicPermission(result.state);
      result.onchange = () => {
        setMicPermission(result.state);
      };
      return result.state;
    } catch (err) {
      // Fallback
      return "prompt";
    }
  };

  const requestMicAndStart = async () => {
    try {
      addLog("Requesting microphone telemetry stream...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");
      stream.getTracks().forEach(t => t.stop()); // close temp stream
      startListeningEngine();
    } catch (err) {
      setMicPermission("denied");
      addLog("ERROR: Microphone access declined. Always-Listening aborted.");
      setAlwaysListening(false);
    }
  };

  // Speech Recognition Control
  const startListeningEngine = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog("CRITICAL: Web Speech Recognition API is unsupported on this browser platform.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // continuous false and restarting onend is much more robust
    recognition.interimResults = false;

    // Map language locales
    const langCode = prefLanguage === "en" ? "en-IN" : prefLanguage === "hi" ? "hi-IN" : "as-IN";
    recognition.lang = langCode;

    recognition.onstart = () => {
      setIsListeningActive(true);
      addLog(`Mic Active: Monitoring wake-word "${wakeWord}" in ${prefLanguage.toUpperCase()}...`);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        // peaceful silence, no action needed
      } else if (event.error === "not-allowed") {
        setMicPermission("denied");
        addLog("Mic blocked by system permission policy.");
        setIsListeningActive(false);
      } else {
        addLog(`Sensor Warning: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListeningActive(false);
      // Restart if Always Listening is still turned on
      if (alwaysListening) {
        setTimeout(() => {
          if (alwaysListening) {
            startListeningEngine();
          }
        }, 300);
      }
    };

    recognition.onresult = (event: any) => {
      const resultIndex = event.resultIndex;
      const transcript = event.results[resultIndex][0].transcript;
      const confidence = event.results[resultIndex][0].confidence;
      
      setLastHeardPhrase(transcript);
      addLog(`Heard: "${transcript}" (Accuracy: ${(confidence * 100).toFixed(0)}%)`);
      processVoiceTelemetry(transcript);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.warn("Speech start conflict: ", e);
    }
  };

  const stopListeningEngine = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListeningActive(false);
    addLog("Mic Deactivated. Push-to-talk available.");
  };

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // VOICE COMMAND PROCESSOR ENGINE
  const processVoiceTelemetry = (phrase: string) => {
    setIsProcessing(true);
    const cleaned = phrase.toLowerCase().trim();
    const triggerWord = wakeWord.toLowerCase().trim();

    // Check wake word in Always Listening Mode
    if (alwaysListening) {
      if (cleaned.includes(triggerWord)) {
        // Strip the wake word to isolate the raw command
        const commandPart = cleaned.split(triggerWord)[1]?.trim() || "";
        if (commandPart) {
          executeVoiceCommand(commandPart);
        } else {
          // Just spoke the wake word alone
          respondToGreeting();
        }
      } else {
        // Heard something without wake-word
        setIsProcessing(false);
      }
    } else {
      // Direct push-to-talk, no wake word check required
      executeVoiceCommand(cleaned);
    }
  };

  const respondToGreeting = () => {
    let reply = "Yes, Operator. I am online. What is your status?";
    if (prefLanguage === "hi") {
      reply = "हाँ, ऑपरेटर। मैं ऑनलाइन हूँ। आपकी क्या स्थिति है?";
    } else if (prefLanguage === "as") {
      reply = "হয়, মই অনলাইন আছোঁ। আপোনাৰ স্থিতি কি?";
    }
    speakWithCustomEngine(reply);
    setChatLog(prev => [
      ...prev,
      { sender: "anis", text: reply, timestamp: new Date().toLocaleTimeString() }
    ]);
    setIsProcessing(false);
  };

  const executeVoiceCommand = (command: string) => {
    addLog(`Processing command: "${command}"`);
    setChatLog(prev => [
      ...prev,
      { sender: "user", text: command, timestamp: new Date().toLocaleTimeString() }
    ]);

    let matched = false;

    // Help respond triggers
    const triggerResponse = (english: string, hindi: string, assamese: string) => {
      const resp = prefLanguage === "en" ? english : prefLanguage === "hi" ? hindi : assamese;
      speakWithCustomEngine(resp);
      setChatLog(prev => [
        ...prev,
        { sender: "anis", text: `### 🎙️ VOICE COMMAND EXECUTED\n*   **Command**: "${command}"\n*   **Response**: ${resp}`, timestamp: new Date().toLocaleTimeString() }
      ]);
      setIsProcessing(false);
      matched = true;
    };

    // 1. OPEN DASHBOARD / TELEMETRY
    if (command.includes("dashboard") || command.includes("cockpit") || command.includes("kholo") && (command.includes("operator") || command.includes("dashboard"))) {
      setActiveTab("sos");
      setMobilePanel("telemetry");
      triggerResponse(
        "Opening primary tactical cockpit and telemetry dashboard.",
        "मुख्य ऑपरेटर डैशबोर्ड खोल रहा हूँ।",
        "মুখ্য ডেশ্ব’ৰ্ড মুকলি কৰা হৈছে।"
      );
    }
    
    // 2. OPEN OFFLINE MAPS
    else if (command.includes("map") || command.includes("maps") || command.includes("bhumichitro") || command.includes("nasha")) {
      setMobilePanel("map");
      triggerResponse(
        "Focusing global tactical search and map routing engine.",
        "वैश्विक मानचित्र और रूटिंग प्रणाली खोल रहा हूँ।",
        "গোলকীয় মানচিত্ৰ আৰু ৰুটিং ইঞ্জিনত ফ’কাচ কৰা হৈছে।"
      );
    }

    // 3. SHOW MY LOCATION
    else if (command.includes("my location") || command.includes("where am i") || command.includes("locate me") || command.includes("meri location") || command.includes("mor sthiti")) {
      setMobilePanel("map");
      // Simulate click coordinate lock or trigger centered feedback
      triggerResponse(
        "Centering map coordinates on GPS telemetry. Local system tracking is active.",
        "जीपीएस पोजीशन को मैप के केंद्र में ला रहा हूँ।",
        "জিপিএছ কোঅর্ডিনেটত মেপটো কেন্দ্ৰীভূত কৰা হৈছে।"
      );
    }

    // 4. DOWNLOAD MAP
    else if (command.includes("download map") || command.includes("download")) {
      setMobilePanel("map");
      // Trigger downloder overlay
      const el = document.getElementById("btn_open_map_downloader");
      if (el) el.click();
      triggerResponse(
        "Launching offline map download selector.",
        "ऑफ़लाइन मानचित्र डाउनलोडर खोल रहा हूँ।",
        "অফলাইন মেপ ডাউনলোডাৰ মুকলি কৰা হৈছে।"
      );
    }

    // 5. SEARCH PLACE
    else if (command.startsWith("search place") || command.startsWith("search") || command.includes("khojo") || command.includes("bisaari")) {
      const query = command.replace("search place", "").replace("search", "").replace("khojo", "").replace("bisaari", "").trim();
      setMobilePanel("map");
      if (onSearchPlaceTriggered && query) {
        onSearchPlaceTriggered(query);
        triggerResponse(
          `Searching global directory for: "${query}".`,
          `मानचित्र पर "${query}" की खोज की जा रही है।`,
          `মানচিত্ৰত "${query}" বিচাৰি থকা হৈছে।`
        );
      } else {
        triggerResponse(
          "Global search console ready. What location would you like to target?",
          "वैश्विक खोज कंसोल तैयार है। आप किस स्थान की खोज करना चाहते हैं?",
          "গোলকীয় অনুসন্ধান সঁজুলি প্ৰস্তুত। আপুনি কোনটো স্থান সন্ধান কৰিব খোজে?"
        );
      }
    }

    // 6. NAVIGATE TO DESTINATION
    else if (command.includes("navigate") || command.includes("margh darshan") || command.includes("pora khula")) {
      const destination = command.replace("navigate to", "").replace("navigate", "").trim();
      setMobilePanel("map");
      if (onSearchPlaceTriggered && destination) {
        onSearchPlaceTriggered(destination);
        triggerResponse(
          `Plotting active course routing corridors towards: "${destination}".`,
          `"${destination}" की ओर नेविगेशन मार्ग की गणना की जा रही है।`,
          `"${destination}" লৈ সক্ৰিয় পথ গণনা কৰা হৈছে।`
        );
      } else {
        triggerResponse(
          "Course routing engine active. Where is your destination?",
          "नेविगेशन प्रणाली तैयार है। आपका गंतव्य स्थान कहाँ है?",
          "নেভিগেশ্যন ইঞ্জিন সক্ৰিয়। আপোনাৰ গন্তব্য স্থান ক’ত?"
        );
      }
    }

    // 7. OPEN SURVIVAL LIBRARY
    else if (command.includes("library") || command.includes("survival guide") || command.includes("pustakalay") || command.includes("kitap")) {
      setActiveTab("library");
      setMobilePanel("cockpit");
      triggerResponse(
        "Opening localized offline survival handbook and emergency response guides.",
        "ऑफ़लाइन आपातकालीन चिकित्सा निर्देशिका और मैनुअल खोल रहा हूँ।",
        "অফলাইন জৰুৰীকালীন নিৰ্দেশিকা পুস্তকালয় খোলা হৈছে।"
      );
    }

    // 8. OPEN MEDICAL GUIDE / FIRST AID
    else if (command.includes("medical") || command.includes("first aid") || command.includes("sarpadansh") || command.includes("cpr") || command.includes("upachar")) {
      setActiveTab("library");
      setActiveAiBrain("medical");
      setMobilePanel("cockpit");
      // Query medical guide auto-trigger if possible
      triggerResponse(
        "Switching AI core to MEDICAL SPECIALIST. First Aid libraries are loaded. Please specify symptoms or bites.",
        "एआई कोर को मेडिकल विशेषज्ञ में बदल रहा हूँ। प्राथमिक चिकित्सा निर्देशिका लोड हो चुकी है।",
        "এআই ক’ৰক চিকিৎসা বিশেষজ্ঞলৈ পৰিৱৰ্তন কৰা হৈছে। প্ৰাথমিক চিকিৎসা নিৰ্দেশিকা লোড কৰা হৈছে।"
      );
    }

    // 9. SECURE VAULT
    else if (command.includes("vault") || command.includes("locker") || command.includes("dastavej")) {
      setActiveTab("vault");
      setMobilePanel("cockpit");
      triggerResponse(
        "Opening military-grade encrypted local offline file vault.",
        "सुरक्षित एन्क्रिप्टेड दस्तावेज़ तिजोरी खोल रहा हूँ।",
        "সুৰক্ষিত ফাইল ভল্ট মুকলি কৰা হৈছে।"
      );
    }

    // 10. ACTIVATE SOS
    else if (command.includes("activate sos") || command.includes("emergency") || command.includes("bachao") || command.includes("khatra") || command.includes("aprakal")) {
      triggerEmergencySOS("VOICE_COMMAND");
      setActiveTab("sos");
      setMobilePanel("telemetry");
      triggerResponse(
        "WARNING: Satellites alerted! Launching emergency tactical beacon broadcasting immediately.",
        "सावधान: आपातकालीन उपग्रह एसओएस बीकन सक्रिय किया जा रहा है!",
        "সাৱধান: জৰুৰীকালীন এছঅ’এছ সংকেত সক্ৰিয় কৰা হৈছে!"
      );
    }

    // 11. DEACTIVATE ALERTS / STOP NAVIGATION
    else if (command.includes("stop navigation") || command.includes("cancel route") || command.includes("navigation band")) {
      setDestinationWaypoint(null);
      triggerResponse(
        "Active route guidance and target corridors cleared.",
        "सक्रिय नेविगेशन मार्ग को रद्द कर दिया गया है।",
        "সক্ৰিয় নেভিগেশ্যন পথ মচি পেলোৱা হৈছে।"
      );
    }

    // 12. START ROUTE TRACKING
    else if (command.includes("start recording") || command.includes("start tracking") || command.includes("tracking chalu")) {
      setTrackingActive(true);
      triggerResponse(
        "Course breadcrumbs trail tracking enabled. Recording return pathway.",
        "सक्रिय मार्ग ट्रैकिंग शुरू की गई है।",
        "সক্ৰিয় পথ অনুসৰণ আৰম্ভ কৰা হৈছে।"
      );
    }

    // 13. CHANGE LANGUAGE
    else if (command.includes("hindi") || command.includes("hindi language")) {
      setPrefLanguage("hi");
      matched = true;
      setIsProcessing(false);
      speakVoiceFeedback("हिंदी भाषा का चयन किया गया है।");
      addLog("Speech synthesis translated to HINDI (hi-IN).");
    } else if (command.includes("english") || command.includes("english language")) {
      setPrefLanguage("en");
      matched = true;
      setIsProcessing(false);
      speakVoiceFeedback("English language selected.");
      addLog("Speech synthesis translated to ENGLISH (en-IN).");
    } else if (command.includes("assamese") || command.includes("assamese language") || command.includes("oxomiya")) {
      setPrefLanguage("as");
      matched = true;
      setIsProcessing(false);
      speakVoiceFeedback("অসমীয়া ভাষা বাছনি কৰা হৈছে।");
      addLog("Speech synthesis translated to ASSAMESE (as-IN).");
    }

    // 14. CHANGE MAP THEME
    else if (command.includes("switch theme") || command.includes("change theme") || command.includes("change map style") || command.includes("theme badlo") || command.includes("satellite")) {
      setMapStyle("satellite");
      triggerResponse(
        "Adjusting HUD layer map to high-contrast Satellite Imagery.",
        "मानचित्र को उपग्रह दृश्य में बदल रहा हूँ।",
        "মানচিত্ৰক উপগ্ৰহ দৃশ্যলৈ সলনি কৰা হৈছে।"
      );
    }

    // 15. SETTINGS
    else if (command.includes("settings") || command.includes("volume") || command.includes("voice settings")) {
      setShowConfig(true);
      triggerResponse(
        "Opening Advanced Multilingual Voice Configuration Panel.",
        "उन्नत आवाज नियंत्रण सेटिंग्स खोल रहा हूँ।",
        "উন্নত কণ্ঠ নিয়ন্ত্ৰণ পেনেল খোলা হৈছে।"
      );
    }

    // 16. GENERAL FALLBACK QUERY TO GEMINI
    if (!matched) {
      addLog(`Rerouting query to specialized brain core: "${command}"...`);
      querySurvivalAI(command);
      setIsProcessing(false);
    }
  };

  return (
    <div id="anis_voice_assistant_control_box" className="bg-[#0b101c] border border-[#182a4d] rounded-xl p-3.5 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#142340] pb-2.5 mb-3">
        <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
          <Mic className={`w-4 h-4 ${isListeningActive ? 'text-red-500 animate-pulse' : 'text-sky-400'}`} />
          ANIS Voice Assistant
        </h3>
        <button
          id="btn_toggle_voice_config"
          onClick={() => setShowConfig(!showConfig)}
          className="p-1 bg-[#121926] hover:bg-[#1f2c42] border border-[#203253] rounded text-gray-400 hover:text-sky-400 transition-colors cursor-pointer"
          title="Voice Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MIC GLOW / CONTROL LAYER */}
      <div className="flex items-center gap-3 bg-[#070b13] border border-[#121f37] rounded-lg p-3">
        <button
          id="btn_voice_push_to_talk"
          onClick={() => {
            if (isListeningActive) {
              stopListeningEngine();
            } else {
              startListeningEngine();
            }
          }}
          className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer relative ${
            isListeningActive 
              ? 'bg-red-950 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' 
              : 'bg-[#121c32] border-sky-600 text-sky-400 hover:bg-[#1a2b4b]'
          }`}
          title={isListeningActive ? "Tap to Stop listening" : "Tap to Speak / Push-to-Talk"}
        >
          {isListeningActive && (
            <div className="absolute inset-0 w-full h-full bg-red-500 rounded-full animate-ping opacity-25"></div>
          )}
          {isListeningActive ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
            <span className={`w-2 h-2 rounded-full ${isListeningActive ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
            {isListeningActive ? "ACTIVE SENSOR LISTENING..." : "PUSH-TO-TALK READY"}
          </div>
          <p className="text-xs font-mono font-bold text-gray-100 truncate mt-0.5">
            {isProcessing ? "Processing Telemetry..." : lastHeardPhrase || "Speak, or tap microphone..."}
          </p>
        </div>

        {/* ALWAYS LISTENING SWITCH */}
        <div className="flex flex-col items-end gap-1 shrink-0 border-l border-[#13223f] pl-3">
          <span className="text-[8px] font-mono font-bold text-sky-400 uppercase tracking-widest">ALWAYS MIC</span>
          <button
            id="toggle_always_listening_state"
            onClick={() => {
              const next = !alwaysListening;
              setAlwaysListening(next);
              speakVoiceFeedback(next ? "Always listening tracking protocol engaged. State microphone is hot." : "Continuous listening paused. Reverted to standard trigger.");
            }}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex ${
              alwaysListening ? 'bg-sky-600 justify-end' : 'bg-gray-800 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow"></span>
          </button>
        </div>
      </div>

      {/* QUICK MULTILINGUAL BUTTONS */}
      <div className="grid grid-cols-3 gap-1.5 mt-2.5">
        {[
          { id: "en", label: "🇬🇧 EN", desc: "Indian English" },
          { id: "hi", label: "🇮🇳 HI", desc: "Hindi Speech" },
          { id: "as", label: "🇮🇳 AS", desc: "Assamese Voice" }
        ].map(lang => (
          <button
            id={`btn_voice_lang_${lang.id}`}
            key={lang.id}
            onClick={() => {
              setPrefLanguage(lang.id as any);
              const confirmation = lang.id === "en" ? "English mode selected." : lang.id === "hi" ? "हिंदी मोड सक्रिय किया गया।" : "অসমীয়া মোড বাছনি কৰা হৈছে।";
              speakVoiceFeedback(confirmation);
              addLog(`Swapped default vocal stream to ${lang.label}`);
            }}
            className={`py-1 text-[9px] font-mono font-bold border rounded transition-all cursor-pointer ${
              prefLanguage === lang.id 
                ? 'bg-sky-950 border-sky-500 text-sky-300' 
                : 'bg-[#121926]/40 border-[#182949]/70 text-gray-500 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* CONFIGURATION PANEL DROPDOWN */}
      {showConfig && (
        <div className="bg-[#090d16] border border-[#1b2b4d] rounded-lg p-3 mt-3 space-y-3 relative animate-fadeIn">
          <button
            id="btn_close_voice_config"
            onClick={() => setShowConfig(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <h4 className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1 border-b border-[#17253f] pb-1.5">
            <Languages className="w-3.5 h-3.5" />
            Vocal Subsystem Controls
          </h4>

          {/* Config Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-gray-400">
              <span>SPEECH SPEED RATE:</span>
              <span className="text-sky-400 font-bold">{voiceRate.toFixed(1)}x</span>
            </div>
            <input
              id="slider_voice_rate"
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={voiceRate}
              onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
              className="w-full h-1 bg-[#121a28] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Config Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-gray-400">
              <span>VOLUME GAIN:</span>
              <span className="text-sky-400 font-bold">{(voiceVolume * 100).toFixed(0)}%</span>
            </div>
            <input
              id="slider_voice_volume"
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={voiceVolume}
              onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-[#121a28] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Wake word preference */}
          <div className="flex items-center justify-between text-[9px] font-mono">
            <span className="text-gray-400">CONFIG WAKE WORD:</span>
            <input
              id="input_voice_wake_word"
              type="text"
              value={wakeWord}
              onChange={(e) => setWakeWord(e.target.value)}
              className="w-20 bg-[#121927] border border-[#203253] rounded text-gray-200 text-center text-[10px] font-bold py-0.5 px-1 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Hands-free simulation info */}
          <div className="flex items-center gap-1.5 bg-sky-950/20 border border-sky-900/30 rounded p-2 text-[9px] text-gray-400 font-mono">
            <HelpCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div>
              <p className="font-bold text-sky-400">HANDS-FREE WAKE PROTOCOL</p>
              <p className="mt-0.5">Simply say your configured wake-word <span className="text-white font-bold">"{wakeWord}"</span> followed by any command. Try <span className="text-white font-mono">"{wakeWord} open settings"</span>.</p>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK MONITOR LOGS */}
      <div className="bg-[#050810] border border-[#111c30] rounded-lg p-2.5 mt-2.5">
        <p className="text-[8px] font-mono text-sky-400 uppercase tracking-widest font-black flex items-center gap-1 mb-1.5">
          <Radio className="w-3 h-3 text-sky-400" />
          Vocal Sensor Feed Logs
        </p>
        <div className="max-h-16 overflow-y-auto space-y-1 font-mono text-[9px] text-gray-500 scrollbar-thin select-none">
          {recognitionLogs.map((log, index) => (
            <p key={index} className="leading-tight truncate">{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

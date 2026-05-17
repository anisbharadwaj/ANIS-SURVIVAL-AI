# ANIS SURVIVAL AI 🌍🛰️

**Navigate. Survive. Anywhere.**

A next-generation offline AI-powered survival navigation platform designed for Android. ANIS works completely offline without internet, Wi-Fi, mobile data, or nearby devices—relying only on GPS satellites, offline maps, local AI processing, and offline storage.

## 🎯 Core Features

### 1. **Offline GPS Engine**
- Real-time GPS tracking without internet
- Compass and magnetometer integration
- Live speed, altitude, and direction tracking
- Continuous movement history logging

### 2. **Offline Map Rendering**
- OpenStreetMap integration
- MapLibre for advanced rendering
- Downloadable regional maps
- Terrain, mountain paths, and forest trails support
- Smooth zoom and offline cache management

### 3. **Navigation Intelligence**
- A* Pathfinding algorithm
- Dijkstra shortest path logic
- Turn-by-turn guidance
- Multiple routing modes:
  - Shortest route
  - Safest route (terrain risk analysis)
  - Low-battery optimized routing
- Dynamic rerouting capability

### 4. **AI Survival Assistant**
- Fully offline AI inference (TensorFlow Lite)
- Terrain risk analysis
- Lost person detection
- Battery survival estimation
- Dangerous zone warnings
- Travel behavior monitoring
- Automatic return trail tracking

### 5. **Return Path Memory System**
- Automatic breadcrumb navigation
- Checkpoint generation
- Safe return route reconstruction
- Emergency trail recovery

### 6. **Emergency Mode System**
- SOS activation with local distress beacon
- Emergency flashlight
- Compass emergency screen
- Coordinate export
- Loud emergency alarm
- Offline emergency instructions
- Auto-send SOS location when internet available

### 7. **Offline Voice Assistant**
- Speech recognition (offline)
- Voice commands
- AI voice responses (offline TTS)
- Multilingual support

### 8. **Battery Optimization**
- Real-time battery monitoring
- 4-tier power optimization:
  - Normal Mode (>50%)
  - Low Battery Mode (20-50%)
  - Ultra-Low Power Mode (5-20%)
  - Emergency Mode (<5%)
- Intelligent GPS polling adjustment
- CPU usage optimization
- Animation/feature management

### 9. **Multilingual Support**
- English
- Assamese (অসমীয়া)
- Hindi (हिंदी)
- Spanish (Español)

### 10. **Trekking & Survival Mode**
- Altitude tracking with elevation graphs
- Terrain difficulty estimation
- Water source marking
- Camping checkpoints
- Danger-zone markers
- Forest and mountain modes

### 11. **Security & Privacy**
- Encrypted local storage (SQLite)
- Offline-first architecture
- Zero unnecessary tracking
- User privacy protection
- Local-only AI processing

## 🏗️ Project Structure

```
anis_survival_ai/
├── lib/
│   ├── main.dart                          # App entry point
│   ├── config/
│   │   ├── theme/
│   │   │   └── app_theme.dart            # Futuristic dark theme
│   │   └── localization/
│   │       └── app_localization.dart     # Multilingual support
│   ├── data/
│   │   ├── database/
│   │   │   └── database_service.dart     # SQLite service
│   │   └── models/
│   │       └── gps_data.dart             # GPS data model
│   ├── services/
│   │   ├── gps_engine.dart               # GPS & sensors
│   │   ├── navigation_engine.dart        # A* & Dijkstra
│   │   └── battery_optimization_engine.dart
│   └── presentation/
│       └── screens/
│           └── splash/
│               └── splash_screen.dart
├── pubspec.yaml                           # Dependencies
└── README.md                              # This file
```

## 🛠️ Tech Stack

- **Frontend**: Flutter
- **State Management**: Riverpod
- **Database**: SQLite
- **Maps**: OpenStreetMap + MapLibre
- **AI/ML**: TensorFlow Lite
- **Voice**: Speech-to-Text + Flutter TTS
- **GPS & Sensors**: Geolocator + Sensors Plus
- **Localization**: Intl
- **Security**: Encrypt

## 📦 Installation

### Prerequisites
- Flutter SDK (>=3.0.0)
- Android SDK (API 21+)
- Dart SDK

### Setup

```bash
# Clone repository
git clone https://github.com/anisbharadwaj/ANIS-SURVIVAL-AI.git
cd ANIS-SURVIVAL-AI

# Install dependencies
flutter pub get

# Generate code (for JSON serialization)
flutter pub run build_runner build

# Run app
flutter run
```

## 🚀 Development Status

- ✅ Project Structure
- ✅ Theme & Localization
- ✅ GPS Engine Architecture
- ✅ Navigation Engine (A* & Dijkstra)
- ✅ Database Service
- ✅ Battery Optimization
- 🔄 Map Rendering UI
- 🔄 AI Assistant Integration
- 🔄 Emergency Systems
- 🔄 Voice Commands
- 🔄 Trekking Dashboard

## 🎨 UI/UX Design

- **Theme**: Futuristic dark military-grade survival aesthetic
- **Colors**: 
  - Primary: Neon Cyan (#00D9FF)
  - Secondary: Silver (#C0C0C0)
  - Accent: Neon Green (#00FF88)
  - Danger: Neon Red (#FF1744)
- **Effects**: Glassmorphism, glowing animations, neon accents
- **Typography**: Roboto (body), Roboto Mono (tech text)

## 🔐 Permissions Required

- GPS/Location (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION)
- Sensors (magnetometer, accelerometer, gyroscope)
- Storage (offline maps, database)
- Microphone (voice commands)
- Speaker (voice guidance)

## 📱 Target Platforms

- **Primary**: Android (API 21+)
- **Future**: iOS, Web

## 🚨 Emergency Features

### SOS Mode
Activate with voice command or emergency button:
```
"Hey ANIS, SOS!"
```

### Features Activated
- Location locked
- Loud alarm
- Distress beacon
- Emergency contacts notification
- Automatic SOS send when internet available

## 🌐 Future-Ready Features

Architecture supports future integration:
- Satellite communication
- Mesh networking
- Offline messaging
- AR navigation
- Rescue drone integration
- Wearable device connection

## 📊 Performance Targets

- Startup time: <2 seconds
- GPS update latency: <500ms
- Navigation query: <100ms
- Memory footprint: <150MB
- Battery efficiency: 8+ hours offline navigation

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**Anis Bharadwaj**
- GitHub: [@anisbharadwaj](https://github.com/anisbharadwaj)

## 🙏 Acknowledgments

- OpenStreetMap community
- MapLibre developers
- Flutter team
- TensorFlow Lite team

---

**Navigate. Survive. Anywhere.** 🛰️🌍🚀

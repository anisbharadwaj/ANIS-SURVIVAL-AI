# ANIS SURVIVAL AI

This PR branch adds a full offline-first scaffold for the ANIS SURVIVAL AI Flutter Android app. It includes:

- Project scaffold and pubspec with required dependencies
- Core services: GPS, emergency, fall detection, AI assistant skeleton, SQLite DB service
- Sample screens: Home, Map, Emergency
- Widgets: Big SOS button
- Theme and basic models

What to expect next

- Offline tile server integration for MBTiles and MapLibre style
- Detailed navigation engine (A*/Dijkstra) implementation
- TFLite models and AI behavior tuning
- More screens and polish

How to run

1. Attach MBTiles files to `assets/mbtiles/` or load them at runtime.
2. Add required Android permissions in `android/app/src/main/AndroidManifest.xml` (see project docs).
3. Run `flutter pub get` and `flutter run` on an Android device.

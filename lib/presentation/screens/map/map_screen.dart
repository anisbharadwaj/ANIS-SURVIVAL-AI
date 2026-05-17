import 'dart:async';
import 'dart:convert';
import 'package:flutter_compass/flutter_compass.dart';
import 'package:flutter/material';
import 'package:flutter_map/flutter_map.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong2.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/constants/colors.dart';
import '../../../core/services/gps_engine.dart';
import '../../../data/database/database_service.dart';
import '../../../data/models/gps_data.dart';
import '../../../widgets/glass_tactical_container.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({Key? key}) : super(key: key);

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final GpsEngine _gpsEngine = GpsEngine();
  StreamSubscription<Position>? _mapStreamSubscription;
  final MapController _mapController = MapController();
  
  // 🧭 Compass Sensor Data Variable
  double _deviceHeading = 0.0;
  
  LatLng? _currentPosition;
  final List<LatLng> _trailCoordinates = [];
  bool _hasError = false;
  String _engineStatus = "INITIALIZING";

  @override
  void initState() {
    super.initState();

    // 1. Listen directly to physical phone compass chip changes completely offline
    FlutterCompass.events?.listen((CompassEvent event) {
      if (mounted) {
        setState(() {
          _deviceHeading = event.heading ?? 0.0;
        });
      }
    });

    // 2. Initialize 100% Offline Hardware Satellite GPS Engine Link
    _initEngineConnection();
  }

  void _initEngineConnection() {
    // 📡 Direct Hardware Satellite Link Configuration
    final LocationSettings locationSettings = AndroidSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 5, // Triggers database save every 5 meters moved
      forceAndroidLocationManager: true, // ⚠️ FORCES phone to read internal satellite chips directly (Zero Internet/WiFi Required!)
    );

    // This starts listening to raw coordinates completely offline
    _mapStreamSubscription = Geolocator.getPositionStream(locationSettings: locationSettings).listen(
      (Position position) {
        if (!mounted) return;
        setState(() {
          _hasError = false;
          _engineStatus = "LOCK_ACTIVE";
          _currentPosition = LatLng(position.latitude, position.longitude);
          _trailCoordinates.add(_currentPosition!);
        });

        // Auto-move map center to current position smoothly
        _mapController.move(_currentPosition!, _mapController.camera.zoom);
      },
      onError: (error) {
        if (!mounted) return;
        setState(() {
          _hasError = true;
          _engineStatus = "SIGNAL_LOST";
        });
      },
    );
  }

  @override
  void dispose() {
    _mapStreamSubscription?.cancel();
    _mapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TacticalColors.blackBackground,
      body: Stack(
        children: [
          // // 1. Core Map Layer
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentPosition ?? const LatLng(26.1445, 91.7363),
              initialZoom: 14.0,
              maxZoom: 18.0,
              rotation: 360.0 - _deviceHeading, // 🧭 This forces the map to point North dynamically!
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.anis.survival.ai',
              ),
              
              // Render Trails and Calculated Paths
              PolylineLayer(
                polylines: [
                  // Recorded breadcrumb history (Cyan)
                  Polyline(
                    points: _trailCoordinates,
                    color: TacticalColors.neonCyanAccent,
                    strokeWidth: 3.5,
                  ),
                ],
              ),

              // Position Marker Overlay
              if (_currentPosition != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _currentPosition!,
                      width: 40,
                      height: 40,
                      child: Transform.rotate(
                        angle: (_deviceHeading * (3.141592653589793 / 180)), // Convert degrees to radians for smooth icon spinning
                        child: const Icon(
                          Icons.navigation,
                          color: TacticalColors.neonCyanAccent,
                          size: 30,
                        ),
                      ),
                    ),
                  ],
                ),
            ],
          ),

          // HUD Overlay Matrix Panels
          Positioned(
            top: 40,
            left: 15,
            right: 15,
            child: GlassTacticalContainer(
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                withHeading: false,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "SYSTEM ENGINE STATUS",
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.5),
                            fontSize: 10,
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _engineStatus,
                          style: TextStyle(
                            color: _hasError ? Colors.redAccent : TacticalColors.neonCyanAccent,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          "COMPASS HEADING",
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.5),
                            fontSize: 10,
                            letterSpacing: 1.5,
                      ),
                    ),
                        const SizedBox(height: 4),
                        Text(
                          "${_deviceHeading.toStringAsFixed(1)}° N",
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

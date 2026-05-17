import '../../../core/services/voice_engine.dart';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong2.dart';
import '../../../core/constants/colors.dart';
import '../../../core/services/gps_engine.dart';
import '../../../data/database/database_service.dart';
import '../../../data/models/gps_data.dart';
import '../../widgets/glass_tactical_container.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({Key? key}) : super(key: key);

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final GpsEngine _gpsEngine = GpsEngine();
  StreamSubscription<GpsData>? _mapStreamSubscription;
  
  final MapController _mapController = MapController();
  LatLng _currentPosition = const LatLng(26.1445, 91.7363); // Default tracking point fallback
  List<LatLng> _trailCoordinates = [];
  
  String _engineStatus = "INITIALIZING";
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _loadHistoricalTrail();
    _initEngineConnection();
  }

  Future<void> _loadHistoricalTrail() async {
    try {
      final history = await DatabaseService.instance.getAllBreadcrumbs();
      if (history.isNotEmpty && mounted) {
        setState(() {
          _trailCoordinates = history.map((e) => LatLng(e.latitude, e.longitude)).toList();
          _currentPosition = _trailCoordinates.last;
        });
        _mapController.move(_currentPosition, 15.0);
      }
    } catch (_) {}
  }

  void _initEngineConnection() {
    _gpsEngine.startTrackingEngine(
      accuracy: LocationAccuracy.bestForNavigation,
      distanceFilterMeters: 3, 
    );

    _mapStreamSubscription = _gpsEngine.gpsStream.listen(
      (GpsData data) {
        if (!mounted) return;
        setState(() {
          _hasError = false;
          _engineStatus = "LOCK_ACTIVE";
          _currentPosition = LatLng(data.latitude, data.longitude);
          _trailCoordinates.add(_currentPosition);
        });
        _mapController.move(_currentPosition, _mapController.camera.zoom);
      },
      onError: (error) {
        if (!mounted) return;
        setState(() {
          _hasError = true;
          _engineStatus = error == "GPS_PERMISSION_DENIED" ? "PERM_DENIED" : "SIGNAL_LOST";
        });
      },
    );
  }

  @override
  void dispose() {
    // Structural Guard against lifecycle subscription pipeline bleeding
    _mapStreamSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TacticalColors.blackBackground,
      body: Stack(
        children: [
          // 1. Core Map Canvas Interlocking System
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentPosition,
              initialZoom: 14.0,
              maxZoom: 18.0,
              minZoom: 4.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.anis.survival.ai',
              ),
              // Render historical persistence trails
              PolylineLayer(
                polylines: [
                  Polyline(
                    points: _trailCoordinates,
                    color: TacticalColors.neonCyanAccent,
                    strokeWidth: 3.5,
                    isFilled: false,
                  ),
                ],
              ),
              // Live Positioning Point Indicator
              MarkerLayer(
                markers: [
                  Marker(
                    point: _currentPosition,
                    width: 40,
                    height: 40,
                    child: Container(
                      decoration: BoxDecoration(
                        color: _hasError ? TacticalColors.alertRedAccent.withOpacity(0.3) : TacticalColors.neonCyanAccent.withOpacity(0.3),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: _hasError ? TacticalColors.alertRedAccent : TacticalColors.neonCyanAccent, 
                          width: 2
                        ),
                      ),
                      child: Center(
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: _hasError ? TacticalColors.alertRedAccent : TacticalColors.neonCyanAccent,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // 2. Tactical Head-Up-Display HUD
          Positioned(
            top: 45,
            left: 16,
            right: 16,
            child: GlassTacticalContainer(
              accentBorderColor: _hasError ? TacticalColors.alertRedAccent : TacticalColors.neonCyanAccent,
              child: Padding(
                padding: const EdgeInsets.all(14.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          "ENGINE: $_engineStatus",
                          style: TextStyle(
                            color: _hasError ? TacticalColors.alertRedAccent : TacticalColors.neonCyanAccent,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          "LAT: ${_currentPosition.latitude.toStringAsFixed(5)} | LON: ${_currentPosition.longitude.toStringAsFixed(5)}",
                          style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.refresh_rounded, color: TacticalColors.neonCyanAccent),
                      onPressed: () {
                        _gpsEngine.stopTrackingEngine();
                        _initEngineConnection();
                      },
                    )
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

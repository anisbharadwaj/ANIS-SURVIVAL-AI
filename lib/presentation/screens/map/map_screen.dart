import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:http/http.dart' as http;
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
  LatLng _currentPosition = const LatLng(26.1445, 91.7363); 
  
  List<LatLng> _trailCoordinates = [];      // Blue line: Where you have walked
  List<LatLng> _navigationPath = [];       // Yellow line: AI calculated return path
  
  String _engineStatus = "INITIALIZING";
  bool _hasError = false;
  bool _isCalculatingRoute = false;

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

  /// Communicates with local Python edge engine to fetch directional path vectors
  Future<void> _requestTacticalReturnPath(String mode) async {
    if (_isCalculatingRoute) return;

    setState(() {
      _isCalculatingRoute = true;
      _engineStatus = "COMPUTING_ROUTE";
    });

    try {
      final response = await http.post(
        Uri.parse("http://127.0.0.1:8080/api/navigation/plan"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "latitude": _currentPosition.latitude,
          "longitude": _currentPosition.longitude,
          "routing_mode": mode
        }),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final List<dynamic> coords = data['coordinates'];

        setState(() {
          _navigationPath = coords.map((c) => LatLng(c['latitude'], c['longitude'])).toList();
          _engineStatus = "ROUTE_READY";
        });

        if (_navigationPath.isNotEmpty) {
          _mapController.move(_navigationPath.first, 14.5);
        }
      } else {
        setState(() => _engineStatus = "MESH_OUT_OF_BOUNDS");
      }
    } catch (_) {
      setState(() => _engineStatus = "BACKEND_OFFLINE");
    } finally {
      setState(() => _isCalculatingRoute = false);
    }
  }

  @override
  void dispose() {
    _mapStreamSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TacticalColors.blackBackground,
      body: Stack(
        children: [
          // 1. Core Map Layer
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentPosition,
              initialZoom: 14.0,
              maxZoom: 18.0,
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
                  // AI Calculated Extraction Route (Neon Amber/Yellow)
                  Polyline(
                    points: _navigationPath,
                    color: const Color(0xFFFFCC00),
                    strokeWidth: 5.0,
                    borderColor: TacticalColors.blackBackground,
                    borderStrokeWidth: 1.5,
                  ),
                ],
              ),

              // Live Position Marker
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
                        border: Border.all(color: _hasError ? TacticalColors.alertRedAccent : TacticalColors.neonCyanAccent, width: 2),
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

          // 2. HUD Metrics Panel
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
                    _isCalculatingRoute 
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: TacticalColors.neonCyanAccent))
                      : IconButton(
                          icon: const Icon(Icons.navigation_rounded, color: TacticalColors.neonCyanAccent),
                          onPressed: () => _requestTacticalReturnPath("SAFEST"),
                        )
                  ],
                ),
              ),
            ),
          ),

          // 3. Bottom Routing Mode Selector Panel
          Positioned(
            bottom: 30,
            left: 16,
            right: 16,
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: TacticalColors.surfaceDarkGlass,
                      side: const BorderSide(color: TacticalColors.neonCyanAccent, width: 1),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () => _requestTacticalReturnPath("SAFEST"),
                    child: const Text("SAFEST ROUTE", style: TextStyle(color: TacticalColors.neonCyanAccent, fontFamily: 'monospace', fontSize: 12)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: TacticalColors.surfaceDarkGlass,
                      side: const BorderSide(color: Color(0xFFFFCC00), width: 1),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () => _requestTacticalReturnPath("LOW_BATTERY"),
                    child: const Text("LOW POWER", style: TextStyle(color: Color(0xFFFFCC00), fontFamily: 'monospace', fontSize: 12)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

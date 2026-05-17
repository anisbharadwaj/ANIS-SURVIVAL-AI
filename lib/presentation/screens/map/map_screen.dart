import 'package:flutter/material.dart';
import 'package:maplibre_gl/maplibre_gl.dart';
import '../../../../core/constants/colors.dart';
import '../../../widgets/glass_tactical_container.dart';

class MapViewScreen extends StatefulWidget {
  const MapViewScreen({Key? key}) : super(key: key);

  @override
  State<MapViewScreen> createState() => _MapViewScreenState();
}

class _MapViewScreenState extends State<MapViewScreen> {
  MapLibreMapController? _mapController;

  // Real-world offline center target example (Guwahati Coordinates)
  final LatLng _initialCenter = const LatLng(26.1445, 91.7363);

  void _onMapCreated(MapLibreMapController controller) {
    _mapController = controller;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TacticalColors.blackBackground,
      body: Stack(
        children: [
          // 1. Core Map Canvas Layer
          MapLibreMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: CameraPosition(
              target: _initialCenter,
              zoom: 13.0,
            ),
            // CRITICAL: Pointing to a local JSON style schema configured for local assets
            styleString: "assets/maps/offline_style.json", 
            myLocationEnabled: true,
            myLocationTrackingMode: MyLocationTrackingMode.TrackingGPS,
          ),

          // 2. Futuristic HUD Tactical Overlay
          Positioned(
            top: 40,
            left: 16,
            right: 16,
            child: GlassTacticalContainer(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Text(
                          "MAP ENGINE: OFFLINE",
                          style: TextStyle(
                            color: TacticalColors.neonCyanAccent,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          "OSM VECTOR TILES ACTIVE",
                          style: TextStyle(color: Colors.white54, fontSize: 10),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.layers, color: TacticalColors.neonCyanAccent),
                      onPressed: _toggleTerrainLayer,
                    )
                  ],
                ),
              ),
            ),
          ),
          
          // 3. Zoom / Checkpoint HUD Panel
          Positioned(
            bottom: 30,
            right: 16,
            child: Column(
              children: [
                _buildFloatingActionButton(Icons.add, () => _mapController?.animateCamera(CameraUpdate.zoomIn())),
                const SizedBox(height: 8),
                _buildFloatingActionButton(Icons.remove, () => _mapController?.animateCamera(CameraUpdate.zoomOut())),
                const SizedBox(height: 8),
                _buildFloatingActionButton(Icons.add_location_alt, _dropCustomSurvivalCheckpoint),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildFloatingActionButton(IconData icon, VoidCallback onTap) {
    return Container(
      decoration: BoxDecoration(
        color: TacticalColors.surfaceDarkGlass.withOpacity(0.8),
        border: Border.all(color: TacticalColors.neonCyanAccent.withOpacity(0.5), width: 1.5),
        shape: BoxShape.circle,
      ),
      child: IconButton(
        icon: Icon(icon, color: TacticalColors.neonCyanAccent),
        onPressed: onTap,
      ),
    );
  }

  void _toggleTerrainLayer() {
    // Logic to switch between custom local topography tilesets or layout schemas
  }

  void _dropCustomSurvivalCheckpoint() {
    if (_mapController != null) {
      _mapController!.addSymbol(
        const SymbolOptions(
          geometry: LatLng(26.1445, 91.7363),
          iconImage: "custom-survival-marker", // Configured local asset image string
          iconSize: 1.5,
          textField: "SAFE ZONE",
          textColor: "#00F0FF",
        ),
      );
    }
  }
}

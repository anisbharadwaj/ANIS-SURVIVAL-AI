import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';

class MapEngine {
  static final MapEngine _instance = MapEngine._internal();
  late MapController _mapController;
  final CacheManager _cacheManager = CacheManager(
    Config(
      'anis_map_cache',
      stalePeriod: const Duration(days: 30),
      maxNrOfCacheObjects: 500,
      repo: JsonCacheInfoRepository(databaseName: 'anis_map_cache'),
    ),
  );

  factory MapEngine() {
    return _instance;
  }

  MapEngine._internal() {
    _mapController = MapController();
  }

  MapController get mapController => _mapController;

  /// Initialize map engine
  Future<void> initialize() async {
    // Pre-cache common offline tile sources
    await _preCacheMapTiles();
  }

  /// Pre-cache map tiles for offline use
  Future<void> _preCacheMapTiles() async {
    // Implementation for pre-caching tiles from OpenStreetMap
    // This would download tiles for a specified region
  }

  /// Get map layer with offline tile support
  TileLayer getOfflineMapLayer() {
    return TileLayer(
      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      userAgentPackageName: 'com.anis.survivalai',
      cacheManager: _cacheManager,
      maxZoom: 18,
      minZoom: 2,
      subdomains: const ['a', 'b', 'c'],
      retinaMode: true,
    );
  }

  /// Create marker for current user position
  Marker createUserMarker(double latitude, double longitude, double heading) {
    return Marker(
      width: 40,
      height: 40,
      point: LatLng(latitude, longitude),
      builder: (ctx) => Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF00D9FF).withOpacity(0.6),
              blurRadius: 15,
              spreadRadius: 5,
            ),
          ],
        ),
        child: Icon(
          Icons.location_on,
          color: const Color(0xFF00D9FF),
          size: 32,
        ),
      ),
    );
  }

  /// Create checkpoint marker
  Marker createCheckpointMarker(
    double latitude,
    double longitude,
    String label,
    String type,
  ) {
    Color markerColor = _getCheckpointColor(type);

    return Marker(
      width: 35,
      height: 35,
      point: LatLng(latitude, longitude),
      builder: (ctx) => Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: markerColor.withOpacity(0.8),
          border: Border.all(color: Colors.white, width: 2),
        ),
        child: Center(
          child: Text(
            label[0].toUpperCase(),
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
      ),
    );
  }

  /// Create route polyline
  Polyline createRoutePolyline(List<MapPoint> points, String routeType) {
    Color lineColor = _getRouteColor(routeType);
    double strokeWidth = routeType == 'emergency' ? 4 : 3;

    return Polyline(
      points: points
          .map((p) => LatLng(p.latitude, p.longitude))
          .toList(),
      color: lineColor,
      strokeWidth: strokeWidth,
      isDashed: routeType == 'return_path',
    );
  }

  /// Create breadcrumb trail
  List<Marker> createBreadcrumbTrail(
    List<MapPoint> trailPoints,
  ) {
    return List.generate(
      trailPoints.length,
      (index) => Marker(
        width: 8,
        height: 8,
        point: LatLng(trailPoints[index].latitude, trailPoints[index].longitude),
        builder: (ctx) => Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFF00D9FF).withOpacity(0.5 + (index / trailPoints.length) * 0.5),
          ),
        ),
      ),
    );
  }

  Color _getCheckpointColor(String type) {
    switch (type) {
      case 'water':
        return const Color(0xFF0099FF);
      case 'camp':
        return const Color(0xFF00FF88);
      case 'danger':
        return const Color(0xFFFF1744);
      case 'safe':
        return const Color(0xFF00D9FF);
      default:
        return const Color(0xFFC0C0C0);
    }
  }

  Color _getRouteColor(String type) {
    switch (type) {
      case 'shortest':
        return const Color(0xFF00D9FF);
      case 'safest':
        return const Color(0xFF00FF88);
      case 'battery':
        return const Color(0xFFFFAA00);
      case 'return_path':
        return const Color(0xFFFF6B35);
      case 'emergency':
        return const Color(0xFFFF1744);
      default:
        return const Color(0xFF00D9FF);
    }
  }

  /// Animate map to location
  void animateToLocation(double latitude, double longitude, {double zoom = 15}) {
    _mapController.move(
      LatLng(latitude, longitude),
      zoom,
    );
  }

  /// Get current map bounds
  LatLngBounds? getMapBounds() {
    try {
      return _mapController.bounds;
    } catch (e) {
      return null;
    }
  }
}

class MapPoint {
  final double latitude;
  final double longitude;
  final double altitude;
  final DateTime timestamp;

  MapPoint({
    required this.latitude,
    required this.longitude,
    required this.altitude,
    required this.timestamp,
  });
}

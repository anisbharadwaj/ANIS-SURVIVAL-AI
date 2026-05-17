import 'dart:async';
import 'package:geolocator/geolocator.dart';
import '../../data/models/gps_data.dart';
import '../../data/database/database_service.dart';

class GpsEngine {
  static final GpsEngine _instance = GpsEngine._internal();
  factory GpsEngine() => _instance;
  GpsEngine._internal();

  StreamController<GpsData>? _broadcastController;
  StreamSubscription<Position>? _geolocatorSubscription;
  bool _isTracking = false;

  bool get isTracking => _isTracking;

  /// Exposes a broadcast stream so multiple UI components can view updates safely
  Stream<GpsData> get gpsStream {
    _broadcastController ??= StreamController<GpsData>.broadcast();
    return _broadcastController!.stream;
  }

  Future<bool> handlePermissionPipeline() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return false;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return false;
    }
    
    if (permission == LocationPermission.deniedForever) return false;
    return true;
  }

  void startTrackingEngine({
    LocationAccuracy accuracy = LocationAccuracy.high,
    int distanceFilterMeters = 5,
  }) async {
    if (_isTracking) return;

    final hasPermission = await handlePermissionPipeline();
    if (!hasPermission) {
      _broadcastController?.addError("GPS_PERMISSION_DENIED");
      return;
    }

    _isTracking = true;
    
    // Configured for tactical field balance between execution context and battery conservation
    final LocationSettings locationSettings = LocationSettings(
      accuracy: accuracy,
      distanceFilter: distanceFilterMeters,
    );

    _geolocatorSubscription = Geolocator.getPositionStream(locationSettings: locationSettings)
        .listen((Position position) async {
          final gpsData = GpsData(
            latitude: position.latitude,
            longitude: position.longitude,
            altitude: position.altitude,
            speed: position.speed,
            timestamp: DateTime.now(),
          );

          // Write directly to local storage
          await DatabaseService.instance.insertBreadcrumb(gpsData);

          // Push down stream line to active UI elements
          if (_broadcastController != null && !_broadcastController!.isClosed) {
            _broadcastController!.add(gpsData);
          }
        }, onError: (error) {
          _broadcastController?.addError(error.toString());
        });
  }

  void stopTrackingEngine() {
    _geolocatorSubscription?.cancel();
    _geolocatorSubscription = null;
    _isTracking = false;
  }

  void dispose() {
    stopTrackingEngine();
    _broadcastController?.close();
    _broadcastController = null;
  }
}

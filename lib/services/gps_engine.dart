import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:sensors_plus/sensors_plus.dart';

class GPSEngine {
  static final GPSEngine _instance = GPSEngine._internal();
  StreamSubscription<Position>? _positionSubscription;
  StreamSubscription<MagnetometerEvent>? _magnetometerSubscription;
  StreamSubscription<GyroscopeEvent>? _gyroscopeSubscription;
  StreamSubscription<AccelerometerEvent>? _accelerometerSubscription;

  late StreamController<Position> _positionController;
  late StreamController<double> _headingController;
  late StreamController<double> _altitudeController;

  double _currentHeading = 0.0;
  double _currentAltitude = 0.0;
  Position? _lastPosition;

  factory GPSEngine() {
    return _instance;
  }

  GPSEngine._internal() {
    _positionController = StreamController<Position>.broadcast();
    _headingController = StreamController<double>.broadcast();
    _altitudeController = StreamController<double>.broadcast();
  }

  Stream<Position> get positionStream => _positionController.stream;
  Stream<double> get headingStream => _headingController.stream;
  Stream<double> get altitudeStream => _altitudeController.stream;

  Position? get lastPosition => _lastPosition;
  double get currentHeading => _currentHeading;
  double get currentAltitude => _currentAltitude;

  Future<void> startTracking() async {
    // Check and request location permission
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception('Location permission denied permanently');
    }

    // Start GPS tracking
    _positionSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 0,
        timeLimit: Duration(seconds: 5),
      ),
    ).listen((Position position) {
      _lastPosition = position;
      _currentAltitude = position.altitude;
      _positionController.add(position);
      _altitudeController.add(position.altitude);
    });

    // Start compass/magnetometer
    _magnetometerSubscription =
        magnetometerEvents.listen((MagnetometerEvent event) {
      _currentHeading = _calculateHeading(event.x, event.y);
      _headingController.add(_currentHeading);
    });

    // Start gyroscope
    _gyroscopeSubscription = gyroscopeEvents.listen((GyroscopeEvent event) {
      // Gyroscope data for rotation tracking
    });

    // Start accelerometer
    _accelerometerSubscription =
        accelerometerEvents.listen((AccelerometerEvent event) {
      // Accelerometer data for movement detection
    });
  }

  Future<void> stopTracking() async {
    await _positionSubscription?.cancel();
    await _magnetometerSubscription?.cancel();
    await _gyroscopeSubscription?.cancel();
    await _accelerometerSubscription?.cancel();
  }

  double _calculateHeading(double x, double y) {
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  Future<Position> getCurrentLocation() async {
    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.best,
    );
  }

  void dispose() {
    _positionSubscription?.cancel();
    _magnetometerSubscription?.cancel();
    _gyroscopeSubscription?.cancel();
    _accelerometerSubscription?.cancel();
    _positionController.close();
    _headingController.close();
    _altitudeController.close();
  }
}

class Math {
  static double atan2(double y, double x) {
    return double.parse(
        (Math.atan(y / x) * 180 / 3.141592653589793).toString());
  }

  static double atan(double x) {
    // Simple atan implementation using Taylor series
    if (x.abs() > 1) {
      return (3.141592653589793 / 2) - Math.atan(1 / x);
    }
    double result = 0;
    double term = x;
    for (int i = 1; i < 100; i += 2) {
      result += term;
      term *= -x * x * (i) / (i + 2);
    }
    return result;
  }
}

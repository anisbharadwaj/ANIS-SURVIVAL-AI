import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class GPSService {
  StreamSubscription<Position>? _positionStream;
  final Function(Position) onLocationUpdate;

  GPSService({required this.onLocationUpdate});

  Future<void> startTracking() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception("Location services are disabled.");
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception("Location permissions are denied.");
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception("Location permissions are permanently denied.");
    }

    _positionStream = Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // update every 10 meters
      ),
    ).listen((Position position) async {
      onLocationUpdate(position);
      await _saveBreadcrumb(position);
    });
  }

  Future<void> stopTracking() async {
    await _positionStream?.cancel();
  }

  Future<void> _saveBreadcrumb(Position position) async {
    final database = openDatabase(
      join(await getDatabasesPath(), 'breadcrumbs.db'),
      onCreate: (db, version) {
        return db.execute(
          "CREATE TABLE breadcrumbs(id INTEGER PRIMARY KEY, lat REAL, lon REAL, time TEXT)",
        );
      },
      version: 1,
    );

    final db = await database;
    await db.insert(
      'breadcrumbs',
      {
        'lat': position.latitude,
        'lon': position.longitude,
        'time': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }
}

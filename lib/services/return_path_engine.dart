import 'package:sqflite/sqflite.dart';
import '../data/database/database_service.dart';

class ReturnPathEngine {
  static final ReturnPathEngine _instance = ReturnPathEngine._internal();
  final DatabaseService _database = DatabaseService();
  List<ReturnPathWaypoint> _currentSessionPath = [];
  String _sessionId = '';
  int _waypointCounter = 0;

  factory ReturnPathEngine() {
    return _instance;
  }

  ReturnPathEngine._internal();

  List<ReturnPathWaypoint> get currentPath => _currentSessionPath;
  String get sessionId => _sessionId;

  /// Start new return path tracking session
  void startSession(String sessionId) {
    _sessionId = sessionId;
    _currentSessionPath = [];
    _waypointCounter = 0;
  }

  /// Add waypoint to current path
  Future<void> addWaypoint(
    double latitude,
    double longitude,
    double altitude,
  ) async {
    final waypoint = ReturnPathWaypoint(
      sessionId: _sessionId,
      waypointIndex: _waypointCounter++,
      latitude: latitude,
      longitude: longitude,
      altitude: altitude,
      timestamp: DateTime.now(),
    );

    _currentSessionPath.add(waypoint);

    // Save to database
    await _database.database.then((db) async {
      await db.insert(
        'return_paths',
        {
          'session_id': waypoint.sessionId,
          'waypoint_index': waypoint.waypointIndex,
          'latitude': waypoint.latitude,
          'longitude': waypoint.longitude,
          'altitude': waypoint.altitude,
          'created_at': waypoint.timestamp.toIso8601String(),
        },
      );
    });
  }

  /// Get return path from database
  Future<List<ReturnPathWaypoint>> getReturnPath(String sessionId) async {
    final db = await _database.database;
    final results = await db.query(
      'return_paths',
      where: 'session_id = ?',
      whereArgs: [sessionId],
      orderBy: 'waypoint_index ASC',
    );

    return results
        .map(
          (row) => ReturnPathWaypoint(
            sessionId: row['session_id'] as String,
            waypointIndex: row['waypoint_index'] as int,
            latitude: row['latitude'] as double,
            longitude: row['longitude'] as double,
            altitude: row['altitude'] as double,
            timestamp: DateTime.parse(row['created_at'] as String),
          ),
        )
        .toList();
  }

  /// Calculate distance to return path
  double calculateDistanceToReturnPath(
    double currentLat,
    double currentLon,
    List<ReturnPathWaypoint> returnPath,
  ) {
    if (returnPath.isEmpty) return double.infinity;

    double minDistance = double.infinity;

    for (final waypoint in returnPath) {
      final distance = _haversineDistance(
        currentLat,
        currentLon,
        waypoint.latitude,
        waypoint.longitude,
      );
      if (distance < minDistance) minDistance = distance;
    }

    return minDistance;
  }

  /// Check if user is moving away from return path
  bool isMovingAwayFromReturnPath(
    double currentLat,
    double currentLon,
    double previousLat,
    double previousLon,
    List<ReturnPathWaypoint> returnPath,
  ) {
    final currentDistance = calculateDistanceToReturnPath(
      currentLat,
      currentLon,
      returnPath,
    );
    final previousDistance = calculateDistanceToReturnPath(
      previousLat,
      previousLon,
      returnPath,
    );

    return currentDistance > previousDistance;
  }

  /// Find nearest waypoint in return path
  ReturnPathWaypoint? findNearestWaypoint(
    double latitude,
    double longitude,
    List<ReturnPathWaypoint> returnPath,
  ) {
    if (returnPath.isEmpty) return null;

    ReturnPathWaypoint? nearest;
    double minDistance = double.infinity;

    for (final waypoint in returnPath) {
      final distance = _haversineDistance(
        latitude,
        longitude,
        waypoint.latitude,
        waypoint.longitude,
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = waypoint;
      }
    }

    return nearest;
  }

  /// Generate safe return route from current position
  List<ReturnPathWaypoint> generateSafeReturnRoute(
    double currentLat,
    double currentLon,
    List<ReturnPathWaypoint> fullReturnPath,
  ) {
    final nearest = findNearestWaypoint(currentLat, currentLon, fullReturnPath);
    if (nearest == null) return fullReturnPath;

    // Return path starting from nearest waypoint
    final nearestIndex = fullReturnPath.indexOf(nearest);
    return fullReturnPath.sublist(0, nearestIndex).reversed.toList();
  }

  /// Clear session data
  Future<void> clearSession(String sessionId) async {
    final db = await _database.database;
    await db.delete(
      'return_paths',
      where: 'session_id = ?',
      whereArgs: [sessionId],
    );
  }

  double _haversineDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const double earthRadiusKm = 6371;
    final double dLat = _toRadians(lat2 - lat1);
    final double dLon = _toRadians(lon2 - lon1);

    final double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(_toRadians(lat1)) *
            Math.cos(_toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    final double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (earthRadiusKm * c) * 1000; // Return in meters
  }

  double _toRadians(double degrees) => degrees * (3.141592653589793 / 180);
}

class ReturnPathWaypoint {
  final String sessionId;
  final int waypointIndex;
  final double latitude;
  final double longitude;
  final double altitude;
  final DateTime timestamp;

  ReturnPathWaypoint({
    required this.sessionId,
    required this.waypointIndex,
    required this.latitude,
    required this.longitude,
    required this.altitude,
    required this.timestamp,
  });
}

class Math {
  static double sin(double x) {
    // Taylor series approximation
    double result = 0;
    double term = x;
    for (int i = 1; i < 20; i += 2) {
      result += term;
      term *= -x * x / ((i + 1) * (i + 2));
    }
    return result;
  }

  static double cos(double x) {
    return Math.sin(x + 3.141592653589793 / 2);
  }

  static double sqrt(double x) {
    if (x < 0) return double.nan;
    if (x == 0) return 0;
    double result = x / 2;
    for (int i = 0; i < 10; i++) {
      result = (result + x / result) / 2;
    }
    return result;
  }

  static double atan2(double y, double x) {
    if (x > 0) return Math.atan(y / x);
    if (x < 0 && y >= 0) return Math.atan(y / x) + 3.141592653589793;
    if (x < 0 && y < 0) return Math.atan(y / x) - 3.141592653589793;
    if (x == 0 && y > 0) return 3.141592653589793 / 2;
    if (x == 0 && y < 0) return -3.141592653589793 / 2;
    return 0;
  }

  static double atan(double x) {
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

import 'dart:math';
import 'package:latlong2/latlong2.dart';

class TelemetryCalculator {
  /// Computes distance between two GPS coordinates in kilometers using Haversine
  static double calculateDistance(LatLng point1, LatLng point2) {
    const double earthRadius = 6371.0; // Radius of the earth in km
    
    double dLat = _toRadians(point2.latitude - point1.latitude);
    double dLon = _toRadians(point2.longitude - point1.longitude);
    
    double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRadians(point1.latitude)) * cos(_toRadians(point2.latitude)) *
        sin(dLon / 2) * sin(dLon / 2);
        
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return earthRadius * c;
  }

  /// Estimates remaining time to target node based on current speed
  /// Returns a string representation of minutes remaining
  static String estimateTimeOfArrival(double currentSpeedKmh, double distanceRemainingKm) {
    if (currentSpeedKmh <= 0.5) return "INF (STATIONARY)";
    
    double hoursRemaining = distanceRemainingKm / currentSpeedKmh;
    double minutesRemaining = hoursRemaining * 60;
    
    if (minutesRemaining > 999) return "> 16 HRS";
    return "${minutesRemaining.toStringAsFixed(0)} MIN";
  }

  static double _toRadians(double degree) {
    return degree * (pi / 180);
  }
}

import 'package:json_annotation/json_annotation.dart';

part 'gps_data.g.dart';

@JsonSerializable()
class GPSData {
  final double latitude;
  final double longitude;
  final double altitude;
  final double speed; // in m/s
  final double heading; // in degrees
  final double accuracy;
  final DateTime timestamp;
  final String? label; // Optional waypoint label

  GPSData({
    required this.latitude,
    required this.longitude,
    required this.altitude,
    required this.speed,
    required this.heading,
    required this.accuracy,
    required this.timestamp,
    this.label,
  });

  factory GPSData.fromJson(Map<String, dynamic> json) =>
      _$GPSDataFromJson(json);

  Map<String, dynamic> toJson() => _$GPSDataToJson(this);

  /// Calculate Haversine distance between two GPS points
  double distanceTo(GPSData other) {
    const double earthRadiusKm = 6371;
    final double dLat = _toRadians(other.latitude - latitude);
    final double dLon = _toRadians(other.longitude - longitude);

    final double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(_toRadians(latitude)) *
            Math.cos(_toRadians(other.latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    final double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    final double distance = earthRadiusKm * c;

    return distance * 1000; // Return in meters
  }

  double _toRadians(double degrees) => degrees * (3.141592653589793 / 180);

  @override
  String toString() =>
      'GPSData(lat: $latitude, lon: $longitude, alt: $altitude m, speed: ${speed.toStringAsFixed(2)} m/s, heading: $heading°)';
}

class Math {
  static double sin(double x) => throw UnimplementedError();
  static double cos(double x) => throw UnimplementedError();
  static double sqrt(double x) => throw UnimplementedError();
  static double atan2(double y, double x) => throw UnimplementedError();
}

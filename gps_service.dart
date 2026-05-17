class GpsData {
  final int? id;
  final double latitude;
  final double longitude;
  final double altitude;
  final double speed;
  final DateTime timestamp;

  GpsData({
    this.id,
    required this.latitude,
    required this.longitude,
    required this.altitude,
    required this.speed,
    required this.timestamp,
  });

  // Convert a Database map into a GpsData object
  factory GpsData.fromMap(Map<String, dynamic> map) {
    return GpsData(
      id: map['id'] as int?,
      latitude: map['latitude'] as double,
      longitude: map['longitude'] as double,
      altitude: map['altitude'] as double,
      speed: map['speed'] as double,
      timestamp: DateTime.parse(map['timestamp'] as String),
    );
  }

  // Convert a GpsData object into a Database map
  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'latitude': latitude,
      'longitude': longitude,
      'altitude': altitude,
      'speed': speed,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class LocationPoint {
  final int? id;
  final double lat;
  final double lon;
  final double? alt;
  final int timestamp;

  LocationPoint({this.id, required this.lat, required this.lon, this.alt, required this.timestamp});

  Map<String, dynamic> toMap() => {
        'id': id,
        'lat': lat,
        'lon': lon,
        'alt': alt,
        'timestamp': timestamp,
      };

  factory LocationPoint.fromMap(Map<String, dynamic> m) => LocationPoint(
        id: m['id'] as int?,
        lat: m['lat'] as double,
        lon: m['lon'] as double,
        alt: m['alt'] as double?,
        timestamp: m['timestamp'] as int,
      );
}

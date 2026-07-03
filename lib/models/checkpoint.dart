class Checkpoint {
  final int? id;
  final String name;
  final double lat;
  final double lon;
  final double? alt;
  final int createdAt;

  Checkpoint({this.id, required this.name, required this.lat, required this.lon, this.alt, required this.createdAt});

  Map<String, dynamic> toMap() => {
        'id': id,
        'name': name,
        'lat': lat,
        'lon': lon,
        'alt': alt,
        'created_at': createdAt,
      };

  factory Checkpoint.fromMap(Map<String, dynamic> m) => Checkpoint(
        id: m['id'] as int?,
        name: m['name'] as String,
        lat: m['lat'] as double,
        lon: m['lon'] as double,
        alt: m['alt'] as double?,
        createdAt: m['created_at'] as int,
      );
}

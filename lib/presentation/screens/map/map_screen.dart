// lib/presentation/screens/map/map_screen.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../../services/gps_engine.dart';
import '../../../data/database/database_service.dart';
import '../../../data/models/gps_data.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});
  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final GpsEngine _engine = GpsEngine();
  final DatabaseService _db = DatabaseService();
  StreamSubscription<GpsData>? _sub;
  List<LatLng> _trail = [];
  LatLng? _current;
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    _loadTrailFromDb();
    _engine.start(accuracy: LocationAccuracy.best, distanceFilter: 8);
    _sub = _engine.onLocation.listen((g) {
      final p = LatLng(g.latitude, g.longitude);
      setState(() {
        _current = p;
        _trail.add(p);
      });
      _mapController.move(p, _mapController.zoom);
    }, onError: (e) {
      // handle permission or GPS errors
    });
  }

  Future<void> _loadTrailFromDb() async {
    final rows = await _db.fetchRecentBreadcrumbs(limit: 500);
    setState(() {
      _trail = rows.map((r) => LatLng(r.latitude, r.longitude)).toList();
      if (_trail.isNotEmpty) _current = _trail.last;
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    _engine.stop();
    _engine.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final markers = <Marker>[];
    if (_current != null) {
      markers.add(Marker(
        point: _current!,
        width: 40,
        height: 40,
        builder: (_) => const Icon(Icons.my_location, color: Colors.cyanAccent, size: 36),
      ));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('ANIS — Map')),
      body: FlutterMap(
        mapController: _mapController,
        options: MapOptions(center: _current ?? LatLng(26.7, 93.1), zoom: 15.0),
        children: [
          TileLayer(
            urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            subdomains: const ['a', 'b', 'c'],
            tileProvider: const NetworkTileProvider(),
          ),
          PolylineLayer(
            polylines: [
              Polyline(points: _trail, strokeWidth: 4.0, color: Colors.greenAccent),
            ],
          ),
          MarkerLayer(markers: markers),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.my_location),
        onPressed: () {
          if (_current != null) _mapController.move(_current!, 17.0);
        },
      ),
    );
  }
}

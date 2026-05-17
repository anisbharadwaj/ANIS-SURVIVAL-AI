import 'dart:async';
import 'package:flutter/material.dart';

import '../../../services/gps_engine.dart';
import '../../../data/models/gps_data.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final GPSEngine gpsEngine = GPSEngine();

  StreamSubscription<GpsData>? _subscription;

  String latitude = "Loading...";
  String longitude = "Loading...";
  String altitude = "Loading...";
  String speed = "Loading...";

  @override
  void initState() {
    super.initState();
    _startTracking();
  }

  Future<void> _startTracking() async {
    await gpsEngine.start();

    _subscription = gpsEngine.stream.listen(
      (GpsData data) {
        if (!mounted) return;

        setState(() {
          latitude = data.latitude.toString();
          longitude = data.longitude.toString();
          altitude = data.altitude.toStringAsFixed(2);
          speed = data.speed.toStringAsFixed(2);
        });
      },
      onError: (error) {
        if (!mounted) return;

        setState(() {
          latitude = "Error";
          longitude = "Error";
          altitude = "Error";
          speed = "Error";
        });
      },
    );
  }

  @override
  void dispose() {
    _subscription?.cancel();
    gpsEngine.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("LIVE GPS TRACKING"),
        backgroundColor: Colors.black,
      ),
      backgroundColor: Colors.black,
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 30),

            _buildCard("LATITUDE", latitude),
            _buildCard("LONGITUDE", longitude),
            _buildCard("ALTITUDE", altitude),
            _buildCard("SPEED", speed),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(String title, String value) {
    return Card(
      color: Colors.grey[900],
      margin: const EdgeInsets.only(bottom: 15),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: Colors.cyanAccent,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

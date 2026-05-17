import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import '../../../services/gps_service.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final GPSService gpsService = GPSService();

  StreamSubscription<Position>? _positionStream;

  String latitude = "Loading...";
  String longitude = "Loading...";
  String altitude = "Loading...";
  String speed = "Loading...";

  bool permissionDenied = false;

  @override
  void initState() {
    super.initState();
    startTracking();
  }

  Future<void> startTracking() async {
    final permission = await gpsService.requestPermission();

    if (!permission) {
  if (!mounted) return;
  setState(() {
    permissionDenied = true;
  });
  return;
}

    _positionStream = gpsService.getLiveLocation().listen(
      (Position position) {
        if (!mounted) return;

        setState(() {
          latitude = position.latitude.toString();
          longitude = position.longitude.toString();
          altitude = position.altitude.toStringAsFixed(2);
          speed = position.speed.toStringAsFixed(2);
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
    _positionStream?.cancel(); // ✅ prevent memory leak
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("LIVE GPS TRACKING"),
      ),
      body: permissionDenied
          ? const Center(
              child: Text(
                "Location permission denied.\nPlease enable it from settings.",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.red, fontSize: 16),
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 30),
                  buildInfoCard("LATITUDE", latitude),
                  buildInfoCard("LONGITUDE", longitude),
                  buildInfoCard("ALTITUDE", altitude),
                  buildInfoCard("SPEED", speed),
                ],
              ),
            ),
    );
  }

  Widget buildInfoCard(String title, String value) {
    return Card(
      color: Colors.black,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: Colors.cyanAccent,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

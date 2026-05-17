import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'gps_service.dart';

class MapScreen extends StatefulWidget {
  @override
  _MapScreenState createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GPSService? gpsService;
  Position? currentPosition;

  @override
  void initState() {
    super.initState();
    gpsService = GPSService(onLocationUpdate: (pos) {
      if (mounted) {
        setState(() {
          currentPosition = pos;
        });
      }
    });
    gpsService?.startTracking();
  }

  @override
  void dispose() {
    gpsService?.stopTracking();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Survival GPS Tracker")),
      body: Center(
        child: currentPosition == null
            ? Text("Waiting for GPS...")
            : Text(
                "Lat: ${currentPosition!.latitude}, Lon: ${currentPosition!.longitude}, Speed: ${currentPosition!.speed} m/s"),
      ),
    );
  }
}

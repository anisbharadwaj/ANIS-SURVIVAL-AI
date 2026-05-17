import 'package:flutter/material.dart';
import 'package:latlong2/latlong2.dart';
import '../widgets/sensor_telemetry_grid.dart'; // Points to your widgets folder
import '../../data/database/database_service.dart';
import '../../core/utils/telemetry_calculator.dart';

class DashboardCockpitScreen extends StatefulWidget {
  const DashboardCockpitScreen({Key? key}) : super(key: key);

  @override
  State<DashboardCockpitScreen> createState() => _DashboardCockpitScreenState();
}

class _DashboardCockpitScreenState extends State<DashboardCockpitScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF030A16), // Tactical Dark Background
      appBar: AppBar(
        title: const Text('TACTICAL COCKPIT', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Tactical Telemetry Header Panel
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.1),
              border: Border.all(color: Colors.redAccent, width: 1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              "SYSTEM: RECON GRID ACTIVE // OFFLINE TELEMETRY INTERCEPT",
              style: TextStyle(color: Colors.redAccent, fontFamily: 'monospace', fontSize: 11),
            ),
          ),

          // The Live Sensor Grid calculation block
          FutureBuilder<List<dynamic>>(
            future: DatabaseService.instance.getAllBreadcrumbs(),
            builder: (context, snapshot) {
              double totalDistance = 0.0;
              double avgSpeed = 0.0;
              String eta = "N/A";

              if (snapshot.hasData && snapshot.data!.isNotEmpty) {
                final logs = snapshot.data!;
                List<LatLng> points = logs.map((e) => LatLng(e.latitude, e.longitude)).toList();
                
                for (int i = 0; i < points.length - 1; i++) {
                  totalDistance += TelemetryCalculator.calculateDistance(points[i], points[i + 1]);
                }
                
                double speedSum = logs.map((e) => e.speed as double).fold(0.0, (a, b) => a + b);
                avgSpeed = logs.isNotEmpty ? (speedSum / logs.length) * 3.6 : 0.0;

                final LatLng baseCamp = const LatLng(26.1445, 91.7363); 
                double distanceToBase = TelemetryCalculator.calculateDistance(points.last, baseCamp);
                eta = TelemetryCalculator.estimateTimeOfArrival(avgSpeed, distanceToBase);
              }

              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: SensorTelemetryGrid(
                  totalDistanceKm: totalDistance,
                  averageSpeedKmh: avgSpeed,
                  etaString: eta,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';

class SensorTelemetryGrid extends StatelessWidget {
  final double totalDistanceKm;
  final double averageSpeedKmh;
  final String etaString;

  const SensorTelemetryGrid({
    Key? key,
    required this.totalDistanceKm,
    required this.averageSpeedKmh,
    required this.etaString,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.1,
      children: [
        _buildSensorCard("TOTAL DIST", "${totalDistanceKm.toStringAsFixed(2)} km", TacticalColors.neonCyanAccent),
        _buildSensorCard("AVG SPEED", "${averageSpeedKmh.toStringAsFixed(1)} km/h", TacticalColors.neonCyanAccent),
        _buildSensorCard("ETA TO BASE", etaString, const Color(0xFFFFCC00)),
      ],
    );
  }

  Widget _buildSensorCard(String label, String value, Color accentColor) {
    return Container(
      decoration: BoxDecoration(
        color: TacticalColors.surfaceDarkGlass,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: accentColor.withOpacity(0.3), width: 1),
      ),
      padding: const EdgeInsets.all(8),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.white54,
              fontFamily: 'monospace',
              fontSize: 9,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              style: TextStyle(
                color: accentColor,
                fontFamily: 'monospace',
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

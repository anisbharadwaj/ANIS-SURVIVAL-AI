import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme/app_theme.dart';

class TacticalHUDWidget extends StatefulWidget {
  final double heading;
  final double altitude;
  final double gpsAccuracy;
  final double speed;
  final int batteryLevel;
  final bool isEmergency;
  final String signalStatus;

  const TacticalHUDWidget({
    Key? key,
    required this.heading,
    required this.altitude,
    required this.gpsAccuracy,
    required this.speed,
    required this.batteryLevel,
    required this.isEmergency,
    required this.signalStatus,
  }) : super(key: key);

  @override
  State<TacticalHUDWidget> createState() => _TacticalHUDWidgetState();
}

class _TacticalHUDWidgetState extends State<TacticalHUDWidget>
    with TickerProviderStateMixin {
  late AnimationController _radarController;

  @override
  void initState() {
    super.initState();
    _radarController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _radarController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.backgroundColor.withOpacity(0.9),
        border: Border.all(
          color: widget.isEmergency ? AppTheme.dangerColor : AppTheme.primaryColor,
          width: 2,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: widget.isEmergency
                ? AppTheme.dangerColor.withOpacity(0.3)
                : AppTheme.primaryColor.withOpacity(0.2),
            blurRadius: 20,
            spreadRadius: 5,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Radar Section
          _buildRadarSection(),
          const SizedBox(height: 16),
          // HUD Data Grid
          _buildHUDDataGrid(),
          const SizedBox(height: 12),
          // Signal Status
          _buildSignalStatus(),
        ],
      ),
    );
  }

  Widget _buildRadarSection() {
    return SizedBox(
      width: 120,
      height: 120,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Radar circles
          ...List.generate(
            3,
            (index) => Container(
              width: 40 + (index * 30).toDouble(),
              height: 40 + (index * 30).toDouble(),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppTheme.primaryColor.withOpacity(0.3),
                  width: 1,
                ),
              ),
            ),
          ),
          // Rotating radar arm
          RotationTransition(
            turns: _radarController,
            child: Container(
              width: 2,
              height: 50,
              color: AppTheme.primaryColor,
            ),
          ),
          // Center dot
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.primaryColor,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryColor.withOpacity(0.6),
                  blurRadius: 8,
                )
              ],
            ),
          ),
          // Heading indicator
          Transform.rotate(
            angle: (widget.heading * 3.14159265359) / 180,
            child: Positioned(
              top: 10,
              child: Icon(
                Icons.navigation,
                color: AppTheme.accentColor,
                size: 16,
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 500));
  }

  Widget _buildHUDDataGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      crossAxisSpacing: 8,
      mainAxisSpacing: 8,
      childAspectRatio: 1.5,
      children: [
        _buildHUDDataBox(
          label: 'HEADING',
          value: '${widget.heading.toStringAsFixed(0)}°',
          unit: 'DEG',
        ),
        _buildHUDDataBox(
          label: 'ALTITUDE',
          value: '${widget.altitude.toStringAsFixed(0)}',
          unit: 'M',
        ),
        _buildHUDDataBox(
          label: 'SPEED',
          value: '${(widget.speed * 3.6).toStringAsFixed(1)}',
          unit: 'KM/H',
        ),
        _buildHUDDataBox(
          label: 'GPS ACC',
          value: '${widget.gpsAccuracy.toStringAsFixed(1)}',
          unit: 'M',
        ),
      ],
    );
  }

  Widget _buildHUDDataBox({
    required String label,
    required String value,
    required String unit,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceColor.withOpacity(0.7),
        border: Border.all(
          color: AppTheme.primaryColor.withOpacity(0.5),
          width: 1,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.all(8),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.textTertiary,
              fontSize: 9,
              letterSpacing: 1,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: AppTheme.primaryColor,
              fontSize: 14,
              fontWeight: FontWeight.bold,
              fontFamily: 'RobotoMono',
            ),
          ),
          Text(
            unit,
            style: const TextStyle(
              color: AppTheme.textTertiary,
              fontSize: 8,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSignalStatus() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Battery status
        _buildStatusIndicator(
          icon: Icons.battery_std,
          value: '${widget.batteryLevel}%',
          color: _getBatteryColor(),
        ),
        // Signal status
        _buildStatusIndicator(
          icon: Icons.signal_cellular_alt,
          value: widget.signalStatus,
          color: _getSignalColor(),
        ),
        // Emergency status
        if (widget.isEmergency)
          _buildStatusIndicator(
            icon: Icons.warning,
            value: 'SOS',
            color: AppTheme.dangerColor,
          ),
      ],
    );
  }

  Widget _buildStatusIndicator({
    required IconData icon,
    required String value,
    required Color color,
  }) {
    return Row(
      children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 4),
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Color _getBatteryColor() {
    if (widget.batteryLevel > 50) return AppTheme.successColor;
    if (widget.batteryLevel > 20) return AppTheme.warningColor;
    return AppTheme.dangerColor;
  }

  Color _getSignalColor() {
    switch (widget.signalStatus) {
      case 'STRONG':
        return AppTheme.successColor;
      case 'WEAK':
        return AppTheme.warningColor;
      case 'NONE':
        return AppTheme.dangerColor;
      default:
        return AppTheme.textSecondary;
    }
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/theme/app_theme.dart';
import '../../../services/map_engine.dart';
import '../../../services/gps_engine.dart';
import '../../widgets/tactical_hud_widget.dart';

class TacticalMapScreen extends ConsumerStatefulWidget {
  const TacticalMapScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<TacticalMapScreen> createState() => _TacticalMapScreenState();
}

class _TacticalMapScreenState extends ConsumerState<TacticalMapScreen> {
  final MapEngine _mapEngine = MapEngine();
  final GPSEngine _gpsEngine = GPSEngine();
  late MapController _mapController;
  List<Marker> _markers = [];
  List<Polyline> _routes = [];

  @override
  void initState() {
    super.initState();
    _mapController = _mapEngine.mapController;
    _initializeMap();
  }

  void _initializeMap() async {
    await _mapEngine.initialize();
    // Start GPS tracking
    await _gpsEngine.startTracking();
    _setupGPSListener();
  }

  void _setupGPSListener() {
    _gpsEngine.positionStream.listen((position) {
      // Update user marker on map
      final userMarker = _mapEngine.createUserMarker(
        position.latitude,
        position.longitude,
        _gpsEngine.currentHeading,
      );

      setState(() {
        _markers = [userMarker];
      });

      // Auto-center map on user
      _mapEngine.animateToLocation(
        position.latitude,
        position.longitude,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Map Layer
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              center: const LatLng(28.6139, 77.2090), // Delhi default
              zoom: 15,
              minZoom: 2,
              maxZoom: 18,
              interactiveFlags: InteractiveFlag.all,
            ),
            children: [
              _mapEngine.getOfflineMapLayer(),
              MarkerLayer(markers: _markers),
              PolylineLayer(polylines: _routes),
            ],
          ),
          // HUD Overlay
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: TacticalHUDWidget(
              heading: _gpsEngine.currentHeading,
              altitude: _gpsEngine.currentAltitude,
              gpsAccuracy: 5.0,
              speed: 0.0,
              batteryLevel: 85,
              isEmergency: false,
              signalStatus: 'STRONG',
            ),
          ),
          // Bottom Controls
          Positioned(
            bottom: 16,
            left: 16,
            right: 16,
            child: _buildBottomControls(),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomControls() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildControlButton(
          icon: Icons.emergency,
          label: 'SOS',
          onPressed: () => _showSOSDialog(),
          isEmergency: true,
        ),
        _buildControlButton(
          icon: Icons.compass_calibration,
          label: 'Navigate',
          onPressed: () => _showNavigationOptions(),
        ),
        _buildControlButton(
          icon: Icons.settings,
          label: 'Settings',
          onPressed: () => _showSettings(),
        ),
      ],
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
    bool isEmergency = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isEmergency ? AppTheme.dangerColor : AppTheme.primaryColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: (isEmergency ? AppTheme.dangerColor : AppTheme.primaryColor)
                .withOpacity(0.5),
            blurRadius: 12,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: Colors.white),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showSOSDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.surfaceColor,
        title: const Text(
          'EMERGENCY SOS',
          style: TextStyle(color: AppTheme.dangerColor),
        ),
        content: const Text(
          'Activate emergency mode?\nThis will:
- Enable SOS beacon\n- Alert emergency contacts\n- Activate location broadcast\n- Enable survival mode',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.dangerColor,
            ),
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('SOS Mode Activated'),
                  backgroundColor: AppTheme.dangerColor,
                ),
              );
            },
            child: const Text('Activate SOS'),
          ),
        ],
      ),
    );
  }

  void _showNavigationOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surfaceColor,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Navigation Mode',
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 16),
            _buildNavOption('Shortest Route', 'Fastest path', () {}),
            _buildNavOption('Safest Route', 'Avoid dangers', () {}),
            _buildNavOption('Battery Optimized', 'Preserve battery', () {}),
          ],
        ),
      ),
    );
  }

  Widget _buildNavOption(String title, String subtitle, VoidCallback onTap) {
    return ListTile(
      title: Text(
        title,
        style: const TextStyle(color: AppTheme.primaryColor),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(color: AppTheme.textTertiary),
      ),
      trailing: const Icon(
        Icons.arrow_forward,
        color: AppTheme.primaryColor,
      ),
      onTap: onTap,
    );
  }

  void _showSettings() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const SettingsScreen()),
    );
  }

  @override
  void dispose() {
    _gpsEngine.stopTracking();
    super.dispose();
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildSettingItem(
              title: 'Language',
              subtitle: 'English',
              icon: Icons.language,
            ),
            _buildSettingItem(
              title: 'Battery Optimization',
              subtitle: 'Enabled',
              icon: Icons.battery_saver,
            ),
            _buildSettingItem(
              title: 'Voice Guidance',
              subtitle: 'Enabled',
              icon: Icons.mic,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingItem({
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primaryColor),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right),
      onTap: () {},
    );
  }
}

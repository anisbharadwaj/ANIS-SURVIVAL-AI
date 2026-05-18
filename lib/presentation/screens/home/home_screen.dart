import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../../config/theme/app_theme.dart';
import '../../../services/gps_engine.dart';
import '../../../services/map_engine.dart';
import '../../../services/battery_optimization_engine.dart';
import '../../widgets/tactical_hud_widget.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final GPSEngine _gpsEngine = GPSEngine();
  final MapEngine _mapEngine = MapEngine();
  final BatteryOptimizationEngine _batteryEngine = BatteryOptimizationEngine();
  late MapController _mapController;
  
  double _currentHeading = 0.0;
  double _currentAltitude = 0.0;
  double _currentSpeed = 0.0;
  double _gpsAccuracy = 5.0;
  int _batteryLevel = 100;
  bool _isEmergency = false;
  String _signalStatus = 'STRONG';
  List<Marker> _markers = [];
  List<Polyline> _polylines = [];

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  void _initializeMap() async {
    try {
      _mapController = _mapEngine.mapController;
      
      // Initialize GPS tracking
      await _gpsEngine.startTracking();
      _setupGPSListener();
      
      // Initialize battery monitoring
      await _batteryEngine.startMonitoring();
      _setupBatteryListener();
    } catch (e) {
      print('Error initializing: $e');
    }
  }

  void _setupGPSListener() {
    _gpsEngine.positionStream.listen((position) {
      setState(() {
        _currentAltitude = position.altitude;
        _currentSpeed = position.speed;
        _gpsAccuracy = position.accuracy;
        
        final userMarker = _mapEngine.createUserMarker(
          position.latitude,
          position.longitude,
          _currentHeading,
        );
        
        _markers = [userMarker];
      });
      
      _mapEngine.animateToLocation(
        position.latitude,
        position.longitude,
      );
    });
    
    _gpsEngine.headingStream.listen((heading) {
      setState(() {
        _currentHeading = heading;
      });
    });
  }

  void _setupBatteryListener() {
    _batteryEngine.batteryLevelStream.listen((level) {
      setState(() {
        _batteryLevel = level;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => false,
      child: Scaffold(
        body: Stack(
          children: [
            // Map Layer
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                center: const LatLng(28.6139, 77.2090),
                zoom: 15,
                minZoom: 2,
                maxZoom: 18,
                interactiveFlags: InteractiveFlag.all,
              ),
              children: [
                _mapEngine.getOfflineMapLayer(),
                MarkerLayer(markers: _markers),
                PolylineLayer(polylines: _polylines),
              ],
            ),
            
            // HUD Overlay
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: TacticalHUDWidget(
                heading: _currentHeading,
                altitude: _currentAltitude,
                gpsAccuracy: _gpsAccuracy,
                speed: _currentSpeed,
                batteryLevel: _batteryLevel,
                isEmergency: _isEmergency,
                signalStatus: _signalStatus,
              ),
            ),
            
            // Bottom Controls
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildControlButton(
                    icon: Icons.emergency,
                    label: 'SOS',
                    onPressed: _showSOSDialog,
                    isEmergency: true,
                  ),
                  _buildControlButton(
                    icon: Icons.compass_calibration,
                    label: 'Navigate',
                    onPressed: _showNavigationOptions,
                  ),
                  _buildControlButton(
                    icon: Icons.settings,
                    label: 'Settings',
                    onPressed: _showSettings,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
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
          'Activate emergency mode?\nThis will:\n- Enable SOS beacon\n- Alert emergency contacts\n- Activate location broadcast\n- Enable survival mode',
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
              setState(() => _isEmergency = true);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('SOS Mode Activated'),
                  backgroundColor: AppTheme.dangerColor,
                  duration: Duration(seconds: 2),
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
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const SettingsScreen()),
    );
  }

  @override
  void dispose() {
    _gpsEngine.stopTracking();
    _batteryEngine.stopMonitoring();
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
        backgroundColor: AppTheme.backgroundColor,
      ),
      backgroundColor: AppTheme.backgroundColor,
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
            _buildSettingItem(
              title: 'Offline Maps',
              subtitle: 'Cache Enabled',
              icon: Icons.map,
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
      title: Text(title, style: const TextStyle(color: AppTheme.textPrimary)),
      subtitle: Text(subtitle, style: const TextStyle(color: AppTheme.textTertiary)),
      trailing: const Icon(Icons.chevron_right, color: AppTheme.primaryColor),
      onTap: () {},
    );
  }
}

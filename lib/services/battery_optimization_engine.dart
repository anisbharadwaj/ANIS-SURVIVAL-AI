import 'dart:async';
import 'package:battery_plus/battery_plus.dart';

class BatteryOptimizationEngine {
  static final BatteryOptimizationEngine _instance =
      BatteryOptimizationEngine._internal();
  final Battery _battery = Battery();
  late StreamController<BatteryState> _batteryStateController;
  late StreamController<int> _batteryLevelController;
  StreamSubscription<BatteryState>? _batteryStateSubscription;

  int _currentBatteryLevel = 100;
  BatteryState _currentBatteryState = BatteryState.full;
  BatteryOptimizationMode _optimizationMode = BatteryOptimizationMode.normal;

  factory BatteryOptimizationEngine() {
    return _instance;
  }

  BatteryOptimizationEngine._internal() {
    _batteryStateController = StreamController<BatteryState>.broadcast();
    _batteryLevelController = StreamController<int>.broadcast();
  }

  Stream<BatteryState> get batteryStateStream => _batteryStateController.stream;
  Stream<int> get batteryLevelStream => _batteryLevelController.stream;

  int get currentBatteryLevel => _currentBatteryLevel;
  BatteryState get currentBatteryState => _currentBatteryState;
  BatteryOptimizationMode get optimizationMode => _optimizationMode;

  Future<void> startMonitoring() async {
    // Get initial battery level
    _currentBatteryLevel = await _battery.batteryLevel;
    _currentBatteryState = await _battery.batteryState;

    _updateOptimizationMode();

    // Listen to battery state changes
    _batteryStateSubscription =
        _battery.onBatteryStateChanged.listen((BatteryState state) {
      _currentBatteryState = state;
      _batteryStateController.add(state);
      _updateOptimizationMode();
    });

    // Poll battery level every 30 seconds
    Timer.periodic(const Duration(seconds: 30), (_) async {
      _currentBatteryLevel = await _battery.batteryLevel;
      _batteryLevelController.add(_currentBatteryLevel);
      _updateOptimizationMode();
    });
  }

  void _updateOptimizationMode() {
    if (_currentBatteryLevel > 50) {
      _optimizationMode = BatteryOptimizationMode.normal;
    } else if (_currentBatteryLevel > 20) {
      _optimizationMode = BatteryOptimizationMode.lowBattery;
    } else if (_currentBatteryLevel > 5) {
      _optimizationMode = BatteryOptimizationMode.ultraLowPower;
    } else {
      _optimizationMode = BatteryOptimizationMode.emergency;
    }
  }

  /// Get GPS polling interval based on battery state (in milliseconds)
  int getGPSPollingInterval() {
    switch (_optimizationMode) {
      case BatteryOptimizationMode.normal:
        return 5000; // 5 seconds
      case BatteryOptimizationMode.lowBattery:
        return 10000; // 10 seconds
      case BatteryOptimizationMode.ultraLowPower:
        return 30000; // 30 seconds
      case BatteryOptimizationMode.emergency:
        return 60000; // 60 seconds
    }
  }

  /// Get screen timeout duration based on battery
  Duration getScreenTimeout() {
    switch (_optimizationMode) {
      case BatteryOptimizationMode.normal:
        return const Duration(minutes: 10);
      case BatteryOptimizationMode.lowBattery:
        return const Duration(minutes: 5);
      case BatteryOptimizationMode.ultraLowPower:
        return const Duration(minutes: 2);
      case BatteryOptimizationMode.emergency:
        return const Duration(seconds: 30);
    }
  }

  /// Estimate survival time in hours
  double estimateSurvivalTime() {
    // Simple estimation: assuming 10% battery drain per hour
    double hoursPerPercent = 0.1;
    return _currentBatteryLevel * hoursPerPercent;
  }

  /// Check if animations should be disabled
  bool shouldDisableAnimations() {
    return _optimizationMode == BatteryOptimizationMode.ultraLowPower ||
        _optimizationMode == BatteryOptimizationMode.emergency;
  }

  /// Check if voice guidance should be disabled
  bool shouldDisableVoiceGuidance() {
    return _optimizationMode == BatteryOptimizationMode.emergency;
  }

  /// Check if GPS polling should be reduced
  bool shouldReduceGPSPolling() {
    return _optimizationMode == BatteryOptimizationMode.lowBattery ||
        _optimizationMode == BatteryOptimizationMode.ultraLowPower ||
        _optimizationMode == BatteryOptimizationMode.emergency;
  }

  Future<void> stopMonitoring() async {
    await _batteryStateSubscription?.cancel();
  }

  void dispose() {
    _batteryStateSubscription?.cancel();
    _batteryStateController.close();
    _batteryLevelController.close();
  }
}

enum BatteryOptimizationMode {
  normal,
  lowBattery,
  ultraLowPower,
  emergency,
}

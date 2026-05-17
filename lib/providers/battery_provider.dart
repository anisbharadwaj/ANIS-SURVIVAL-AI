import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/battery_optimization_engine.dart';

final batteryEngine = Provider<BatteryOptimizationEngine>((ref) {
  return BatteryOptimizationEngine();
});

final batteryLevelStream = StreamProvider<int>((ref) async* {
  final engine = ref.watch(batteryEngine);
  await engine.startMonitoring();
  yield* engine.batteryLevelStream;
});

final batteryStateStream = StreamProvider<BatteryState>((ref) async* {
  final engine = ref.watch(batteryEngine);
  await engine.startMonitoring();
  yield* engine.batteryStateStream;
});

final batteryOptimizationModeProvider = StateProvider<BatteryOptimizationMode>((ref) {
  return BatteryOptimizationMode.normal;
});

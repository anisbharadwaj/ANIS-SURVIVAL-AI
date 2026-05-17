import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/emergency_system.dart';

final emergencyEngine = Provider<EmergencySystem>((ref) {
  return EmergencySystem();
});

final emergencyStateProvider = StateProvider<bool>((ref) {
  return false;
});

final sosSessionProvider = StateProvider<String?>((ref) {
  return null;
});

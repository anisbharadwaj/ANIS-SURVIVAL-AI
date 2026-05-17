import 'package:vibration/vibration.dart';
import '../data/database/database_service.dart';

class EmergencySystem {
  static final EmergencySystem _instance = EmergencySystem._internal();
  final DatabaseService _database = DatabaseService();
  bool _sosActive = false;
  late String _sosSessionId;
  late DateTime _sosActivationTime;

  factory EmergencySystem() {
    return _instance;
  }

  EmergencySystem._internal();

  bool get sosActive => _sosActive;
  String get sosSessionId => _sosSessionId;

  /// Activate SOS mode
  Future<SOSActivation> activateSOS(
    double latitude,
    double longitude,
    double altitude,
    String emergencyType,
    String? message,
  ) async {
    _sosActive = true;
    _sosSessionId = _generateSessionId();
    _sosActivationTime = DateTime.now();

    // Trigger emergency notifications
    await _triggerEmergencyAlarm();
    await _activateEmergencyFlashlight();
    await _logEmergency(latitude, longitude, altitude, emergencyType, message);

    return SOSActivation(
      sessionId: _sosSessionId,
      activationTime: _sosActivationTime,
      latitude: latitude,
      longitude: longitude,
      altitude: altitude,
      emergencyType: emergencyType,
      message: message,
    );
  }

  /// Trigger emergency alarm vibration
  Future<void> _triggerEmergencyAlarm() async {
    // Vibration pattern for SOS (... --- ...)
    final hasVibrator = await Vibration.hasVibrator() ?? false;
    if (hasVibrator) {
      // SOS pattern: 3 short, 3 long, 3 short
      await Vibration.vibrate(duration: 100);
      await Future.delayed(const Duration(milliseconds: 100));
      await Vibration.vibrate(duration: 100);
      await Future.delayed(const Duration(milliseconds: 100));
      await Vibration.vibrate(duration: 100);
      await Future.delayed(const Duration(milliseconds: 300));
      await Vibration.vibrate(duration: 500);
      await Future.delayed(const Duration(milliseconds: 100));
      await Vibration.vibrate(duration: 500);
      await Future.delayed(const Duration(milliseconds: 100));
      await Vibration.vibrate(duration: 500);
      await Future.delayed(const Duration(milliseconds: 300));
      await Vibration.vibrate(duration: 100);
      await Future.delayed(const Duration(milliseconds: 100));
      await Vibration.vibrate(duration: 100);
      await Future.delayed(const Duration(milliseconds: 100));
      await Vibration.vibrate(duration: 100);
    }
  }

  /// Activate flashlight SOS strobe
  Future<void> _activateEmergencyFlashlight() async {
    // This would integrate with torch_light package
    // Strobe pattern for visibility
  }

  /// Log emergency event
  Future<void> _logEmergency(
    double latitude,
    double longitude,
    double altitude,
    String emergencyType,
    String? message,
  ) async {
    await _database.database.then((db) async {
      await db.insert('emergency_logs', {
        'emergency_type': emergencyType,
        'latitude': latitude,
        'longitude': longitude,
        'altitude': altitude,
        'status': 'ACTIVE',
        'sos_message': message,
        'created_at': DateTime.now().toIso8601String(),
      });
    });
  }

  /// Deactivate SOS mode
  Future<void> deactivateSOS() async {
    _sosActive = false;
    // Log deactivation
    await _database.database.then((db) async {
      await db.update(
        'emergency_logs',
        {'status': 'RESOLVED', 'resolved_at': DateTime.now().toIso8601String()},
        where: 'status = ? AND created_at IN (SELECT MAX(created_at) FROM emergency_logs)',
        whereArgs: ['ACTIVE'],
      );
    });
  }

  /// Get emergency coordinates
  Map<String, dynamic> getEmergencyCoordinates() {
    return {
      'session_id': _sosSessionId,
      'activation_time': _sosActivationTime.toIso8601String(),
      'timestamp': DateTime.now().toIso8601String(),
    };
  }

  /// Get emergency instructions based on situation
  Future<EmergencyInstructions> getEmergencyInstructions(
    String emergencyType,
    String terrain,
  ) async {
    List<String> instructions = [];

    switch (emergencyType) {
      case 'lost':
        instructions = [
          'STOP moving immediately.',
          'Stay calm and assess your situation.',
          'Mark your location with bright objects.',
          'Use ANIS to identify landmarks.',
          'Signal for help if possible.',
          'Wait for rescue team - do not wander.',
        ];
        break;

      case 'injury':
        instructions = [
          'Find safe shelter immediately.',
          'Apply first aid if possible.',
          'Keep the injury clean and elevated.',
          'Stay hydrated and rested.',
          'Signal distress continuously.',
          'Do not move injured area unnecessarily.',
        ];
        break;

      case 'weather':
        instructions = [
          'Seek immediate shelter.',
          'Move away from open high ground.',
          'Avoid water and isolated trees.',
          'Stay dry - hypothermia risk.',
          'Keep emergency devices protected.',
          'Monitor weather condition changes.',
        ];
        break;

      case 'dehydration':
        instructions = [
          'Find water source immediately.',
          'Rest in shade - reduce activity.',
          'Drink small amounts slowly.',
          'Avoid alcohol and caffeine.',
          'Cover skin to reduce moisture loss.',
          'Look for signs of water (birds, insects).',
        ];
        break;

      case 'hypothermia':
        instructions = [
          'Find shelter immediately.',
          'Remove wet clothing carefully.',
          'Wrap in insulation (leaves, branches).',
          'Build fire if possible.',
          'Avoid rapid rewarming.',
          'Stay dry and still.',
        ];
        break;

      default:
        instructions = [
          'ACTIVATE EMERGENCY MODE.',
          'Stay calm and secure your position.',
          'Signal for help.',
          'Conserve device battery.',
          'Provide location to rescuers.',
          'Follow all survival protocols.',
        ];
    }

    return EmergencyInstructions(
      emergencyType: emergencyType,
      terrain: terrain,
      instructions: instructions,
    );
  }

  String _generateSessionId() {
    return '${DateTime.now().millisecondsSinceEpoch}_${(DateTime.now().microsecond % 1000).toString()}';
  }
}

class SOSActivation {
  final String sessionId;
  final DateTime activationTime;
  final double latitude;
  final double longitude;
  final double altitude;
  final String emergencyType;
  final String? message;

  SOSActivation({
    required this.sessionId,
    required this.activationTime,
    required this.latitude,
    required this.longitude,
    required this.altitude,
    required this.emergencyType,
    this.message,
  });
}

class EmergencyInstructions {
  final String emergencyType;
  final String terrain;
  final List<String> instructions;

  EmergencyInstructions({
    required this.emergencyType,
    required this.terrain,
    required this.instructions,
  });
}

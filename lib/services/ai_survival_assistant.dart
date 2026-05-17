import 'package:uuid/uuid.dart';
import '../data/database/database_service.dart';

class AISurvivalAssistant {
  static final AISurvivalAssistant _instance =
      AISurvivalAssistant._internal();
  final DatabaseService _database = DatabaseService();
  final List<String> _commandHistory = [];
  late String _sessionId;

  factory AISurvivalAssistant() {
    return _instance;
  }

  AISurvivalAssistant._internal() {
    _sessionId = const Uuid().v4();
  }

  /// Analyze terrain danger
  Future<TerrainAnalysis> analyzeTerrainDanger(
    double latitude,
    double longitude,
    double altitude,
    String terrainType,
  ) async {
    double riskScore = 0.0;
    List<String> warnings = [];

    // Analyze altitude danger
    if (altitude > 4000) {
      riskScore += 0.3;
      warnings.add('High altitude detected. Risk of altitude sickness.');
    } else if (altitude > 3000) {
      riskScore += 0.2;
      warnings.add('Moderate altitude. Monitor breathing.');
    }

    // Analyze terrain type danger
    switch (terrainType) {
      case 'cliff':
        riskScore += 0.5;
        warnings.add('Cliff terrain detected. High fall risk.');
        break;
      case 'swamp':
        riskScore += 0.35;
        warnings.add('Swamp terrain. Risk of sinking and disease.');
        break;
      case 'forest_dense':
        riskScore += 0.25;
        warnings.add('Dense forest. Risk of disorientation.');
        break;
      case 'water':
        riskScore += 0.4;
        warnings.add('Water terrain. Swimming/drowning risk.');
        break;
      case 'snow':
        riskScore += 0.3;
        warnings.add('Snow terrain. Risk of avalanche.');
        break;
      case 'open_field':
        riskScore += 0.1;
        warnings.add('Open terrain. Relatively safe.');
        break;
    }

    // Store analysis in database
    await _database.database.then((db) async {
      await db.insert('ai_history', {
        'query': 'terrain_analysis_$latitude\_$longitude',
        'response': warnings.join(' | '),
        'confidence_score': riskScore,
        'created_at': DateTime.now().toIso8601String(),
      });
    });

    return TerrainAnalysis(
      riskScore: riskScore.clamp(0.0, 1.0),
      warnings: warnings,
      safeRoutingRecommended: riskScore > 0.5,
    );
  }

  /// Detect if user is lost
  Future<LostDetection> detectIfLost(
    double currentLatitude,
    double currentLongitude,
    double previousLatitude,
    double previousLongitude,
    int timeSinceLastUpdate,
    double distanceTraveled,
  ) async {
    bool isLost = false;
    List<String> indicators = [];
    double lostProbability = 0.0;

    // Check for circular movement
    const double circularThreshold = 500; // meters
    if (distanceTraveled < 100 && timeSinceLastUpdate > 300) {
      // Minimal movement over long time
      lostProbability += 0.3;
      indicators.add('Minimal movement detected.');
    }

    // Check GPS accuracy
    if (timeSinceLastUpdate > 600) {
      // No GPS update for 10 minutes
      lostProbability += 0.25;
      indicators.add('GPS signal weak.');
    }

    // Check for abnormal speed
    double speedKmh = (distanceTraveled / 1000) / (timeSinceLastUpdate / 3600);
    if (speedKmh > 50 && timeSinceLastUpdate < 60) {
      // Unlikely human speed
      lostProbability += 0.2;
      indicators.add('Abnormal speed detected.');
    }

    isLost = lostProbability > 0.5;

    // Store detection
    await _database.database.then((db) async {
      await db.insert('ai_history', {
        'query': 'lost_detection_check',
        'response': '${indicators.join(" | ")} - Lost: $isLost',
        'confidence_score': lostProbability,
        'created_at': DateTime.now().toIso8601String(),
      });
    });

    return LostDetection(
      isLost: isLost,
      lostProbability: lostProbability,
      indicators: indicators,
    );
  }

  /// Estimate battery survival time
  Future<BatterySurvivalEstimate> estimateBatterySurvival(
    int currentBattery,
    int gpsPollingIntervalMs,
    bool screenOn,
    bool voiceGuidanceEnabled,
  ) async {
    double drainRatePerHour = 0.0;

    // GPS drain rate
    drainRatePerHour += (gpsPollingIntervalMs < 5000) ? 15 : 10;

    // Screen drain
    if (screenOn) drainRatePerHour += 20;

    // Voice guidance
    if (voiceGuidanceEnabled) drainRatePerHour += 5;

    double estimatedHours = currentBattery / drainRatePerHour;

    String recommendation = '';
    if (estimatedHours > 8) {
      recommendation = 'Battery sufficient for extended navigation.';
    } else if (estimatedHours > 4) {
      recommendation = 'Battery good. Plan for low-power mode later.';
    } else if (estimatedHours > 2) {
      recommendation = 'Battery low. Consider activating battery saver.';
    } else if (estimatedHours > 1) {
      recommendation = 'Battery critical. Activate ultra-low power mode NOW.';
    } else {
      recommendation = 'EMERGENCY: Battery will die soon. Find shelter and signal.';
    }

    return BatterySurvivalEstimate(
      estimatedHours: estimatedHours,
      drainRatePerHour: drainRatePerHour,
      recommendation: recommendation,
    );
  }

  /// Generate survival guidance
  Future<SurvivalGuidance> generateSurvivalGuidance(
    String currentSituation,
    String terrain,
    double temperature,
    int batteryLevel,
    bool hasWater,
    bool hasShelter,
  ) async {
    List<String> guidancePoints = [];

    // Basic survival priorities: Water, Shelter, Fire, Food
    if (!hasWater) {
      guidancePoints.add('PRIORITY: Find water source. Dehydration is critical.');
    } else {
      guidancePoints.add('Water secured. Ration wisely.');
    }

    if (!hasShelter) {
      guidancePoints.add('PRIORITY: Build or find shelter to protect from elements.');
    } else {
      guidancePoints.add('Shelter found. Rest when possible.');
    }

    // Temperature-based guidance
    if (temperature < 0) {
      guidancePoints.add('Sub-zero temperature. Risk of hypothermia.');
      guidancePoints.add('Keep moving to maintain body heat.');
    } else if (temperature > 35) {
      guidancePoints.add('High temperature. Severe dehydration risk.');
      guidancePoints.add('Conserve energy. Travel during cool hours.');
    }

    // Battery-based guidance
    if (batteryLevel < 10) {
      guidancePoints.add('Battery critical. Power off non-essential features.');
      guidancePoints.add('Use device only for navigation and emergency.');
    }

    return SurvivalGuidance(
      guidancePoints: guidancePoints,
      priority: guidancePoints.first,
    );
  }
}

class TerrainAnalysis {
  final double riskScore; // 0.0 to 1.0
  final List<String> warnings;
  final bool safeRoutingRecommended;

  TerrainAnalysis({
    required this.riskScore,
    required this.warnings,
    required this.safeRoutingRecommended,
  });
}

class LostDetection {
  final bool isLost;
  final double lostProbability; // 0.0 to 1.0
  final List<String> indicators;

  LostDetection({
    required this.isLost,
    required this.lostProbability,
    required this.indicators,
  });
}

class BatterySurvivalEstimate {
  final double estimatedHours;
  final double drainRatePerHour;
  final String recommendation;

  BatterySurvivalEstimate({
    required this.estimatedHours,
    required this.drainRatePerHour,
    required this.recommendation,
  });
}

class SurvivalGuidance {
  final List<String> guidancePoints;
  final String priority;

  SurvivalGuidance({
    required this.guidancePoints,
    required this.priority,
  });
}

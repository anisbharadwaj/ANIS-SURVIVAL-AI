import 'package:flutter_tts/flutter_tts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

class VoiceNavigationEngine {
  static final VoiceNavigationEngine _instance =
      VoiceNavigationEngine._internal();
  final FlutterTts _textToSpeech = FlutterTts();
  final stt.SpeechToText _speechToText = stt.SpeechToText();
  bool _isListening = false;
  String _currentLanguage = 'en-US';

  factory VoiceNavigationEngine() {
    return _instance;
  }

  VoiceNavigationEngine._internal() {
    _initializeTTS();
  }

  bool get isListening => _isListening;

  /// Initialize text-to-speech engine
  Future<void> _initializeTTS() async {
    await _textToSpeech.setLanguage(_currentLanguage);
    await _textToSpeech.setSpeechRate(0.8);
  }

  /// Initialize speech recognition
  Future<bool> initializeSpeechRecognition() async {
    try {
      bool available = await _speechToText.initialize(
        onError: (error) => print('Speech recognition error: $error'),
        onStatus: (status) => print('Speech recognition status: $status'),
      );
      return available;
    } catch (e) {
      print('Error initializing speech recognition: $e');
      return false;
    }
  }

  /// Set language for voice
  Future<void> setLanguage(String languageCode) async {
    _currentLanguage = _getLanguageLocale(languageCode);
    await _textToSpeech.setLanguage(_currentLanguage);
  }

  /// Speak navigation instruction
  Future<void> speakNavigation(
    String instruction,
    double distance,
    String direction,
  ) async {
    String speedAdjustedInstruction = instruction;

    if (distance > 1000) {
      speedAdjustedInstruction = '$instruction in ${(distance / 1000).toStringAsFixed(1)} kilometers';
    } else if (distance > 100) {
      speedAdjustedInstruction = '$instruction in ${distance.toStringAsFixed(0)} meters';
    } else {
      speedAdjustedInstruction = '$instruction immediately';
    }

    await _speak(speedAdjustedInstruction);
  }

  /// Speak survival warning
  Future<void> speakSurvivalWarning(String warning) async {
    await _speak('WARNING: $warning');
  }

  /// Speak emergency alert
  Future<void> speakEmergencyAlert(String alert) async {
    await _speak('EMERGENCY ALERT: $alert');
  }

  /// Speak route information
  Future<void> speakRouteInfo(
    String routeName,
    double distance,
    int estimatedMinutes,
  ) async {
    String info =
        'Route: $routeName. Distance: ${(distance / 1000).toStringAsFixed(1)} kilometers. Estimated time: $estimatedMinutes minutes.';
    await _speak(info);
  }

  /// Start listening for voice commands
  Future<void> startListening(
    Function(String) onResult,
    Function(String) onError,
  ) async {
    if (!_isListening && _speechToText.isAvailable) {
      _isListening = true;

      _speechToText.listen(
        onResult: (result) {
          if (result.finalResult) {
            onResult(result.recognizedWords.toLowerCase());
            _isListening = false;
          }
        },
        listenMode: stt.ListenMode.confirmation,
        pauseDuration: const Duration(seconds: 3),
      );
    }
  }

  /// Stop listening for voice commands
  Future<void> stopListening() async {
    if (_isListening) {
      await _speechToText.stop();
      _isListening = false;
    }
  }

  /// Process voice command
  Future<VoiceCommand?> processVoiceCommand(String command) async {
    final lowerCommand = command.toLowerCase();

    if (lowerCommand.contains('sos') || lowerCommand.contains('emergency')) {
      return VoiceCommand.emergency;
    }

    if (lowerCommand.contains('navigate') || lowerCommand.contains('route')) {
      return VoiceCommand.navigate;
    }

    if (lowerCommand.contains('battery') || lowerCommand.contains('power')) {
      return VoiceCommand.batteryStatus;
    }

    if (lowerCommand.contains('return') || lowerCommand.contains('way back')) {
      return VoiceCommand.returnPath;
    }

    if (lowerCommand.contains('help') || lowerCommand.contains('guide')) {
      return VoiceCommand.survivalTips;
    }

    if (lowerCommand.contains('location') || lowerCommand.contains('where')) {
      return VoiceCommand.currentLocation;
    }

    if (lowerCommand.contains('compass')) {
      return VoiceCommand.compass;
    }

    return null;
  }

  /// Speak general response
  Future<void> speak(String text) async {
    await _speak(text);
  }

  Future<void> _speak(String text) async {
    try {
      await _textToSpeech.speak(text);
    } catch (e) {
      print('Error speaking: $e');
    }
  }

  String _getLanguageLocale(String languageCode) {
    switch (languageCode) {
      case 'en':
        return 'en-US';
      case 'as':
        return 'as-IN';
      case 'hi':
        return 'hi-IN';
      case 'es':
        return 'es-ES';
      default:
        return 'en-US';
    }
  }

  Future<void> dispose() async {
    await _speechToText.cancel();
    await _textToSpeech.stop();
  }
}

enum VoiceCommand {
  emergency,
  navigate,
  batteryStatus,
  returnPath,
  survivalTips,
  currentLocation,
  compass,
}

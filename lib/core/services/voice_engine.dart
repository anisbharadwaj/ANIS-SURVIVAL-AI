import 'package:flutter_tts/flutter_tts.dart';

class VoiceEngine {
  // Singleton pattern for global application access
  static final VoiceEngine instance = VoiceEngine._init();
  final FlutterTts _flutterTts = FlutterTts();
  bool _isEngineReady = false;

  VoiceEngine._init() {
    _configureAudioHardware();
  }

  Future<void> _configureAudioHardware() async {
    try {
      // Configure hardware constraints for rugged operation
      await _flutterTts.setLanguage("en-US");
      await _flutterTts.setSpeechRate(0.45); // Slightly slower speech for higher clarity under stress
      await _flutterTts.setVolume(1.0);     // Max volume override
      await _flutterTts.setPitch(0.9);      // Lower pitch carries better through environmental noise
      
      // Forces audio to prioritize system voice channels
      await _flutterTts.setAudioAttributes(
        const AudioAttributes(
          usage: AudioAttributesUsage.assistanceNavigationGuidance,
          contentType: AudioAttributesContentType.speech,
        ),
      );
      _isEngineReady = true;
    } catch (e) {
      _isEngineReady = false;
    }
  }

  /// Synthesizes speech completely offline
  Future<void> speakTacticalAlert(String instruction) async {
    if (!_isEngineReady) await _configureAudioHardware();
    if (instruction.isNotEmpty) {
      await _flutterTts.stop(); // Clear previous command queue instantly
      await _flutterTts.speak(instruction);
    }
  }

  Future<void> silenceEngine() async {
    await _flutterTts.stop();
  }
}

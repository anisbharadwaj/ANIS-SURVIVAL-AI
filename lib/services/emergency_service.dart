import 'package:audioplayers/audioplayers.dart';
import 'package:torch_light/torch_light.dart';

class EmergencyService {
  final AudioPlayer _player = AudioPlayer();

  Future<void> triggerSirenLoop() async {
    try {
      await _player.setReleaseMode(ReleaseMode.loop);
      await _player.play(DeviceFileSource('assets/sounds/siren.mp3'));
    } catch (e) {
      // ignore
    }
  }

  Future<void> stopSiren() async => await _player.stop();

  Future<void> flashMorseSOS() async {
    // implement a simple SOS pattern using torch_light
    Future<void> on(Duration d) async {
      try {
        await TorchLight.enableTorch();
        await Future.delayed(d);
        await TorchLight.disableTorch();
      } catch (_) {}
    }

    // ... --- ...
    for (int i = 0; i < 3; i++) {
      await on(Duration(milliseconds: 200));
      await Future.delayed(Duration(milliseconds: 150));
    }
    await Future.delayed(Duration(milliseconds: 300));
    for (int i = 0; i < 3; i++) {
      await on(Duration(milliseconds: 600));
      await Future.delayed(Duration(milliseconds: 150));
    }
    await Future.delayed(Duration(milliseconds: 300));
    for (int i = 0; i < 3; i++) {
      await on(Duration(milliseconds: 200));
      await Future.delayed(Duration(milliseconds: 150));
    }
  }
}

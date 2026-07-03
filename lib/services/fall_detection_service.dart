import 'dart:async';
import 'package:sensors_plus/sensors_plus.dart';

class FallDetectionService {
  StreamSubscription<AccelerometerEvent>? _sub;
  final VoidCallback onFallDetected;
  final VoidCallback onNoMotionDetected;

  bool _moving = true;
  int _lastMove = DateTime.now().millisecondsSinceEpoch;

  FallDetectionService({required this.onFallDetected, required this.onNoMotionDetected});

  void start() {
    _sub = accelerometerEvents.listen((event) {
      final mag = (event.x * event.x + event.y * event.y + event.z * event.z).sqrt();
      // simple threshold
      if (mag > 30) {
        onFallDetected();
      }

      // simple no-motion detection: low variance
      final now = DateTime.now().millisecondsSinceEpoch;
      if (event.x.abs() + event.y.abs() + event.z.abs() > 0.1) {
        _lastMove = now;
        _moving = true;
      } else {
        if (_moving && now - _lastMove > 1000 * 60 * 10) {
          _moving = false;
          onNoMotionDetected();
        }
      }
    });
  }

  void stop() => _sub?.cancel();
}

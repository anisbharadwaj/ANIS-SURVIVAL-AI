import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

import '../services/gps_engine.dart';

final gpsEngine = Provider<GPSEngine>((ref) {
  return GPSEngine();
});

final gpsPositionStream = StreamProvider<Position>((ref) async* {
  final engine = ref.watch(gpsEngine);
  await engine.startTracking();
  yield* engine.positionStream;
});

final gpsHeadingStream = StreamProvider<double>((ref) async* {
  final engine = ref.watch(gpsEngine);
  yield* engine.headingStream;
});

final gpsAltitudeStream = StreamProvider<double>((ref) async* {
  final engine = ref.watch(gpsEngine);
  yield* engine.altitudeStream;
});

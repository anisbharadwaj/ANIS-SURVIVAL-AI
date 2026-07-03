import 'dart:async';
import 'package:geolocator/geolocator.dart';

class GpsService {
  StreamSubscription<Position>? _posSub;

  void start(Function(Position) onData) async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    if (permission == LocationPermission.deniedForever) return;

    LocationSettings settings = LocationSettings(
      accuracy: LocationAccuracy.bestForNavigation,
      distanceFilter: 2,
    );

    _posSub = Geolocator.getPositionStream(locationSettings: settings).listen((pos) {
      onData(pos);
    });
  }

  Future<Position> getCurrent() => Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.bestForNavigation);

  void stop() {
    _posSub?.cancel();
  }
}

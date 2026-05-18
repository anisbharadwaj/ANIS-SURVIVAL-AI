import 'package:geolocator/geolocator.dart';

class GPSService {

  Future<bool> requestPermission() async {

    LocationPermission permission;

    permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    return permission != LocationPermission.deniedForever;
  }

  Stream<Position> getLiveLocation() {

    return Geolocator.getPositionStream(

      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 5,
      ),
    );
  }
}

import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';

class LocationProvider extends ChangeNotifier {
  Position? _current;
  Position? get current => _current;

  void update(Position p) {
    _current = p;
    notifyListeners();
  }
}

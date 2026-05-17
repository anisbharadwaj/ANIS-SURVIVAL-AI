import 'package:flutter/material';
import 'presentation/screens/map/map_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const AnisSurvivalApp());
}

class AnisSurvivalApp extends StatelessWidget {
  const AnisSurvivalApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ANIS SURVIVAL AI',
      theme: ThemeData.dark(),
      debugShowCheckedModeBanner: false,
      home: const MapScreen(), // 📡 Launches straight into your hardware-linked offline tracking array
    );
  }
}

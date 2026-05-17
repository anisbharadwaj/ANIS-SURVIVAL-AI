import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';

void main() {
  runApp(const SurvivalAIApp());
}

class SurvivalAIApp extends StatelessWidget {
  const SurvivalAIApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(

      debugShowCheckedModeBanner: false,

      title: 'ANIS SURVIVAL AI',

      theme: AppTheme.darkTheme,

      home: const Scaffold(
        body: Center(
          child: Text(
            'ANIS SURVIVAL AI',
            style: TextStyle(
              color: Colors.cyanAccent,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

class AnisTheme {
  static const Color neonCyan = Color(0xFF00FFE5);
  static const Color emergencyRed = Color(0xFFFF3B30);

  static final ThemeData theme = ThemeData(
    brightness: Brightness.dark,
    primaryColor: neonCyan,
    scaffoldBackgroundColor: Colors.black,
    colorScheme: ColorScheme.dark(
      primary: neonCyan,
      secondary: emergencyRed,
    ),
    textTheme: TextTheme(
      headlineSmall: TextStyle(color: neonCyan),
      bodyMedium: TextStyle(color: Colors.white70),
    ),
  );
}

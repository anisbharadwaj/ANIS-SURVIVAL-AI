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
      headline6: TextStyle(color: neonCyan),
      bodyText2: TextStyle(color: Colors.white70),
    ),
  );
}

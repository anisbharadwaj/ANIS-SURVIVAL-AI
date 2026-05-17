import 'package:flutter/material.dart';

class AppTheme {

  static ThemeData darkTheme = ThemeData(

    brightness: Brightness.dark,

    scaffoldBackgroundColor: Colors.black,

    primaryColor: Colors.cyanAccent,

    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.black,
      elevation: 0,
    ),

    colorScheme: const ColorScheme.dark(
      primary: Colors.cyanAccent,
      secondary: Colors.blueAccent,
    ),
  );
}

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../../config/theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToHome();
  }

  _navigateToHome() async {
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryColor.withOpacity(0.6),
                    blurRadius: 30,
                    spreadRadius: 10,
                  ),
                ],
              ),
              child: Icon(
                Icons.compass_calibration,
                size: 80,
                color: AppTheme.primaryColor,
              ),
            )
                .animate()
                .scale(duration: const Duration(milliseconds: 800))
                .then()
                .pulse(
                  duration: const Duration(milliseconds: 1500),
                  curve: Curves.easeInOut,
                ),
            const SizedBox(height: 40),
            Text(
              'ANIS',
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    color: AppTheme.primaryColor,
                    letterSpacing: 2,
                  ),
            ).animate().fadeIn(duration: const Duration(milliseconds: 800)),
            const SizedBox(height: 8),
            Text(
              'Navigate. Survive. Anywhere.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppTheme.secondaryColor,
                    letterSpacing: 1,
                  ),
            )
                .animate()
                .fadeIn(delay: const Duration(milliseconds: 400))
                .slideY(begin: 0.3),
            const SizedBox(height: 60),
            SizedBox(
              width: 40,
              height: 40,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(
                  AppTheme.primaryColor.withOpacity(0.7),
                ),
              ),
            ).animate().fadeIn(delay: const Duration(milliseconds: 800)),
            const SizedBox(height: 20),
            Text(
              'Initializing AI Navigation System...',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppTheme.textTertiary,
                  ),
            )
                .animate()
                .fadeIn(delay: const Duration(milliseconds: 1000)),
          ],
        ),
      ),
    );
  }
}

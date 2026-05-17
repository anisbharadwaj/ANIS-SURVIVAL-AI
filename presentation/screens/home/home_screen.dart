import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      appBar: AppBar(
        title: const Text(
          'ANIS SURVIVAL AI',
        ),
      ),

      body: Center(

        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,

          children: [

            const Icon(
              Icons.explore,
              size: 120,
              color: Colors.cyanAccent,
            ),

            const SizedBox(height: 20),

            const Text(
              'Navigate. Survive. Anywhere.',
              style: TextStyle(
                fontSize: 22,
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 40),

            ElevatedButton(

              onPressed: () {},

              child: const Text(
                'START NAVIGATION',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

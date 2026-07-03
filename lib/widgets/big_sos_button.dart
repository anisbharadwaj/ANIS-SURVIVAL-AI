import 'package:flutter/material.dart';

class BigSosButton extends StatelessWidget {
  final VoidCallback onTap;
  const BigSosButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 120,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.secondary,
          shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: Colors.red.withOpacity(0.6), blurRadius: 20, spreadRadius: 4)],
        ),
        child: Center(child: Text('SOS', style: TextStyle(fontSize: 36, color: Colors.white, fontWeight: FontWeight.bold))),
      ),
    );
  }
}

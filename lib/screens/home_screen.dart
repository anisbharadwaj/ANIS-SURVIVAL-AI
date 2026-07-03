import 'package:flutter/material.dart';
import '../widgets/big_sos_button.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('ANIS SURVIVAL AI')),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(child: Center(child: Text('Welcome to ANIS SURVIVAL AI', style: Theme.of(context).textTheme.headline6))),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: BigSosButton(onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => EmergencyScreen()));
              }),
            )
          ],
        ),
      ),
    );
  }
}

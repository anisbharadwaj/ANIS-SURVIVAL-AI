import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DbService {
  static Database? _db;

  static Future<Database> getDb() async {
    if (_db != null) return _db!;
    final databasesPath = await getDatabasesPath();
    final path = join(databasesPath, 'anis_survival.db');
    _db = await openDatabase(path, version: 1, onCreate: (db, v) async {
      await db.execute('''CREATE TABLE checkpoints (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, lat REAL, lon REAL, alt REAL, created_at INTEGER)''');
      await db.execute('''CREATE TABLE locations (id INTEGER PRIMARY KEY AUTOINCREMENT, lat REAL, lon REAL, alt REAL, timestamp INTEGER)''');
      await db.execute('''CREATE TABLE emergency_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, details TEXT, timestamp INTEGER)''');
    });
    return _db!;
  }
}

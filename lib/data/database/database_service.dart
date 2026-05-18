import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/gps_data.dart';

class DatabaseService {
  static final DatabaseService instance = DatabaseService._init();
  static Database? _database;

  DatabaseService._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('anis_survival_tactical.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);
    return await openDatabase(path, version: 1, onCreate: _createDB);
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE breadcrumbs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL NOT NULL,
        speed REAL NOT NULL,
        timestamp TEXT NOT NULL
      )
    ''');
  }

  Future<int> insertBreadcrumb(GpsData data) async {
    final db = await instance.database;
    return await db.insert('breadcrumbs', data.toMap());
  }

  Future<List<GpsData>> getAllBreadcrumbs() async {
    final db = await instance.database;
    final result = await db.query('breadcrumbs', orderBy: 'timestamp ASC');
    return result.map((json) => GpsData.fromMap(json)).toList();
  }

  Future<void> clearTrail() async {
    final db = await instance.database;
    await db.delete('breadcrumbs');
  }
}

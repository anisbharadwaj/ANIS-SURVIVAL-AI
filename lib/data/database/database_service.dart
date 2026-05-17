import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:encrypt/encrypt.dart' as encrypt;

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  static Database? _database;
  static const String _dbName = 'anis_survival.db';
  static const int _dbVersion = 1;

  factory DatabaseService() {
    return _instance;
  }

  DatabaseService._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final String path = join(await getDatabasesPath(), _dbName);
    return await openDatabase(
      path,
      version: _dbVersion,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // GPS Tracks Table
    await db.execute('''
      CREATE TABLE gps_tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL NOT NULL,
        speed REAL NOT NULL,
        heading REAL NOT NULL,
        accuracy REAL NOT NULL,
        timestamp TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');

    // Routes Table
    await db.execute('''
      CREATE TABLE routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        start_lat REAL NOT NULL,
        start_lon REAL NOT NULL,
        end_lat REAL NOT NULL,
        end_lon REAL NOT NULL,
        distance REAL,
        duration INTEGER,
        terrain_type TEXT,
        difficulty_level TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // Checkpoints Table
    await db.execute('''
      CREATE TABLE checkpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_id INTEGER NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL,
        checkpoint_type TEXT,
        name TEXT,
        description TEXT,
        visited INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY(route_id) REFERENCES routes(id) ON DELETE CASCADE
      )
    ''');

    // Emergency Logs Table
    await db.execute('''
      CREATE TABLE emergency_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emergency_type TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL,
        status TEXT,
        sos_message TEXT,
        created_at TEXT NOT NULL,
        resolved_at TEXT
      )
    ''');

    // Downloaded Maps Table
    await db.execute('''
      CREATE TABLE downloaded_maps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        region_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        zoom_level INTEGER,
        downloaded_at TEXT NOT NULL,
        last_accessed TEXT
      )
    ''');

    // User Settings Table
    await db.execute('''
      CREATE TABLE user_settings (
        id INTEGER PRIMARY KEY,
        language TEXT DEFAULT 'en',
        battery_optimization_enabled INTEGER DEFAULT 1,
        voice_guidance_enabled INTEGER DEFAULT 1,
        dark_mode_enabled INTEGER DEFAULT 1,
        gps_polling_interval INTEGER DEFAULT 5000,
        sos_phone_numbers TEXT,
        emergency_contacts TEXT,
        updated_at TEXT NOT NULL
      )
    ''');

    // AI History Table
    await db.execute('''
      CREATE TABLE ai_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        confidence_score REAL,
        created_at TEXT NOT NULL
      )
    ''');

    // Return Paths Table
    await db.execute('''
      CREATE TABLE return_paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        waypoint_index INTEGER NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL,
        created_at TEXT NOT NULL
      )
    ''');

    // Initialize default settings
    await db.insert('user_settings', {
      'id': 1,
      'language': 'en',
      'battery_optimization_enabled': 1,
      'voice_guidance_enabled': 1,
      'dark_mode_enabled': 1,
      'updated_at': DateTime.now().toIso8601String(),
    });
  }

  // GPS Tracks Operations
  Future<int> insertGPSTrack(Map<String, dynamic> track) async {
    final db = await database;
    return await db.insert('gps_tracks', track);
  }

  Future<List<Map<String, dynamic>>> getAllGPSTracks() async {
    final db = await database;
    return await db.query('gps_tracks');
  }

  // Routes Operations
  Future<int> insertRoute(Map<String, dynamic> route) async {
    final db = await database;
    return await db.insert('routes', route);
  }

  Future<List<Map<String, dynamic>>> getAllRoutes() async {
    final db = await database;
    return await db.query('routes');
  }

  // Checkpoints Operations
  Future<int> insertCheckpoint(Map<String, dynamic> checkpoint) async {
    final db = await database;
    return await db.insert('checkpoints', checkpoint);
  }

  // Emergency Logs Operations
  Future<int> insertEmergencyLog(Map<String, dynamic> log) async {
    final db = await database;
    return await db.insert('emergency_logs', log);
  }

  // User Settings Operations
  Future<Map<String, dynamic>?> getUserSettings() async {
    final db = await database;
    final result = await db.query('user_settings', where: 'id = ?', whereArgs: [1]);
    return result.isNotEmpty ? result.first : null;
  }

  Future<int> updateUserSettings(Map<String, dynamic> settings) async {
    final db = await database;
    return await db.update(
      'user_settings',
      {...settings, 'updated_at': DateTime.now().toIso8601String()},
      where: 'id = ?',
      whereArgs: [1],
    );
  }

  Future<void> deleteDatabase() async {
    final String path = join(await getDatabasesPath(), _dbName);
    await deleteDatabase();
  }
}

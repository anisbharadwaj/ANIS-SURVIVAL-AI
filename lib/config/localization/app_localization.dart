import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AppLocalizations {
  late Locale _locale;

  AppLocalizations(Locale locale) {
    _locale = locale;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = [
    AppLocalizations.delegate,
  ];

  static const List<Locale> supportedLocales = [
    Locale('en', 'US'),
    Locale('as', 'IN'),
    Locale('hi', 'IN'),
    Locale('es', 'ES'),
  ];

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  // Navigation & Maps
  String get navigationTitle => _translateKey('navigationTitle');
  String get liveMap => _translateKey('liveMap');
  String get compass => _translateKey('compass');
  String get routeInfo => _translateKey('routeInfo');
  String get distance => _translateKey('distance');
  String get altitude => _translateKey('altitude');
  String get speed => _translateKey('speed');
  String get heading => _translateKey('heading');

  // AI Assistant
  String get aiAssistant => _translateKey('aiAssistant');
  String get askAnything => _translateKey('askAnything');
  String get survivalTips => _translateKey('survivalTips');
  String get terrainAnalysis => _translateKey('terrainAnalysis');

  // Emergency
  String get emergencyMode => _translateKey('emergencyMode');
  String get sosActivated => _translateKey('sosActivated');
  String get alarm => _translateKey('alarm');
  String get sendLocation => _translateKey('sendLocation');
  String get emergencyContacts => _translateKey('emergencyContacts');

  // Trekking
  String get trekking => _translateKey('trekking');
  String get elevation => _translateKey('elevation');
  String get terrain => _translateKey('terrain');
  String get waterSource => _translateKey('waterSource');
  String get campsite => _translateKey('campsite');
  String get dangerZone => _translateKey('dangerZone');

  // Battery
  String get battery => _translateKey('battery');
  String get lowBattery => _translateKey('lowBattery');
  String get ultraLowPower => _translateKey('ultraLowPower');
  String get estimatedSurvivalTime => _translateKey('estimatedSurvivalTime');

  // General
  String get loading => _translateKey('loading');
  String get error => _translateKey('error');
  String get success => _translateKey('success');
  String get cancel => _translateKey('cancel');
  String get save => _translateKey('save');
  String get settings => _translateKey('settings');
  String get language => _translateKey('language');

  String _translateKey(String key) {
    final Map<String, Map<String, String>> translations = {
      'en': {
        'navigationTitle': 'Navigation',
        'liveMap': 'Live Map',
        'compass': 'Compass',
        'routeInfo': 'Route Info',
        'distance': 'Distance',
        'altitude': 'Altitude',
        'speed': 'Speed',
        'heading': 'Heading',
        'aiAssistant': 'AI Assistant',
        'askAnything': 'Ask me anything...',
        'survivalTips': 'Survival Tips',
        'terrainAnalysis': 'Terrain Analysis',
        'emergencyMode': 'Emergency Mode',
        'sosActivated': 'SOS Activated',
        'alarm': 'Alarm',
        'sendLocation': 'Send Location',
        'emergencyContacts': 'Emergency Contacts',
        'trekking': 'Trekking',
        'elevation': 'Elevation',
        'terrain': 'Terrain',
        'waterSource': 'Water Source',
        'campsite': 'Campsite',
        'dangerZone': 'Danger Zone',
        'battery': 'Battery',
        'lowBattery': 'Low Battery',
        'ultraLowPower': 'Ultra Low Power',
        'estimatedSurvivalTime': 'Estimated Survival Time',
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        'cancel': 'Cancel',
        'save': 'Save',
        'settings': 'Settings',
        'language': 'Language',
      },
      'as': {
        'navigationTitle': 'নেভিগেশন',
        'liveMap': 'লাইভ মেপ',
        'compass': 'কম্পাস',
        'routeInfo': 'ৰুট তথ্য',
        'distance': 'দূৰত্ব',
        'altitude': 'উচ্চতা',
        'speed': 'গতি',
        'heading': 'দিক',
        'aiAssistant': 'AI সহায়ক',
        'askAnything': 'যেকোনো কিছু প্ৰশ্ন কৰুন...',
        'survivalTips': 'বেঁচে থকাৰ টিপছ',
        'terrainAnalysis': 'ভূখণ্ড বিশ্লেষণ',
        'emergencyMode': 'জৰুৰী মোড',
        'sosActivated': 'SOS সক্রিয়',
        'alarm': 'সতৰ্কতা',
        'sendLocation': 'অৱস্থান পাঠান',
        'emergencyContacts': 'জৰুৰী পরিচয়',
        'trekking': 'ট্রেকিং',
        'elevation': 'উন্নতি',
        'terrain': 'ভূখণ্ড',
        'waterSource': 'পানীয় জলৰ উৎস',
        'campsite': 'শিবিৰ স্থান',
        'dangerZone': 'বিপদজনক অঞ্চল',
        'battery': 'ব্যাটেৰী',
        'lowBattery': 'কম ব্যাটেৰী',
        'ultraLowPower': 'অতি কম শক্তি',
        'estimatedSurvivalTime': 'অনুমানিত জীৱন কাল',
        'loading': 'লোড হচ্ছে...',
        'error': 'ত্রুটি',
        'success': 'সফল',
        'cancel': 'বাতিল',
        'save': 'সংৰক্ষণ কৰুন',
        'settings': 'সেটিংস',
        'language': 'ভাষা',
      },
      'hi': {
        'navigationTitle': 'नेविगेशन',
        'liveMap': 'लाइव मानचित्र',
        'compass': 'कम्पास',
        'routeInfo': 'रूट जानकारी',
        'distance': 'दूरी',
        'altitude': 'ऊंचाई',
        'speed': 'गति',
        'heading': 'दिशा',
        'aiAssistant': 'AI सहायक',
        'askAnything': 'कुछ भी पूछें...',
        'survivalTips': 'जीवन रक्षा सुझाव',
        'terrainAnalysis': 'इलाके का विश्लेषण',
        'emergencyMode': 'आपातकालीन मोड',
        'sosActivated': 'SOS सक्रिय',
        'alarm': 'अलर्ट',
        'sendLocation': 'स्थान भेजें',
        'emergencyContacts': 'आपातकालीन संपर्क',
        'trekking': 'ट्रेकिंग',
        'elevation': 'ऊंचाई',
        'terrain': 'इलाका',
        'waterSource': 'जल स्रोत',
        'campsite': 'शिविर स्थल',
        'dangerZone': 'खतरे का क्षेत्र',
        'battery': 'बैटरी',
        'lowBattery': 'कम बैटरी',
        'ultraLowPower': 'अल्ट्रा लो पावर',
        'estimatedSurvivalTime': 'अनुमानित जीवन काल',
        'loading': 'लोड हो रहा है...',
        'error': 'त्रुटि',
        'success': 'सफल',
        'cancel': 'रद्द करें',
        'save': 'सहेजें',
        'settings': 'सेटिंग्स',
        'language': 'भाषा',
      },
      'es': {
        'navigationTitle': 'Navegación',
        'liveMap': 'Mapa en Vivo',
        'compass': 'Brújula',
        'routeInfo': 'Información de Ruta',
        'distance': 'Distancia',
        'altitude': 'Altitud',
        'speed': 'Velocidad',
        'heading': 'Dirección',
        'aiAssistant': 'Asistente IA',
        'askAnything': 'Pregunta algo...',
        'survivalTips': 'Consejos de Supervivencia',
        'terrainAnalysis': 'Análisis de Terreno',
        'emergencyMode': 'Modo Emergencia',
        'sosActivated': 'SOS Activado',
        'alarm': 'Alarma',
        'sendLocation': 'Enviar Ubicación',
        'emergencyContacts': 'Contactos de Emergencia',
        'trekking': 'Senderismo',
        'elevation': 'Elevación',
        'terrain': 'Terreno',
        'waterSource': 'Fuente de Agua',
        'campsite': 'Campamento',
        'dangerZone': 'Zona de Peligro',
        'battery': 'Batería',
        'lowBattery': 'Batería Baja',
        'ultraLowPower': 'Potencia Ultra Baja',
        'estimatedSurvivalTime': 'Tiempo de Supervivencia Estimado',
        'loading': 'Cargando...',
        'error': 'Error',
        'success': 'Éxito',
        'cancel': 'Cancelar',
        'save': 'Guardar',
        'settings': 'Configuración',
        'language': 'Idioma',
      },
    };

    return translations[_locale.languageCode]?[key] ?? key;
  }
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return AppLocalizations.supportedLocales
        .any((Locale l) => l.languageCode == locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

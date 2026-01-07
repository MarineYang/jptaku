class UserSettings {
  final bool notificationEnabled;
  final String? dailyReminderTime;
  final double preferredVoiceSpeed;
  final bool showRomaji;
  final bool showTranslation;

  UserSettings({
    this.notificationEnabled = false,
    this.dailyReminderTime,
    this.preferredVoiceSpeed = 1.0,
    this.showRomaji = true,
    this.showTranslation = true,
  });

  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      notificationEnabled: json['notification_enabled'] ?? false,
      dailyReminderTime: json['daily_reminder_time'],
      preferredVoiceSpeed: (json['preferred_voice_speed'] ?? 1.0).toDouble(),
      showRomaji: json['show_romaji'] ?? true,
      showTranslation: json['show_translation'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'notification_enabled': notificationEnabled,
        'daily_reminder_time': dailyReminderTime,
        'preferred_voice_speed': preferredVoiceSpeed,
        'show_romaji': showRomaji,
        'show_translation': showTranslation,
      };

  UserSettings copyWith({
    bool? notificationEnabled,
    String? dailyReminderTime,
    double? preferredVoiceSpeed,
    bool? showRomaji,
    bool? showTranslation,
  }) {
    return UserSettings(
      notificationEnabled: notificationEnabled ?? this.notificationEnabled,
      dailyReminderTime: dailyReminderTime ?? this.dailyReminderTime,
      preferredVoiceSpeed: preferredVoiceSpeed ?? this.preferredVoiceSpeed,
      showRomaji: showRomaji ?? this.showRomaji,
      showTranslation: showTranslation ?? this.showTranslation,
    );
  }
}

class User {
  final int id;
  final String email;
  final String? name;
  final String? avatarUrl;
  final DateTime? createdAt;

  User({
    required this.id,
    required this.email,
    this.name,
    this.avatarUrl,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'] ?? '',
      name: json['name'],
      avatarUrl: json['avatar_url'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'avatar_url': avatarUrl,
        'created_at': createdAt?.toIso8601String(),
      };

  User copyWith({
    int? id,
    String? email,
    String? name,
    String? avatarUrl,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

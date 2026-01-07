class AppConstants {
  static const String appName = '일타쿠';
  static const String appTagline = '오타쿠를 위한 일본어 학습 앱';

  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String isOnboardedKey = 'is_onboarded';
  static const String userDataKey = 'user_data';

  // Category codes
  static const Map<int, String> categoryNames = {
    1: '애니메이션',
    2: '게임',
    3: '음악',
    4: '영화',
    5: '드라마',
  };

  // Level codes
  static const Map<int, String> levelNames = {
    3: 'N3',
    4: 'N4',
    5: 'N5',
  };
}

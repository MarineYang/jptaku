import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/sentence_model.dart';
import '../models/user_model.dart';
import '../../core/constants/app_constants.dart';

class ApiService {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    final baseUrl = dotenv.env['API_URL'] ?? 'http://localhost:30001';

    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: AppConstants.accessTokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Try to refresh token
          final refreshed = await _refreshToken();
          if (refreshed) {
            // Retry the request
            final token = await _storage.read(key: AppConstants.accessTokenKey);
            error.requestOptions.headers['Authorization'] = 'Bearer $token';
            final response = await _dio.fetch(error.requestOptions);
            return handler.resolve(response);
          } else {
            // Clear tokens
            await _storage.delete(key: AppConstants.accessTokenKey);
            await _storage.delete(key: AppConstants.refreshTokenKey);
          }
        }
        return handler.next(error);
      },
    ));
  }

  /// Helper to extract data from server response { success: true, data: {...} }
  dynamic _extractData(Response response) {
    final responseData = response.data;
    if (responseData is Map && responseData.containsKey('data')) {
      return responseData['data'];
    }
    return responseData;
  }

  // ==================== Auth ====================

  /// Get Google OAuth URL for login
  Future<String?> getGoogleOAuthUrl() async {
    try {
      final response = await _dio.get('/api/auth/google', queryParameters: {
        'state': 'mobile',
      });
      final data = _extractData(response);
      return data?['url'];
    } catch (e) {
      return null;
    }
  }

  /// Save tokens after OAuth callback
  Future<bool> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    try {
      await _storage.write(key: AppConstants.accessTokenKey, value: accessToken);
      await _storage.write(key: AppConstants.refreshTokenKey, value: refreshToken);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Refresh access token
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken == null) return false;

      final response = await _dio.post('/api/auth/refresh', data: {
        'refresh_token': refreshToken,
      });

      final data = _extractData(response);
      final newAccessToken = data['access_token'];
      final newRefreshToken = data['refresh_token'];

      await _storage.write(key: AppConstants.accessTokenKey, value: newAccessToken);
      await _storage.write(key: AppConstants.refreshTokenKey, value: newRefreshToken);

      return true;
    } catch (e) {
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await _dio.post('/api/auth/logout');
    } catch (e) {
      // Ignore error
    } finally {
      await _storage.delete(key: AppConstants.accessTokenKey);
      await _storage.delete(key: AppConstants.refreshTokenKey);
    }
  }

  // ==================== User ====================

  /// Get current user info
  Future<User?> getMe() async {
    try {
      final response = await _dio.get('/api/user/me');
      final data = _extractData(response);
      return User.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  /// Update user profile
  Future<User?> updateProfile({required String name}) async {
    try {
      final response = await _dio.put('/api/user/profile', data: {
        'name': name,
      });
      final data = _extractData(response);
      return User.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  /// Submit onboarding info
  Future<bool> submitOnboarding({
    required List<int> categories,
    required int level,
  }) async {
    try {
      await _dio.post('/api/user/onboarding', data: {
        'categories': categories,
        'level': level,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Get user settings
  Future<UserSettings?> getSettings() async {
    try {
      final response = await _dio.get('/api/user/settings');
      final data = _extractData(response);
      return UserSettings.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  /// Update user settings
  Future<bool> updateSettings(UserSettings settings) async {
    try {
      await _dio.put('/api/user/settings', data: settings.toJson());
      return true;
    } catch (e) {
      return false;
    }
  }

  // ==================== Sentences ====================

  /// Get today's 5 sentences
  Future<DailySentencesResponse?> getTodaySentences() async {
    try {
      final response = await _dio.get('/api/sentences/today');
      final data = _extractData(response);
      return DailySentencesResponse.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  /// Get sentence history
  Future<List<DailySentencesResponse>> getSentenceHistory({
    int page = 1,
    int perPage = 10,
  }) async {
    try {
      final response = await _dio.get('/api/sentences/history', queryParameters: {
        'page': page,
        'per_page': perPage,
      });
      final data = _extractData(response);
      if (data is List) {
        return data.map((e) => DailySentencesResponse.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // ==================== Learning ====================

  /// Update learning progress
  Future<bool> updateLearningProgress({
    required int sentenceId,
    required int dailySetId,
    bool? understand,
    bool? speak,
    bool? confirm,
    bool? memorized,
  }) async {
    try {
      await _dio.post('/api/learning/progress', data: {
        'sentence_id': sentenceId,
        'daily_set_id': dailySetId,
        if (understand != null) 'understand': understand,
        if (speak != null) 'speak': speak,
        if (confirm != null) 'confirm': confirm,
        if (memorized != null) 'memorized': memorized,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Submit quiz answer
  Future<QuizResult?> submitQuizAnswer({
    required int sentenceId,
    required int dailySetId,
    String? fillBlankAnswer,
    List<int>? orderingAnswer,
  }) async {
    try {
      final response = await _dio.post('/api/learning/quiz', data: {
        'sentence_id': sentenceId,
        'daily_set_id': dailySetId,
        if (fillBlankAnswer != null) 'fill_blank_answer': fillBlankAnswer,
        if (orderingAnswer != null) 'ordering_answer': orderingAnswer,
      });
      final data = _extractData(response);
      return QuizResult.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  /// Get today's learning progress
  Future<List<LearningProgress>> getTodayLearningProgress(int dailySetId) async {
    try {
      final response = await _dio.get('/api/learning/today', queryParameters: {
        'daily_set_id': dailySetId,
      });
      final data = _extractData(response);
      if (data is List) {
        return data.map((e) => LearningProgress.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Get learning history
  Future<List<LearningProgress>> getLearningHistory({
    int page = 1,
    int perPage = 20,
  }) async {
    try {
      final response = await _dio.get('/api/learning/history', queryParameters: {
        'page': page,
        'per_page': perPage,
      });
      final data = _extractData(response);
      if (data is List) {
        return data.map((e) => LearningProgress.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // ==================== Flash ====================

  /// Get today's flash sentences
  Future<TodayFlashResponse?> getTodayFlash() async {
    try {
      final response = await _dio.get('/api/flash/today');
      final data = _extractData(response);
      return TodayFlashResponse.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  /// Update flash progress
  Future<bool> updateFlashProgress({
    required int sentenceId,
    required String grade, // 'bad', 'mid', 'good'
  }) async {
    try {
      await _dio.post('/api/flash/progress', data: {
        'sentence_id': sentenceId,
        'grade': grade,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  // ==================== Chat ====================

  /// Create chat session
  Future<ChatSession?> createChatSession({
    required String topic,
    String? topicDetail,
  }) async {
    try {
      final response = await _dio.post('/api/chat/session', data: {
        'topic': topic,
        if (topicDetail != null) 'topic_detail': topicDetail,
      });
      final data = _extractData(response);
      return ChatSession.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  /// Get chat session
  Future<ChatSession?> getChatSession(int sessionId) async {
    try {
      final response = await _dio.get('/api/chat/session/$sessionId');
      final data = _extractData(response);
      return ChatSession.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  /// End chat session
  Future<bool> endChatSession(int sessionId) async {
    try {
      await _dio.post('/api/chat/session/$sessionId/end');
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Send message with SSE streaming
  Stream<String> sendMessageStream({
    required int sessionId,
    required String message,
  }) async* {
    try {
      final token = await _storage.read(key: AppConstants.accessTokenKey);

      final response = await _dio.post(
        '/api/chat/session/$sessionId/message',
        data: {'message': message},
        options: Options(
          responseType: ResponseType.stream,
          headers: {
            'Accept': 'text/event-stream',
            'Authorization': 'Bearer $token',
          },
        ),
      );

      final stream = response.data.stream as Stream<List<int>>;
      String buffer = '';

      await for (final chunk in stream) {
        buffer += utf8.decode(chunk);

        while (buffer.contains('\n\n')) {
          final index = buffer.indexOf('\n\n');
          final eventData = buffer.substring(0, index);
          buffer = buffer.substring(index + 2);

          for (final line in eventData.split('\n')) {
            if (line.startsWith('data: ')) {
              final data = line.substring(6);
              if (data != '[DONE]') {
                yield data;
              }
            }
          }
        }
      }
    } catch (e) {
      yield '[ERROR]';
    }
  }

  /// Get chat sessions list
  Future<List<ChatSession>> getChatSessions({
    int page = 1,
    int perPage = 20,
  }) async {
    try {
      final response = await _dio.get('/api/chat/sessions', queryParameters: {
        'page': page,
        'per_page': perPage,
      });
      final data = _extractData(response);
      if (data is List) {
        return data.map((e) => ChatSession.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // ==================== Feedback ====================

  /// Get feedback for session
  Future<Feedback?> getFeedback(int sessionId) async {
    try {
      final response = await _dio.get('/api/feedback/$sessionId');
      final data = _extractData(response);
      return Feedback.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  // ==================== Stats ====================

  /// Get today's stats
  Future<TodayStats?> getTodayStats() async {
    try {
      final response = await _dio.get('/api/stats/today');
      final data = _extractData(response);
      return TodayStats.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  /// Get category progress
  Future<List<CategoryProgress>> getCategoryProgress() async {
    try {
      final response = await _dio.get('/api/stats/categories');
      final data = _extractData(response);
      if (data is List) {
        return data.map((e) => CategoryProgress.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Get weekly stats
  Future<WeeklyStats?> getWeeklyStats() async {
    try {
      final response = await _dio.get('/api/stats/weekly');
      final data = _extractData(response);
      return WeeklyStats.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  // ==================== Audio ====================

  /// Get audio URL
  String getAudioUrl(String filename) {
    final baseUrl = dotenv.env['API_URL'] ?? 'http://localhost:30001';
    return '$baseUrl/api/audio/$filename';
  }
}

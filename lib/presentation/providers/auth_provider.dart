import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/app_constants.dart';
import '../../data/models/user_model.dart';
import '../../data/models/sentence_model.dart';
import '../../data/services/api_service.dart';

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

final storageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

class AuthState {
  final bool isLoading;
  final bool isLoggedIn;
  final bool isOnboarded;
  final User? user;
  final UserSettings? settings;
  final TodayStats? stats;
  final String? error;

  AuthState({
    this.isLoading = false,
    this.isLoggedIn = false,
    this.isOnboarded = false,
    this.user,
    this.settings,
    this.stats,
    this.error,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isLoggedIn,
    bool? isOnboarded,
    User? user,
    UserSettings? settings,
    TodayStats? stats,
    String? error,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      isOnboarded: isOnboarded ?? this.isOnboarded,
      user: user ?? this.user,
      settings: settings ?? this.settings,
      stats: stats ?? this.stats,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _apiService;
  final FlutterSecureStorage _storage;

  AuthNotifier(this._apiService, this._storage) : super(AuthState());

  /// Initialize auth state on app start
  Future<void> initialize() async {
    state = state.copyWith(isLoading: true);

    try {
      final token = await _storage.read(key: AppConstants.accessTokenKey);
      final prefs = await SharedPreferences.getInstance();
      final isOnboarded = prefs.getBool(AppConstants.isOnboardedKey) ?? false;

      if (token != null) {
        final user = await _apiService.getMe();
        if (user != null) {
          final settings = await _apiService.getSettings();
          final stats = await _apiService.getTodayStats();

          state = state.copyWith(
            isLoading: false,
            isLoggedIn: true,
            isOnboarded: isOnboarded,
            user: user,
            settings: settings,
            stats: stats,
          );
          return;
        }
      }

      state = state.copyWith(
        isLoading: false,
        isLoggedIn: false,
        isOnboarded: isOnboarded,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isLoggedIn: false,
        error: e.toString(),
      );
    }
  }

  /// Check auth status after login
  Future<void> checkAuth() async {
    state = state.copyWith(isLoading: true);

    try {
      final user = await _apiService.getMe();
      final prefs = await SharedPreferences.getInstance();
      final isOnboarded = prefs.getBool(AppConstants.isOnboardedKey) ?? false;

      if (user != null) {
        final settings = await _apiService.getSettings();
        final stats = await _apiService.getTodayStats();

        state = state.copyWith(
          isLoading: false,
          isLoggedIn: true,
          isOnboarded: isOnboarded,
          user: user,
          settings: settings,
          stats: stats,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          isLoggedIn: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isLoggedIn: false,
        error: e.toString(),
      );
    }
  }

  /// Complete onboarding
  Future<bool> completeOnboarding({
    required List<int> categories,
    required int level,
  }) async {
    state = state.copyWith(isLoading: true);

    try {
      final success = await _apiService.submitOnboarding(
        categories: categories,
        level: level,
      );

      if (success) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool(AppConstants.isOnboardedKey, true);

        final user = await _apiService.getMe();
        final stats = await _apiService.getTodayStats();

        state = state.copyWith(
          isLoading: false,
          isOnboarded: true,
          user: user,
          stats: stats,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: '온보딩 저장에 실패했습니다.',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Update user settings
  Future<bool> updateSettings(UserSettings settings) async {
    try {
      final success = await _apiService.updateSettings(settings);
      if (success) {
        state = state.copyWith(settings: settings);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Update user profile
  Future<bool> updateProfile({required String name}) async {
    try {
      final updatedUser = await _apiService.updateProfile(name: name);
      if (updatedUser != null) {
        state = state.copyWith(user: updatedUser);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Refresh stats
  Future<void> refreshStats() async {
    try {
      final stats = await _apiService.getTodayStats();
      if (stats != null) {
        state = state.copyWith(stats: stats);
      }
    } catch (e) {
      // Ignore error
    }
  }

  /// Logout
  Future<void> logout() async {
    await _apiService.logout();
    state = AuthState(isOnboarded: state.isOnboarded);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(apiServiceProvider),
    ref.watch(storageProvider),
  );
});

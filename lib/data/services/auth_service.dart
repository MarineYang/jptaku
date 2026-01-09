import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/app_constants.dart';
import 'api_service.dart';

class AuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final ApiService _apiService;

  AuthService(this._apiService);

  /// Sign in with Google
  Future<bool> signInWithGoogle() async {
    try {
      // 1. Google SDK로 로그인
      final account = await _googleSignIn.signIn();
      if (account == null) {
        // User cancelled
        return false;
      }

      final auth = await account.authentication;
      final idToken = auth.idToken;

      if (idToken == null) {
        return false;
      }

      // 2. 백엔드에 ID Token 전송
      final tokens = await _apiService.signInWithGoogleToken(idToken);
      if (tokens == null) {
        return false;
      }

      // 3. JWT 토큰 저장
      await _storage.write(
        key: AppConstants.accessTokenKey,
        value: tokens['access_token'],
      );
      await _storage.write(
        key: AppConstants.refreshTokenKey,
        value: tokens['refresh_token'],
      );

      return true;
    } catch (e) {
      return false;
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
      await _apiService.logout();
    } catch (e) {
      // Ignore error
    }
  }

  /// Check if user is signed in
  Future<bool> isSignedIn() async {
    final token = await _storage.read(key: AppConstants.accessTokenKey);
    return token != null;
  }

  /// Get current Google account
  GoogleSignInAccount? get currentUser => _googleSignIn.currentUser;
}

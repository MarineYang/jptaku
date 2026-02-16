import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  bool _isLoading = false;

  Future<void> _handleGoogleLogin() async {
    setState(() => _isLoading = true);

    try {
      final googleSignIn = GoogleSignIn(
        scopes: ['email', 'profile'],
        serverClientId: dotenv.env['WEB_CLIENT_ID'],
      );

      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        // User cancelled
        setState(() => _isLoading = false);
        return;
      }

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Google 인증 토큰을 가져올 수 없습니다.')),
          );
        }
        setState(() => _isLoading = false);
        return;
      }

      final apiService = ref.read(apiServiceProvider);
      final result = await apiService.loginWithGoogleIdToken(idToken);

      if (result == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('서버 로그인에 실패했습니다.')),
          );
        }
        setState(() => _isLoading = false);
        return;
      }

      await ref.read(authProvider.notifier).checkAuth();

      if (mounted) {
        final authState = ref.read(authProvider);
        if (authState.isLoggedIn) {
          if (authState.isOnboarded) {
            context.go('/home');
          } else {
            context.go('/onboarding');
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('로그인 실패: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Logo Section
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 16,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          '日',
                          style: TextStyle(
                            fontSize: 40,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      '일타쿠',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppColors.gray900,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      '오타쿠를 위한\n일본어 학습 앱',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.gray500,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Login Button Section
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 48),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: OutlinedButton(
                      onPressed: _isLoading ? null : _handleGoogleLogin,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.gray200),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.primary,
                              ),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'G',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.gray900,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                const Text(
                                  'Google로 로그인',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: AppColors.gray900,
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    '로그인 시 서비스 이용약관에 동의하게 됩니다.',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.gray400,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

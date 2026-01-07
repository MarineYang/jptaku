import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
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
      final apiService = ref.read(apiServiceProvider);
      final oauthUrl = await apiService.getGoogleOAuthUrl();

      if (oauthUrl == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('로그인 URL을 가져올 수 없습니다.')),
          );
        }
        setState(() => _isLoading = false);
        return;
      }

      if (mounted) {
        final result = await Navigator.push<Map<String, String>>(
          context,
          MaterialPageRoute(
            builder: (context) => OAuthWebViewScreen(initialUrl: oauthUrl),
          ),
        );

        if (result != null && mounted) {
          final accessToken = result['access_token'];
          final refreshToken = result['refresh_token'];

          if (accessToken != null && refreshToken != null) {
            await apiService.saveTokens(
              accessToken: accessToken,
              refreshToken: refreshToken,
            );

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

// OAuth WebView Screen
class OAuthWebViewScreen extends StatefulWidget {
  final String initialUrl;

  const OAuthWebViewScreen({super.key, required this.initialUrl});

  @override
  State<OAuthWebViewScreen> createState() => _OAuthWebViewScreenState();
}

class _OAuthWebViewScreenState extends State<OAuthWebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() => _isLoading = true);
          },
          onPageFinished: (String url) {
            setState(() => _isLoading = false);
          },
          onNavigationRequest: (NavigationRequest request) {
            final uri = Uri.parse(request.url);

            // Check for deep link callback (jptaku://)
            if (uri.scheme == 'jptaku') {
              final accessToken = uri.queryParameters['access_token'];
              final refreshToken = uri.queryParameters['refresh_token'];

              if (accessToken != null && refreshToken != null) {
                Navigator.pop(context, {
                  'access_token': accessToken,
                  'refresh_token': refreshToken,
                });
              } else {
                Navigator.pop(context);
              }
              return NavigationDecision.prevent;
            }

            // Check for callback URL with tokens in query params
            if (uri.path.contains('/callback') ||
                uri.queryParameters.containsKey('access_token')) {
              final accessToken = uri.queryParameters['access_token'];
              final refreshToken = uri.queryParameters['refresh_token'];

              if (accessToken != null && refreshToken != null) {
                Navigator.pop(context, {
                  'access_token': accessToken,
                  'refresh_token': refreshToken,
                });
                return NavigationDecision.prevent;
              }
            }

            return NavigationDecision.navigate;
          },
          onWebResourceError: (WebResourceError error) {
            // Handle deep link scheme errors silently
            if (error.description.contains('jptaku://')) {
              return;
            }
            debugPrint('WebView error: ${error.description}');
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.initialUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Google 로그인',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}

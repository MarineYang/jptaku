import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../presentation/providers/auth_provider.dart';
import '../presentation/screens/login/login_screen.dart';
import '../presentation/screens/onboarding/onboarding_screen.dart';
import '../presentation/screens/main/main_screen.dart';
import '../presentation/screens/sentence_detail/sentence_detail_screen.dart';
import '../presentation/screens/conversation/conversation_screen.dart';
import '../presentation/screens/feedback/feedback_screen.dart';
import '../presentation/screens/home/home_screen.dart';
import '../presentation/screens/mypage/mypage_screen.dart';
import '../presentation/screens/flash/flash_card_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    initialLocation: '/login',
    refreshListenable: RouterRefreshNotifier(ref),
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isLoggedIn = authState.isLoggedIn;
      final isOnboarded = authState.isOnboarded;
      final isLoading = authState.isLoading;

      final loggingIn = state.matchedLocation == '/login';
      final onboarding = state.matchedLocation == '/onboarding';

      // 로딩 중이면 리다이렉트하지 않음
      if (isLoading) return null;

      // 로그인하지 않은 경우
      if (!isLoggedIn) {
        return loggingIn ? null : '/login';
      }

      // 로그인했지만 온보딩 안함
      if (!isOnboarded) {
        return onboarding ? null : '/onboarding';
      }

      // 로그인 + 온보딩 완료 상태에서 로그인/온보딩 페이지 접근 시
      if (loggingIn || onboarding) {
        return '/home';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainScreen(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/stats',
                builder: (context, state) => const StatsPlaceholder(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/mypage',
                builder: (context, state) => MyPageScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/sentence/:id',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return SentenceDetailScreen(sentenceId: id);
        },
      ),
      GoRoute(
        path: '/conversation',
        builder: (context, state) => const ConversationScreen(),
      ),
      GoRoute(
        path: '/feedback/:sessionId',
        builder: (context, state) {
          final sessionId = int.parse(state.pathParameters['sessionId']!);
          return FeedbackScreen(sessionId: sessionId);
        },
      ),
      GoRoute(
        path: '/flash',
        builder: (context, state) => const FlashCardScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text('페이지를 찾을 수 없습니다: ${state.matchedLocation}'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              child: const Text('홈으로'),
            ),
          ],
        ),
      ),
    ),
  );

  return router;
});

/// Notifier to refresh router when auth state changes
class RouterRefreshNotifier extends ChangeNotifier {
  RouterRefreshNotifier(this._ref) {
    _ref.listen(authProvider, (_, __) {
      notifyListeners();
    });
  }

  final Ref _ref;
}

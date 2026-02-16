import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';

class MainScreen extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainScreen({
    super.key,
    required this.navigationShell,
  });

  void _onTap(BuildContext context, int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(color: AppColors.gray100),
          ),
        ),
        child: MediaQuery.removePadding(
          context: context,
          removeBottom: true,
          child: SizedBox(
            height: 56,
            child: BottomNavigationBar(
              currentIndex: navigationShell.currentIndex,
              onTap: (index) => _onTap(context, index),
              backgroundColor: Colors.white,
              elevation: 0,
              type: BottomNavigationBarType.fixed,
              selectedItemColor: AppColors.primary,
              unselectedItemColor: AppColors.gray400,
              selectedFontSize: 10,
              unselectedFontSize: 10,
              selectedLabelStyle: const TextStyle(
                fontWeight: FontWeight.w500,
                height: 1.2,
              ),
              unselectedLabelStyle: const TextStyle(
                height: 1.2,
              ),
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.home_outlined, size: 24),
                  activeIcon: Icon(Icons.home, size: 24),
                  label: '홈',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.analytics_outlined, size: 24),
                  activeIcon: Icon(Icons.analytics, size: 24),
                  label: '통계',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.person_outline, size: 24),
                  activeIcon: Icon(Icons.person, size: 24),
                  label: '마이',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class StatsPlaceholder extends StatelessWidget {
  const StatsPlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Icon(
                Icons.analytics_outlined,
                size: 64,
                color: AppColors.gray300,
              ),
              SizedBox(height: 16),
              Text(
                '통계 기능 준비 중',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.gray500,
                ),
              ),
              SizedBox(height: 8),
              Text(
                '곧 학습 통계를 확인할 수 있어요',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.gray400,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

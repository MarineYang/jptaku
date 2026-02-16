import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/user_model.dart';
import '../../providers/auth_provider.dart';

class MyPageScreen extends ConsumerStatefulWidget {
  const MyPageScreen({super.key});

  @override
  ConsumerState<MyPageScreen> createState() => _MyPageScreenState();
}

class _MyPageScreenState extends ConsumerState<MyPageScreen> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final settings = authState.settings;
    final stats = authState.stats;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Profile Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: Colors.white,
                ),
                child: Column(
                  children: [
                    // Avatar
                    CircleAvatar(
                      radius: 48,
                      backgroundColor: AppColors.primary,
                      backgroundImage: user?.avatarUrl != null
                          ? NetworkImage(user!.avatarUrl!)
                          : null,
                      child: user?.avatarUrl == null
                          ? Text(
                              user?.name?.substring(0, 1) ?? '?',
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            )
                          : null,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user?.name ?? '학습자',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.gray900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.email ?? '',
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.gray500,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Level & Categories
                    if (user?.onboarding != null) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              user!.onboarding!.levelName,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          ...user.onboarding!.categoryNames.map((name) => Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.gray100,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                name,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.gray700,
                                ),
                              ),
                            ),
                          )),
                        ],
                      ),
                      const SizedBox(height: 4),
                    ],
                    const SizedBox(height: 12),
                    // Stats
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildStatItem('학습', '${stats?.totalStudyDays ?? 0}일'),
                        Container(
                          width: 1,
                          height: 40,
                          color: AppColors.gray200,
                          margin: const EdgeInsets.symmetric(horizontal: 24),
                        ),
                        _buildStatItem('문장', '${stats?.totalSentencesUsed ?? 0}개'),
                        Container(
                          width: 1,
                          height: 40,
                          color: AppColors.gray200,
                          margin: const EdgeInsets.symmetric(horizontal: 24),
                        ),
                        _buildStatItem('대화', '${stats?.totalSessions ?? 0}회'),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Learning Settings
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '학습 설정',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.gray500,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          _buildMenuItem(
                            icon: Icons.school,
                            title: '난이도 변경',
                            trailing: Text(
                              user?.onboarding?.levelName ?? 'N5',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary,
                              ),
                            ),
                            onTap: () => _showLevelChangeDialog(user?.onboarding?.level ?? 5),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Display Settings
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '표시 설정',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.gray500,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          _buildSwitchItem(
                            icon: Icons.text_fields,
                            title: '로마자 표시',
                            value: settings?.showRomaji ?? true,
                            onChanged: (value) {
                              if (settings != null) {
                                ref.read(authProvider.notifier).updateSettings(
                                      settings.copyWith(showRomaji: value),
                                    );
                              }
                            },
                          ),
                          Container(
                            height: 1,
                            color: AppColors.gray100,
                            margin: const EdgeInsets.symmetric(horizontal: 16),
                          ),
                          _buildSwitchItem(
                            icon: Icons.translate,
                            title: '번역 표시',
                            value: settings?.showTranslation ?? true,
                            onChanged: (value) {
                              if (settings != null) {
                                ref.read(authProvider.notifier).updateSettings(
                                      settings.copyWith(showTranslation: value),
                                    );
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Notification Settings
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '알림 설정',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.gray500,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          _buildSwitchItem(
                            icon: Icons.notifications_outlined,
                            title: '학습 알림',
                            value: settings?.notificationEnabled ?? false,
                            onChanged: (value) {
                              if (settings != null) {
                                ref.read(authProvider.notifier).updateSettings(
                                      settings.copyWith(
                                          notificationEnabled: value),
                                    );
                              }
                            },
                          ),
                          if (settings?.notificationEnabled == true) ...[
                            Container(
                              height: 1,
                              color: AppColors.gray100,
                              margin:
                                  const EdgeInsets.symmetric(horizontal: 16),
                            ),
                            ListTile(
                              leading: const Icon(
                                Icons.access_time,
                                color: AppColors.gray500,
                              ),
                              title: const Text('알림 시간'),
                              trailing: Text(
                                settings?.dailyReminderTime ?? '09:00',
                                style: const TextStyle(
                                  color: AppColors.gray500,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Account Menu
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      _buildMenuItem(
                        icon: Icons.help_outline,
                        title: '도움말',
                        onTap: () {
                          // TODO: Help
                        },
                      ),
                      Container(
                        height: 1,
                        color: AppColors.gray100,
                        margin: const EdgeInsets.symmetric(horizontal: 16),
                      ),
                      _buildMenuItem(
                        icon: Icons.info_outline,
                        title: '앱 정보',
                        onTap: () {
                          // TODO: About
                        },
                      ),
                      Container(
                        height: 1,
                        color: AppColors.gray100,
                        margin: const EdgeInsets.symmetric(horizontal: 16),
                      ),
                      _buildMenuItem(
                        icon: Icons.logout,
                        title: '로그아웃',
                        isDestructive: true,
                        onTap: () async {
                          final confirmed = await showDialog<bool>(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: const Text('로그아웃'),
                              content: const Text('정말 로그아웃하시겠습니까?'),
                              actions: [
                                TextButton(
                                  onPressed: () =>
                                      Navigator.pop(context, false),
                                  child: const Text('취소'),
                                ),
                                TextButton(
                                  onPressed: () => Navigator.pop(context, true),
                                  child: const Text(
                                    '로그아웃',
                                    style: TextStyle(color: AppColors.error),
                                  ),
                                ),
                              ],
                            ),
                          );

                          if (confirmed == true) {
                            await ref.read(authProvider.notifier).logout();
                            if (context.mounted) {
                              context.go('/login');
                            }
                          }
                        },
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Version
              const Text(
                'v1.0.0',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.gray400,
                ),
              ),

              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
    );
  }

  void _showLevelChangeDialog(int currentLevel) {
    int selectedLevel = currentLevel;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('난이도 변경'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                '학습 난이도를 선택해주세요',
                style: TextStyle(fontSize: 14, color: AppColors.gray500),
              ),
              const SizedBox(height: 16),
              ...[
                {'level': 5, 'name': 'N5', 'desc': '입문 (히라가나, 기본 인사)'},
                {'level': 4, 'name': 'N4', 'desc': '초급 (기본 문법, 일상 회화)'},
                {'level': 3, 'name': 'N3', 'desc': '중급 (일반적 회화, 독해)'},
              ].map((item) {
                final level = item['level'] as int;
                final isSelected = selectedLevel == level;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: InkWell(
                    onTap: () => setDialogState(() => selectedLevel = level),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary.withValues(alpha: 0.1) : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.gray200,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.primary : AppColors.gray200,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text(
                                item['name'] as String,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : AppColors.gray500,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              item['desc'] as String,
                              style: TextStyle(
                                fontSize: 14,
                                color: isSelected ? AppColors.gray900 : AppColors.gray500,
                              ),
                            ),
                          ),
                          if (isSelected)
                            const Icon(Icons.check_circle, color: AppColors.primary, size: 20),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('취소'),
            ),
            TextButton(
              onPressed: () async {
                Navigator.pop(context);
                if (selectedLevel != currentLevel) {
                  await _changeLevel(selectedLevel);
                }
              },
              child: const Text('변경'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _changeLevel(int level) async {
    final user = ref.read(authProvider).user;
    final categories = user?.onboarding?.categories ?? [1, 2];

    final success = await ref.read(apiServiceProvider).submitOnboarding(
      categories: categories,
      level: level,
    );

    if (success && mounted) {
      // Refresh user data
      await ref.read(authProvider.notifier).checkAuth();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('난이도가 변경되었습니다.')),
        );
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('난이도 변경에 실패했습니다.')),
      );
    }
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.gray900,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.gray500,
          ),
        ),
      ],
    );
  }

  Widget _buildSwitchItem({
    required IconData icon,
    required String title,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.gray500),
      title: Text(title),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: AppColors.primary,
        activeTrackColor: AppColors.primaryLight,
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    bool isDestructive = false,
    Widget? trailing,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: isDestructive ? AppColors.error : AppColors.gray500,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isDestructive ? AppColors.error : AppColors.gray900,
        ),
      ),
      trailing: trailing ?? const Icon(
        Icons.chevron_right,
        color: AppColors.gray400,
      ),
      onTap: onTap,
    );
  }
}

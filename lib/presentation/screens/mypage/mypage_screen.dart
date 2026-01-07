import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';

class MyPageScreen extends ConsumerWidget {
  const MyPageScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
                    const SizedBox(height: 16),
                    // Stats
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildStatItem('연속', '${stats?.streakDays ?? 0}일'),
                        Container(
                          width: 1,
                          height: 40,
                          color: AppColors.gray200,
                          margin: const EdgeInsets.symmetric(horizontal: 24),
                        ),
                        _buildStatItem('학습', '${stats?.totalSentences ?? 0}문장'),
                      ],
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
      trailing: const Icon(
        Icons.chevron_right,
        color: AppColors.gray400,
      ),
      onTap: onTap,
    );
  }
}

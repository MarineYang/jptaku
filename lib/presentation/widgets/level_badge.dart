import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';

enum BadgeType { level, category, achievement, streak }

class LevelBadge extends StatelessWidget {
  final String text;
  final BadgeType type;
  final IconData? icon;
  final bool isSmall;

  const LevelBadge({
    super.key,
    required this.text,
    this.type = BadgeType.level,
    this.icon,
    this.isSmall = false,
  });

  Color get _backgroundColor {
    switch (type) {
      case BadgeType.level:
        return AppColors.primaryLight;
      case BadgeType.category:
        return AppColors.matchaLight;
      case BadgeType.achievement:
        return AppColors.yuzuLight;
      case BadgeType.streak:
        return AppColors.sakuraLight;
    }
  }

  Color get _foregroundColor {
    switch (type) {
      case BadgeType.level:
        return AppColors.primary;
      case BadgeType.category:
        return AppColors.matchaDark;
      case BadgeType.achievement:
        return AppColors.yuzuDark;
      case BadgeType.streak:
        return AppColors.sakuraDark;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 12,
        vertical: isSmall ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: _backgroundColor,
        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: isSmall ? 12 : 14,
              color: _foregroundColor,
            ),
            SizedBox(width: isSmall ? 4 : 6),
          ],
          Text(
            text,
            style: TextStyle(
              fontSize: isSmall ? 10 : 12,
              fontWeight: FontWeight.w600,
              color: _foregroundColor,
            ),
          ),
        ],
      ),
    );
  }
}

class XpBadge extends StatelessWidget {
  final int xp;
  final bool showIcon;

  const XpBadge({
    super.key,
    required this.xp,
    this.showIcon = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        gradient: AppColors.xpGradient,
        borderRadius: BorderRadius.circular(AppTheme.radiusRound),
        boxShadow: [
          BoxShadow(
            color: AppColors.xpGold.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            const Icon(
              Icons.star,
              size: 14,
              color: Colors.white,
            ),
            const SizedBox(width: 4),
          ],
          Text(
            '$xp XP',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class ProgressNumberBadge extends StatelessWidget {
  final int current;
  final int total;
  final bool isCompleted;

  const ProgressNumberBadge({
    super.key,
    required this.current,
    required this.total,
    this.isCompleted = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: isCompleted ? AppColors.success : AppColors.primaryLight,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
      ),
      child: Center(
        child: isCompleted
            ? const Icon(
                Icons.check,
                color: Colors.white,
                size: 20,
              )
            : Text(
                '$current',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: isCompleted ? Colors.white : AppColors.primary,
                ),
              ),
      ),
    );
  }
}

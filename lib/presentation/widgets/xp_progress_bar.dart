import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class XpProgressBar extends StatelessWidget {
  final double progress; // 0.0 to 1.0
  final int currentXp;
  final int maxXp;
  final bool showLabel;
  final double height;

  const XpProgressBar({
    super.key,
    required this.progress,
    required this.currentXp,
    required this.maxXp,
    this.showLabel = true,
    this.height = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (showLabel)
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.star,
                      size: 14,
                      color: AppColors.xpGold,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '$currentXp XP',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.gray700,
                      ),
                    ),
                  ],
                ),
                Text(
                  '$maxXp XP',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.gray400,
                  ),
                ),
              ],
            ),
          ),
        ClipRRect(
          borderRadius: BorderRadius.circular(height / 2),
          child: Stack(
            children: [
              Container(
                height: height,
                width: double.infinity,
                color: AppColors.gray100,
              ),
              FractionallySizedBox(
                widthFactor: progress.clamp(0.0, 1.0),
                child: Container(
                  height: height,
                  decoration: BoxDecoration(
                    gradient: AppColors.xpGradient,
                    borderRadius: BorderRadius.circular(height / 2),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class LearningProgressBar extends StatelessWidget {
  final int completed;
  final int total;
  final String? label;
  final Color? activeColor;
  final Color? inactiveColor;

  const LearningProgressBar({
    super.key,
    required this.completed,
    required this.total,
    this.label,
    this.activeColor,
    this.inactiveColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  label!,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.gray700,
                  ),
                ),
                Text(
                  '$completed/$total',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
        Row(
          children: List.generate(total, (index) {
            final isCompleted = index < completed;
            return Expanded(
              child: Container(
                height: 6,
                margin: EdgeInsets.only(right: index < total - 1 ? 4 : 0),
                decoration: BoxDecoration(
                  color: isCompleted
                      ? (activeColor ?? AppColors.primary)
                      : (inactiveColor ?? AppColors.gray200),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            );
          }),
        ),
      ],
    );
  }
}

class CircularProgressIndicatorWithLabel extends StatelessWidget {
  final double progress;
  final String label;
  final double size;
  final double strokeWidth;
  final Color? progressColor;

  const CircularProgressIndicatorWithLabel({
    super.key,
    required this.progress,
    required this.label,
    this.size = 60,
    this.strokeWidth = 6,
    this.progressColor,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        children: [
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              value: progress,
              strokeWidth: strokeWidth,
              backgroundColor: AppColors.gray100,
              valueColor: AlwaysStoppedAnimation<Color>(
                progressColor ?? AppColors.primary,
              ),
              strokeCap: StrokeCap.round,
            ),
          ),
          Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: size * 0.25,
                fontWeight: FontWeight.bold,
                color: progressColor ?? AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

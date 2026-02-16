import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class AnimatedFireIcon extends StatefulWidget {
  final double size;
  final bool isActive;

  const AnimatedFireIcon({
    super.key,
    this.size = 32,
    this.isActive = true,
  });

  @override
  State<AnimatedFireIcon> createState() => _AnimatedFireIconState();
}

class _AnimatedFireIconState extends State<AnimatedFireIcon>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _glowController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _glowController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _glowAnimation = Tween<double>(begin: 0.3, end: 0.7).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );

    if (widget.isActive) {
      _pulseController.repeat(reverse: true);
      _glowController.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(AnimatedFireIcon oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive != oldWidget.isActive) {
      if (widget.isActive) {
        _pulseController.repeat(reverse: true);
        _glowController.repeat(reverse: true);
      } else {
        _pulseController.stop();
        _glowController.stop();
      }
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isActive) {
      return Icon(
        Icons.local_fire_department,
        size: widget.size,
        color: AppColors.gray400,
      );
    }

    return AnimatedBuilder(
      animation: Listenable.merge([_pulseAnimation, _glowAnimation]),
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.orange.withValues(alpha: _glowAnimation.value),
                blurRadius: 16,
                spreadRadius: 2,
              ),
              BoxShadow(
                color: Colors.red.withValues(alpha: _glowAnimation.value * 0.5),
                blurRadius: 24,
                spreadRadius: 4,
              ),
            ],
          ),
          child: Transform.scale(
            scale: _pulseAnimation.value,
            child: ShaderMask(
              shaderCallback: (bounds) {
                return const LinearGradient(
                  colors: [
                    Color(0xFFFFD54F),
                    Color(0xFFFF9800),
                    Color(0xFFFF5722),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ).createShader(bounds);
              },
              child: Icon(
                Icons.local_fire_department,
                size: widget.size,
                color: Colors.white,
              ),
            ),
          ),
        );
      },
    );
  }
}

class StreakBadge extends StatelessWidget {
  final int streakDays;
  final bool isCompact;

  const StreakBadge({
    super.key,
    required this.streakDays,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 10 : 14,
        vertical: isCompact ? 6 : 8,
      ),
      decoration: BoxDecoration(
        gradient: AppColors.streakGradient,
        borderRadius: BorderRadius.circular(isCompact ? 12 : 16),
        boxShadow: [
          BoxShadow(
            color: Colors.orange.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedFireIcon(
            size: isCompact ? 16 : 20,
            isActive: streakDays > 0,
          ),
          const SizedBox(width: 6),
          Text(
            '$streakDays',
            style: TextStyle(
              fontSize: isCompact ? 14 : 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          if (!isCompact) ...[
            const SizedBox(width: 2),
            const Text(
              '일',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.white70,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class AnimatedSparkle extends StatefulWidget {
  final Widget child;
  final bool isActive;

  const AnimatedSparkle({
    super.key,
    required this.child,
    this.isActive = true,
  });

  @override
  State<AnimatedSparkle> createState() => _AnimatedSparkleState();
}

class _AnimatedSparkleState extends State<AnimatedSparkle>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    if (widget.isActive) {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          foregroundPainter: widget.isActive
              ? _SparklePainter(progress: _controller.value)
              : null,
          child: widget.child,
        );
      },
    );
  }
}

class _SparklePainter extends CustomPainter {
  final double progress;

  _SparklePainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.xpGold.withValues(alpha: 0.6)
      ..style = PaintingStyle.fill;

    final random = math.Random(42);
    for (int i = 0; i < 5; i++) {
      final x = random.nextDouble() * size.width;
      final y = random.nextDouble() * size.height;
      final animatedProgress = (progress + i * 0.2) % 1.0;
      final radius = 2.0 * math.sin(animatedProgress * math.pi);

      if (radius > 0) {
        canvas.drawCircle(Offset(x, y), radius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SparklePainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

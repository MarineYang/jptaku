import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';

enum MascotMood { happy, excited, thinking, encouraging, sleeping }
enum MascotSize { small, medium, large }

class MascotWidget extends StatefulWidget {
  final MascotMood mood;
  final MascotSize size;
  final String? message;
  final bool animate;

  const MascotWidget({
    super.key,
    this.mood = MascotMood.happy,
    this.size = MascotSize.medium,
    this.message,
    this.animate = true,
  });

  @override
  State<MascotWidget> createState() => _MascotWidgetState();
}

class _MascotWidgetState extends State<MascotWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _bounceAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _bounceAnimation = Tween<double>(begin: 0, end: 6).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ),
    );
    if (widget.animate) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  double get _mascotSize {
    switch (widget.size) {
      case MascotSize.small:
        return 48;
      case MascotSize.medium:
        return 80;
      case MascotSize.large:
        return 120;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedBuilder(
          animation: _bounceAnimation,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(0, -_bounceAnimation.value),
              child: child,
            );
          },
          child: _buildMascot(),
        ),
        if (widget.message != null) ...[
          const SizedBox(height: 12),
          _buildSpeechBubble(widget.message!),
        ],
      ],
    );
  }

  Widget _buildMascot() {
    return Container(
      width: _mascotSize,
      height: _mascotSize,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFE0E6), Color(0xFFFFB7C5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppColors.sakura.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Ears
          Positioned(
            top: _mascotSize * 0.05,
            left: _mascotSize * 0.15,
            child: _buildEar(isLeft: true),
          ),
          Positioned(
            top: _mascotSize * 0.05,
            right: _mascotSize * 0.15,
            child: _buildEar(isLeft: false),
          ),
          // Face
          CustomPaint(
            size: Size(_mascotSize * 0.6, _mascotSize * 0.4),
            painter: _MascotFacePainter(mood: widget.mood),
          ),
          // Blush
          Positioned(
            bottom: _mascotSize * 0.25,
            left: _mascotSize * 0.18,
            child: _buildBlush(),
          ),
          Positioned(
            bottom: _mascotSize * 0.25,
            right: _mascotSize * 0.18,
            child: _buildBlush(),
          ),
        ],
      ),
    );
  }

  Widget _buildEar({required bool isLeft}) {
    return Transform.rotate(
      angle: isLeft ? -0.3 : 0.3,
      child: Container(
        width: _mascotSize * 0.2,
        height: _mascotSize * 0.25,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              const Color(0xFFFFE0E6),
              AppColors.sakura,
            ],
            begin: isLeft ? Alignment.topRight : Alignment.topLeft,
            end: isLeft ? Alignment.bottomLeft : Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(_mascotSize * 0.1),
            topRight: Radius.circular(_mascotSize * 0.1),
          ),
        ),
      ),
    );
  }

  Widget _buildBlush() {
    return Container(
      width: _mascotSize * 0.12,
      height: _mascotSize * 0.06,
      decoration: BoxDecoration(
        color: AppColors.sakuraDark.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(_mascotSize * 0.03),
      ),
    );
  }

  Widget _buildSpeechBubble(String message) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        boxShadow: [
          BoxShadow(
            color: AppColors.gray900.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        message,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: AppColors.gray700,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}

class _MascotFacePainter extends CustomPainter {
  final MascotMood mood;

  _MascotFacePainter({required this.mood});

  @override
  void paint(Canvas canvas, Size size) {
    final eyePaint = Paint()
      ..color = AppColors.gray800
      ..style = PaintingStyle.fill;

    final mouthPaint = Paint()
      ..color = AppColors.gray700
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;

    // Eyes
    switch (mood) {
      case MascotMood.happy:
      case MascotMood.excited:
        // Happy curved eyes
        canvas.drawArc(
          Rect.fromCenter(
            center: Offset(size.width * 0.3, size.height * 0.3),
            width: 8,
            height: 8,
          ),
          3.14,
          3.14,
          false,
          eyePaint..style = PaintingStyle.stroke..strokeWidth = 2,
        );
        canvas.drawArc(
          Rect.fromCenter(
            center: Offset(size.width * 0.7, size.height * 0.3),
            width: 8,
            height: 8,
          ),
          3.14,
          3.14,
          false,
          eyePaint,
        );
        break;
      case MascotMood.thinking:
        // Normal eyes with raised position
        eyePaint.style = PaintingStyle.fill;
        canvas.drawCircle(
          Offset(size.width * 0.3, size.height * 0.25),
          3,
          eyePaint,
        );
        canvas.drawCircle(
          Offset(size.width * 0.7, size.height * 0.25),
          3,
          eyePaint,
        );
        break;
      case MascotMood.encouraging:
        // Winking
        eyePaint.style = PaintingStyle.fill;
        canvas.drawCircle(
          Offset(size.width * 0.3, size.height * 0.3),
          3,
          eyePaint,
        );
        canvas.drawArc(
          Rect.fromCenter(
            center: Offset(size.width * 0.7, size.height * 0.3),
            width: 8,
            height: 4,
          ),
          3.14,
          3.14,
          false,
          eyePaint..style = PaintingStyle.stroke..strokeWidth = 2,
        );
        break;
      case MascotMood.sleeping:
        // Closed eyes (lines)
        canvas.drawLine(
          Offset(size.width * 0.2, size.height * 0.3),
          Offset(size.width * 0.4, size.height * 0.3),
          eyePaint..style = PaintingStyle.stroke..strokeWidth = 2,
        );
        canvas.drawLine(
          Offset(size.width * 0.6, size.height * 0.3),
          Offset(size.width * 0.8, size.height * 0.3),
          eyePaint,
        );
        break;
    }

    // Mouth
    switch (mood) {
      case MascotMood.happy:
        canvas.drawArc(
          Rect.fromCenter(
            center: Offset(size.width * 0.5, size.height * 0.6),
            width: 12,
            height: 10,
          ),
          0,
          3.14,
          false,
          mouthPaint,
        );
        break;
      case MascotMood.excited:
        // Open smile
        final path = Path();
        path.moveTo(size.width * 0.35, size.height * 0.55);
        path.quadraticBezierTo(
          size.width * 0.5,
          size.height * 0.85,
          size.width * 0.65,
          size.height * 0.55,
        );
        mouthPaint.style = PaintingStyle.fill;
        mouthPaint.color = AppColors.umeDark;
        canvas.drawPath(path, mouthPaint);
        break;
      case MascotMood.thinking:
        // Small o mouth
        canvas.drawCircle(
          Offset(size.width * 0.5, size.height * 0.65),
          4,
          mouthPaint..style = PaintingStyle.stroke,
        );
        break;
      case MascotMood.encouraging:
        // Cat smile
        canvas.drawArc(
          Rect.fromCenter(
            center: Offset(size.width * 0.5, size.height * 0.65),
            width: 16,
            height: 12,
          ),
          0,
          3.14,
          false,
          mouthPaint,
        );
        break;
      case MascotMood.sleeping:
        // Small line
        canvas.drawLine(
          Offset(size.width * 0.4, size.height * 0.65),
          Offset(size.width * 0.6, size.height * 0.65),
          mouthPaint,
        );
        // Zzz
        final textPainter = TextPainter(
          text: const TextSpan(
            text: 'z',
            style: TextStyle(
              fontSize: 8,
              fontStyle: FontStyle.italic,
              color: AppColors.gray400,
            ),
          ),
          textDirection: TextDirection.ltr,
        );
        textPainter.layout();
        textPainter.paint(
          canvas,
          Offset(size.width * 0.75, size.height * 0.1),
        );
        break;
    }
  }

  @override
  bool shouldRepaint(covariant _MascotFacePainter oldDelegate) {
    return oldDelegate.mood != mood;
  }
}

class MascotGreeting extends StatelessWidget {
  final String userName;
  final int streakDays;

  const MascotGreeting({
    super.key,
    required this.userName,
    this.streakDays = 0,
  });

  MascotMood get _mood {
    if (streakDays >= 7) return MascotMood.excited;
    if (streakDays >= 3) return MascotMood.encouraging;
    return MascotMood.happy;
  }

  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return '좋은 아침이에요!';
    if (hour < 18) return '오늘도 화이팅!';
    return '좋은 저녁이에요!';
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        MascotWidget(
          mood: _mood,
          size: MascotSize.medium,
          animate: true,
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _greeting,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.gray500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '$userName님',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.gray900,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

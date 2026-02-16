import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class SakuraBackground extends StatefulWidget {
  final Widget child;
  final bool enableAnimation;
  final int petalCount;
  final Color? backgroundColor;

  const SakuraBackground({
    super.key,
    required this.child,
    this.enableAnimation = true,
    this.petalCount = 15,
    this.backgroundColor,
  });

  @override
  State<SakuraBackground> createState() => _SakuraBackgroundState();
}

class _SakuraBackgroundState extends State<SakuraBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late List<_SakuraPetal> _petals;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 20),
      vsync: this,
    );
    _initPetals();
    if (widget.enableAnimation) {
      _controller.repeat();
    }
  }

  void _initPetals() {
    final random = math.Random();
    _petals = List.generate(widget.petalCount, (index) {
      return _SakuraPetal(
        x: random.nextDouble(),
        y: random.nextDouble(),
        size: 8 + random.nextDouble() * 12,
        speed: 0.2 + random.nextDouble() * 0.3,
        drift: -0.1 + random.nextDouble() * 0.2,
        rotation: random.nextDouble() * math.pi * 2,
        rotationSpeed: -0.02 + random.nextDouble() * 0.04,
        opacity: 0.3 + random.nextDouble() * 0.4,
      );
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          color: widget.backgroundColor ?? AppColors.backgroundAnime,
        ),
        if (widget.enableAnimation)
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return CustomPaint(
                painter: _SakuraPainter(
                  petals: _petals,
                  progress: _controller.value,
                ),
                size: Size.infinite,
              );
            },
          ),
        CustomPaint(
          painter: _JapanesePatternPainter(),
          size: Size.infinite,
        ),
        widget.child,
      ],
    );
  }
}

class _SakuraPetal {
  double x;
  double y;
  final double size;
  final double speed;
  final double drift;
  double rotation;
  final double rotationSpeed;
  final double opacity;

  _SakuraPetal({
    required this.x,
    required this.y,
    required this.size,
    required this.speed,
    required this.drift,
    required this.rotation,
    required this.rotationSpeed,
    required this.opacity,
  });
}

class _SakuraPainter extends CustomPainter {
  final List<_SakuraPetal> petals;
  final double progress;

  _SakuraPainter({required this.petals, required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    for (final petal in petals) {
      final y =
          ((petal.y + progress * petal.speed) % 1.2 - 0.1) * size.height;
      final x = (petal.x +
              math.sin(progress * math.pi * 2 + petal.rotation) * petal.drift) *
          size.width;
      final rotation = petal.rotation + progress * petal.rotationSpeed * math.pi * 2;

      final paint = Paint()
        ..color = AppColors.sakura.withValues(alpha: petal.opacity)
        ..style = PaintingStyle.fill;

      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(rotation);

      // Draw sakura petal shape
      final path = Path();
      final petalSize = petal.size;
      path.moveTo(0, -petalSize / 2);
      path.quadraticBezierTo(
        petalSize / 2,
        -petalSize / 4,
        petalSize / 3,
        petalSize / 4,
      );
      path.quadraticBezierTo(0, petalSize / 2, -petalSize / 3, petalSize / 4);
      path.quadraticBezierTo(-petalSize / 2, -petalSize / 4, 0, -petalSize / 2);
      path.close();

      canvas.drawPath(path, paint);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant _SakuraPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

class _JapanesePatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.sakura.withValues(alpha: 0.03)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    // Draw subtle wave pattern (seigaiha)
    const waveSpacing = 80.0;
    const waveRadius = 30.0;

    for (double y = 0; y < size.height + waveSpacing; y += waveSpacing) {
      for (double x = 0; x < size.width + waveSpacing; x += waveSpacing * 2) {
        final offsetX = (y ~/ waveSpacing % 2 == 0) ? 0.0 : waveSpacing;
        canvas.drawArc(
          Rect.fromCircle(
            center: Offset(x + offsetX, y),
            radius: waveRadius,
          ),
          math.pi,
          math.pi,
          false,
          paint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class PatternBackground extends StatelessWidget {
  final Widget child;
  final PatternType type;
  final Color? patternColor;

  const PatternBackground({
    super.key,
    required this.child,
    this.type = PatternType.seigaiha,
    this.patternColor,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        CustomPaint(
          painter: _PatternPainter(
            type: type,
            color: patternColor ?? AppColors.sakura.withValues(alpha: 0.05),
          ),
          size: Size.infinite,
        ),
        child,
      ],
    );
  }
}

enum PatternType { seigaiha, asanoha, dots }

class _PatternPainter extends CustomPainter {
  final PatternType type;
  final Color color;

  _PatternPainter({required this.type, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    switch (type) {
      case PatternType.seigaiha:
        _drawSeigaiha(canvas, size, paint);
        break;
      case PatternType.asanoha:
        _drawAsanoha(canvas, size, paint);
        break;
      case PatternType.dots:
        _drawDots(canvas, size, paint);
        break;
    }
  }

  void _drawSeigaiha(Canvas canvas, Size size, Paint paint) {
    const spacing = 60.0;
    const radius = 25.0;

    for (double y = 0; y < size.height + spacing; y += spacing / 2) {
      for (double x = 0; x < size.width + spacing; x += spacing) {
        final offsetX = (y ~/ (spacing / 2) % 2 == 0) ? 0.0 : spacing / 2;
        for (int i = 0; i < 3; i++) {
          canvas.drawArc(
            Rect.fromCircle(
              center: Offset(x + offsetX, y),
              radius: radius - i * 8,
            ),
            math.pi,
            math.pi,
            false,
            paint,
          );
        }
      }
    }
  }

  void _drawAsanoha(Canvas canvas, Size size, Paint paint) {
    const spacing = 40.0;

    for (double y = 0; y < size.height + spacing; y += spacing) {
      for (double x = 0; x < size.width + spacing; x += spacing) {
        final center = Offset(x, y);
        for (int i = 0; i < 6; i++) {
          final angle = i * math.pi / 3;
          final end = Offset(
            center.dx + math.cos(angle) * spacing / 2,
            center.dy + math.sin(angle) * spacing / 2,
          );
          canvas.drawLine(center, end, paint);
        }
      }
    }
  }

  void _drawDots(Canvas canvas, Size size, Paint paint) {
    paint.style = PaintingStyle.fill;
    const spacing = 30.0;
    const radius = 2.0;

    for (double y = 0; y < size.height; y += spacing) {
      for (double x = 0; x < size.width; x += spacing) {
        canvas.drawCircle(Offset(x, y), radius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';

class AnimatedCard extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? backgroundColor;
  final Gradient? gradient;
  final Border? border;
  final double borderRadius;
  final List<BoxShadow>? boxShadow;
  final bool isEnabled;

  const AnimatedCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.gradient,
    this.border,
    this.borderRadius = AppTheme.radiusLarge,
    this.boxShadow,
    this.isEnabled = true,
  });

  @override
  State<AnimatedCard> createState() => _AnimatedCardState();
}

class _AnimatedCardState extends State<AnimatedCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: AppTheme.animationFast,
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.98).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    if (widget.isEnabled && widget.onTap != null) {
      _controller.forward();
    }
  }

  void _onTapUp(TapUpDetails details) {
    if (widget.isEnabled && widget.onTap != null) {
      _controller.reverse();
    }
  }

  void _onTapCancel() {
    if (widget.isEnabled && widget.onTap != null) {
      _controller.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      onTap: widget.isEnabled ? widget.onTap : null,
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              margin: widget.margin,
              padding: widget.padding ?? const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: widget.gradient == null
                    ? (widget.backgroundColor ?? Colors.white)
                    : null,
                gradient: widget.gradient,
                borderRadius: BorderRadius.circular(widget.borderRadius),
                border: widget.border ??
                    Border.all(color: AppColors.gray100, width: 1),
                boxShadow: widget.boxShadow ??
                    [
                      BoxShadow(
                        color: AppColors.gray900.withValues(alpha: 0.04),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
              ),
              child: widget.child,
            ),
          );
        },
      ),
    );
  }
}

class GradientCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Gradient gradient;
  final double borderRadius;
  final List<BoxShadow>? boxShadow;

  const GradientCard({
    super.key,
    required this.child,
    required this.gradient,
    this.onTap,
    this.padding,
    this.margin,
    this.borderRadius = AppTheme.radiusXLarge,
    this.boxShadow,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedCard(
      onTap: onTap,
      padding: padding,
      margin: margin,
      gradient: gradient,
      borderRadius: borderRadius,
      border: Border.all(color: Colors.transparent),
      boxShadow: boxShadow ??
          [
            BoxShadow(
              color: (gradient.colors.first).withValues(alpha: 0.3),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
      child: child,
    );
  }
}

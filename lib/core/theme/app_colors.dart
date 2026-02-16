import 'package:flutter/material.dart';

class AppColors {
  // Primary (Sky Blue - Anime Sky)
  static const Color primary = Color(0xFF0EA5E9);
  static const Color primaryLight = Color(0xFFE0F2FE);
  static const Color primaryDark = Color(0xFF0284C7);

  // Secondary (Sakura Pink)
  static const Color secondary = Color(0xFFF472B6);
  static const Color secondaryLight = Color(0xFFFCE7F3);
  static const Color secondaryDark = Color(0xFFDB2777);

  // Anime-inspired Accent Colors
  static const Color sakura = Color(0xFFFFB7C5); // Cherry blossom pink
  static const Color sakuraLight = Color(0xFFFFF0F3);
  static const Color sakuraDark = Color(0xFFFF8FA3);

  static const Color matcha = Color(0xFF8BC34A); // Matcha green
  static const Color matchaLight = Color(0xFFF1F8E9);
  static const Color matchaDark = Color(0xFF689F38);

  static const Color yuzu = Color(0xFFFFD54F); // Yuzu yellow
  static const Color yuzuLight = Color(0xFFFFFDE7);
  static const Color yuzuDark = Color(0xFFFFCA28);

  static const Color ume = Color(0xFFE91E63); // Plum pink
  static const Color umeLight = Color(0xFFFCE4EC);
  static const Color umeDark = Color(0xFFC2185B);

  static const Color sora = Color(0xFF03A9F4); // Sky blue
  static const Color soraLight = Color(0xFFE1F5FE);
  static const Color soraDark = Color(0xFF0288D1);

  // Gradient Colors for Anime Effects
  static const Color gradientPurple = Color(0xFF9C27B0);
  static const Color gradientPink = Color(0xFFFF4081);
  static const Color gradientOrange = Color(0xFFFF9800);

  // XP/Level Colors
  static const Color xpGold = Color(0xFFFFD700);
  static const Color xpSilver = Color(0xFFC0C0C0);
  static const Color xpBronze = Color(0xFFCD7F32);

  // Neutral
  static const Color gray50 = Color(0xFFF8FAFC);
  static const Color gray100 = Color(0xFFF1F5F9);
  static const Color gray200 = Color(0xFFE2E8F0);
  static const Color gray300 = Color(0xFFCBD5E1);
  static const Color gray400 = Color(0xFF94A3B8);
  static const Color gray500 = Color(0xFF64748B);
  static const Color gray600 = Color(0xFF475569);
  static const Color gray700 = Color(0xFF334155);
  static const Color gray800 = Color(0xFF1E293B);
  static const Color gray900 = Color(0xFF0F172A);

  // Semantic
  static const Color success = Color(0xFF22C55E);
  static const Color successLight = Color(0xFFDCFCE7);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEE2E2);

  // Background
  static const Color background = Color(0xFFFAF9FB);
  static const Color backgroundAnime = Color(0xFFFFF8FA); // Soft pink tint
  static const Color surface = Colors.white;
  static const Color surfaceElevated = Color(0xFFFFFEFF);

  // Common Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient sakuraGradient = LinearGradient(
    colors: [sakura, sakuraDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient streakGradient = LinearGradient(
    colors: [Color(0xFFFF6B6B), Color(0xFFFF8E53)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient xpGradient = LinearGradient(
    colors: [yuzu, xpGold],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient animeGradient = LinearGradient(
    colors: [gradientPink, gradientPurple],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

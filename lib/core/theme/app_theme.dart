import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {
  // Design tokens
  static const double radiusSmall = 8.0;
  static const double radiusMedium = 12.0;
  static const double radiusLarge = 16.0;
  static const double radiusXLarge = 20.0;
  static const double radiusRound = 100.0;

  static const double spacingXSmall = 4.0;
  static const double spacingSmall = 8.0;
  static const double spacingMedium = 12.0;
  static const double spacingLarge = 16.0;
  static const double spacingXLarge = 24.0;
  static const double spacingXXLarge = 32.0;

  static const Duration animationFast = Duration(milliseconds: 150);
  static const Duration animationNormal = Duration(milliseconds: 300);
  static const Duration animationSlow = Duration(milliseconds: 500);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Pretendard',
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.light,
        primary: AppColors.primary,
        secondary: AppColors.sakura,
        tertiary: AppColors.matcha,
        surface: AppColors.surface,
      ),
      scaffoldBackgroundColor: AppColors.backgroundAnime,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.gray900,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontFamily: 'Pretendard',
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.gray900,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          elevation: 0,
          shadowColor: AppColors.primary.withValues(alpha: 0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusMedium),
          ),
          textStyle: const TextStyle(
            fontFamily: 'Pretendard',
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.gray900,
          minimumSize: const Size(double.infinity, 52),
          side: const BorderSide(color: AppColors.gray200),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusMedium),
          ),
          textStyle: const TextStyle(
            fontFamily: 'Pretendard',
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusLarge),
        ),
        shadowColor: AppColors.gray900.withValues(alpha: 0.08),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: AppColors.gray200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: AppColors.gray200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.gray400,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.primaryLight,
        labelStyle: const TextStyle(
          fontFamily: 'Pretendard',
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColors.primary,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusSmall),
        ),
        side: BorderSide.none,
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary,
        linearTrackColor: AppColors.gray100,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Pretendard',
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.dark,
        primary: AppColors.primary,
        secondary: AppColors.sakura,
        tertiary: AppColors.matcha,
      ),
      scaffoldBackgroundColor: AppColors.gray900,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: AppColors.gray800,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusLarge),
        ),
      ),
    );
  }
}

// Text Styles for Japanese Learning
class AppTextStyles {
  static const TextStyle japaneseMain = TextStyle(
    fontFamily: 'Noto Sans JP',
    fontSize: 24,
    fontWeight: FontWeight.w500,
    height: 1.5,
  );

  static const TextStyle japaneseLarge = TextStyle(
    fontFamily: 'Noto Sans JP',
    fontSize: 32,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );

  static const TextStyle furigana = TextStyle(
    fontFamily: 'Noto Sans JP',
    fontSize: 10,
    fontWeight: FontWeight.w400,
    color: AppColors.gray500,
  );

  static const TextStyle korean = TextStyle(
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.gray600,
  );

  static const TextStyle headingLarge = TextStyle(
    fontFamily: 'Pretendard',
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: AppColors.gray900,
  );

  static const TextStyle headingMedium = TextStyle(
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: AppColors.gray900,
  );

  static const TextStyle headingSmall = TextStyle(
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.gray900,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.gray700,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.gray600,
  );

  static const TextStyle caption = TextStyle(
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.gray500,
  );

  static const TextStyle badge = TextStyle(
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: FontWeight.w600,
  );
}

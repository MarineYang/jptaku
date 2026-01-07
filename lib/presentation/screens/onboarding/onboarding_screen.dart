import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';

class CategoryItem {
  final int id;
  final String name;
  final IconData icon;

  CategoryItem({required this.id, required this.name, required this.icon});
}

class LevelItem {
  final int id;
  final String name;
  final String description;

  LevelItem({required this.id, required this.name, required this.description});
}

final categories = [
  CategoryItem(id: 1, name: '애니메이션', icon: Icons.movie),
  CategoryItem(id: 2, name: '게임', icon: Icons.sports_esports),
  CategoryItem(id: 3, name: '음악', icon: Icons.music_note),
  CategoryItem(id: 4, name: '영화', icon: Icons.theaters),
  CategoryItem(id: 5, name: '드라마', icon: Icons.tv),
];

final levels = [
  LevelItem(id: 5, name: 'N5 (입문)', description: '히라가나, 기초 인사말'),
  LevelItem(id: 4, name: 'N4 (초급)', description: '기본 문법, 일상 회화'),
  LevelItem(id: 3, name: 'N3 (중급)', description: '복잡한 문장, 뉴스 이해'),
];

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int _currentStep = 0;
  final Set<int> _selectedCategories = {};
  int? _selectedLevel;

  bool get _canProceed {
    if (_currentStep == 0) {
      return _selectedCategories.isNotEmpty;
    } else if (_currentStep == 1) {
      return _selectedLevel != null;
    }
    return true;
  }

  void _handleNext() {
    if (_currentStep < 2) {
      setState(() => _currentStep++);
    }
  }

  void _handleBack() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  Future<void> _handleFinish() async {
    if (_selectedCategories.isEmpty || _selectedLevel == null) return;

    final success = await ref.read(authProvider.notifier).completeOnboarding(
          categories: _selectedCategories.toList(),
          level: _selectedLevel!,
        );

    if (success && mounted) {
      context.go('/home');
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('온보딩 저장에 실패했습니다. 다시 시도해주세요.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Row(
                children: [
                  // Back Button
                  if (_currentStep > 0)
                    IconButton(
                      onPressed: _handleBack,
                      icon: const Icon(Icons.arrow_back_ios),
                      color: AppColors.gray600,
                    )
                  else
                    const SizedBox(width: 48),

                  // Progress Dots
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(3, (index) {
                        final isActive = index == _currentStep;
                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: isActive ? 24 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: isActive
                                ? AppColors.primary
                                : AppColors.gray200,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        );
                      }),
                    ),
                  ),

                  const SizedBox(width: 48),
                ],
              ),
            ),

            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: _buildStepContent(),
              ),
            ),

            // Bottom Button
            Padding(
              padding: const EdgeInsets.all(24),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: _currentStep < 2
                    ? ElevatedButton(
                        onPressed: _canProceed ? _handleNext : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _canProceed
                              ? AppColors.primary
                              : AppColors.gray100,
                          foregroundColor:
                              _canProceed ? Colors.white : AppColors.gray400,
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('다음'),
                            SizedBox(width: 8),
                            Icon(Icons.arrow_forward, size: 18),
                          ],
                        ),
                      )
                    : ElevatedButton(
                        onPressed: authState.isLoading ? null : _handleFinish,
                        child: authState.isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text('학습 시작하기'),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildCategoryStep();
      case 1:
        return _buildLevelStep();
      case 2:
        return _buildSummaryStep();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildCategoryStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        const Text(
          '어떤 콘텐츠로\n일본어를 배우고 싶으세요?',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.bold,
            color: AppColors.gray900,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          '관심 분야를 선택해주세요 (복수 선택 가능)',
          style: TextStyle(
            fontSize: 15,
            color: AppColors.gray500,
          ),
        ),
        const SizedBox(height: 32),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: categories.map((category) {
            final isSelected = _selectedCategories.contains(category.id);
            return GestureDetector(
              onTap: () {
                setState(() {
                  if (isSelected) {
                    _selectedCategories.remove(category.id);
                  } else {
                    _selectedCategories.add(category.id);
                  }
                });
              },
              child: Container(
                width: (MediaQuery.of(context).size.width - 60) / 2,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primaryLight : AppColors.gray50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.gray100,
                    width: 2,
                  ),
                ),
                child: Column(
                  children: [
                    Icon(
                      category.icon,
                      size: 40,
                      color: isSelected ? AppColors.primary : AppColors.gray500,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      category.name,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.gray700,
                      ),
                    ),
                    if (isSelected) ...[
                      const SizedBox(height: 8),
                      Container(
                        width: 24,
                        height: 24,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.check,
                          size: 16,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildLevelStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        const Text(
          '현재 일본어 실력은\n어느 정도인가요?',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.bold,
            color: AppColors.gray900,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          '레벨에 맞는 문장을 추천해드릴게요',
          style: TextStyle(
            fontSize: 15,
            color: AppColors.gray500,
          ),
        ),
        const SizedBox(height: 32),
        ...levels.map((level) {
          final isSelected = _selectedLevel == level.id;
          return GestureDetector(
            onTap: () {
              setState(() => _selectedLevel = level.id);
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primaryLight : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.gray100,
                  width: 2,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary
                          : AppColors.gray100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        'N${level.id}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : AppColors.gray500,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          level.name,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.gray900,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          level.description,
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppColors.gray500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isSelected)
                    Container(
                      width: 24,
                      height: 24,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check,
                        size: 16,
                        color: Colors.white,
                      ),
                    ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildSummaryStep() {
    final selectedCategoryNames = categories
        .where((c) => _selectedCategories.contains(c.id))
        .map((c) => c.name)
        .toList();

    final selectedLevelName =
        levels.firstWhere((l) => l.id == _selectedLevel).name;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        const Text(
          '준비가 완료되었어요!',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.bold,
            color: AppColors.gray900,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          '선택하신 설정을 확인해주세요',
          style: TextStyle(
            fontSize: 15,
            color: AppColors.gray500,
          ),
        ),
        const SizedBox(height: 32),
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.gray50,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.gray100),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '관심 카테고리',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.gray400,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: selectedCategoryNames.map((name) {
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              Container(
                height: 1,
                color: AppColors.gray200,
              ),
              const SizedBox(height: 20),
              const Text(
                '일본어 레벨',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.gray400,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  selectedLevelName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Row(
            children: [
              Icon(
                Icons.info_outline,
                color: AppColors.primary,
                size: 20,
              ),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  '설정은 나중에 마이페이지에서 변경할 수 있어요.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.primaryDark,
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

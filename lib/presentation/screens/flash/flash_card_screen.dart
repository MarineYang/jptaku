import 'package:appinio_swiper/appinio_swiper.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/sentence_model.dart';
import '../../providers/auth_provider.dart';

class FlashCardScreen extends ConsumerStatefulWidget {
  const FlashCardScreen({super.key});

  @override
  ConsumerState<FlashCardScreen> createState() => _FlashCardScreenState();
}

class _FlashCardScreenState extends ConsumerState<FlashCardScreen> {
  final AppinioSwiperController _swiperController = AppinioSwiperController();
  List<FlashSentence> _sentences = [];
  bool _isLoading = true;
  String? _error;

  // Track flipped state for each card index
  final Map<int, bool> _flippedStates = {};

  @override
  void initState() {
    super.initState();
    _loadFlashCards();
  }

  Future<void> _loadFlashCards() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.getTodayFlash();

      if (response != null) {
        setState(() {
          _sentences = response.sentences;
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = '플래시 카드를 불러올 수 없습니다.';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = '오류가 발생했습니다.';
        _isLoading = false;
      });
    }
  }

  Future<void> _handleSwipe(int previousIndex, int targetIndex, SwiperActivity activity) async {
    // Haptic feedback on swipe
    HapticFeedback.mediumImpact();

    final sentence = _sentences[previousIndex];
    final apiService = ref.read(apiServiceProvider);

    String grade = 'mid'; // Default
    
    // Check direction from activity
    if (activity.direction == AxisDirection.right) {
      grade = 'good'; // Easy/Memorized
    } else if (activity.direction == AxisDirection.left) {
      grade = 'bad'; // Difficult/Review again
    }

    try {
      await apiService.updateFlashProgress(
        sentenceId: sentence.id,
        grade: grade,
      );
    } catch (e) {
      // Silently fail or retry in background ideally
      debugPrint('Failed to submit grade: $e');
    }
  }

  void _onEnd() {
    _showCompletionDialog();
  }
  // ... (dialog code remains same) ...

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        contentPadding: const EdgeInsets.all(32),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.celebration,
                size: 40,
                color: AppColors.success,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              '학습 완료!',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.gray900,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              '오늘의 플래시 카드 ${_sentences.length}개를\n모두 학습했어요!',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                color: AppColors.gray600,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  context.pop(); // Close dialog
                  context.pop(); // Go back home
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text(
                  '홈으로 가기',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () {
                context.pop(); // Close dialog
                setState(() {
                  _flippedStates.clear();
                  _loadFlashCards(); // Reload to restart
                });
              },
              child: const Text(
                '다시 학습하기',
                style: TextStyle(
                  color: AppColors.gray500,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: AppColors.gray900),
          onPressed: () => context.pop(),
        ),
        centerTitle: true,
        title: Column(
          children: [
            const Text(
              '플래시 카드',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.gray900,
              ),
            ),
            if (!_isLoading && _sentences.isNotEmpty)
              Text(
                '${_sentences.length}개의 카드',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.gray500,
                ),
              ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _sentences.isEmpty
                  ? const Center(child: Text('학습할 카드가 없습니다.'))
                  : Column(
                      children: [
                        Expanded(
                          child: AppinioSwiper(
                            controller: _swiperController,
                            cardCount: _sentences.length,
                            backgroundCardCount: 2,
                            onSwipeEnd: _handleSwipe, 
                            onEnd: _onEnd,
                            swipeOptions: const SwipeOptions.only(
                              left: true,
                              right: true,
                              up: false,
                              down: false,
                            ),
                            cardBuilder: (context, index) {
                              final sentence = _sentences[index];
                              final isFlipped = _flippedStates[index] ?? false;

                              return _buildCard(index, sentence, isFlipped);
                            },
                          ),
                        ),
                        // Bottom Action Hints
                        const Padding(
                          padding: EdgeInsets.fromLTRB(24, 0, 24, 48),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _SwipeHint(
                                icon: Icons.keyboard_arrow_left,
                                text: '어려워요',
                                color: AppColors.error,
                              ),
                              _SwipeHint(
                                icon: Icons.keyboard_arrow_right,
                                text: '쉬워요',
                                color: AppColors.success,
                                isRight: true,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
    );
  }

  Widget _buildCard(int index, FlashSentence sentence, bool isFlipped) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        setState(() {
          _flippedStates[index] = !isFlipped;
        });
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: AppColors.gray900.withValues(alpha: 0.08),
              blurRadius: 24,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          transitionBuilder: (Widget child, Animation<double> animation) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
          child: isFlipped
              ? _buildBackSide(sentence, key: const ValueKey(true))
              : _buildFrontSide(sentence, key: const ValueKey(false)),
        ),
      ),
    );
  }

  Widget _buildFrontSide(FlashSentence sentence, {required Key key}) {
    return Container(
      key: key,
      width: double.infinity,
      height: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Level & Category Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(100),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  sentence.levelName,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
                Container(
                  width: 1,
                  height: 12,
                  color: AppColors.primary.withValues(alpha: 0.2),
                  margin: const EdgeInsets.symmetric(horizontal: 12),
                ),
                Text(
                  sentence.categoryName,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.gray600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),

          // Japanese Text
          Text(
            sentence.jp,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: AppColors.gray900,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),

          // Romaji
          if (sentence.romaji != null)
            Text(
              sentence.romaji!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                color: AppColors.gray400,
                height: 1.5,
              ),
            ),

          const Spacer(),
          const Text(
            '탭해서 결과 보기',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.gray400,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }


  Widget _buildBackSide(FlashSentence sentence, {required Key key}) {
    return Container(
      key: key,
      width: double.infinity,
      height: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            '한국어 뜻',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            sentence.kr,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryDark,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 32),

          if (sentence.phrase != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Text(
                    '핵심 표현',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.gray500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    sentence.phrase!,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.warning,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          if (sentence.tip != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.lightbulb_outline,
                    size: 20,
                    color: AppColors.warning,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      sentence.tip!,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.gray600,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const Spacer(),
          const Text(
            '좌우로 밀어서 카드 넘기기',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.gray400,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _SwipeHint extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color color;
  final bool isRight;

  const _SwipeHint({
    required this.icon,
    required this.text,
    required this.color,
    this.isRight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (!isRight) Icon(icon, color: color.withValues(alpha: 0.5), size: 20),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Text(
            text,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: color.withValues(alpha: 0.5),
            ),
          ),
        ),
        if (isRight) Icon(icon, color: color.withValues(alpha: 0.5), size: 20),
      ],
    );
  }
}

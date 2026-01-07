import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:just_audio/just_audio.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/sentence_model.dart';
import '../../providers/sentence_provider.dart';

class SentenceDetailScreen extends ConsumerStatefulWidget {
  final int sentenceId;

  const SentenceDetailScreen({super.key, required this.sentenceId});

  @override
  ConsumerState<SentenceDetailScreen> createState() =>
      _SentenceDetailScreenState();
}

class _SentenceDetailScreenState extends ConsumerState<SentenceDetailScreen> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isPlaying = false;
  bool _showQuiz = false;
  String? _selectedFillBlankAnswer;
  final List<int> _selectedOrderingAnswer = [];
  bool? _fillBlankCorrect;
  bool? _orderingCorrect;

  Map<String, bool> _progress = {
    'understand': false,
    'speak': false,
    'confirm': false,
  };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadProgress();
    });
  }

  void _loadProgress() {
    final sentenceState = ref.read(sentenceProvider);
    final progress = sentenceState.progressMap[widget.sentenceId];
    if (progress != null) {
      setState(() {
        _progress = {
          'understand': progress.understand,
          'speak': progress.speak,
          'confirm': progress.confirm,
        };
      });
    }
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _playAudio(String? url) async {
    if (url == null) return;

    try {
      if (_isPlaying) {
        await _audioPlayer.stop();
        setState(() => _isPlaying = false);
      } else {
        await _audioPlayer.setUrl(url);
        setState(() => _isPlaying = true);
        await _audioPlayer.play();
        setState(() => _isPlaying = false);
      }
    } catch (e) {
      setState(() => _isPlaying = false);
    }
  }

  Future<void> _handleFillBlankAnswer(String answer, Sentence sentence) async {
    setState(() {
      _selectedFillBlankAnswer = answer;
    });

    final result = await ref.read(sentenceProvider.notifier).submitQuizAnswer(
          sentenceId: sentence.id,
          fillBlankAnswer: answer,
        );

    if (result != null) {
      setState(() {
        _fillBlankCorrect = result.fillBlankCorrect;
        if (result.allCorrect) {
          _progress['confirm'] = true;
        }
      });
    }
  }

  Future<void> _handleOrderingSubmit(Sentence sentence) async {
    final result = await ref.read(sentenceProvider.notifier).submitQuizAnswer(
          sentenceId: sentence.id,
          orderingAnswer: _selectedOrderingAnswer,
        );

    if (result != null) {
      setState(() {
        _orderingCorrect = result.orderingCorrect;
        if (result.allCorrect) {
          _progress['confirm'] = true;
        }
      });
    }
  }

  Future<void> _updateProgress(String step, bool value) async {
    setState(() {
      _progress[step] = value;
    });

    await ref.read(sentenceProvider.notifier).updateProgress(
          sentenceId: widget.sentenceId,
          understand: step == 'understand' ? value : null,
          speak: step == 'speak' ? value : null,
          confirm: step == 'confirm' ? value : null,
        );
  }

  @override
  Widget build(BuildContext context) {
    final sentenceState = ref.watch(sentenceProvider);
    final sentence = sentenceState.currentSentence;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          '문장 학습',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: sentence == null
          ? const Center(child: Text('문장을 불러올 수 없습니다.'))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Main Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Text(
                          sentence.jp,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppColors.gray900,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        if (sentence.romaji != null) ...[
                          const SizedBox(height: 8),
                          Text(
                            sentence.romaji!,
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.gray400,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                        const SizedBox(height: 12),
                        Text(
                          sentence.kr,
                          style: const TextStyle(
                            fontSize: 18,
                            color: AppColors.gray600,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 20),
                        // Play Button
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton.icon(
                            onPressed: () => _playAudio(sentence.audioUrl),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _isPlaying
                                  ? AppColors.primary
                                  : AppColors.primaryLight,
                              foregroundColor: _isPlaying
                                  ? Colors.white
                                  : AppColors.primary,
                            ),
                            icon: Icon(
                                _isPlaying ? Icons.pause : Icons.play_arrow),
                            label: Text(_isPlaying ? '재생 중...' : '발음 듣기'),
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Tags
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primaryLight,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                sentence.levelName,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.primary,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.gray100,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                sentence.categoryName,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.gray600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Words Section
                  if (sentence.words.isNotEmpty) ...[
                    const Text(
                      '단어 분석',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.gray900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...sentence.words.map((word) => Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    word.japanese,
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.gray900,
                                    ),
                                  ),
                                  if (word.reading != null) ...[
                                    const SizedBox(width: 8),
                                    Text(
                                      word.reading!,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: AppColors.gray500,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                word.meaning,
                                style: const TextStyle(
                                  fontSize: 15,
                                  color: AppColors.gray700,
                                ),
                              ),
                              if (word.partOf != null) ...[
                                const SizedBox(height: 4),
                                Text(
                                  word.partOf!,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.gray400,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        )),
                    const SizedBox(height: 24),
                  ],

                  // Learning Steps
                  const Text(
                    '학습 단계',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.gray900,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildStepCard(
                    number: '1',
                    title: '이해하기',
                    description: '문장의 의미와 문법을 이해했어요',
                    isComplete: _progress['understand']!,
                    onTap: () {
                      _updateProgress('understand', true);
                    },
                  ),
                  _buildStepCard(
                    number: '2',
                    title: '따라 말하기',
                    description: '발음을 듣고 따라 말해보세요',
                    isComplete: _progress['speak']!,
                    onTap: () {
                      _playAudio(sentence.audioUrl);
                      _updateProgress('speak', true);
                    },
                  ),
                  _buildStepCard(
                    number: '3',
                    title: '확인하기',
                    description: '퀴즈로 학습을 확인해요',
                    isComplete: _progress['confirm']!,
                    onTap: () {
                      setState(() => _showQuiz = true);
                    },
                  ),

                  // Quiz Section
                  if (_showQuiz && sentence.quiz != null) ...[
                    const SizedBox(height: 24),
                    const Text(
                      '퀴즈',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.gray900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (sentence.quiz!.fillBlank != null)
                      _buildFillBlankQuiz(sentence),
                    if (sentence.quiz!.ordering != null)
                      _buildOrderingQuiz(sentence),
                  ],

                  const SizedBox(height: 100),
                ],
              ),
            ),
    );
  }

  Widget _buildStepCard({
    required String number,
    required String title,
    required String description,
    required bool isComplete,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isComplete ? AppColors.successLight : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isComplete ? AppColors.success : AppColors.gray100,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isComplete ? AppColors.success : AppColors.gray100,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: isComplete
                    ? const Icon(Icons.check, color: Colors.white, size: 20)
                    : Text(
                        number,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.gray500,
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
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.gray900,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    description,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.gray500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFillBlankQuiz(Sentence sentence) {
    final quiz = sentence.quiz!.fillBlank!;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(
            quiz.questionJp,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.gray900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ...quiz.options.map((option) {
            final isSelected = _selectedFillBlankAnswer == option;
            final isCorrect = _fillBlankCorrect == true && isSelected;
            final isWrong = _fillBlankCorrect == false && isSelected;

            return GestureDetector(
              onTap: _selectedFillBlankAnswer == null
                  ? () => _handleFillBlankAnswer(option, sentence)
                  : null,
              child: Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isCorrect
                      ? AppColors.successLight
                      : isWrong
                          ? AppColors.errorLight
                          : isSelected
                              ? AppColors.primaryLight
                              : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isCorrect
                        ? AppColors.success
                        : isWrong
                            ? AppColors.error
                            : isSelected
                                ? AppColors.primary
                                : AppColors.gray200,
                    width: 2,
                  ),
                ),
                child: Text(
                  option,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color:
                        isSelected ? AppColors.primaryDark : AppColors.gray700,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }),
          if (_fillBlankCorrect != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _fillBlankCorrect!
                    ? AppColors.successLight
                    : AppColors.errorLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _fillBlankCorrect! ? Icons.check_circle : Icons.cancel,
                    color:
                        _fillBlankCorrect! ? AppColors.success : AppColors.error,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _fillBlankCorrect! ? '정답입니다!' : '틀렸어요. 다시 도전해보세요.',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _fillBlankCorrect!
                          ? AppColors.success
                          : AppColors.error,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildOrderingQuiz(Sentence sentence) {
    final quiz = sentence.quiz!.ordering!;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(
            sentence.kr,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.gray600,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          const Text(
            '올바른 순서로 배열하세요',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.gray400,
            ),
          ),
          const SizedBox(height: 16),
          // Selected Order Display
          Container(
            width: double.infinity,
            constraints: const BoxConstraints(minHeight: 48),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.gray50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _selectedOrderingAnswer.map((index) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    quiz.fragments[index],
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Colors.white,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),
          // Options
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: List.generate(quiz.fragments.length, (index) {
              final isSelected = _selectedOrderingAnswer.contains(index);
              return GestureDetector(
                onTap: _orderingCorrect != null
                    ? null
                    : () {
                        setState(() {
                          if (isSelected) {
                            _selectedOrderingAnswer.remove(index);
                          } else {
                            _selectedOrderingAnswer.add(index);
                          }
                        });
                      },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primaryLight : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.gray200,
                      width: 2,
                    ),
                  ),
                  child: Text(
                    quiz.fragments[index],
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color:
                          isSelected ? AppColors.primaryDark : AppColors.gray700,
                    ),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 16),
          if (_selectedOrderingAnswer.length == quiz.fragments.length &&
              _orderingCorrect == null)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _handleOrderingSubmit(sentence),
                child: const Text('정답 확인'),
              ),
            ),
          if (_orderingCorrect != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _orderingCorrect!
                    ? AppColors.successLight
                    : AppColors.errorLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _orderingCorrect! ? Icons.check_circle : Icons.cancel,
                    color:
                        _orderingCorrect! ? AppColors.success : AppColors.error,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _orderingCorrect! ? '정답입니다!' : '틀렸어요. 다시 도전해보세요.',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _orderingCorrect!
                          ? AppColors.success
                          : AppColors.error,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

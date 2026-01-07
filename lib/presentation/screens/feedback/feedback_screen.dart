import 'package:flutter/material.dart' hide Feedback;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/sentence_model.dart';
import '../../providers/auth_provider.dart';

class FeedbackScreen extends ConsumerStatefulWidget {
  final int sessionId;

  const FeedbackScreen({super.key, required this.sessionId});

  @override
  ConsumerState<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends ConsumerState<FeedbackScreen> {
  Feedback? _feedback;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadFeedback();
  }

  Future<void> _loadFeedback() async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final result = await apiService.getFeedback(widget.sessionId);

      if (mounted) {
        setState(() {
          _feedback = result;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = '피드백을 불러올 수 없습니다.';
          _isLoading = false;
        });
      }
    }
  }

  Color _getScoreColor(int score) {
    if (score >= 80) return AppColors.success;
    if (score >= 60) return AppColors.warning;
    return AppColors.error;
  }

  String _getScoreLabel(int score) {
    if (score >= 90) return '훌륭해요!';
    if (score >= 80) return '잘했어요!';
    if (score >= 70) return '좋아요!';
    if (score >= 60) return '괜찮아요';
    return '조금 더 노력해요';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text(
          '학습 피드백',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        automaticallyImplyLeading: false,
      ),
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text(
                    '피드백을 분석하고 있어요...',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.gray500,
                    ),
                  ),
                ],
              ),
            )
          : _error != null || _feedback == null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 48,
                        color: AppColors.gray400,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _error ?? '피드백 데이터가 없습니다.',
                        style: const TextStyle(
                          fontSize: 16,
                          color: AppColors.gray500,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => context.go('/home'),
                        child: const Text('홈으로 돌아가기'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      // Total Score Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
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
                            Container(
                              width: 140,
                              height: 140,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color:
                                      _getScoreColor(_feedback!.totalScore),
                                  width: 8,
                                ),
                              ),
                              child: Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '${_feedback!.totalScore}',
                                      style: TextStyle(
                                        fontSize: 48,
                                        fontWeight: FontWeight.bold,
                                        color: _getScoreColor(
                                            _feedback!.totalScore),
                                      ),
                                    ),
                                    const Text(
                                      '점',
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: AppColors.gray500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _getScoreLabel(_feedback!.totalScore),
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: AppColors.gray900,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              '오늘의 회화 점수입니다',
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.gray500,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Score Details
                      const Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          '상세 점수',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.gray900,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          children: [
                            _buildScoreItem(
                              icon: Icons.menu_book,
                              iconBgColor: AppColors.primaryLight,
                              iconColor: AppColors.primary,
                              label: '문법',
                              score: _feedback!.grammarScore,
                              barColor: AppColors.primary,
                            ),
                            const SizedBox(height: 20),
                            _buildScoreItem(
                              icon: Icons.chat_bubble_outline,
                              iconBgColor: AppColors.successLight,
                              iconColor: AppColors.success,
                              label: '어휘',
                              score: _feedback!.vocabularyScore,
                              barColor: AppColors.success,
                            ),
                            const SizedBox(height: 20),
                            _buildScoreItem(
                              icon: Icons.mic,
                              iconBgColor: AppColors.warningLight,
                              iconColor: AppColors.warning,
                              label: '유창성',
                              score: _feedback!.fluencyScore,
                              barColor: AppColors.warning,
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // AI Feedback
                      if (_feedback!.feedbackText != null) ...[
                        const Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            'AI 피드백',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.gray900,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(
                                    Icons.auto_awesome,
                                    color: AppColors.primary,
                                    size: 20,
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    '학습 조언',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                _feedback!.feedbackText!,
                                style: const TextStyle(
                                  fontSize: 15,
                                  color: AppColors.gray700,
                                  height: 1.6,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],

                      // Action Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => context.go('/home'),
                          child: const Text('홈으로 돌아가기'),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Tips
                      const Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          '다음 학습 팁',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.gray900,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildTipCard(
                        icon: Icons.lightbulb_outline,
                        iconColor: AppColors.warning,
                        text: '매일 5문장씩 꾸준히 학습하면 실력이 빠르게 향상됩니다.',
                      ),
                      const SizedBox(height: 8),
                      _buildTipCard(
                        icon: Icons.refresh,
                        iconColor: AppColors.success,
                        text: '틀린 문장은 다시 복습하면 기억에 오래 남습니다.',
                      ),

                      const SizedBox(height: 100),
                    ],
                  ),
                ),
    );
  }

  Widget _buildScoreItem({
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required String label,
    required int score,
    required Color barColor,
  }) {
    return Column(
      children: [
        Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconBgColor,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.gray900,
                ),
              ),
            ),
            Text(
              '$score점',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.gray900,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          height: 8,
          margin: const EdgeInsets.only(left: 48),
          decoration: BoxDecoration(
            color: AppColors.gray200,
            borderRadius: BorderRadius.circular(4),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: score / 100,
            child: Container(
              decoration: BoxDecoration(
                color: barColor,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTipCard({
    required IconData icon,
    required Color iconColor,
    required String text,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: iconColor, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.gray700,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

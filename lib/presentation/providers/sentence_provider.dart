import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/sentence_model.dart';
import 'auth_provider.dart';

class SentenceState {
  final bool isLoading;
  final DailySentencesResponse? todayData;
  final Sentence? currentSentence;
  final Map<int, LearningProgress> progressMap;
  final String? error;

  SentenceState({
    this.isLoading = false,
    this.todayData,
    this.currentSentence,
    this.progressMap = const {},
    this.error,
  });

  List<Sentence> get todaySentences => todayData?.sentences ?? [];
  List<Sentence> get newSentences =>
      todaySentences.where((s) => !s.memorized).toList();
  List<Sentence> get reviewSentences =>
      todaySentences.where((s) => s.memorized).toList();
  int get dailySetId => todayData?.dailySetId ?? 0;
  bool get allMemorized =>
      todaySentences.isNotEmpty &&
      todaySentences.every((s) =>
          s.memorized || (progressMap[s.id]?.memorized ?? false));

  SentenceState copyWith({
    bool? isLoading,
    DailySentencesResponse? todayData,
    Sentence? currentSentence,
    Map<int, LearningProgress>? progressMap,
    String? error,
  }) {
    return SentenceState(
      isLoading: isLoading ?? this.isLoading,
      todayData: todayData ?? this.todayData,
      currentSentence: currentSentence ?? this.currentSentence,
      progressMap: progressMap ?? this.progressMap,
      error: error,
    );
  }
}

class SentenceNotifier extends StateNotifier<SentenceState> {
  final Ref _ref;

  SentenceNotifier(this._ref) : super(SentenceState());

  /// Load today's sentences
  Future<void> loadTodaySentences() async {
    if (state.isLoading) return;
    state = state.copyWith(isLoading: true);

    try {
      final apiService = _ref.read(apiServiceProvider);
      final todayData = await apiService.getTodaySentences();

      if (todayData != null) {
        // Load progress only if dailySetId is valid
        var progressMap = <int, LearningProgress>{};
        if (todayData.dailySetId > 0) {
          final progressList =
              await apiService.getTodayLearningProgress(todayData.dailySetId);
          for (final progress in progressList) {
            progressMap[progress.sentenceId] = progress;
          }
        }

        state = state.copyWith(
          isLoading: false,
          todayData: todayData,
          progressMap: progressMap,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: '오늘의 문장을 불러올 수 없습니다.',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Set current sentence for detail view
  void setCurrentSentence(Sentence sentence) {
    state = state.copyWith(currentSentence: sentence);
  }

  /// Clear current sentence
  void clearCurrentSentence() {
    state = SentenceState(
      isLoading: state.isLoading,
      todayData: state.todayData,
      progressMap: state.progressMap,
      error: state.error,
    );
  }

  /// Update learning progress
  Future<bool> updateProgress({
    required int sentenceId,
    bool? understand,
    bool? speak,
    bool? confirm,
    bool? memorized,
  }) async {
    if (state.dailySetId == 0) return false;

    try {
      final apiService = _ref.read(apiServiceProvider);
      final success = await apiService.updateLearningProgress(
        sentenceId: sentenceId,
        dailySetId: state.dailySetId,
        understand: understand,
        speak: speak,
        confirm: confirm,
        memorized: memorized,
      );

      if (success) {
        // Update local state
        final currentProgress = state.progressMap[sentenceId] ??
            LearningProgress(
              sentenceId: sentenceId,
              dailySetId: state.dailySetId,
            );

        final updatedProgress = LearningProgress(
          sentenceId: sentenceId,
          dailySetId: state.dailySetId,
          understand: understand ?? currentProgress.understand,
          speak: speak ?? currentProgress.speak,
          confirm: confirm ?? currentProgress.confirm,
          memorized: memorized ?? currentProgress.memorized,
        );

        final newProgressMap = Map<int, LearningProgress>.from(state.progressMap);
        newProgressMap[sentenceId] = updatedProgress;

        state = state.copyWith(progressMap: newProgressMap);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Submit quiz answer
  Future<QuizResult?> submitQuizAnswer({
    required int sentenceId,
    String? fillBlankAnswer,
    List<int>? orderingAnswer,
  }) async {
    if (state.dailySetId == 0) return null;

    try {
      final apiService = _ref.read(apiServiceProvider);
      final result = await apiService.submitQuizAnswer(
        sentenceId: sentenceId,
        dailySetId: state.dailySetId,
        fillBlankAnswer: fillBlankAnswer,
        orderingAnswer: orderingAnswer,
      );

      if (result != null && result.memorized) {
        // Update progress if memorized
        final newProgressMap = Map<int, LearningProgress>.from(state.progressMap);
        final currentProgress = newProgressMap[sentenceId];
        if (currentProgress != null) {
          newProgressMap[sentenceId] = LearningProgress(
            sentenceId: sentenceId,
            dailySetId: state.dailySetId,
            understand: currentProgress.understand,
            speak: currentProgress.speak,
            confirm: true,
            memorized: true,
          );
          state = state.copyWith(progressMap: newProgressMap);
        }
      }

      return result;
    } catch (e) {
      return null;
    }
  }

  /// Get progress for a sentence
  LearningProgress? getProgress(int sentenceId) {
    return state.progressMap[sentenceId];
  }
}

final sentenceProvider =
    StateNotifierProvider<SentenceNotifier, SentenceState>((ref) {
  return SentenceNotifier(ref);
});

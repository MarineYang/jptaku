import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useAppStore, Sentence, LearningProgress } from '../store/useAppStore';

type RouteParams = {
  SentenceDetail: { id: number };
};

export default function SentenceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'SentenceDetail'>>();
  const { id } = route.params;

  // Store state
  const dailySet = useAppStore((state) => state.dailySet);
  const localProgress = useAppStore((state) => state.localProgress);

  // Store actions
  const updateLearningProgress = useAppStore((state) => state.updateLearningProgress);
  const submitQuiz = useAppStore((state) => state.submitQuiz);

  // Find sentence from dailySet
  const sentence = dailySet?.sentences.find((s) => s.id === id);
  const progress = localProgress[id] || {
    sentence_id: id,
    understand: false,
    speak: false,
    confirm: false,
    memorized: false,
    quiz_completed: false,
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedFillBlankAnswer, setSelectedFillBlankAnswer] = useState<string | null>(null);
  const [selectedOrderingAnswer, setSelectedOrderingAnswer] = useState<number[] | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [orderingFragments, setOrderingFragments] = useState<{ text: string; originalIndex: number }[]>([]);

  if (!sentence) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>문장을 찾을 수 없습니다.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handlePlay = () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    Speech.speak(sentence.jp, {
      language: 'ja-JP',
      rate: 0.9,
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const handleStepComplete = async (step: 'understand' | 'speak' | 'confirm') => {
    await updateLearningProgress(id, { [step]: true });

    // Check if all steps are complete for memorization
    const newProgress = {
      ...progress,
      [step]: true,
    };

    if (newProgress.understand && newProgress.speak && newProgress.confirm && newProgress.quiz_completed) {
      await updateLearningProgress(id, { memorized: true });
    }
  };

  const handleShowQuiz = () => {
    setShowQuiz(true);
    // Initialize ordering fragments if ordering quiz exists
    if (sentence.quiz?.ordering) {
      const shuffled = sentence.quiz.ordering.fragments
        .map((text, index) => ({ text, originalIndex: index }))
        .sort(() => Math.random() - 0.5);
      setOrderingFragments(shuffled);
    }
  };

  const handleFillBlankAnswer = async (answer: string) => {
    setSelectedFillBlankAnswer(answer);
    const isCorrect = await submitQuiz(id, answer);
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      await handleStepComplete('confirm');
      await updateLearningProgress(id, { quiz_completed: true });
    }
  };

  const handleOrderingSubmit = async () => {
    if (!selectedOrderingAnswer) return;

    const isCorrect = await submitQuiz(id, undefined, selectedOrderingAnswer);
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      await handleStepComplete('confirm');
      await updateLearningProgress(id, { quiz_completed: true });
    }
  };

  const handleOrderingSelect = (fragmentIndex: number) => {
    const newOrder = selectedOrderingAnswer ? [...selectedOrderingAnswer] : [];
    const fragment = orderingFragments[fragmentIndex];

    if (newOrder.includes(fragment.originalIndex)) {
      // Remove from selection
      const idx = newOrder.indexOf(fragment.originalIndex);
      newOrder.splice(idx, 1);
    } else {
      // Add to selection
      newOrder.push(fragment.originalIndex);
    }

    setSelectedOrderingAnswer(newOrder);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      anime: '애니',
      game: '게임',
      music: '음악',
      movie: '영화',
      drama: '드라마',
    };
    return labels[category] || category;
  };

  const allStepsComplete = progress.understand && progress.speak && progress.confirm && progress.quiz_completed;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문장 학습</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Main Sentence Card */}
        <View style={styles.mainCard}>
          <Text style={styles.japaneseText}>{sentence.jp}</Text>
          {sentence.romaji && (
            <Text style={styles.romajiText}>{sentence.romaji}</Text>
          )}
          <Text style={styles.meaningText}>{sentence.kr}</Text>

          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handlePlay}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={isPlaying ? '#fff' : '#2563EB'} />
            <Text style={[styles.playButtonText, isPlaying && styles.playButtonTextActive]}>
              {isPlaying ? '재생 중...' : '발음 듣기'}
            </Text>
          </TouchableOpacity>

          <View style={styles.tagsContainer}>
            <View style={styles.levelTag}>
              <Text style={styles.levelTagText}>{sentence.level}</Text>
            </View>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{getCategoryLabel(sentence.category)}</Text>
            </View>
          </View>
        </View>

        {/* Words Section */}
        {sentence.detail?.words && sentence.detail.words.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>단어</Text>
            <View style={styles.wordsList}>
              {sentence.detail.words.map((word, idx) => (
                <View key={idx} style={styles.wordCard}>
                  <View style={styles.wordHeader}>
                    <Text style={styles.wordJapanese}>{word.japanese}</Text>
                    <Text style={styles.wordReading}>{word.reading}</Text>
                  </View>
                  <Text style={styles.wordMeaning}>{word.meaning}</Text>
                  {word.part_of_speech && (
                    <Text style={styles.wordPartOf}>{word.part_of_speech}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Grammar Section */}
        {sentence.detail?.grammar && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>문법</Text>
            <View style={styles.grammarCard}>
              <Ionicons name="book-outline" size={16} color="#6B7280" />
              <Text style={styles.grammarText}>{sentence.detail.grammar}</Text>
            </View>
          </View>
        )}

        {/* Examples Section */}
        {sentence.detail?.examples && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>예문</Text>
            <View style={styles.examplesCard}>
              <Text style={styles.examplesText}>{sentence.detail.examples}</Text>
            </View>
          </View>
        )}

        {/* Learning Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>학습 단계</Text>
          <View style={styles.stepsList}>
            <TouchableOpacity
              style={[styles.stepCard, progress.understand && styles.stepCardComplete]}
              onPress={() => handleStepComplete('understand')}
            >
              <View style={[styles.stepIcon, progress.understand && styles.stepIconComplete]}>
                {progress.understand ? (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                ) : (
                  <Text style={styles.stepNumber}>1</Text>
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>이해하기</Text>
                <Text style={styles.stepDesc}>문장의 의미와 문법을 이해했어요</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepCard, progress.speak && styles.stepCardComplete]}
              onPress={() => {
                handlePlay();
                handleStepComplete('speak');
              }}
            >
              <View style={[styles.stepIcon, progress.speak && styles.stepIconComplete]}>
                {progress.speak ? (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                ) : (
                  <Text style={styles.stepNumber}>2</Text>
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>따라 말하기</Text>
                <Text style={styles.stepDesc}>발음을 듣고 따라 말해보세요</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepCard, progress.confirm && styles.stepCardComplete]}
              onPress={handleShowQuiz}
            >
              <View style={[styles.stepIcon, progress.confirm && styles.stepIconComplete]}>
                {progress.confirm ? (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                ) : (
                  <Text style={styles.stepNumber}>3</Text>
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>확인하기</Text>
                <Text style={styles.stepDesc}>퀴즈로 학습을 확인해보세요</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fill Blank Quiz */}
        {showQuiz && sentence.quiz?.fill_blank && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>빈칸 채우기</Text>
            <View style={styles.quizCard}>
              <Text style={styles.quizQuestion}>{sentence.quiz.fill_blank.question_jp}</Text>
              <View style={styles.quizOptions}>
                {sentence.quiz.fill_blank.options.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.quizOption,
                      selectedFillBlankAnswer === option && styles.quizOptionSelected,
                      selectedFillBlankAnswer === option && isAnswerCorrect === true && styles.quizOptionCorrect,
                      selectedFillBlankAnswer === option && isAnswerCorrect === false && styles.quizOptionWrong,
                    ]}
                    onPress={() => handleFillBlankAnswer(option)}
                    disabled={selectedFillBlankAnswer !== null}
                  >
                    <Text style={[
                      styles.quizOptionText,
                      selectedFillBlankAnswer === option && styles.quizOptionTextSelected,
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {isAnswerCorrect !== null && selectedFillBlankAnswer && (
                <View style={[styles.quizResult, isAnswerCorrect ? styles.quizResultCorrect : styles.quizResultWrong]}>
                  <Ionicons
                    name={isAnswerCorrect ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={isAnswerCorrect ? '#16A34A' : '#DC2626'}
                  />
                  <Text style={[styles.quizResultText, isAnswerCorrect ? styles.quizResultTextCorrect : styles.quizResultTextWrong]}>
                    {isAnswerCorrect ? '정답입니다!' : '다시 시도해보세요'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Ordering Quiz */}
        {showQuiz && sentence.quiz?.ordering && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>문장 배열하기</Text>
            <View style={styles.quizCard}>
              <Text style={styles.quizInstruction}>올바른 순서로 선택하세요</Text>

              {/* Selected order display */}
              {selectedOrderingAnswer && selectedOrderingAnswer.length > 0 && (
                <View style={styles.selectedOrder}>
                  {selectedOrderingAnswer.map((origIdx, idx) => (
                    <View key={idx} style={styles.selectedOrderItem}>
                      <Text style={styles.selectedOrderText}>
                        {sentence.quiz!.ordering!.fragments[origIdx]}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Fragment options */}
              <View style={styles.orderingOptions}>
                {orderingFragments.map((fragment, idx) => {
                  const isSelected = selectedOrderingAnswer?.includes(fragment.originalIndex);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.orderingOption,
                        isSelected && styles.orderingOptionSelected,
                      ]}
                      onPress={() => handleOrderingSelect(idx)}
                      disabled={isAnswerCorrect !== null}
                    >
                      <Text style={[
                        styles.orderingOptionText,
                        isSelected && styles.orderingOptionTextSelected,
                      ]}>
                        {fragment.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Submit button */}
              {selectedOrderingAnswer && selectedOrderingAnswer.length === orderingFragments.length && isAnswerCorrect === null && (
                <TouchableOpacity style={styles.submitButton} onPress={handleOrderingSubmit}>
                  <Text style={styles.submitButtonText}>정답 확인</Text>
                </TouchableOpacity>
              )}

              {isAnswerCorrect !== null && !selectedFillBlankAnswer && (
                <View style={[styles.quizResult, isAnswerCorrect ? styles.quizResultCorrect : styles.quizResultWrong]}>
                  <Ionicons
                    name={isAnswerCorrect ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={isAnswerCorrect ? '#16A34A' : '#DC2626'}
                  />
                  <Text style={[styles.quizResultText, isAnswerCorrect ? styles.quizResultTextCorrect : styles.quizResultTextWrong]}>
                    {isAnswerCorrect ? '정답입니다!' : '다시 시도해보세요'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Completion Badge */}
        {allStepsComplete && (
          <View style={styles.completionBadge}>
            <Ionicons name="trophy" size={32} color="#EAB308" />
            <Text style={styles.completionText}>학습 완료!</Text>
            <Text style={styles.completionSubtext}>이 문장을 마스터했어요</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  backLink: { fontSize: 16, color: '#2563EB', fontWeight: '600' },

  // Main Card
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  japaneseText: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  romajiText: { fontSize: 14, color: '#9CA3AF', marginBottom: 8, textAlign: 'center' },
  meaningText: { fontSize: 18, color: '#374151', marginBottom: 20, textAlign: 'center' },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    height: 48,
    gap: 8,
    marginBottom: 16,
  },
  playButtonActive: { backgroundColor: '#2563EB' },
  playButtonText: { fontSize: 16, fontWeight: '600', color: '#2563EB' },
  playButtonTextActive: { color: '#fff' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  levelTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelTagText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  categoryTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryTagText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

  // Sections
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },

  // Words
  wordsList: { gap: 12 },
  wordCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  wordHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  wordJapanese: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  wordReading: { fontSize: 14, color: '#6B7280' },
  wordMeaning: { fontSize: 15, color: '#374151' },
  wordPartOf: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },

  // Grammar
  grammarCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  grammarText: { fontSize: 14, color: '#374151', flex: 1 },

  // Examples
  examplesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  examplesText: { fontSize: 14, color: '#374151', lineHeight: 22 },

  // Steps
  stepsList: { gap: 12 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  stepCardComplete: { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconComplete: { backgroundColor: '#22C55E' },
  stepNumber: { fontSize: 16, fontWeight: 'bold', color: '#6B7280' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  stepDesc: { fontSize: 13, color: '#6B7280' },

  // Quiz
  quizCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  quizQuestion: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16, textAlign: 'center' },
  quizInstruction: { fontSize: 14, color: '#6B7280', marginBottom: 16, textAlign: 'center' },
  quizOptions: { gap: 12 },
  quizOption: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quizOptionSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  quizOptionCorrect: { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },
  quizOptionWrong: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  quizOptionText: { fontSize: 16, fontWeight: '500', color: '#374151' },
  quizOptionTextSelected: { color: '#1D4ED8' },
  quizResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  quizResultCorrect: { backgroundColor: '#F0FDF4' },
  quizResultWrong: { backgroundColor: '#FEF2F2' },
  quizResultText: { fontSize: 14, fontWeight: '600' },
  quizResultTextCorrect: { color: '#16A34A' },
  quizResultTextWrong: { color: '#DC2626' },

  // Ordering Quiz
  selectedOrder: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    minHeight: 48,
  },
  selectedOrderItem: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectedOrderText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  orderingOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  orderingOption: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  orderingOptionSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  orderingOptionText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  orderingOptionTextSelected: { color: '#1D4ED8' },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },

  // Completion
  completionBadge: {
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
  },
  completionText: { fontSize: 20, fontWeight: 'bold', color: '#A16207', marginTop: 8 },
  completionSubtext: { fontSize: 14, color: '#CA8A04', marginTop: 4 },
});

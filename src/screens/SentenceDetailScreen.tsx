import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useAppStore } from '../store/useAppStore';

type RouteParams = {
  SentenceDetail: { id: string | number };
};

export default function SentenceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'SentenceDetail'>>();
  const { id } = route.params;

  const todaySentences = useAppStore((state) => state.todaySentences);
  const sentenceProgress = useAppStore((state) => state.sentenceProgress);
  const updateStepStatus = useAppStore((state) => state.updateStepStatus);
  const markSentenceAsMemorized = useAppStore((state) => state.markSentenceAsMemorized);

  const sentence = todaySentences.find((s) => s.id === id);
  const progress = sentenceProgress[id] || { status: 'not_started', steps: { understand: false, speak: false, check: false } };

  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

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
    Speech.speak(sentence.japanese, {
      language: 'ja-JP',
      rate: 0.9,
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const handleStepComplete = (step: 'understand' | 'speak' | 'check') => {
    updateStepStatus(id, step, true);
  };

  const handleQuizAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === sentence.quiz?.fill_blank?.answer;
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      handleStepComplete('check');
      // Check if all steps are complete
      const newSteps = { ...progress.steps, check: true };
      if (newSteps.understand && newSteps.speak && newSteps.check) {
        markSentenceAsMemorized(id);
      }
    }
  };

  const allStepsComplete = progress.steps.understand && progress.steps.speak && progress.steps.check;

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
          <Text style={styles.japaneseText}>{sentence.japanese}</Text>
          {sentence.reading && (
            <Text style={styles.readingText}>{sentence.reading}</Text>
          )}
          <Text style={styles.meaningText}>{sentence.meaning}</Text>

          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handlePlay}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={isPlaying ? '#fff' : '#2563EB'} />
            <Text style={[styles.playButtonText, isPlaying && styles.playButtonTextActive]}>
              {isPlaying ? '재생 중...' : '발음 듣기'}
            </Text>
          </TouchableOpacity>

          {sentence.tags && sentence.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {sentence.tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Words Section */}
        {sentence.words && sentence.words.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>단어</Text>
            <View style={styles.wordsList}>
              {sentence.words.map((word, idx) => (
                <View key={idx} style={styles.wordCard}>
                  <View style={styles.wordHeader}>
                    <Text style={styles.wordJapanese}>{word.japanese}</Text>
                    <Text style={styles.wordReading}>{word.reading}</Text>
                  </View>
                  <Text style={styles.wordMeaning}>{word.meaning}</Text>
                  {word.part_of && (
                    <Text style={styles.wordPartOf}>{word.part_of}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Grammar Section */}
        {sentence.grammar && sentence.grammar.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>문법</Text>
            <View style={styles.grammarList}>
              {sentence.grammar.map((item, idx) => (
                <View key={idx} style={styles.grammarItem}>
                  <Ionicons name="book-outline" size={16} color="#6B7280" />
                  <Text style={styles.grammarText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Learning Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>학습 단계</Text>
          <View style={styles.stepsList}>
            <TouchableOpacity
              style={[styles.stepCard, progress.steps.understand && styles.stepCardComplete]}
              onPress={() => handleStepComplete('understand')}
            >
              <View style={[styles.stepIcon, progress.steps.understand && styles.stepIconComplete]}>
                {progress.steps.understand ? (
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
              style={[styles.stepCard, progress.steps.speak && styles.stepCardComplete]}
              onPress={() => {
                handlePlay();
                handleStepComplete('speak');
              }}
            >
              <View style={[styles.stepIcon, progress.steps.speak && styles.stepIconComplete]}>
                {progress.steps.speak ? (
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
              style={[styles.stepCard, progress.steps.check && styles.stepCardComplete]}
              onPress={() => setShowQuiz(true)}
            >
              <View style={[styles.stepIcon, progress.steps.check && styles.stepIconComplete]}>
                {progress.steps.check ? (
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

        {/* Quiz Section */}
        {showQuiz && sentence.quiz?.fill_blank && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>퀴즈</Text>
            <View style={styles.quizCard}>
              <Text style={styles.quizQuestion}>{sentence.quiz.fill_blank.question_jp}</Text>
              <View style={styles.quizOptions}>
                {sentence.quiz.fill_blank.options.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.quizOption,
                      selectedAnswer === option && styles.quizOptionSelected,
                      selectedAnswer === option && isAnswerCorrect === true && styles.quizOptionCorrect,
                      selectedAnswer === option && isAnswerCorrect === false && styles.quizOptionWrong,
                    ]}
                    onPress={() => handleQuizAnswer(option)}
                    disabled={selectedAnswer !== null}
                  >
                    <Text style={[
                      styles.quizOptionText,
                      selectedAnswer === option && styles.quizOptionTextSelected,
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {isAnswerCorrect !== null && (
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
  readingText: { fontSize: 16, color: '#6B7280', marginBottom: 8, textAlign: 'center' },
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
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  wordsList: { gap: 12 },
  wordCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  wordHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  wordJapanese: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  wordReading: { fontSize: 14, color: '#6B7280' },
  wordMeaning: { fontSize: 15, color: '#374151' },
  wordPartOf: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  grammarList: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 12 },
  grammarItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  grammarText: { fontSize: 14, color: '#374151', flex: 1 },
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
  quizCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  quizQuestion: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16, textAlign: 'center' },
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

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, Feedback } from '../store/useAppStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

type RootStackParamList = {
  Main: undefined;
  Feedback: { sessionId: number };
};

type RouteParams = {
  Feedback: { sessionId: number };
};

export default function FeedbackScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RouteParams, 'Feedback'>>();
  const sessionId = route.params?.sessionId;

  const accessToken = useAppStore((state) => state.accessToken);

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!accessToken || !sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/feedback/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setFeedback(data.data);
        } else {
          setError('피드백을 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('Fetch feedback error:', err);
        setError('피드백을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [accessToken, sessionId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '훌륭해요!';
    if (score >= 80) return '잘했어요!';
    if (score >= 70) return '좋아요!';
    if (score >= 60) return '괜찮아요';
    return '조금 더 노력해요';
  };

  const handleGoHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>피드백을 분석하고 있어요...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !feedback) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>학습 피드백</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
          <Text style={styles.errorText}>{error || '피드백 데이터가 없습니다.'}</Text>
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Text style={styles.homeButtonText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>학습 피드백</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Total Score Card */}
        <View style={styles.totalScoreCard}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor(feedback.total_score) }]}>
            <Text style={[styles.totalScoreText, { color: getScoreColor(feedback.total_score) }]}>
              {feedback.total_score}
            </Text>
            <Text style={styles.scoreUnit}>점</Text>
          </View>
          <Text style={styles.scoreLabel}>{getScoreLabel(feedback.total_score)}</Text>
          <Text style={styles.scoreDesc}>오늘의 회화 점수입니다</Text>
        </View>

        {/* Score Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상세 점수</Text>
          <View style={styles.scoresCard}>
            <View style={styles.scoreItem}>
              <View style={styles.scoreHeader}>
                <View style={[styles.scoreIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="book-outline" size={20} color="#2563EB" />
                </View>
                <Text style={styles.scoreName}>문법</Text>
              </View>
              <View style={styles.scoreBarContainer}>
                <View
                  style={[
                    styles.scoreBar,
                    { width: `${feedback.grammar_score}%`, backgroundColor: '#2563EB' },
                  ]}
                />
              </View>
              <Text style={styles.scoreValue}>{feedback.grammar_score}점</Text>
            </View>

            <View style={styles.scoreItem}>
              <View style={styles.scoreHeader}>
                <View style={[styles.scoreIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="chatbox-outline" size={20} color="#10B981" />
                </View>
                <Text style={styles.scoreName}>어휘</Text>
              </View>
              <View style={styles.scoreBarContainer}>
                <View
                  style={[
                    styles.scoreBar,
                    { width: `${feedback.vocabulary_score}%`, backgroundColor: '#10B981' },
                  ]}
                />
              </View>
              <Text style={styles.scoreValue}>{feedback.vocabulary_score}점</Text>
            </View>

            <View style={styles.scoreItem}>
              <View style={styles.scoreHeader}>
                <View style={[styles.scoreIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="mic-outline" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.scoreName}>유창성</Text>
              </View>
              <View style={styles.scoreBarContainer}>
                <View
                  style={[
                    styles.scoreBar,
                    { width: `${feedback.fluency_score}%`, backgroundColor: '#F59E0B' },
                  ]}
                />
              </View>
              <Text style={styles.scoreValue}>{feedback.fluency_score}점</Text>
            </View>
          </View>
        </View>

        {/* AI Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI 피드백</Text>
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <Ionicons name="sparkles" size={20} color="#2563EB" />
              <Text style={styles.feedbackHeaderText}>학습 조언</Text>
            </View>
            <Text style={styles.feedbackText}>{feedback.feedback_text}</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleGoHome}>
          <Text style={styles.actionButtonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>다음 학습 팁</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
            <Text style={styles.tipText}>매일 5문장씩 꾸준히 학습하면 실력이 빠르게 향상됩니다.</Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="repeat-outline" size={20} color="#10B981" />
            <Text style={styles.tipText}>틀린 문장은 다시 복습하면 기억에 오래 남습니다.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: { fontSize: 16, color: '#6B7280' },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  errorText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  homeButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  homeButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },

  // Total Score
  totalScoreCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  totalScoreText: { fontSize: 48, fontWeight: 'bold' },
  scoreUnit: { fontSize: 16, color: '#6B7280' },
  scoreLabel: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  scoreDesc: { fontSize: 14, color: '#6B7280' },

  // Section
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },

  // Scores Card
  scoresCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 20 },
  scoreItem: { gap: 8 },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scoreIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreName: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
  scoreValue: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  scoreBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginLeft: 48,
    marginRight: 48,
  },
  scoreBar: { height: 8, borderRadius: 4 },

  // Feedback Card
  feedbackCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  feedbackHeaderText: { fontSize: 16, fontWeight: 'bold', color: '#2563EB' },
  feedbackText: { fontSize: 15, color: '#374151', lineHeight: 24 },

  // Action Button
  actionButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  actionButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },

  // Tips
  tipsSection: { marginBottom: 24 },
  tipsTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  tipText: { fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useAppStore, Sentence } from '../store/useAppStore';

type RootStackParamList = {
  SentenceDetail: { id: number };
  Conversation: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Store state
  const accessToken = useAppStore((state) => state.accessToken);
  const dailySet = useAppStore((state) => state.dailySet);
  const localProgress = useAppStore((state) => state.localProgress);
  const todayStats = useAppStore((state) => state.todayStats);
  const todayLearning = useAppStore((state) => state.todayLearning);

  // Store actions
  const fetchTodaySentences = useAppStore((state) => state.fetchTodaySentences);
  const fetchLearningProgress = useAppStore((state) => state.fetchLearningProgress);
  const fetchTodayStats = useAppStore((state) => state.fetchTodayStats);

  const [playingId, setPlayingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        await Promise.all([
          fetchTodaySentences(),
          fetchTodayStats(),
        ]);
        // Learning progress는 dailySet이 있어야 호출 가능
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [accessToken]);

  // dailySet이 로드된 후 learning progress 가져오기
  useEffect(() => {
    if (dailySet) {
      fetchLearningProgress();
    }
  }, [dailySet?.daily_set_id]);

  const sentences = dailySet?.sentences || [];

  // 암기 완료된 문장 수 계산
  const memorizedCount = sentences.filter((s) =>
    localProgress[s.id]?.memorized
  ).length;

  const progressPercentage = sentences.length > 0
    ? (memorizedCount / sentences.length) * 100
    : 0;

  const handlePlay = async (item: Sentence) => {
    if (playingId === item.id) {
      Speech.stop();
      setPlayingId(null);
      return;
    }

    Speech.stop();
    setPlayingId(item.id);
    Speech.speak(item.jp, {
      language: 'ja-JP',
      rate: 0.9,
      onDone: () => setPlayingId(null),
      onError: () => setPlayingId(null),
    });
  };

  const getStatusIcon = (item: Sentence) => {
    const progress = localProgress[item.id];

    if (progress?.memorized) {
      return <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />;
    }
    if (progress?.understand || progress?.speak || progress?.confirm) {
      return <Ionicons name="ellipse" size={24} color="#3B82F6" />;
    }
    return <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />;
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

  const SentenceSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonContent}>
            <View style={[styles.skeletonLine, { width: '75%' }]} />
            <View style={[styles.skeletonLine, { width: '50%', marginTop: 8 }]} />
          </View>
          <View style={styles.skeletonActions}>
            <View style={styles.skeletonCircle} />
            <View style={styles.skeletonCircle} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>오늘의 학습</Text>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color="#F97316" />
          <Text style={styles.streakText}>{todayStats?.current_streak || 0}일</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Main CTA */}
        <View style={styles.ctaCard}>
          <View style={styles.ctaBackground} />
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>실전 회화 시작하기</Text>
            <Text style={styles.ctaSubtitle}>하루 10분으로 일본어 마스터하기</Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Conversation')}
            >
              <Ionicons name="play" size={18} color="#2563EB" />
              <Text style={styles.ctaButtonText}>지금 시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{todayStats?.total_learning_minutes || 0}분</Text>
            <Text style={styles.statLabel}>학습 시간</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="chatbubbles-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{todayStats?.total_sessions || 0}회</Text>
            <Text style={styles.statLabel}>회화 세션</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="star-outline" size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{todayStats?.average_score || 0}점</Text>
            <Text style={styles.statLabel}>평균 점수</Text>
          </View>
        </View>

        {/* Today's 5 Sentences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>오늘의 5문장</Text>
              <Text style={styles.sectionSubtitle}>
                <Text style={styles.highlightText}>{memorizedCount}</Text>/{sentences.length} 문장 외움
              </Text>
            </View>
            {dailySet && (
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>{dailySet.date}</Text>
              </View>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.sectionProgressContainer}>
            <View style={[styles.sectionProgressBar, { width: `${progressPercentage}%` }]} />
          </View>

          {/* Sentence List */}
          {isLoading && sentences.length === 0 ? (
            <SentenceSkeleton />
          ) : sentences.length === 0 ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.emptyText}>오늘의 문장을 준비하고 있어요...</Text>
            </View>
          ) : (
            <View style={styles.sentenceList}>
              {sentences.map((item) => {
                const isMemorized = localProgress[item.id]?.memorized;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.sentenceCard, isMemorized && styles.sentenceCardMemorized]}
                    onPress={() => navigation.navigate('SentenceDetail', { id: item.id })}
                  >
                    <View style={styles.sentenceContent}>
                      <Text style={styles.japaneseText} numberOfLines={1}>{item.jp}</Text>
                      <Text style={styles.meaningText} numberOfLines={1}>{item.kr}</Text>
                      <View style={styles.tagsContainer}>
                        <View style={styles.levelTag}>
                          <Text style={styles.levelTagText}>{item.level}</Text>
                        </View>
                        <View style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>{getCategoryLabel(item.category)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.sentenceActions}>
                      <TouchableOpacity
                        style={[styles.playButton, playingId === item.id && styles.playButtonActive]}
                        onPress={() => handlePlay(item)}
                      >
                        <Ionicons
                          name={playingId === item.id ? 'pause' : 'play'}
                          size={16}
                          color={playingId === item.id ? '#2563EB' : '#9CA3AF'}
                        />
                      </TouchableOpacity>
                      {getStatusIcon(item)}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  streakText: { fontSize: 14, fontWeight: 'bold', color: '#F97316' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 },

  // CTA Card
  ctaCard: {
    borderRadius: 24,
    backgroundColor: '#2563EB',
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  ctaBackground: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#3B82F6',
    opacity: 0.5,
  },
  ctaContent: { position: 'relative' },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  ctaSubtitle: { fontSize: 14, color: '#BFDBFE', marginBottom: 24 },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 48,
    gap: 8,
  },
  ctaButtonText: { fontSize: 16, fontWeight: 'bold', color: '#2563EB' },

  // Stats Card
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#6B7280' },
  highlightText: { color: '#2563EB', fontWeight: 'bold' },
  dateBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionProgressContainer: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 16 },
  sectionProgressBar: { height: 8, backgroundColor: '#3B82F6', borderRadius: 4 },

  // Sentence List
  sentenceList: { gap: 12 },
  sentenceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sentenceCardMemorized: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE' },
  sentenceContent: { flex: 1, marginRight: 12 },
  japaneseText: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  meaningText: { fontSize: 14, color: '#6B7280' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  levelTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelTagText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  categoryTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: { fontSize: 12, color: '#6B7280' },
  sentenceActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: { backgroundColor: '#DBEAFE' },

  // Skeleton
  skeletonContainer: { gap: 12 },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonContent: { flex: 1 },
  skeletonLine: { height: 16, backgroundColor: '#E5E7EB', borderRadius: 4 },
  skeletonActions: { flexDirection: 'row', gap: 12 },
  skeletonCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB' },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 12 },
});

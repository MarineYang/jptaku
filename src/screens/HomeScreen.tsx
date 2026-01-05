import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useAppStore, DailySentence } from '../store/useAppStore';

type RootStackParamList = {
  SentenceDetail: { id: string | number };
  Conversation: undefined;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const accessToken = useAppStore((state) => state.accessToken);
  const todaySentences = useAppStore((state) => state.todaySentences);
  const setTodaySentences = useAppStore((state) => state.setTodaySentences);
  const sentenceProgress = useAppStore((state) => state.sentenceProgress);
  const user = useAppStore((state) => state.user);

  const [playingId, setPlayingId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTodaySentences = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      if (todaySentences.length > 0) {
        setIsLoading(false);
      }

      try {
        const response = await fetch(`${API_URL}/api/sentences/today`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const responseData = await response.json();
          const sentencesData = responseData.data?.sentences || responseData.sentences || responseData || [];
          const sentences: DailySentence[] = sentencesData.map((s: Record<string, unknown>) => ({
            id: s.id,
            japanese: (s.jp || s.japanese || '') as string,
            reading: (s.reading || s.furigana || '') as string,
            meaning: (s.kr || s.meaning || '') as string,
            romaji: (s.romaji || '') as string,
            tags: (s.tags || []) as string[],
            categories: (s.categories || []) as number[],
            memorized: (s.memorized || false) as boolean,
            words: (s.words || []) as DailySentence['words'],
            grammar: (s.grammar || []) as string[],
            examples: (s.examples || []) as string[],
            quiz: (s.quiz || {}) as DailySentence['quiz'],
          }));
          setTodaySentences(sentences);
        }
      } catch (err) {
        console.error('Failed to fetch today sentences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaySentences();
  }, [accessToken, setTodaySentences]);

  const memorizedCount = todaySentences.filter((s) => s.memorized).length;
  const progressPercentage = todaySentences.length > 0 ? (memorizedCount / todaySentences.length) * 100 : 0;

  const handlePlay = async (item: DailySentence) => {
    if (playingId === item.id) {
      Speech.stop();
      setPlayingId(null);
      return;
    }

    Speech.stop();
    setPlayingId(item.id);
    Speech.speak(item.japanese, {
      language: 'ja-JP',
      rate: 0.9,
      onDone: () => setPlayingId(null),
      onError: () => setPlayingId(null),
    });
  };

  const getStatusIcon = (item: DailySentence) => {
    if (item.memorized) {
      return <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />;
    }
    const localStatus = sentenceProgress[item.id]?.status;
    if (localStatus === 'in_progress') {
      return <Ionicons name="ellipse" size={24} color="#3B82F6" />;
    }
    return <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />;
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
          <Text style={styles.streakText}>{user.streak}일</Text>
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

        {/* Total Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <View style={styles.trophyCircle}>
              <Ionicons name="trophy" size={20} color="#CA8A04" />
            </View>
            <View>
              <Text style={styles.progressLabel}>학습한 총 문장</Text>
              <Text style={styles.progressCount}>
                500 <Text style={styles.progressTotal}>/ 6000</Text>
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${(500 / 6000) * 100}%` }]} />
          </View>
        </View>

        {/* Today's 5 Sentences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>오늘의 5문장</Text>
              <Text style={styles.sectionSubtitle}>
                <Text style={styles.highlightText}>{memorizedCount}</Text>/5 문장 외움
              </Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>전체 보기</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.sectionProgressContainer}>
            <View style={[styles.sectionProgressBar, { width: `${progressPercentage}%` }]} />
          </View>

          {/* Sentence List */}
          {isLoading && todaySentences.length === 0 ? (
            <SentenceSkeleton />
          ) : todaySentences.length === 0 ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.emptyText}>오늘의 문장을 준비하고 있어요...</Text>
            </View>
          ) : (
            <View style={styles.sentenceList}>
              {todaySentences.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.sentenceCard, item.memorized && styles.sentenceCardMemorized]}
                  onPress={() => navigation.navigate('SentenceDetail', { id: item.id })}
                >
                  <View style={styles.sentenceContent}>
                    <Text style={styles.japaneseText} numberOfLines={1}>{item.japanese}</Text>
                    <Text style={styles.meaningText} numberOfLines={1}>{item.meaning}</Text>
                    {item.tags && item.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {item.tags.map((tag, idx) => (
                          <View key={idx} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
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
              ))}
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
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  progressInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  trophyCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF9C3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  progressCount: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  progressTotal: { fontSize: 14, fontWeight: 'normal', color: '#9CA3AF' },
  progressBarContainer: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4 },
  progressBar: { height: 8, backgroundColor: '#EAB308', borderRadius: 4 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#6B7280' },
  highlightText: { color: '#2563EB', fontWeight: 'bold' },
  viewAllButton: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { fontSize: 14, color: '#9CA3AF' },
  sectionProgressContainer: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 16 },
  sectionProgressBar: { height: 8, backgroundColor: '#3B82F6', borderRadius: 4 },
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
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 12, color: '#6B7280' },
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
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 12 },
});

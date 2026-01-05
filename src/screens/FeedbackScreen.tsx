import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function FeedbackScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>학습 피드백</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Coming Soon */}
        <View style={styles.comingSoonCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="analytics" size={48} color="#2563EB" />
          </View>
          <Text style={styles.title}>피드백 기능 준비 중</Text>
          <Text style={styles.description}>
            학습 진행 상황과 개선점을 분석해드리는{'\n'}
            피드백 기능이 곧 출시됩니다!
          </Text>
        </View>

        {/* Preview Cards */}
        <Text style={styles.sectionTitle}>출시 예정 기능</Text>

        <View style={styles.previewCard}>
          <View style={[styles.previewIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="bar-chart" size={24} color="#2563EB" />
          </View>
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle}>학습 통계</Text>
            <Text style={styles.previewDesc}>일별/주별 학습량과 진행 상황 확인</Text>
          </View>
        </View>

        <View style={styles.previewCard}>
          <View style={[styles.previewIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="heart" size={24} color="#DC2626" />
          </View>
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle}>취약점 분석</Text>
            <Text style={styles.previewDesc}>자주 틀리는 문법과 단어 분석</Text>
          </View>
        </View>

        <View style={styles.previewCard}>
          <View style={[styles.previewIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="trending-up" size={24} color="#059669" />
          </View>
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle}>성장 그래프</Text>
            <Text style={styles.previewDesc}>실력 향상 추이 시각화</Text>
          </View>
        </View>

        <View style={styles.previewCard}>
          <View style={[styles.previewIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="bulb" size={24} color="#D97706" />
          </View>
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle}>맞춤 추천</Text>
            <Text style={styles.previewDesc}>학습 패턴 기반 콘텐츠 추천</Text>
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
  comingSoonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  description: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContent: { flex: 1 },
  previewTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  previewDesc: { fontSize: 13, color: '#6B7280' },
});

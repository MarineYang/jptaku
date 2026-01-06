import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, OnboardingCategory, Level, OnboardingCategoryType, LevelType } from '../store/useAppStore';

type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Onboarding: undefined;
};

// 카테고리 목록 (새로운 5개 카테고리)
const CATEGORIES = [
  { id: OnboardingCategory.ANIME, label: '애니', icon: 'tv-outline' },
  { id: OnboardingCategory.GAME, label: '게임', icon: 'game-controller-outline' },
  { id: OnboardingCategory.MUSIC, label: '음악', icon: 'musical-notes-outline' },
  { id: OnboardingCategory.MOVIE, label: '영화', icon: 'film-outline' },
  { id: OnboardingCategory.DRAMA, label: '드라마', icon: 'play-circle-outline' },
] as const;

// 레벨 목록 (N5, N4, N3)
const LEVELS = [
  { id: Level.N5, label: 'N5', desc: '기초 단계 - 히라가나, 기본 인사' },
  { id: Level.N4, label: 'N4', desc: '초급 단계 - 일상 회화 조금 가능' },
  { id: Level.N3, label: 'N3', desc: '중급 단계 - 일상적인 표현 이해 가능' },
] as const;

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const [step, setStep] = useState(1); // 1: 카테고리, 2: 레벨, 3: 완료
  const [selectedCategories, setSelectedCategories] = useState<OnboardingCategoryType[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LevelType | null>(null);

  const handleNext = () => {
    if (step === 1 && selectedCategories.length > 0) setStep(2);
    else if (step === 2 && selectedLevel) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    if (selectedCategories.length > 0 && selectedLevel) {
      await completeOnboarding({
        categories: selectedCategories,
        level: selectedLevel,
      });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const toggleCategory = (categoryId: OnboardingCategoryType) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Step 1: 카테고리 선택 (복수 선택 가능)
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.heading}>어떤 콘텐츠로{'\n'}일본어를 배우고 싶나요?</Text>
      <Text style={styles.subheading}>관심있는 분야를 모두 선택해주세요.</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
              onPress={() => toggleCategory(cat.id)}
            >
              <View style={[styles.categoryIcon, isSelected && styles.categoryIconSelected]}>
                <Ionicons
                  name={cat.icon as any}
                  size={32}
                  color={isSelected ? '#fff' : '#6B7280'}
                />
              </View>
              <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                {cat.label}
              </Text>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Step 2: 레벨 선택
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.heading}>현재 일본어 실력이{'\n'}어느 정도인가요?</Text>
      <Text style={styles.subheading}>난이도에 맞춰 학습을 도와드릴게요.</Text>
      <View style={styles.levelList}>
        {LEVELS.map((lvl) => {
          const isSelected = selectedLevel === lvl.id;
          return (
            <TouchableOpacity
              key={lvl.id}
              style={[styles.levelCard, isSelected && styles.levelCardSelected]}
              onPress={() => setSelectedLevel(lvl.id)}
            >
              <View style={styles.levelContent}>
                <View style={[styles.levelBadge, isSelected && styles.levelBadgeSelected]}>
                  <Text style={[styles.levelBadgeText, isSelected && styles.levelBadgeTextSelected]}>
                    {lvl.label}
                  </Text>
                </View>
                <View style={styles.levelTextContainer}>
                  <Text style={[styles.levelLabel, isSelected && styles.levelLabelSelected]}>
                    {lvl.label} 수준
                  </Text>
                  <Text style={styles.levelDesc}>{lvl.desc}</Text>
                </View>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Step 3: 완료 확인
  const renderStep3 = () => {
    const selectedCategoryLabels = CATEGORIES
      .filter(cat => selectedCategories.includes(cat.id))
      .map(cat => cat.label);
    const selectedLevelLabel = LEVELS.find(l => l.id === selectedLevel)?.label;

    return (
      <View style={styles.stepContent}>
        <Text style={styles.heading}>준비 완료!</Text>
        <Text style={styles.subheading}>선택하신 내용을 확인해주세요.</Text>

        <View style={styles.summaryBox}>
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>관심 분야</Text>
            <View style={styles.tagsContainer}>
              {selectedCategoryLabels.map((label, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>일본어 레벨</Text>
            <View style={styles.levelDisplayBadge}>
              <Text style={styles.levelDisplayText}>{selectedLevelLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#2563EB" />
          <Text style={styles.infoText}>
            설정은 나중에 마이페이지에서 변경할 수 있어요.
          </Text>
        </View>
      </View>
    );
  };

  const isNextDisabled = () => {
    if (step === 1) return selectedCategories.length === 0;
    if (step === 2) return !selectedLevel;
    return false;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.progressDot, step >= s && styles.progressDotActive]}
            />
          ))}
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomSection}>
        {step < 3 ? (
          <TouchableOpacity
            style={[styles.nextButton, isNextDisabled() && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={isNextDisabled()}
          >
            <Text style={[styles.nextButtonText, isNextDisabled() && styles.nextButtonTextDisabled]}>
              다음
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={isNextDisabled() ? '#9CA3AF' : '#fff'}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={handleFinish}>
            <Text style={styles.startButtonText}>학습 시작하기</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  progressContainer: { flexDirection: 'row', gap: 8 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB' },
  progressDotActive: { width: 24, backgroundColor: '#2563EB' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  stepContent: { paddingTop: 16 },
  heading: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 8, lineHeight: 36 },
  subheading: { fontSize: 15, color: '#6B7280', marginBottom: 32 },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  categoryCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryIconSelected: {
    backgroundColor: '#2563EB',
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  categoryLabelSelected: {
    color: '#1D4ED8',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Level List
  levelList: { gap: 12 },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  levelCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeSelected: {
    backgroundColor: '#2563EB',
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  levelBadgeTextSelected: {
    color: '#fff',
  },
  levelTextContainer: { flex: 1 },
  levelLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  levelLabelSelected: {
    color: '#1D4ED8',
  },
  levelDesc: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Summary
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summarySection: {
    gap: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  levelDisplayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  levelDisplayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  infoText: {
    fontSize: 13,
    color: '#1D4ED8',
    flex: 1,
  },

  // Bottom
  bottomSection: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 52,
    gap: 8,
  },
  nextButtonDisabled: { backgroundColor: '#F3F4F6' },
  nextButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  nextButtonTextDisabled: { color: '#9CA3AF' },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 52,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});

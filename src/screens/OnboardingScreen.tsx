import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Onboarding: undefined;
};

const CATEGORIES = [
  { id: 'anime', label: '애니/만화', icon: 'tv-outline' },
  { id: 'game', label: '게임', icon: 'game-controller-outline' },
  { id: 'music', label: '음악/Jpop/버튜버', icon: 'musical-notes-outline' },
  { id: 'lifestyle', label: '오타쿠 라이프스타일', icon: 'bag-outline' },
  { id: 'situation', label: '실전 오타쿠 상황', icon: 'chatbubbles-outline' },
] as const;

const SUB_CATEGORIES: Record<string, string[]> = {
  anime: ['이세계/판타지', '러브코미디', '일상물', '배틀/액션', '스포츠물', 'SF/로봇', '음악/아이돌물', '미스터리/추리'],
  game: ['JRPG', '모바일 가챠게임', '리듬게임', 'FPS', '닌텐도 게임', '격투 게임'],
  music: ['Jpop', 'Vocaloid', '애니송', '아이돌', '버튜버(hololive, NIJISANJI 등)'],
  lifestyle: ['성지순례', '굿즈 구매', '피규어/프라모델', '코미케/행사 참가', '애니카페 방문', '게임센터 방문'],
  situation: ['굿즈 예약하기', '행사에서 인사하기', '친구와 애니 얘기하기', '일본 사이트 주문하기', '일본 여행 오타쿠 코스', '콘서트/라이브 관람'],
};

const LEVELS = [
  { id: 'lv0', label: 'Lv 0 - 완전 초입문', desc: '히라가나/가타카나도 모름' },
  { id: 'lv1', label: 'Lv 1 - 기본 인사 가능', desc: 'N5 수준' },
  { id: 'lv2', label: 'Lv 2 - 일상 회화 조금 가능', desc: 'N4 수준' },
  { id: 'lv3', label: 'Lv 3 - 생각 표현 가능', desc: 'N3 수준' },
  { id: 'lv4', label: 'Lv 4 - 능숙', desc: 'N2 수준' },
  { id: 'lv5', label: 'Lv 5 - 거의 원어민 수준', desc: 'N1 수준' },
];

const PURPOSES = [
  '자막 없이 애니·만화 즐기려고',
  '일본 친구와 대화하고 싶어서',
  '일본 여행에서 말하고 싶어서',
  '버튜버 방송/콘텐츠 이해하고 싶어서',
  '좋아하는 게임의 일본 서버/콘텐츠 즐기려고',
  '굿즈 구매·이벤트 참가 때문에',
  '기타'
];

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);

  const handleNext = () => {
    if (step === 1 && selectedCategory) setStep(2);
    else if (step === 2 && selectedSubCategories.length > 0) setStep(3);
    else if (step === 3 && selectedLevel) setStep(4);
    else if (step === 4 && selectedPurposes.length > 0) setStep(5);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    if (selectedCategory && selectedLevel) {
      await completeOnboarding({
        interestCategory: selectedCategory,
        interestSubCategories: selectedSubCategories,
        level: selectedLevel,
        purposes: selectedPurposes
      });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const toggleSubCategory = (sub: string) => {
    setSelectedSubCategories(prev =>
      prev.includes(sub) ? prev.filter(i => i !== sub) : [...prev, sub]
    );
  };

  const togglePurpose = (p: string) => {
    setSelectedPurposes(prev =>
      prev.includes(p) ? prev.filter(i => i !== p) : [...prev, p]
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.heading}>어떤 관심사로{'\n'}일본어를 배우고 싶나요?</Text>
      <Text style={styles.subheading}>당신의 취향에 맞는 문장을 추천해 드릴게요.</Text>
      <View style={styles.optionList}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.optionCard, selectedCategory === cat.id && styles.optionCardSelected]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <View style={[styles.iconCircle, selectedCategory === cat.id && styles.iconCircleSelected]}>
              <Ionicons name={cat.icon as any} size={20} color={selectedCategory === cat.id ? '#fff' : '#6B7280'} />
            </View>
            <Text style={[styles.optionLabel, selectedCategory === cat.id && styles.optionLabelSelected]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => {
    const catLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label;
    const subList = selectedCategory ? SUB_CATEGORIES[selectedCategory] : [];

    return (
      <View style={styles.stepContent}>
        <Text style={styles.heading}>
          <Text style={styles.highlight}>{catLabel}</Text> 중{'\n'}어떤 장르를 좋아하시나요?
        </Text>
        <Text style={styles.subheading}>여러 개 선택할 수 있어요.</Text>
        <View style={styles.gridContainer}>
          {subList.map((sub) => (
            <TouchableOpacity
              key={sub}
              style={[styles.gridItem, selectedSubCategories.includes(sub) && styles.gridItemSelected]}
              onPress={() => toggleSubCategory(sub)}
            >
              <Text style={[styles.gridItemText, selectedSubCategories.includes(sub) && styles.gridItemTextSelected]}>
                {sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.heading}>현재 일본어 실력이{'\n'}어느 정도인가요?</Text>
      <Text style={styles.subheading}>난이도에 맞춰 학습을 도와드릴게요.</Text>
      <View style={styles.optionList}>
        {LEVELS.map((lvl) => (
          <TouchableOpacity
            key={lvl.id}
            style={[styles.levelCard, selectedLevel === lvl.id && styles.optionCardSelected]}
            onPress={() => setSelectedLevel(lvl.id)}
          >
            <View style={styles.levelContent}>
              <Text style={[styles.levelLabel, selectedLevel === lvl.id && styles.optionLabelSelected]}>
                {lvl.label}
              </Text>
              <Text style={styles.levelDesc}>{lvl.desc}</Text>
            </View>
            {selectedLevel === lvl.id && (
              <Ionicons name="checkmark" size={20} color="#2563EB" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.heading}>일본어를 왜{'\n'}배우고 싶나요?</Text>
      <Text style={styles.subheading}>여러 개 선택할 수 있어요.</Text>
      <View style={styles.optionList}>
        {PURPOSES.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.purposeCard, selectedPurposes.includes(p) && styles.optionCardSelected]}
            onPress={() => togglePurpose(p)}
          >
            <View style={[styles.checkbox, selectedPurposes.includes(p) && styles.checkboxSelected]}>
              {selectedPurposes.includes(p) && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={[styles.purposeText, selectedPurposes.includes(p) && styles.purposeTextSelected]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep5 = () => {
    const catLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label;
    const lvlLabel = LEVELS.find(l => l.id === selectedLevel)?.label;

    return (
      <View style={styles.stepContent}>
        <Text style={styles.heading}>모든 준비가{'\n'}완료되었습니다!</Text>
        <Text style={styles.subheading}>일타쿠가 아래 내용을 바탕으로 학습을 도와드릴게요.</Text>

        <View style={styles.summaryBox}>
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>관심 분야</Text>
            <Text style={styles.summaryValue}>{catLabel}</Text>
            <View style={styles.tagContainer}>
              {selectedSubCategories.map(sub => (
                <View key={sub} style={styles.tag}>
                  <Text style={styles.tagText}>{sub}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>일본어 실력</Text>
            <Text style={[styles.summaryValue, { color: '#2563EB' }]}>{lvlLabel}</Text>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>학습 목적</Text>
            {selectedPurposes.map(p => (
              <Text key={p} style={styles.purposeListItem}>• {p}</Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const isNextDisabled = () => {
    if (step === 1) return !selectedCategory;
    if (step === 2) return selectedSubCategories.length === 0;
    if (step === 3) return !selectedLevel;
    if (step === 4) return selectedPurposes.length === 0;
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
          {[1, 2, 3, 4, 5].map((s) => (
            <View key={s} style={[styles.progressDot, step >= s && styles.progressDotActive]} />
          ))}
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomSection}>
        {step < 5 ? (
          <TouchableOpacity
            style={[styles.nextButton, isNextDisabled() && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={isNextDisabled()}
          >
            <Text style={[styles.nextButtonText, isNextDisabled() && styles.nextButtonTextDisabled]}>다음</Text>
            <Ionicons name="arrow-forward" size={18} color={isNextDisabled() ? '#9CA3AF' : '#fff'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={handleFinish}>
            <Text style={styles.startButtonText}>시작하기</Text>
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
  backButton: { width: 40 },
  progressContainer: { flexDirection: 'row', gap: 4 },
  progressDot: { width: 8, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB' },
  progressDotActive: { width: 24, backgroundColor: '#2563EB' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  stepContent: { paddingTop: 16 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, lineHeight: 32 },
  highlight: { color: '#2563EB' },
  subheading: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  optionList: { gap: 12 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#fff',
    gap: 16,
  },
  optionCardSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: { backgroundColor: '#2563EB' },
  optionLabel: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  optionLabelSelected: { color: '#1D4ED8' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: {
    width: '47%',
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  gridItemSelected: { borderColor: '#2563EB', backgroundColor: '#2563EB' },
  gridItemText: { fontSize: 14, fontWeight: 'bold', color: '#4B5563', textAlign: 'center' },
  gridItemTextSelected: { color: '#fff' },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  levelContent: { flex: 1 },
  levelLabel: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  levelDesc: { fontSize: 12, color: '#6B7280' },
  purposeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#fff',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  purposeText: { fontSize: 14, fontWeight: '500', color: '#374151', flex: 1 },
  purposeTextSelected: { color: '#1E3A8A' },
  summaryBox: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20, gap: 24, borderWidth: 1, borderColor: '#F3F4F6' },
  summarySection: { gap: 8 },
  summaryLabel: { fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 12, color: '#4B5563' },
  purposeListItem: { fontSize: 14, color: '#374151', marginTop: 4 },
  bottomSection: { padding: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
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
    height: 48,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});

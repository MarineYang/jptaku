import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

type RootStackParamList = {
  Login: undefined;
};

export default function MyPageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAppStore((state) => state.user);
  const onboardingData = useAppStore((state) => state.onboardingData);
  const logout = useAppStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{user.level}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="flame" size={20} color="#F97316" />
              <Text style={styles.statValue}>{user.streak}일</Text>
              <Text style={styles.statLabel}>연속 학습</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="star" size={20} color="#EAB308" />
              <Text style={styles.statValue}>{user.points}</Text>
              <Text style={styles.statLabel}>포인트</Text>
            </View>
          </View>
        </View>

        {/* Learning Info */}
        {onboardingData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>학습 설정</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>관심 분야</Text>
                <Text style={styles.infoValue}>
                  {onboardingData.interestCategory === 'anime' && '애니/만화'}
                  {onboardingData.interestCategory === 'game' && '게임'}
                  {onboardingData.interestCategory === 'music' && '음악/Jpop/버튜버'}
                  {onboardingData.interestCategory === 'lifestyle' && '오타쿠 라이프스타일'}
                  {onboardingData.interestCategory === 'situation' && '실전 오타쿠 상황'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>일본어 레벨</Text>
                <Text style={styles.infoValue}>{onboardingData.level.toUpperCase()}</Text>
              </View>
              <View style={styles.subCategoriesContainer}>
                <Text style={styles.infoLabel}>세부 카테고리</Text>
                <View style={styles.tagsContainer}>
                  {onboardingData.interestSubCategories.map((sub, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{sub}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설정</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="notifications-outline" size={22} color="#6B7280" />
              </View>
              <Text style={styles.menuText}>알림 설정</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="settings-outline" size={22} color="#6B7280" />
              </View>
              <Text style={styles.menuText}>학습 설정</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="help-circle-outline" size={22} color="#6B7280" />
              </View>
              <Text style={styles.menuText}>도움말</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="document-text-outline" size={22} color="#6B7280" />
              </View>
              <Text style={styles.menuText}>이용약관</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={handleLogout}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="log-out-outline" size={22} color="#DC2626" />
              </View>
              <Text style={[styles.menuText, styles.logoutText]}>로그아웃</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>버전 1.0.0</Text>
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
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#EAB308',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  levelBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statDivider: { width: 1, height: 40, backgroundColor: '#E5E7EB' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12 },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: '#6B7280' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  subCategoriesContainer: { gap: 8 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  tagText: { fontSize: 12, color: '#4B5563' },
  menuCard: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconContainer: { width: 32, alignItems: 'center' },
  menuText: { flex: 1, fontSize: 15, color: '#111827', marginLeft: 8 },
  logoutText: { color: '#DC2626' },
  versionText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
});

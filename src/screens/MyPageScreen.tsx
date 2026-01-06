import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, OnboardingCategory, Level } from '../store/useAppStore';

type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
};

// Category and Level label mappings
const CATEGORY_LABELS: Record<number, string> = {
  [OnboardingCategory.ANIME]: '애니',
  [OnboardingCategory.GAME]: '게임',
  [OnboardingCategory.MUSIC]: '음악',
  [OnboardingCategory.MOVIE]: '영화',
  [OnboardingCategory.DRAMA]: '드라마',
};

const LEVEL_LABELS: Record<number, string> = {
  [Level.N5]: 'N5',
  [Level.N4]: 'N4',
  [Level.N3]: 'N3',
};

export default function MyPageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Store state
  const user = useAppStore((state) => state.user);
  const onboardingData = useAppStore((state) => state.onboardingData);
  const todayStats = useAppStore((state) => state.todayStats);

  // Store actions
  const logout = useAppStore((state) => state.logout);
  const fetchUser = useAppStore((state) => state.fetchUser);
  const fetchTodayStats = useAppStore((state) => state.fetchTodayStats);
  const updateSettings = useAppStore((state) => state.updateSettings);

  useEffect(() => {
    fetchUser();
    fetchTodayStats();
  }, []);

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

  const handleToggleNotification = async (value: boolean) => {
    await updateSettings({ notification_enabled: value });
  };

  const handleToggleRomaji = async (value: boolean) => {
    await updateSettings({ show_romaji: value });
  };

  const handleToggleTranslation = async (value: boolean) => {
    await updateSettings({ show_translation: value });
  };

  const handleEditOnboarding = () => {
    Alert.alert(
      '학습 설정 변경',
      '관심 분야와 레벨을 다시 설정하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '변경하기',
          onPress: () => {
            navigation.navigate('Onboarding');
          },
        },
      ]
    );
  };

  const getInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getLevelLabel = () => {
    if (onboardingData?.level) {
      return LEVEL_LABELS[onboardingData.level] || `N${onboardingData.level}`;
    }
    if (user?.onboarding?.level) {
      return user.onboarding.level.toUpperCase();
    }
    return 'N5';
  };

  const getCategoryLabels = () => {
    if (onboardingData?.categories) {
      return onboardingData.categories.map((cat) => CATEGORY_LABELS[cat] || String(cat));
    }
    if (user?.onboarding?.categories) {
      return user.onboarding.categories;
    }
    return [];
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
            {user?.profile_image ? (
              <Image source={{ uri: user.profile_image }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitial()}</Text>
              </View>
            )}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{getLevelLabel()}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || '사용자'}</Text>
          {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="flame" size={20} color="#F97316" />
              <Text style={styles.statValue}>{todayStats?.current_streak || 0}일</Text>
              <Text style={styles.statLabel}>연속 학습</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="chatbubbles" size={20} color="#3B82F6" />
              <Text style={styles.statValue}>{todayStats?.total_sessions || 0}회</Text>
              <Text style={styles.statLabel}>총 세션</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color="#10B981" />
              <Text style={styles.statValue}>{todayStats?.total_learning_minutes || 0}분</Text>
              <Text style={styles.statLabel}>학습 시간</Text>
            </View>
          </View>
        </View>

        {/* Learning Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>학습 설정</Text>
            <TouchableOpacity onPress={handleEditOnboarding}>
              <Text style={styles.editButton}>수정</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>일본어 레벨</Text>
              <View style={styles.levelTag}>
                <Text style={styles.levelTagText}>{getLevelLabel()}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.subCategoriesContainer}>
              <Text style={styles.infoLabel}>관심 분야</Text>
              <View style={styles.tagsContainer}>
                {getCategoryLabels().map((label, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{label}</Text>
                  </View>
                ))}
                {getCategoryLabels().length === 0 && (
                  <Text style={styles.emptyText}>설정되지 않음</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>표시 설정</Text>
          <View style={styles.menuCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="text-outline" size={22} color="#6B7280" />
                <Text style={styles.settingText}>로마자 표시</Text>
              </View>
              <Switch
                value={user?.settings?.show_romaji ?? true}
                onValueChange={handleToggleRomaji}
                trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
                thumbColor={user?.settings?.show_romaji ? '#2563EB' : '#9CA3AF'}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="language-outline" size={22} color="#6B7280" />
                <Text style={styles.settingText}>번역 표시</Text>
              </View>
              <Switch
                value={user?.settings?.show_translation ?? true}
                onValueChange={handleToggleTranslation}
                trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
                thumbColor={user?.settings?.show_translation ? '#2563EB' : '#9CA3AF'}
              />
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 설정</Text>
          <View style={styles.menuCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={22} color="#6B7280" />
                <Text style={styles.settingText}>학습 알림</Text>
              </View>
              <Switch
                value={user?.settings?.notification_enabled ?? true}
                onValueChange={handleToggleNotification}
                trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
                thumbColor={user?.settings?.notification_enabled ? '#2563EB' : '#9CA3AF'}
              />
            </View>
            {user?.settings?.notification_enabled && (
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="time-outline" size={22} color="#6B7280" />
                  <Text style={styles.settingText}>알림 시간</Text>
                </View>
                <Text style={styles.settingValue}>
                  {user?.settings?.daily_reminder_time || '09:00'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기타</Text>
          <View style={styles.menuCard}>
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

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#6B7280" />
              </View>
              <Text style={styles.menuText}>개인정보 처리방침</Text>
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

  // Profile Card
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
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  levelBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statDivider: { width: 1, height: 40, backgroundColor: '#E5E7EB' },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  editButton: { fontSize: 14, fontWeight: '600', color: '#2563EB' },

  // Info Card
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: { fontSize: 14, color: '#6B7280' },
  infoDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  levelTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelTagText: { fontSize: 14, fontWeight: 'bold', color: '#2563EB' },
  subCategoriesContainer: { gap: 8 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  emptyText: { fontSize: 14, color: '#9CA3AF', fontStyle: 'italic' },

  // Settings
  menuCard: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingText: { fontSize: 15, color: '#111827' },
  settingValue: { fontSize: 14, color: '#6B7280' },

  // Menu
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

  // Version
  versionText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
});

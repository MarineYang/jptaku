import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

// === 카테고리 & 레벨 상수 ===
export const OnboardingCategory = {
  ANIME: 1,  // 애니
  GAME: 2,   // 게임
  MUSIC: 3,  // 음악
  MOVIE: 4,  // 영화
  DRAMA: 5,  // 드라마
} as const;

export const Level = {
  N5: 5,  // N5 수준
  N4: 4,  // N4 수준
  N3: 3,  // N3 수준
} as const;

export type OnboardingCategoryType = typeof OnboardingCategory[keyof typeof OnboardingCategory];
export type LevelType = typeof Level[keyof typeof Level];

// === API 응답 타입 ===
export interface User {
  id: number;
  email: string;
  name: string;
  profile_image?: string;
  created_at: string;
  onboarding?: {
    categories: string[];
    level: string;
  };
  settings?: UserSettings;
}

export interface UserSettings {
  notification_enabled: boolean;
  daily_reminder_time: string;
  preferred_voice_speed: number;
  show_romaji: boolean;
  show_translation: boolean;
}

export interface WordDetail {
  japanese: string;
  reading: string;
  meaning: string;
  part_of_speech?: string;
}

export interface SentenceDetail {
  words: WordDetail[];
  grammar: string;
  examples: string;
}

export interface Quiz {
  fill_blank?: {
    question_jp: string;
    options: string[];
    answer: string;
  };
  ordering?: {
    fragments: string[];
    correct_order: number[];
  };
}

export interface Sentence {
  id: number;
  sentence_key: string;
  jp: string;
  kr: string;
  romaji: string;
  level: string;
  category: string;
  audio_url?: string;
  detail: SentenceDetail;
  quiz: Quiz;
}

export interface DailySet {
  daily_set_id: number;
  date: string;
  sentences: Sentence[];
}

export interface LearningProgress {
  sentence_id: number;
  understand: boolean;
  speak: boolean;
  confirm: boolean;
  memorized: boolean;
  quiz_completed: boolean;
}

export interface TodayLearning {
  daily_set_id: number;
  total_sentences: number;
  completed_sentences: number;
  progress_percentage: number;
  sentences: LearningProgress[];
}

export interface ChatSession {
  id: number;
  user_id: number;
  topic: string;
  topic_detail: string;
  current_turn: number;
  max_turn: number;
  status: 'active' | 'ended';
  started_at: string;
  ended_at?: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Feedback {
  session_id: number;
  total_score: number;
  grammar_score: number;
  vocabulary_score: number;
  fluency_score: number;
  feedback_text: string;
}

export interface TodayStats {
  total_sessions: number;
  total_learning_minutes: number;
  total_sentences_used: number;
  average_score: number;
  current_streak: number;
}

// === 온보딩 데이터 ===
export interface OnboardingData {
  categories: OnboardingCategoryType[];
  level: LevelType;
}

// === 앱 상태 ===
interface AppState {
  // Auth
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;

  // User
  user: User | null;
  isOnboarded: boolean;
  onboardingData: OnboardingData | null;

  // Learning
  dailySet: DailySet | null;
  todayLearning: TodayLearning | null;
  localProgress: Record<number, LearningProgress>;

  // Chat
  currentSession: ChatSession | null;

  // Stats
  todayStats: TodayStats | null;

  // Actions - Auth
  setAuth: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;

  // Actions - User
  fetchUser: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // Actions - Sentences
  fetchTodaySentences: () => Promise<void>;
  fetchLearningProgress: () => Promise<void>;
  updateLearningProgress: (sentenceId: number, progress: Partial<LearningProgress>) => Promise<void>;
  submitQuiz: (sentenceId: number, fillBlankAnswer?: string, orderingAnswer?: number[]) => Promise<boolean>;

  // Actions - Chat
  createChatSession: (topic: string, topicDetail: string) => Promise<ChatSession | null>;
  endChatSession: () => Promise<void>;

  // Actions - Stats
  fetchTodayStats: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      isOnboarded: false,
      onboardingData: null,
      dailySet: null,
      todayLearning: null,
      localProgress: {},
      currentSession: null,
      todayStats: null,

      // Auth Actions
      setAuth: (accessToken, refreshToken) =>
        set({
          isLoggedIn: true,
          accessToken,
          refreshToken: refreshToken || null,
        }),

      logout: () => {
        // Call logout API
        const { accessToken } = get();
        if (accessToken) {
          fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }).catch(console.error);
        }

        set({
          isLoggedIn: false,
          accessToken: null,
          refreshToken: null,
          user: null,
          isOnboarded: false,
          onboardingData: null,
          dailySet: null,
          todayLearning: null,
          localProgress: {},
          currentSession: null,
          todayStats: null,
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (response.ok) {
            const data = await response.json();
            set({
              accessToken: data.data.access_token,
              refreshToken: data.data.refresh_token,
            });
            return true;
          }
        } catch (error) {
          console.error('Token refresh error:', error);
        }

        get().logout();
        return false;
      },

      // User Actions
      fetchUser: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const response = await fetch(`${API_URL}/api/user/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });

          if (response.ok) {
            const data = await response.json();
            const user = data.data as User;
            set({
              user,
              isOnboarded: !!user.onboarding,
            });
          }
        } catch (error) {
          console.error('Fetch user error:', error);
        }
      },

      completeOnboarding: async (data) => {
        const { accessToken } = get();

        // 먼저 로컬 상태 업데이트
        set({
          isOnboarded: true,
          onboardingData: data,
        });

        if (!accessToken) return;

        try {
          await fetch(`${API_URL}/api/user/onboarding`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              categories: data.categories,
              level: data.level,
            }),
          });
        } catch (error) {
          console.error('Onboarding API error:', error);
        }
      },

      updateSettings: async (settings) => {
        const { accessToken, user } = get();
        if (!accessToken || !user) return;

        try {
          const response = await fetch(`${API_URL}/api/user/settings`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(settings),
          });

          if (response.ok) {
            const data = await response.json();
            set({
              user: {
                ...user,
                settings: data.data,
              },
            });
          }
        } catch (error) {
          console.error('Update settings error:', error);
        }
      },

      // Sentences Actions
      fetchTodaySentences: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const response = await fetch(`${API_URL}/api/sentences/today`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });

          if (response.ok) {
            const data = await response.json();
            set({ dailySet: data.data });
          }
        } catch (error) {
          console.error('Fetch sentences error:', error);
        }
      },

      fetchLearningProgress: async () => {
        const { accessToken, dailySet } = get();
        if (!accessToken || !dailySet) return;

        try {
          const response = await fetch(
            `${API_URL}/api/learning/today?daily_set_id=${dailySet.daily_set_id}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          );

          if (response.ok) {
            const data = await response.json();
            set({ todayLearning: data.data });

            // 로컬 프로그레스 동기화
            const localProgress: Record<number, LearningProgress> = {};
            data.data.sentences.forEach((s: LearningProgress) => {
              localProgress[s.sentence_id] = s;
            });
            set({ localProgress });
          }
        } catch (error) {
          console.error('Fetch learning progress error:', error);
        }
      },

      updateLearningProgress: async (sentenceId, progress) => {
        const { accessToken, dailySet, localProgress } = get();
        if (!accessToken || !dailySet) return;

        // 로컬 상태 먼저 업데이트
        const currentProgress = localProgress[sentenceId] || {
          sentence_id: sentenceId,
          understand: false,
          speak: false,
          confirm: false,
          memorized: false,
          quiz_completed: false,
        };

        const updatedProgress = { ...currentProgress, ...progress };
        set({
          localProgress: {
            ...localProgress,
            [sentenceId]: updatedProgress,
          },
        });

        try {
          await fetch(`${API_URL}/api/learning/progress`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              sentence_id: sentenceId,
              daily_set_id: dailySet.daily_set_id,
              ...progress,
            }),
          });
        } catch (error) {
          console.error('Update progress error:', error);
        }
      },

      submitQuiz: async (sentenceId, fillBlankAnswer, orderingAnswer) => {
        const { accessToken, dailySet } = get();
        if (!accessToken || !dailySet) return false;

        try {
          const response = await fetch(`${API_URL}/api/learning/quiz`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              sentence_id: sentenceId,
              daily_set_id: dailySet.daily_set_id,
              fill_blank_answer: fillBlankAnswer,
              ordering_answer: orderingAnswer,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            return data.data.all_correct;
          }
        } catch (error) {
          console.error('Submit quiz error:', error);
        }

        return false;
      },

      // Chat Actions
      createChatSession: async (topic, topicDetail) => {
        const { accessToken } = get();
        if (!accessToken) return null;

        try {
          const response = await fetch(`${API_URL}/api/chat/session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ topic, topic_detail: topicDetail }),
          });

          if (response.ok) {
            const data = await response.json();
            set({ currentSession: data.data });
            return data.data;
          }
        } catch (error) {
          console.error('Create chat session error:', error);
        }

        return null;
      },

      endChatSession: async () => {
        const { accessToken, currentSession } = get();
        if (!accessToken || !currentSession) return;

        try {
          await fetch(`${API_URL}/api/chat/session/${currentSession.id}/end`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
        } catch (error) {
          console.error('End chat session error:', error);
        } finally {
          set({ currentSession: null });
        }
      },

      // Stats Actions
      fetchTodayStats: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const response = await fetch(`${API_URL}/api/stats/today`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });

          if (response.ok) {
            const data = await response.json();
            set({ todayStats: data.data });
          }
        } catch (error) {
          console.error('Fetch stats error:', error);
        }
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isOnboarded: state.isOnboarded,
        onboardingData: state.onboardingData,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Daily Sentence Data Structure
export interface DailySentence {
  id: string | number; // Updated to support string IDs
  japanese: string;
  reading: string;
  meaning: string;
  romaji?: string;
  tags?: string[];
  words: {
    term: string;
    reading?: string;
    meaning: string;
  }[];
  grammar: {
    pattern: string;
    description: string;
  };
  examples: {
    japanese: string;
    reading: string;
    meaning: string;
  }[];
  quiz: {
    type: 'meaning' | 'blank' | 'order';
    question: string;
    options: string[];
    answer: string;
  };
}

// User Progress State
interface SentenceProgress {
  status: 'not_started' | 'in_progress' | 'memorized';
  steps: {
    understand: boolean;
    speak: boolean;
    check: boolean;
  };
}

// Onboarding Data Structure
export interface OnboardingData {
  interestCategory: string;
  interestSubCategories: string[];
  level: string;
  purposes: string[];
}

// Onboarding API Request Structure
export interface OnboardingApiData {
  level: number;
  interests: number[];
  purposes: number[];
}

interface AppState {
  // Auth
  isLoggedIn: boolean;
  accessToken: string | null;

  // Onboarding
  isOnboarded: boolean;
  onboardingData: OnboardingData | null;

  // Today's Sentences from API
  todaySentences: DailySentence[];

  // User Info
  user: {
    name: string;
    level: string;
    streak: number;
    points: number;
  };

  // Progress Tracking
  sentenceProgress: Record<string | number, SentenceProgress>; // Updated key type

  // Auth Actions
  setAuth: (token: string) => void;
  logout: () => void;

  // Actions
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  resetOnboarding: () => void;
  setTodaySentences: (sentences: DailySentence[]) => void;
  updateStepStatus: (id: string | number, step: 'understand' | 'speak' | 'check', completed: boolean) => void;
  markSentenceAsMemorized: (id: string | number) => void;
  resetProgress: () => void;
}

// Mapping functions for onboarding data
const CATEGORY_TO_SUBCATEGORY_MAP: Record<string, Record<string, number>> = {
  anime: {
    '이세계/판타지': 101,
    '러브코미디': 102,
    '일상물': 103,
    '배틀/액션': 104,
    '스포츠물': 105,
    'SF/로봇': 106,
    '음악/아이돌물': 107,
    '미스터리/추리': 108,
  },
  game: {
    'JRPG': 201,
    '모바일 가챠게임': 202,
    '리듬게임': 203,
    'FPS': 204,
    '닌텐도 게임': 205,
    '격투 게임': 206,
  },
  music: {
    'Jpop': 301,
    'Vocaloid': 302,
    '애니송': 303,
    '아이돌': 304,
    '버튜버(hololive, NIJISANJI 등)': 305,
  },
  lifestyle: {
    '성지순례': 401,
    '굿즈 구매': 402,
    '피규어/프라모델': 403,
    '코미케/행사 참가': 404,
    '애니카페 방문': 405,
    '게임센터 방문': 406,
  },
  situation: {
    '굿즈 예약하기': 501,
    '행사에서 인사하기': 502,
    '친구와 애니 얘기하기': 503,
    '일본 사이트 주문하기': 504,
    '일본 여행 오타쿠 코스': 505,
    '콘서트/라이브 관람': 506,
  },
};

const LEVEL_MAP: Record<string, number> = {
  'lv0': 0,
  'lv1': 1,
  'lv2': 2,
  'lv3': 3,
  'lv4': 4,
  'lv5': 5,
};

const PURPOSE_MAP: Record<string, number> = {
  '자막 없이 애니·만화 즐기려고': 1,
  '일본 친구와 대화하고 싶어서': 2,
  '일본 여행에서 말하고 싶어서': 3,
  '버튜버 방송/콘텐츠 이해하고 싶어서': 4,
  '좋아하는 게임의 일본 서버/콘텐츠 즐기려고': 5,
  '굿즈 구매·이벤트 참가 때문에': 6,
  '기타': 7,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth initial state
      isLoggedIn: false,
      accessToken: null,

      // Onboarding initial state
      isOnboarded: false,
      onboardingData: null,

      // Today's sentences
      todaySentences: [],

      user: {
        name: "형배",
        level: "Lv.3",
        streak: 12,
        points: 350,
      },
      sentenceProgress: {},

      // Auth actions
      setAuth: (token) =>
        set(() => ({
          isLoggedIn: true,
          accessToken: token,
        })),

      logout: () =>
        set(() => ({
          isLoggedIn: false,
          accessToken: null,
          isOnboarded: false,
          onboardingData: null,
          todaySentences: [],
        })),

      // Complete onboarding action with API call
      completeOnboarding: async (data) => {
        const state = get();
        const token = state.accessToken;

        // Convert UI data to API format
        const level = LEVEL_MAP[data.level] ?? 2;
        const interests: number[] = [];
        const subCategoryMap = CATEGORY_TO_SUBCATEGORY_MAP[data.interestCategory] || {};
        data.interestSubCategories.forEach((sub) => {
          const code = subCategoryMap[sub];
          if (code) interests.push(code);
        });
        const purposes = data.purposes.map((p) => PURPOSE_MAP[p]).filter(Boolean);

        // Call onboarding API
        if (token) {
          try {
            await fetch('http://localhost:30001/api/user/onboarding', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                level,
                interests,
                purposes,
              }),
            });
          } catch (err) {
            console.error('Onboarding API error:', err);
          }
        }

        set(() => ({
          isOnboarded: true,
          onboardingData: data,
        }));
      },

      // Reset onboarding action
      resetOnboarding: () =>
        set(() => ({
          isOnboarded: false,
          onboardingData: null,
        })),

      // Set today's sentences from API
      setTodaySentences: (sentences) =>
        set(() => ({
          todaySentences: sentences,
        })),

      updateStepStatus: (id, step, completed) =>
        set((state) => {
          const currentProgress = state.sentenceProgress[id] || {
            status: 'not_started' as const,
            steps: { understand: false, speak: false, check: false }
          };

          const newSteps = { ...currentProgress.steps, [step]: completed };

          // Check if all steps are done to update status?
          // For now, we keep 'in_progress' unless explicitly memorized.
          const newStatus: 'not_started' | 'in_progress' | 'memorized' =
            currentProgress.status === 'memorized' ? 'memorized' : 'in_progress';

          return {
            sentenceProgress: {
              ...state.sentenceProgress,
              [id]: {
                ...currentProgress,
                status: newStatus,
                steps: newSteps
              }
            }
          };
        }),

      markSentenceAsMemorized: (id) =>
        set((state) => {
          const currentProgress = state.sentenceProgress[id] || {
            status: 'not_started' as const,
            steps: { understand: false, speak: false, check: false }
          };

          return {
            sentenceProgress: {
              ...state.sentenceProgress,
              [id]: {
                ...currentProgress,
                status: 'memorized' as const,
              }
            }
          };
        }),

      resetProgress: () => set({ sentenceProgress: {} }),
    }),
    {
      name: 'app-storage',
    }
  )
);
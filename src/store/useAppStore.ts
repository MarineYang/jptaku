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

interface AppState {
  // Onboarding
  isOnboarded: boolean;
  onboardingData: OnboardingData | null;
  
  // User Info
  user: {
    name: string;
    level: string;
    streak: number;
    points: number;
  };
  
  // Progress Tracking
  sentenceProgress: Record<string | number, SentenceProgress>; // Updated key type
  
  // Actions
  completeOnboarding: (data: OnboardingData) => void;
  updateStepStatus: (id: string | number, step: 'understand' | 'speak' | 'check', completed: boolean) => void;
  markSentenceAsMemorized: (id: string | number) => void;
  resetProgress: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Onboarding initial state
      isOnboarded: false,
      onboardingData: null,
      
      user: {
        name: "지우",
        level: "Lv.3",
        streak: 12,
        points: 350,
      },
      sentenceProgress: {},

      // Complete onboarding action
      completeOnboarding: (data) => 
        set(() => ({
          isOnboarded: true,
          onboardingData: data,
        })),

      updateStepStatus: (id, step, completed) => 
        set((state) => {
          const currentProgress = state.sentenceProgress[id] || {
            status: 'not_started',
            steps: { understand: false, speak: false, check: false }
          };

          const newSteps = { ...currentProgress.steps, [step]: completed };
          
          // Check if all steps are done to update status? 
          // For now, we keep 'in_progress' unless explicitly memorized.
          const newStatus = currentProgress.status === 'memorized' ? 'memorized' : 'in_progress';

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
            status: 'not_started',
            steps: { understand: false, speak: false, check: false }
          };

          return {
            sentenceProgress: {
              ...state.sentenceProgress,
              [id]: {
                ...currentProgress,
                status: 'memorized',
                // Optionally mark all steps as done when memorized?
                // steps: { understand: true, speak: true, check: true } 
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
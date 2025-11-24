# Project: Japanese Learning App Demo (Toss Style)

## Goal
Create a mobile-first web application for learning Japanese with a minimalist "Toss-like" UI.

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS + Shadcn-ui
- Zustand
- Lucide React

## File Structure & Tasks

### 1. Mock Data
- [ ] `src/mock/todaySentences.ts`: Daily learning content.
- [ ] `src/mock/conversationMock.ts`: Chat history data.
- [ ] `src/mock/feedbackMock.ts`: Learning feedback data.
- [ ] `src/mock/userMock.ts`: User profile data.

### 2. State Management
- [ ] `src/store/useAppStore.ts`: Zustand store for managing navigation state or user progress (if needed).

### 3. Components
- [ ] `src/components/MobileLayout.tsx`: A container to center content and limit width (max-w-md) with a gray background outside.
- [ ] `src/components/BottomNav.tsx`: Fixed bottom navigation bar (Home, Chat, Feedback, My).
- [ ] `src/components/Header.tsx`: Simple header for screens.

### 4. Pages
- [ ] `src/pages/Home.tsx`: "Today's 5 Sentences", Progress, CTA.
- [ ] `src/pages/Conversation.tsx`: Chat interface, bubbles, mic button.
- [ ] `src/pages/Feedback.tsx`: Score cards, summary.
- [ ] `src/pages/MyPage.tsx`: Profile, settings list.

### 5. App Entry
- [ ] `src/App.tsx`: Routing setup (using simple state-based routing or React Router if preferred, but state-based might be smoother for a simple demo inside the MobileLayout). *Decision: Use React Router as per template default.*

## Design System (Toss Style)
- Background: `bg-gray-100` (app background), `bg-white` (content).
- Spacing: Generous padding (`p-6`, `gap-4`).
- Radius: `rounded-3xl` for cards.
- Typography: Clean, sans-serif. Large headings.
- Colors: Primary Blue (`blue-500`), Text (`gray-900`, `gray-500`).
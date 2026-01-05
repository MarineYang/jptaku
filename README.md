# JPTAKU - 오타쿠를 위한 일본어 학습 앱

> 애니, 만화, 게임을 좋아하는 오타쿠들을 위한 맞춤형 일본어 회화 학습 앱

## 📱 프로젝트 소개

JPTAKU는 오타쿠 문화에 관심 있는 사용자들을 위한 일본어 학습 앱입니다.
AI와의 대화를 통해 실제로 사용할 수 있는 일본어 문장을 학습하고,
성지순례, 애니메이션, 만화 등 다양한 오타쿠 카테고리의 표현을 익힐 수 있습니다.

### 주요 기능

- 🎯 **오늘의 5문장**: 매일 새로운 일본어 문장 학습
- 💬 **AI 회화 연습**: 학습한 문장을 실제 대화에서 사용
- 📊 **피드백 시스템**: 문법, 발음, 자연스러움에 대한 상세한 피드백
- 🎌 **오타쿠 카테고리**: 애니, 만화, 게임, 성지순례 등 관심사별 학습
- 📈 **학습 진도 추적**: 카테고리별 진행도 및 사용 통계

## 🛠️ 기술 스택

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: Zustand + AsyncStorage
- **Data Fetching**: TanStack Query
- **TTS**: Expo Speech
- **Auth**: Expo Web Browser (OAuth)

## 📁 프로젝트 구조

```
jptaku/
├── App.tsx                    # 앱 진입점
├── app.json                   # Expo 설정
├── src/
│   ├── navigation/           # React Navigation 설정
│   │   └── AppNavigator.tsx
│   ├── screens/              # 화면 컴포넌트
│   │   ├── LoginScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── SentenceDetailScreen.tsx
│   │   ├── ConversationScreen.tsx
│   │   ├── FeedbackScreen.tsx
│   │   └── MyPageScreen.tsx
│   └── store/                # Zustand 상태 관리
│       └── useAppStore.ts
├── assets/                   # 앱 아이콘, 스플래시
└── ios/                      # iOS 네이티브 빌드
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18 이상
- Xcode (iOS 빌드용)
- Android Studio (Android 빌드용)

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
# Expo 개발 서버 시작
npx expo start

# iOS 시뮬레이터에서 실행
npx expo run:ios

# Android 에뮬레이터에서 실행
npx expo run:android
```

### 환경 변수 설정

`.env` 파일을 생성하고 API URL을 설정하세요:

```
EXPO_PUBLIC_API_URL=https://your-api-url.com
```

## 📱 화면 구성

- **Login**: Google OAuth 로그인
- **Onboarding**: 관심사, 레벨, 학습 목적 설정
- **Home**: 오늘의 5문장 및 학습 시작
- **SentenceDetail**: 문장 상세 학습 및 퀴즈
- **Conversation**: AI와의 실시간 회화 연습
- **Feedback**: 학습 결과 및 피드백
- **MyPage**: 사용자 프로필 및 학습 통계

## 🔗 딥링크

앱은 `jptaku://` 스키마를 지원합니다:

- `jptaku://auth/callback` - OAuth 콜백
- `jptaku://sentence/:id` - 문장 상세

## 📦 주요 의존성

- **expo**: ~54.0.0
- **react-native**: 0.79.x
- **@react-navigation/native**: ^7.x
- **zustand**: ^4.5.0
- **@tanstack/react-query**: ^5.x
- **expo-speech**: TTS
- **expo-web-browser**: OAuth

## 📝 라이선스

This project is private and proprietary.

---

**Made with ❤️ for Otaku learners**

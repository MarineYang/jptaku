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

- **Framework**: Flutter
- **Language**: Dart
- **Navigation**: GoRouter (StatefulShellRoute 적용)
- **State Management**: Riverpod
- **Networking**: Dio (with SSE support)
- **Auth**: Google Sign In
- **Audio**: Just Audio

## 📁 프로젝트 구조

```
jptaku/
├── lib/
│   ├── core/                 # 상수, 테마, 유틸리티
│   ├── data/                 # 데이터 계층 (Models, Repositories, Services)
│   ├── presentation/         # UI 계층 (Screens, Widgets, Providers)
│   │   ├── screens/
│   │   │   ├── conversation/
│   │   │   ├── home/
│   │   │   ├── login/
│   │   │   ├── main/
│   │   │   ├── mypage/
│   │   │   └── onboarding/
│   │   └── providers/
│   ├── router/               # 네비게이션 설정 (AppRouter)
│   └── main.dart             # 앱 진입점
├── assets/                   # 이미지, 폰트 등 리소스
├── ios/                      # iOS 네이티브 프로젝트
└── android/                  # Android 네이티브 프로젝트
```

## 🚀 시작하기

### 사전 요구사항

- Flutter SDK Installed
- Xcode (iOS 실행용)
- Android Studio (Android 실행용)

### 설치

```bash
# 의존성 설치
flutter pub get
```

### 앱 실행 방법

#### 1. iOS 시뮬레이터 실행

터미널에서 먼저 시뮬레이터를 실행합니다. (또는 Spotlight 검색으로 'Simulator' 앱 실행)

```bash
open -a Simulator
```

#### 2. 앱 빌드 및 실행

프로젝트 루트 경로에서 아래 명령어를 실행합니다.

flutter 빌드 명령어 

```bash
iOS 빌드:
flutter build ios

Android 빌드:
flutter build apk        # APK 파일
flutter build appbundle  # Play Store용 AAB 파일


릴리즈 빌드:
flutter build ios --release
flutter build apk --release
```

```bash
flutter run
```

만약 특정 기기(예: iPhone 17 Pro)를 지정해서 실행하고 싶다면, `flutter devices`로 기기 ID를 확인한 후 실행하세요.

```bash
# 기기 목록 확인
flutter devices

# 특정 기기 실행 (예: iPhone 17 Pro)
flutter run -d <Device ID>
# 예: flutter run -d 210E208B
```

#### 참고 사항

- 빌드 시간이 처음에는 다소 걸릴 수 있습니다 (Xcode Build).
- `Cmd + R`로 Hot Restart, `r`로 Hot Reload가 가능합니다.

## 📱 화면 구성

- **Login**: Google OAuth 로그인 (그라데이션 로고 적용)
- **Onboarding**: 관심사 및 초기 설정
- **Home**: 학습 대시보드 (스트릭, 오늘의 문장)
- **Conversation**: AI 실시간 회화 (Sakura Pink 테마, 스트리밍 채팅)
- **MyPage**: 프로필, 설정, 통계

## 🔗 딥링크

- `jptaku://` 스키마 지원 (`GoRouter` 기반)

## 📝 라이선스

This project is private and proprietary.

---

**Made with ❤️ for Otaku learners**

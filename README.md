# JPTAKU - 오타쿠를 위한 일본어 학습 앱

> 애니, 만화, 게임을 좋아하는 오타쿠들을 위한 맞춤형 일본어 회화 학습 앱

## 프로젝트 소개

JPTAKU는 오타쿠 문화에 관심 있는 사용자들을 위한 일본어 학습 앱입니다.
AI와의 대화를 통해 실제로 사용할 수 있는 일본어 문장을 학습하고,
성지순례, 애니메이션, 만화 등 다양한 오타쿠 카테고리의 표현을 익힐 수 있습니다.

### 주요 기능

- **오늘의 5문장**: 매일 새로운 일본어 문장 학습
- **AI 회화 연습**: 학습한 문장을 실제 대화에서 사용
- **피드백 시스템**: 문법, 발음, 자연스러움에 대한 상세한 피드백
- **오타쿠 카테고리**: 애니, 만화, 게임, 성지순례 등 관심사별 학습
- **학습 진도 추적**: 카테고리별 진행도 및 사용 통계

## 기술 스택

- **Framework**: Flutter 3.8+
- **Language**: Dart
- **State Management**: Riverpod
- **Navigation**: Go Router
- **HTTP Client**: Dio
- **Local Storage**: Flutter Secure Storage, Shared Preferences
- **Auth**: Google OAuth (System Browser + Deep Link)

## 프로젝트 구조

```
jptaku/
├── lib/
│   ├── main.dart                 # 앱 진입점
│   ├── core/
│   │   ├── constants/            # 상수 정의
│   │   └── theme/                # 앱 테마, 색상
│   ├── data/
│   │   ├── models/               # 데이터 모델
│   │   └── services/             # API 서비스
│   └── presentation/
│       ├── providers/            # Riverpod 프로바이더
│       ├── screens/              # 화면 컴포넌트
│       └── widgets/              # 공통 위젯
├── android/                      # Android 네이티브
├── ios/                          # iOS 네이티브
└── assets/                       # 정적 리소스
```

## 시작하기

### 사전 요구사항

- Flutter SDK 3.8 이상
- Dart SDK 3.8 이상
- Xcode (iOS 빌드용)
- Android Studio (Android 빌드용)

### 설치

```bash
# 의존성 설치
flutter pub get
```

### 환경 변수 설정

`.env` 파일을 생성하고 API URL을 설정하세요:

```
API_URL=https://your-api-url.com
```

### 개발 서버 실행

```bash
# 연결된 디바이스 확인
flutter devices

# 디버그 모드 실행
flutter run

# 특정 디바이스에서 실행
flutter run -d <device_id>

# iOS 시뮬레이터에서 실행
flutter run -d ios

# Android 에뮬레이터에서 실행
flutter run -d android
```

### 빌드

```bash
# Android APK 빌드
flutter build apk

# Android App Bundle 빌드 (Play Store 배포용)
flutter build appbundle

# iOS 빌드
flutter build ios

# iOS IPA 빌드 (배포용)
flutter build ipa
```

## 화면 구성

- **Login**: Google OAuth 로그인 (외부 브라우저)
- **Onboarding**: 관심사, 레벨, 학습 목적 설정
- **Home**: 오늘의 5문장 및 학습 시작
- **SentenceDetail**: 문장 상세 학습 및 퀴즈
- **Conversation**: AI와의 실시간 회화 연습
- **Feedback**: 학습 결과 및 피드백
- **MyPage**: 사용자 프로필 및 학습 통계

## 딥링크

앱은 `jptaku://` 스키마를 지원합니다:

- `jptaku://callback?access_token=...&refresh_token=...` - OAuth 콜백

## 주요 의존성

- **flutter_riverpod**: 상태 관리
- **go_router**: 라우팅
- **dio**: HTTP 클라이언트
- **flutter_secure_storage**: 보안 저장소
- **url_launcher**: 외부 브라우저 실행
- **app_links**: 딥링크 처리
- **just_audio**: 오디오 재생

## 라이선스

This project is private and proprietary.

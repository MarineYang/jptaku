import 'dart:convert';

// ==================== Word ====================
class Word {
  final String japanese;
  final String? reading;
  final String meaning;
  final String? partOf;

  Word({
    required this.japanese,
    this.reading,
    required this.meaning,
    this.partOf,
  });

  factory Word.fromJson(Map<String, dynamic> json) {
    return Word(
      japanese: json['japanese'] ?? '',
      reading: json['reading'],
      meaning: json['meaning'] ?? '',
      partOf: json['part_of'],
    );
  }

  Map<String, dynamic> toJson() => {
        'japanese': japanese,
        'reading': reading,
        'meaning': meaning,
        'part_of': partOf,
      };
}

// ==================== Quiz ====================
class FillBlankQuiz {
  final String questionJp;
  final List<String> options;
  final String answer;

  FillBlankQuiz({
    required this.questionJp,
    required this.options,
    required this.answer,
  });

  factory FillBlankQuiz.fromJson(Map<String, dynamic> json) {
    return FillBlankQuiz(
      questionJp: json['question_jp'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      answer: json['answer'] ?? '',
    );
  }
}

class OrderingQuiz {
  final List<String> fragments;
  final List<int> correctOrder;

  OrderingQuiz({
    required this.fragments,
    required this.correctOrder,
  });

  factory OrderingQuiz.fromJson(Map<String, dynamic> json) {
    return OrderingQuiz(
      fragments: List<String>.from(json['fragments'] ?? []),
      correctOrder: List<int>.from(json['correct_order'] ?? []),
    );
  }
}

class Quiz {
  final FillBlankQuiz? fillBlank;
  final OrderingQuiz? ordering;

  Quiz({this.fillBlank, this.ordering});

  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      fillBlank: json['fill_blank'] != null
          ? FillBlankQuiz.fromJson(json['fill_blank'])
          : null,
      ordering: json['ordering'] != null
          ? OrderingQuiz.fromJson(json['ordering'])
          : null,
    );
  }
}

class QuizResult {
  final int sentenceId;
  final bool? fillBlankCorrect;
  final bool? orderingCorrect;
  final bool allCorrect;
  final bool memorized;

  QuizResult({
    required this.sentenceId,
    this.fillBlankCorrect,
    this.orderingCorrect,
    required this.allCorrect,
    required this.memorized,
  });

  factory QuizResult.fromJson(Map<String, dynamic> json) {
    return QuizResult(
      sentenceId: json['sentence_id'] ?? 0,
      fillBlankCorrect: json['fill_blank_correct'],
      orderingCorrect: json['ordering_correct'],
      allCorrect: json['all_correct'] ?? false,
      memorized: json['memorized'] ?? false,
    );
  }
}

// ==================== Sentence ====================
class Sentence {
  final int id;
  final String? sentenceKey;
  final String jp;
  final String kr;
  final String? romaji;
  final int level;
  final int category;
  final String? audioUrl;
  final List<Word> words;
  final List<String> grammar;
  final List<String> examples;
  final Quiz? quiz;
  final bool memorized;

  Sentence({
    required this.id,
    this.sentenceKey,
    required this.jp,
    required this.kr,
    this.romaji,
    required this.level,
    required this.category,
    this.audioUrl,
    this.words = const [],
    this.grammar = const [],
    this.examples = const [],
    this.quiz,
    this.memorized = false,
  });

  factory Sentence.fromJson(Map<String, dynamic> json) {
    return Sentence(
      id: json['id'] ?? 0,
      sentenceKey: json['sentence_key'],
      jp: json['jp'] ?? '',
      kr: json['kr'] ?? '',
      romaji: json['romaji'],
      level: json['level'] ?? 5,
      category: json['category'] ?? 1,
      audioUrl: json['audio_url'],
      words: (json['words'] as List<dynamic>?)
              ?.map((w) => Word.fromJson(w))
              .toList() ??
          [],
      grammar: List<String>.from(json['grammar'] ?? []),
      examples: List<String>.from(json['examples'] ?? []),
      quiz: json['quiz'] != null ? Quiz.fromJson(json['quiz']) : null,
      memorized: json['memorized'] ?? false,
    );
  }

  String get levelName {
    switch (level) {
      case 3:
        return 'N3';
      case 4:
        return 'N4';
      case 5:
        return 'N5';
      default:
        return 'N$level';
    }
  }

  String get categoryName {
    switch (category) {
      case 1:
        return '애니메이션';
      case 2:
        return '게임';
      case 3:
        return '음악';
      case 4:
        return '영화';
      case 5:
        return '드라마';
      default:
        return '기타';
    }
  }
}

// ==================== Daily Sentences Response ====================
class DailySentencesResponse {
  final String date;
  final int dailySetId;
  final List<Sentence> sentences;

  DailySentencesResponse({
    required this.date,
    required this.dailySetId,
    required this.sentences,
  });

  factory DailySentencesResponse.fromJson(Map<String, dynamic> json) {
    return DailySentencesResponse(
      date: json['date'] ?? '',
      dailySetId: json['daily_set_id'] ?? 0,
      sentences: (json['sentences'] as List<dynamic>?)
              ?.map((s) => Sentence.fromJson(s))
              .toList() ??
          [],
    );
  }
}

// ==================== Learning Progress ====================
class LearningProgress {
  final int sentenceId;
  final int dailySetId;
  final bool understand;
  final bool speak;
  final bool confirm;
  final bool memorized;

  LearningProgress({
    required this.sentenceId,
    required this.dailySetId,
    this.understand = false,
    this.speak = false,
    this.confirm = false,
    this.memorized = false,
  });

  factory LearningProgress.fromJson(Map<String, dynamic> json) {
    return LearningProgress(
      sentenceId: json['sentence_id'] ?? 0,
      dailySetId: json['daily_set_id'] ?? 0,
      understand: json['understand'] ?? false,
      speak: json['speak'] ?? false,
      confirm: json['confirm'] ?? false,
      memorized: json['memorized'] ?? false,
    );
  }
}

// ==================== Flash ====================
class FlashSentence {
  final int id;
  final String? sentenceKey;
  final String jp;
  final String kr;
  final String? romaji;
  final int level;
  final int category;
  final String? phrase;
  final String? tip;
  final String? alt;
  final String? audioUrl;
  final int flashCount;
  final String? flashGrade;
  final DateTime? nextReviewAt;

  FlashSentence({
    required this.id,
    this.sentenceKey,
    required this.jp,
    required this.kr,
    this.romaji,
    this.level = 5,
    this.category = 1,
    this.phrase,
    this.tip,
    this.alt,
    this.audioUrl,
    this.flashCount = 0,
    this.flashGrade,
    this.nextReviewAt,
  });

  factory FlashSentence.fromJson(Map<String, dynamic> json) {
    return FlashSentence(
      id: json['id'] ?? 0,
      sentenceKey: json['sentence_key'],
      jp: json['jp'] ?? '',
      kr: json['kr'] ?? '',
      romaji: json['romaji'],
      level: json['level'] ?? 5,
      category: json['category'] ?? 1,
      phrase: json['phrase'],
      tip: json['tip'],
      alt: json['alt'],
      audioUrl: json['audio_url'],
      flashCount: json['flash_count'] ?? 0,
      flashGrade: json['flash_grade'],
      nextReviewAt: json['next_review_at'] != null
          ? DateTime.parse(json['next_review_at'])
          : null,
    );
  }

  String get levelName {
    switch (level) {
      case 3:
        return 'N3';
      case 4:
        return 'N4';
      case 5:
        return 'N5';
      default:
        return 'N$level';
    }
  }

  String get categoryName {
    switch (category) {
      case 1:
        return '애니메이션';
      case 2:
        return '게임';
      case 3:
        return '음악';
      case 4:
        return '영화';
      case 5:
        return '드라마';
      default:
        return '기타';
    }
  }
}

class TodayFlashResponse {
  final String date;
  final List<FlashSentence> sentences;

  TodayFlashResponse({
    required this.date,
    required this.sentences,
  });

  factory TodayFlashResponse.fromJson(Map<String, dynamic> json) {
    return TodayFlashResponse(
      date: json['date'] ?? '',
      sentences: (json['sentences'] as List<dynamic>?)
              ?.map((s) => FlashSentence.fromJson(s))
              .toList() ??
          [],
    );
  }
}

// ==================== Chat ====================
class ChatMessage {
  final int id;
  final String role;
  final String content;
  final String? contentKr;
  final DateTime? createdAt;

  ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    this.contentKr,
    this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] ?? 0,
      role: json['role'] ?? 'user',
      content: json['content'] ?? '',
      contentKr: json['content_kr'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
    );
  }

  bool get isUser => role == 'user';
}

class ChatSession {
  final int id;
  final String topic;
  final String? topicDetail;
  final String status;
  final List<ChatMessage> messages;
  final List<ChatSuggestion> suggestions;
  final int currentTurn;
  final int maxTurn;
  final DateTime? createdAt;
  final DateTime? endedAt;

  ChatSession({
    required this.id,
    required this.topic,
    this.topicDetail,
    this.status = 'active',
    this.messages = const [],
    this.suggestions = const [],
    this.currentTurn = 0,
    this.maxTurn = 8,
    this.createdAt,
    this.endedAt,
  });

  factory ChatSession.fromJson(Map<String, dynamic> json) {
    return ChatSession(
      id: json['id'] ?? 0,
      topic: json['topic'] ?? '',
      topicDetail: json['topic_detail'],
      status: json['status'] ?? 'active',
      messages: (json['messages'] as List<dynamic>?)
              ?.map((m) => ChatMessage.fromJson(m))
              .toList() ??
          [],
      suggestions: (json['suggestions'] as List<dynamic>?)
              ?.map((s) => ChatSuggestion.fromJson(s))
              .toList() ??
          [],
      currentTurn: json['current_turn'] ?? 0,
      maxTurn: json['max_turn'] ?? 8,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
      endedAt:
          json['ended_at'] != null ? DateTime.parse(json['ended_at']) : null,
    );
  }

  bool get isActive => status == 'active';
}

class ChatSuggestion {
  final String text;
  final String? textKr;
  final bool isTodaySentence;

  ChatSuggestion({
    required this.text,
    this.textKr,
    this.isTodaySentence = false,
  });

  factory ChatSuggestion.fromJson(Map<String, dynamic> json) {
    return ChatSuggestion(
      text: json['text'] ?? '',
      textKr: json['text_kr'],
      isTodaySentence: json['is_today_sentence'] ?? false,
    );
  }

  ChatSuggestion copyWith({
    String? text,
    String? textKr,
    bool? isTodaySentence,
  }) {
    return ChatSuggestion(
      text: text ?? this.text,
      textKr: textKr ?? this.textKr,
      isTodaySentence: isTodaySentence ?? this.isTodaySentence,
    );
  }
}

/// 세션 메시지 (번역 포함) - 세션 재개 시 사용
class SessionMessage {
  final int id;
  final int sessionId;
  final String role;
  final String content;
  final String? contentKr;
  final DateTime? createdAt;

  SessionMessage({
    required this.id,
    required this.sessionId,
    required this.role,
    required this.content,
    this.contentKr,
    this.createdAt,
  });

  factory SessionMessage.fromJson(Map<String, dynamic> json) {
    return SessionMessage(
      id: json['id'] ?? 0,
      sessionId: json['session_id'] ?? 0,
      role: json['role'] ?? 'user',
      content: json['content'] ?? '',
      contentKr: json['content_kr'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
    );
  }

  bool get isUser => role == 'user';
}

class CreateSessionResponse {
  final ChatSession session;
  final String? greeting;
  final String? greetingKr;
  final List<ChatSuggestion> suggestions;
  final String? audio;
  final List<SessionMessage> messages; // 세션 재개 시 기존 메시지들 (번역 포함)
  final bool isResumed; // 기존 세션 재개 여부

  CreateSessionResponse({
    required this.session,
    this.greeting,
    this.greetingKr,
    this.suggestions = const [],
    this.audio,
    this.messages = const [],
    this.isResumed = false,
  });

  factory CreateSessionResponse.fromJson(Map<String, dynamic> json) {
    return CreateSessionResponse(
      session: ChatSession.fromJson(json['session']),
      greeting: json['greeting'],
      greetingKr: json['greeting_kr'],
      suggestions: (json['suggestions'] as List<dynamic>?)
              ?.map((s) => ChatSuggestion.fromJson(s))
              .toList() ??
          [],
      audio: json['audio'],
      messages: (json['messages'] as List<dynamic>?)
              ?.map((m) => SessionMessage.fromJson(m))
              .toList() ??
          [],
      isResumed: json['is_resumed'] ?? false,
    );
  }
}

// ==================== SSE Event ====================
enum SSEEventType {
  content,
  translation,
  audio,
  suggestions,
  done,
  error,
}

class SSEEvent {
  final SSEEventType type;
  final String? content;
  final String? contentKr;
  final String? audio;
  final List<ChatSuggestion>? suggestions;
  final int? currentTurn;
  final int? maxTurn;
  final bool? isCompleted;
  final String? error;

  SSEEvent({
    required this.type,
    this.content,
    this.contentKr,
    this.audio,
    this.suggestions,
    this.currentTurn,
    this.maxTurn,
    this.isCompleted,
    this.error,
  });

  factory SSEEvent.fromJson(Map<String, dynamic> json) {
    final typeStr = json['type'] as String? ?? '';
    SSEEventType type;

    switch (typeStr) {
      case 'content':
        type = SSEEventType.content;
        break;
      case 'translation':
        type = SSEEventType.translation;
        break;
      case 'audio':
        type = SSEEventType.audio;
        break;
      case 'suggestions':
        type = SSEEventType.suggestions;
        break;
      case 'done':
        type = SSEEventType.done;
        break;
      case 'error':
        type = SSEEventType.error;
        break;
      default:
        type = SSEEventType.content;
    }

    // done 타입인 경우 content를 파싱
    int? currentTurn;
    int? maxTurn;
    bool? isCompleted;
    if (type == SSEEventType.done && json['content'] != null) {
      try {
        final contentStr = json['content'] as String;
        if (contentStr.startsWith('{')) {
          final doneData = jsonDecode(contentStr) as Map<String, dynamic>;
          currentTurn = doneData['current_turn'] as int?;
          maxTurn = doneData['max_turn'] as int?;
          isCompleted = doneData['is_completed'] as bool?;
        }
      } catch (_) {}
    }

    return SSEEvent(
      type: type,
      content: json['content'] as String?,
      contentKr: json['content_kr'] as String?,
      audio: json['audio'] as String?,
      suggestions: json['suggestions'] != null
          ? (json['suggestions'] as List<dynamic>)
              .map((s) => ChatSuggestion.fromJson(s))
              .toList()
          : null,
      currentTurn: currentTurn,
      maxTurn: maxTurn,
      isCompleted: isCompleted,
      error: json['error'] as String?,
    );
  }
}

// ==================== Feedback ====================
class Feedback {
  final int sessionId;
  final int totalScore;
  final int grammarScore;
  final int vocabularyScore;
  final int fluencyScore;
  final String? feedbackText;
  final DateTime? createdAt;

  Feedback({
    required this.sessionId,
    required this.totalScore,
    required this.grammarScore,
    required this.vocabularyScore,
    required this.fluencyScore,
    this.feedbackText,
    this.createdAt,
  });

  factory Feedback.fromJson(Map<String, dynamic> json) {
    return Feedback(
      sessionId: json['session_id'] ?? 0,
      totalScore: json['total_score'] ?? 0,
      grammarScore: json['grammar_score'] ?? 0,
      vocabularyScore: json['vocabulary_score'] ?? 0,
      fluencyScore: json['fluency_score'] ?? 0,
      feedbackText: json['feedback_text'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
    );
  }
}

// ==================== Stats ====================
class TodayStats {
  final int sentencesLearned;
  final int minutesStudied;
  final int streakDays;
  final int totalSentences;
  final double completionRate;

  TodayStats({
    this.sentencesLearned = 0,
    this.minutesStudied = 0,
    this.streakDays = 0,
    this.totalSentences = 0,
    this.completionRate = 0.0,
  });

  factory TodayStats.fromJson(Map<String, dynamic> json) {
    return TodayStats(
      sentencesLearned: json['sentences_learned'] ?? 0,
      minutesStudied: json['minutes_studied'] ?? 0,
      streakDays: json['streak_days'] ?? 0,
      totalSentences: json['total_sentences'] ?? 0,
      completionRate: (json['completion_rate'] ?? 0.0).toDouble(),
    );
  }
}

class CategoryProgress {
  final int category;
  final String categoryName;
  final int learned;
  final int total;
  final double progressRate;

  CategoryProgress({
    required this.category,
    required this.categoryName,
    this.learned = 0,
    this.total = 0,
    this.progressRate = 0.0,
  });

  factory CategoryProgress.fromJson(Map<String, dynamic> json) {
    return CategoryProgress(
      category: json['category'] ?? 0,
      categoryName: json['category_name'] ?? '',
      learned: json['learned'] ?? 0,
      total: json['total'] ?? 0,
      progressRate: (json['progress_rate'] ?? 0.0).toDouble(),
    );
  }
}

class DailyStudyData {
  final String date;
  final int sentencesLearned;
  final int minutesStudied;

  DailyStudyData({
    required this.date,
    this.sentencesLearned = 0,
    this.minutesStudied = 0,
  });

  factory DailyStudyData.fromJson(Map<String, dynamic> json) {
    return DailyStudyData(
      date: json['date'] ?? '',
      sentencesLearned: json['sentences_learned'] ?? 0,
      minutesStudied: json['minutes_studied'] ?? 0,
    );
  }
}

class WeeklyStats {
  final List<DailyStudyData> dailyData;
  final int totalSentences;
  final int totalMinutes;
  final double averagePerDay;

  WeeklyStats({
    this.dailyData = const [],
    this.totalSentences = 0,
    this.totalMinutes = 0,
    this.averagePerDay = 0.0,
  });

  factory WeeklyStats.fromJson(Map<String, dynamic> json) {
    return WeeklyStats(
      dailyData: (json['daily_data'] as List<dynamic>?)
              ?.map((d) => DailyStudyData.fromJson(d))
              .toList() ??
          [],
      totalSentences: json['total_sentences'] ?? 0,
      totalMinutes: json['total_minutes'] ?? 0,
      averagePerDay: (json['average_per_day'] ?? 0.0).toDouble(),
    );
  }
}

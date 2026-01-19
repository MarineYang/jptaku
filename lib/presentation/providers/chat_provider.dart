import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';
import 'package:path_provider/path_provider.dart';
import '../../data/models/sentence_model.dart';
import '../../data/repositories/chat_repository.dart';
import 'auth_provider.dart';

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ChatRepository(ref.watch(apiServiceProvider));
});

final chatProvider = StateNotifierProvider.autoDispose<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(ref.watch(chatRepositoryProvider));
});

// UI Message Model
class Message {
  final String content;
  final String? contentKr;
  final bool isUser;
  final DateTime timestamp;

  Message({
    required this.content,
    this.contentKr,
    required this.isUser,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

// State
class ChatState {
  final bool isLoading;
  final bool isStreaming;
  final bool isCompleted;
  final List<Message> messages;
  final ChatSession? session;
  final int currentTurn;
  final int maxTurns;
  final List<ChatSuggestion> suggestions;
  final String streamingText;
  final String? streamingTranslation;
  final String? error;
  final Set<String> todaySentences; // 오늘의 문장 일본어 텍스트 Set

  ChatState({
    this.isLoading = true,
    this.isStreaming = false,
    this.isCompleted = false,
    this.messages = const [],
    this.session,
    this.currentTurn = 0,
    this.maxTurns = 8,
    this.suggestions = const [],
    this.streamingText = '',
    this.streamingTranslation,
    this.error,
    this.todaySentences = const {},
  });

  ChatState copyWith({
    bool? isLoading,
    bool? isStreaming,
    bool? isCompleted,
    List<Message>? messages,
    ChatSession? session,
    int? currentTurn,
    int? maxTurns,
    List<ChatSuggestion>? suggestions,
    String? streamingText,
    String? streamingTranslation,
    String? error,
    Set<String>? todaySentences,
  }) {
    return ChatState(
      isLoading: isLoading ?? this.isLoading,
      isStreaming: isStreaming ?? this.isStreaming,
      isCompleted: isCompleted ?? this.isCompleted,
      messages: messages ?? this.messages,
      session: session ?? this.session,
      currentTurn: currentTurn ?? this.currentTurn,
      maxTurns: maxTurns ?? this.maxTurns,
      suggestions: suggestions ?? this.suggestions,
      streamingText: streamingText ?? this.streamingText,
      streamingTranslation: streamingTranslation ?? this.streamingTranslation,
      error: error,
      todaySentences: todaySentences ?? this.todaySentences,
    );
  }
}

// Notifier
class ChatNotifier extends StateNotifier<ChatState> {
  final ChatRepository _repository;
  final AudioPlayer _audioPlayer = AudioPlayer();

  ChatNotifier(this._repository) : super(ChatState());

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> startConversation() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // 오늘의 문장 텍스트 가져오기
      final todaySentences = await _repository.getTodaySentenceTexts();

      // 세션 생성 요청 (서버에서 오늘 활성 세션이 있으면 해당 세션 반환)
      final response = await _repository.createSession(topic: 'general');

      if (response != null) {
        // 서버에서 기존 세션 반환한 경우 (is_resumed = true)
        if (response.isResumed) {
          // 기존 메시지들을 UI Message로 변환 (번역 포함)
          final messages = response.messages.map((m) => Message(
            content: m.content,
            contentKr: m.contentKr,
            isUser: m.isUser,
            timestamp: m.createdAt,
          )).toList();

          // 서버에서 받은 suggestions 사용 (이미 is_today_sentence 표시됨)
          state = state.copyWith(
            isLoading: false,
            session: response.session,
            messages: messages,
            suggestions: response.suggestions,
            todaySentences: todaySentences,
            currentTurn: response.session.currentTurn,
            maxTurns: response.session.maxTurn,
          );
        } else {
          // 새 세션 생성된 경우
          final messages = <Message>[];
          if (response.greeting != null) {
            messages.add(Message(
              content: response.greeting!,
              contentKr: response.greetingKr,
              isUser: false,
            ));
          }

          // suggestion에 오늘의 문장 여부 표시
          final markedSuggestions = _markTodaySentences(response.suggestions, todaySentences);

          state = state.copyWith(
            isLoading: false,
            session: response.session,
            suggestions: markedSuggestions,
            messages: messages,
            todaySentences: todaySentences,
            currentTurn: 0,
            maxTurns: response.session.maxTurn,
          );

          if (response.audio != null) {
            _playAudio(response.audio!);
          }
        }
      } else {
        state = state.copyWith(
          isLoading: false,
          error: '세션 생성에 실패했습니다.',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: '세션 생성에 실패했습니다.',
      );
    }
  }

  /// suggestion 목록에서 오늘의 문장에 해당하는 것 표시
  List<ChatSuggestion> _markTodaySentences(List<ChatSuggestion> suggestions, Set<String> todaySentences) {
    return suggestions.map((s) {
      final isTodaySentence = todaySentences.contains(s.text);
      return s.copyWith(isTodaySentence: isTodaySentence);
    }).toList();
  }

  Future<void> sendMessage(String text) async {
    if (text.isEmpty || state.isStreaming || state.isCompleted || state.session == null) return;

    // Add user message immediately
    final updatedMessages = List<Message>.from(state.messages)
      ..add(Message(content: text, isUser: true));

    state = state.copyWith(
      messages: updatedMessages,
      isStreaming: true,
      streamingText: '',
      streamingTranslation: null,
      currentTurn: state.currentTurn + 1,
      suggestions: [],
    );

    try {
      final stream = _repository.sendMessageStream(
        sessionId: state.session!.id,
        message: text,
      );

      await for (final event in stream) {
        switch (event.type) {
          case SSEEventType.content:
            if (event.content != null) {
              state = state.copyWith(
                streamingText: state.streamingText + event.content!,
              );
            }
            break;

          case SSEEventType.translation:
            if (event.contentKr != null) {
              state = state.copyWith(
                streamingTranslation: event.contentKr,
              );
            }
            break;

          case SSEEventType.audio:
            if (event.audio != null) {
              _playAudio(event.audio!);
            }
            break;

          case SSEEventType.suggestions:
            if (event.suggestions != null) {
              // 오늘의 문장 여부 표시
              final markedSuggestions = _markTodaySentences(event.suggestions!, state.todaySentences);
              state = state.copyWith(suggestions: markedSuggestions);
            }
            break;

          case SSEEventType.done:
            // Finalize message
            if (state.streamingText.isNotEmpty) {
               final newMessages = List<Message>.from(state.messages)
                 ..add(Message(
                   content: state.streamingText,
                   contentKr: state.streamingTranslation,
                   isUser: false,
                 ));
               
               state = state.copyWith(
                 messages: newMessages,
                 streamingText: '',
                 streamingTranslation: null,
                 currentTurn: event.currentTurn ?? state.currentTurn,
                 maxTurns: event.maxTurn ?? state.maxTurns,
                 isCompleted: event.isCompleted ?? state.isCompleted,
               );
            }
            break;

          case SSEEventType.error:
            final errorMessages = List<Message>.from(state.messages)
              ..add(Message(
                content: 'すみません、エラーが発生しました。もう一度試してください。',
                isUser: false,
              ));
            state = state.copyWith(messages: errorMessages);
            break;
        }
      }
    } catch (e) {
      final errorMessages = List<Message>.from(state.messages)
        ..add(Message(
          content: 'すみません、エラーが発生しました。',
          isUser: false,
        ));
      state = state.copyWith(messages: errorMessages);
    } finally {
      state = state.copyWith(isStreaming: false);
    }
  }

  Future<void> _playAudio(String base64Audio) async {
    try {
      final bytes = base64Decode(base64Audio);
      final tempDir = await getTemporaryDirectory();
      final tempFile = File('${tempDir.path}/chat_audio_${DateTime.now().millisecondsSinceEpoch}.wav');
      await tempFile.writeAsBytes(bytes);
      
      await _audioPlayer.setFilePath(tempFile.path);
      await _audioPlayer.play();

      // Clean up after playback
      _audioPlayer.playerStateStream.listen((playerState) {
        if (playerState.processingState == ProcessingState.completed) {
           tempFile.delete().catchError((_) => tempFile);
        }
      });
    } catch (e) {
      print('Audio playback error: $e');
    }
  }

  Future<bool> endSession() async {
    if (state.session == null) return false;
    
    state = state.copyWith(isLoading: true);
    try {
      final success = await _repository.endSession(state.session!.id);
      return success;
    } catch (e) {
      return false;
    }
  }
}

import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:just_audio/just_audio.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/sentence_model.dart';
import '../../providers/auth_provider.dart';

/// Local UI message model
class _UiMessage {
  final String content;
  final String? contentKr;
  final bool isUser;
  final Uint8List? audioData;

  _UiMessage({
    required this.content,
    required this.isUser,
    this.contentKr,
    this.audioData,
  });
}

class ConversationScreen extends ConsumerStatefulWidget {
  const ConversationScreen({super.key});

  @override
  ConsumerState<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends ConsumerState<ConversationScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<_UiMessage> _messages = [];
  bool _isLoading = false;
  bool _isStreaming = false;
  bool _isCompleted = false;
  ChatSession? _session;
  int _currentTurn = 0;
  int _maxTurns = 5;

  // Current suggestions (updated after each AI response)
  List<Suggestion> _currentSuggestions = [];

  // Streaming state for current AI response
  String _streamingText = '';
  String? _streamingTranslation;
  Uint8List? _streamingAudio;

  AudioPlayer? _audioPlayer;

  final List<Map<String, String>> _topicOptions = [
    {'topic': 'cafe', 'label': '카페에서 주문하기'},
    {'topic': 'shopping', 'label': '쇼핑할 때'},
    {'topic': 'travel', 'label': '여행 중 질문'},
    {'topic': 'greeting', 'label': '일상 인사'},
    {'topic': 'anime', 'label': '애니메이션 이야기'},
  ];

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _audioPlayer?.dispose();
    super.dispose();
  }

  // ==================== Audio ====================

  Future<void> _playAudio(Uint8List audioData) async {
    try {
      _audioPlayer?.dispose();
      _audioPlayer = AudioPlayer();
      await _audioPlayer!.setAudioSource(_AudioBytesSource(audioData));
      await _audioPlayer!.play();
    } catch (_) {}
  }

  Uint8List? _decodeAudioBase64(String? base64Str) {
    if (base64Str == null || base64Str.isEmpty) return null;
    try {
      return base64Decode(base64Str);
    } catch (_) {
      return null;
    }
  }

  // ==================== Session Creation ====================

  Future<void> _startConversation(String topic, String label) async {
    setState(() => _isLoading = true);

    try {
      final apiService = ref.read(apiServiceProvider);
      final result = await apiService.createChatSession(
        topic: topic,
        topicDetail: label,
      );

      if (result == null || !mounted) {
        setState(() => _isLoading = false);
        return;
      }

      final session = result.session;
      _session = session;
      _currentTurn = session.currentTurn;
      _maxTurns = session.maxTurn;

      if (result.isResumed) {
        // Resume: restore previous messages
        for (final msg in result.messages) {
          _messages.add(_UiMessage(
            content: msg.content,
            contentKr: msg.contentKr,
            isUser: msg.isUser,
          ));
        }
        _currentSuggestions = result.suggestions;
      } else {
        // New session: show greeting
        final audioData = _decodeAudioBase64(result.audioBase64);
        _messages.add(_UiMessage(
          content: result.greeting,
          contentKr: result.greetingKr,
          isUser: false,
          audioData: audioData,
        ));
        _currentSuggestions = result.suggestions;

        if (audioData != null) {
          _playAudio(audioData);
        }
      }

      setState(() => _isLoading = false);
      _scrollToBottom();
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('세션 생성에 실패했습니다.')),
        );
      }
    }
  }

  // ==================== Send Message (SSE) ====================

  Future<void> _sendMessage([String? overrideText]) async {
    final text = overrideText ?? _controller.text.trim();
    if (text.isEmpty || _isLoading || _isStreaming || _isCompleted) return;
    if (_session == null) return;

    setState(() {
      _messages.add(_UiMessage(content: text, isUser: true));
      _isStreaming = true;
      _streamingText = '';
      _streamingTranslation = null;
      _streamingAudio = null;
      _currentSuggestions = []; // Clear suggestions during streaming
    });
    if (overrideText == null) _controller.clear();
    _scrollToBottom();

    try {
      final apiService = ref.read(apiServiceProvider);
      final stream = apiService.sendMessageStream(
        sessionId: _session!.id,
        message: text,
      );

      print('[Chat] SSE stream started for session ${_session!.id}');
      await for (final event in stream) {
        if (!mounted) break;

        print('[Chat] Event: type=${event.type}, content=${event.content}, contentKr=${event.contentKr}, suggestions=${event.suggestions?.length}, audio=${event.audioBase64 != null ? "${event.audioBase64!.length} chars" : "null"}, currentTurn=${event.currentTurn}, maxTurn=${event.maxTurn}, isCompleted=${event.isCompleted}');

        switch (event.type) {
          case ChatStreamEventType.content:
            setState(() {
              _streamingText += event.content ?? '';
            });
            _scrollToBottom();
            break;

          case ChatStreamEventType.translation:
            setState(() {
              _streamingTranslation = event.contentKr;
            });
            break;

          case ChatStreamEventType.suggestions:
            setState(() {
              _currentSuggestions = event.suggestions ?? [];
            });
            _scrollToBottom();
            break;

          case ChatStreamEventType.audio:
            final audioBytes = _decodeAudioBase64(event.audioBase64);
            if (audioBytes != null) {
              setState(() => _streamingAudio = audioBytes);
              _playAudio(audioBytes);
            }
            break;

          case ChatStreamEventType.done:
            setState(() {
              _currentTurn = event.currentTurn ?? _currentTurn;
              _maxTurns = event.maxTurn ?? _maxTurns;
              if (event.isCompleted == true) {
                _isCompleted = true;
                _currentSuggestions = [];
              }
            });
            break;

          case ChatStreamEventType.error:
            print('[Chat] SSE error event: ${event.content}');
            setState(() {
              _messages.add(_UiMessage(
                content: 'エラーが発生しました。もう一度試してください。',
                isUser: false,
              ));
            });
            break;
        }
      }

      print('[Chat] SSE stream ended. streamingText="${_streamingText}", translation="${_streamingTranslation}", audio=${_streamingAudio != null ? "${_streamingAudio!.length} bytes" : "null"}');

      // Finalize AI message
      if (_streamingText.isNotEmpty && mounted) {
        setState(() {
          _messages.add(_UiMessage(
            content: _streamingText,
            contentKr: _streamingTranslation,
            isUser: false,
            audioData: _streamingAudio,
          ));
          _streamingText = '';
          _streamingTranslation = null;
          _streamingAudio = null;
        });
      }
    } catch (e) {
      print('[Chat] SSE exception: $e');
      if (mounted) {
        setState(() {
          _messages.add(_UiMessage(
            content: 'エラーが発生しました。',
            isUser: false,
          ));
        });
      }
    } finally {
      if (mounted) setState(() => _isStreaming = false);
    }

    _scrollToBottom();
  }

  // ==================== End Session ====================

  Future<void> _endConversation() async {
    if (_session == null) {
      context.go('/home');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final apiService = ref.read(apiServiceProvider);
      final success = await apiService.endChatSession(_session!.id);

      if (mounted) {
        if (success) {
          context.push('/feedback/${_session!.id}');
        } else {
          context.go('/home');
        }
      }
    } catch (e) {
      if (mounted) context.go('/home');
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // ==================== Build ====================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
        title: _session != null
            ? Column(
                children: [
                  const Text(
                    'AI 회화',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '$_currentTurn / $_maxTurns 턴',
                    style: const TextStyle(
                        fontSize: 12, color: AppColors.gray500),
                  ),
                ],
              )
            : const Text(
                'AI 회화',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
        actions: [
          if (_session != null && _messages.length > 1)
            TextButton(
              onPressed: _endConversation,
              child: const Text('종료'),
            ),
        ],
      ),
      body: _session == null ? _buildTopicSelection() : _buildChatView(),
    );
  }

  // ==================== Topic Selection ====================

  Widget _buildTopicSelection() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '대화 주제를 선택하세요',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.gray900,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'AI와 선택한 주제로 일본어 대화를 연습해보세요',
            style: TextStyle(fontSize: 16, color: AppColors.gray500),
          ),
          const SizedBox(height: 32),
          if (_isLoading)
            const Center(child: CircularProgressIndicator())
          else
            ..._topicOptions.map((t) => _buildTopicCard(
                  topic: t['topic']!,
                  label: t['label']!,
                )),
        ],
      ),
    );
  }

  Widget _buildTopicCard({required String topic, required String label}) {
    return GestureDetector(
      onTap: () => _startConversation(topic, label),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.gray100),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.chat_bubble_outline,
                  color: AppColors.primary),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(label,
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.gray900)),
            ),
            const Icon(Icons.arrow_forward_ios,
                size: 16, color: AppColors.gray400),
          ],
        ),
      ),
    );
  }

  // ==================== Chat View ====================

  Widget _buildChatView() {
    return Column(
      children: [
        // Progress bar
        LinearProgressIndicator(
          value: _maxTurns > 0 ? _currentTurn / _maxTurns : 0,
          backgroundColor: AppColors.gray200,
          color: AppColors.primary,
        ),

        // Messages list
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: _messages.length +
                (_isStreaming && _streamingText.isNotEmpty ? 1 : 0) +
                (_isStreaming && _streamingText.isEmpty ? 1 : 0) +
                // Suggestion chips at the end (if not streaming and has suggestions)
                (!_isStreaming && _currentSuggestions.isNotEmpty ? 1 : 0),
            itemBuilder: (context, index) {
              // Streaming AI bubble
              if (_isStreaming &&
                  _streamingText.isNotEmpty &&
                  index == _messages.length) {
                return _buildAiBubble(
                  content: _streamingText,
                  contentKr: _streamingTranslation,
                  isStreaming: true,
                );
              }
              // Typing indicator
              if (_isStreaming &&
                  _streamingText.isEmpty &&
                  index == _messages.length) {
                return _buildTypingIndicator();
              }
              // Suggestion chips row
              if (!_isStreaming &&
                  _currentSuggestions.isNotEmpty &&
                  index ==
                      _messages.length +
                          (_isStreaming && _streamingText.isNotEmpty ? 1 : 0) +
                          (_isStreaming && _streamingText.isEmpty ? 1 : 0)) {
                return _buildSuggestionsList();
              }
              // Regular message
              final msg = _messages[index];
              if (msg.isUser) return _buildUserBubble(msg);
              return _buildAiBubble(
                content: msg.content,
                contentKr: msg.contentKr,
                audioData: msg.audioData,
              );
            },
          ),
        ),

        // Completion card
        if (_isCompleted) _buildCompletionCard(),

        // Input bar
        if (!_isCompleted) _buildInputBar(),
      ],
    );
  }

  // ==================== Message Bubbles ====================

  Widget _buildUserBubble(_UiMessage msg) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Flexible(
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(4),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Text(
                msg.content,
                style: const TextStyle(
                    fontSize: 16, color: Colors.white, height: 1.4),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAiBubble({
    required String content,
    String? contentKr,
    Uint8List? audioData,
    bool isStreaming = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // AI avatar
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Text('AI',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white)),
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                  bottomLeft: Radius.circular(4),
                  bottomRight: Radius.circular(16),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Japanese text
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Flexible(
                        child: Text(
                          content,
                          style: const TextStyle(
                              fontSize: 16,
                              color: AppColors.gray900,
                              height: 1.4),
                        ),
                      ),
                      if (isStreaming) ...[
                        const SizedBox(width: 8),
                        const SizedBox(
                          width: 12,
                          height: 12,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: AppColors.gray400),
                        ),
                      ],
                    ],
                  ),
                  // Korean translation
                  if (contentKr != null && contentKr.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.gray50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        contentKr,
                        style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.gray600,
                            height: 1.3),
                      ),
                    ),
                  ],
                  // Audio button
                  if (audioData != null) ...[
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: () => _playAudio(audioData),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.volume_up,
                                size: 16, color: AppColors.primary),
                            SizedBox(width: 4),
                            Text('다시 듣기',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==================== Suggestions ====================

  Widget _buildSuggestionsList() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 44),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(bottom: 6),
            child: Text(
              '이렇게 답해보세요',
              style: TextStyle(
                  fontSize: 12,
                  color: AppColors.gray500,
                  fontWeight: FontWeight.w500),
            ),
          ),
          ..._currentSuggestions.map((s) => _buildSuggestionChip(s)),
        ],
      ),
    );
  }

  Widget _buildSuggestionChip(Suggestion suggestion) {
    return GestureDetector(
      onTap: () {
        if (!_isStreaming && !_isCompleted) {
          _sendMessage(suggestion.text);
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: suggestion.isTodaySentence
                ? AppColors.sakura
                : AppColors.gray200,
            width: suggestion.isTodaySentence ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (suggestion.isTodaySentence) ...[
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.sakura.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  '오늘의 문장',
                  style: TextStyle(
                      fontSize: 9,
                      color: AppColors.sakura,
                      fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 8),
            ],
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    suggestion.text,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: AppColors.gray900),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    suggestion.textKr,
                    style:
                        const TextStyle(fontSize: 12, color: AppColors.gray500),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.send, size: 14, color: AppColors.gray400),
          ],
        ),
      ),
    );
  }

  // ==================== Typing Indicator ====================

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Text('AI',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white)),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(
                  3,
                  (i) => Padding(
                        padding: EdgeInsets.only(left: i > 0 ? 4 : 0),
                        child: _buildDot(i),
                      )),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDot(int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 300 + (index * 100)),
      builder: (context, value, child) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: AppColors.gray400.withValues(alpha: 0.5 + (value * 0.5)),
            shape: BoxShape.circle,
          ),
        );
      },
    );
  }

  // ==================== Completion ====================

  Widget _buildCompletionCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: AppColors.warningLight,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Column(
        children: [
          const Icon(Icons.celebration, size: 40, color: AppColors.warning),
          const SizedBox(height: 8),
          const Text('회화 완료!',
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.gray900)),
          const SizedBox(height: 4),
          const Text('피드백을 확인해보세요',
              style: TextStyle(fontSize: 14, color: AppColors.gray600)),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _endConversation,
              child: const Text('피드백 확인하기'),
            ),
          ),
        ],
      ),
    );
  }

  // ==================== Input Bar ====================

  Widget _buildInputBar() {
    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 12,
        bottom: MediaQuery.of(context).padding.bottom + 12,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.gray100)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              enabled: !_isStreaming,
              decoration: InputDecoration(
                hintText: '일본어로 대화해보세요...',
                hintStyle: const TextStyle(color: AppColors.gray400),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: AppColors.gray50,
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 12),
              ),
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: _isStreaming ? AppColors.gray200 : AppColors.primary,
              shape: BoxShape.circle,
            ),
            child: IconButton(
              onPressed: _isStreaming ? null : () => _sendMessage(),
              icon: Icon(
                _isStreaming ? Icons.more_horiz : Icons.send,
                color: _isStreaming ? AppColors.gray400 : Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Custom AudioSource for playing audio from bytes in memory
class _AudioBytesSource extends StreamAudioSource {
  final Uint8List _audioData;

  _AudioBytesSource(this._audioData);

  @override
  Future<StreamAudioResponse> request([int? start, int? end]) async {
    start ??= 0;
    end ??= _audioData.length;
    return StreamAudioResponse(
      sourceLength: _audioData.length,
      contentLength: end - start,
      offset: start,
      stream: Stream.value(_audioData.sublist(start, end)),
      contentType: 'audio/wav',
    );
  }
}

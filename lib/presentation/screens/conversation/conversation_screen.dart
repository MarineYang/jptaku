import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:just_audio/just_audio.dart';
import 'package:path_provider/path_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/sentence_model.dart';
import '../../providers/auth_provider.dart';

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

class ConversationScreen extends ConsumerStatefulWidget {
  const ConversationScreen({super.key});

  @override
  ConsumerState<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends ConsumerState<ConversationScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final AudioPlayer _audioPlayer = AudioPlayer();
  final List<Message> _messages = [];
  bool _isLoading = true;
  bool _isStreaming = false;
  bool _isCompleted = false;
  ChatSession? _session;
  int _currentTurn = 0;
  int _maxTurns = 8;
  String _streamingText = '';
  String? _streamingTranslation;
  List<ChatSuggestion> _suggestions = [];
  Set<int> _expandedMessages = {};

  @override
  void initState() {
    super.initState();
    _startConversation();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _startConversation() async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.createChatSession(
        topic: 'general',
      );

      if (response != null && mounted) {
        setState(() {
          _session = response.session;
          _suggestions = response.suggestions;
          // greeting 메시지 추가
          if (response.greeting != null) {
            _messages.add(Message(
              content: response.greeting!,
              contentKr: response.greetingKr,
              isUser: false,
            ));
          }
          _isLoading = false;
        });
      } else {
        if (mounted) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('세션 생성에 실패했습니다.')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('세션 생성에 실패했습니다.')),
        );
      }
    }
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _isLoading || _isStreaming || _isCompleted) return;
    if (_session == null) return;

    setState(() {
      _messages.add(Message(content: text, isUser: true));
      _isStreaming = true;
      _streamingText = '';
      _streamingTranslation = null;
      _currentTurn++;
      _suggestions = [];
    });
    _controller.clear();
    _scrollToBottom();

    try {
      final apiService = ref.read(apiServiceProvider);
      debugPrint('Calling sendMessageStream: sessionId=${_session!.id}, message=$text');
      final stream = apiService.sendMessageStream(
        sessionId: _session!.id,
        message: text,
      );

      debugPrint('Stream created, waiting for events...');
      await for (final event in stream) {
        debugPrint('SSE Event received: ${event.type}');
        switch (event.type) {
          case SSEEventType.content:
            // 일본어 텍스트 스트리밍
            if (event.content != null) {
              setState(() {
                _streamingText += event.content!;
              });
              _scrollToBottom();
            }
            break;

          case SSEEventType.translation:
            // 한국어 번역
            debugPrint('Translation: ${event.contentKr}');
            if (event.contentKr != null) {
              setState(() {
                _streamingTranslation = event.contentKr;
              });
            }
            break;

          case SSEEventType.audio:
            // Base64 오디오 재생
            debugPrint('Audio received: ${event.audio?.length ?? 0} chars');
            if (event.audio != null) {
              _playAudio(event.audio!);
            }
            break;

          case SSEEventType.suggestions:
            // 답변 제안
            if (event.suggestions != null) {
              setState(() {
                _suggestions = event.suggestions!;
              });
            }
            break;

          case SSEEventType.done:
            // 스트리밍 완료 - 메시지 추가
            if (_streamingText.isNotEmpty) {
              setState(() {
                _messages.add(Message(
                  content: _streamingText,
                  contentKr: _streamingTranslation,
                  isUser: false,
                ));
                _streamingText = '';
                _streamingTranslation = null;

                // 턴 정보 업데이트
                if (event.currentTurn != null) {
                  _currentTurn = event.currentTurn!;
                }
                if (event.maxTurn != null) {
                  _maxTurns = event.maxTurn!;
                }
                if (event.isCompleted == true) {
                  _isCompleted = true;
                }
              });
            }
            break;

          case SSEEventType.error:
            setState(() {
              _messages.add(Message(
                content: 'すみません、エラーが発生しました。もう一度試してください。',
                isUser: false,
              ));
            });
            break;
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add(Message(
            content: 'すみません、エラーが発生しました。',
            isUser: false,
          ));
        });
      }
    } finally {
      setState(() => _isStreaming = false);
    }

    _scrollToBottom();
  }

  Future<void> _playAudio(String base64Audio) async {
    debugPrint('_playAudio called with ${base64Audio.length} chars');
    try {
      // Base64 데이터를 바이트로 디코딩
      final bytes = base64Decode(base64Audio);
      debugPrint('Decoded ${bytes.length} bytes');

      // 임시 디렉토리에 파일 저장
      final tempDir = await getTemporaryDirectory();
      final tempFile = File('${tempDir.path}/chat_audio_${DateTime.now().millisecondsSinceEpoch}.wav');
      await tempFile.writeAsBytes(bytes);
      debugPrint('Saved audio to: ${tempFile.path}');

      // 파일에서 재생
      debugPrint('Setting audio source...');
      await _audioPlayer.setFilePath(tempFile.path);
      debugPrint('Playing audio...');
      await _audioPlayer.play();
      debugPrint('Audio play started');

      // 재생 완료 후 임시 파일 삭제
      _audioPlayer.playerStateStream.listen((state) {
        if (state.processingState == ProcessingState.completed) {
          tempFile.delete().catchError((_) => tempFile);
        }
      });
    } catch (e, stackTrace) {
      debugPrint('Audio playback error: $e');
      debugPrint('Stack trace: $stackTrace');
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
      if (mounted) {
        context.go('/home');
      }
    }
  }

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
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '$_currentTurn / $_maxTurns 턴',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.gray500,
                    ),
                  ),
                ],
              )
            : const Text(
                'AI 회화',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
        actions: [
          if (_session != null && _messages.length > 1)
            TextButton(
              onPressed: _endConversation,
              child: const Text('종료'),
            ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_session == null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.error_outline,
              size: 48,
              color: AppColors.gray400,
            ),
            const SizedBox(height: 16),
            const Text(
              '세션을 시작할 수 없습니다',
              style: TextStyle(
                fontSize: 16,
                color: AppColors.gray500,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                setState(() => _isLoading = true);
                _startConversation();
              },
              child: const Text('다시 시도'),
            ),
          ],
        ),
      );
    }

    return _buildChatView();
  }

  Widget _buildChatView() {
    return Column(
      children: [
        // Progress Bar
        LinearProgressIndicator(
          value: _currentTurn / _maxTurns,
          backgroundColor: AppColors.gray200,
          color: AppColors.primary,
        ),

        // Messages
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: _messages.length +
                (_isStreaming && _streamingText.isNotEmpty ? 1 : 0) +
                (_isStreaming && _streamingText.isEmpty ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == _messages.length &&
                  _isStreaming &&
                  _streamingText.isNotEmpty) {
                return _buildMessageBubble(
                  Message(content: _streamingText, isUser: false),
                  index: -1,
                  isStreaming: true,
                );
              }
              if (index == _messages.length && _isStreaming) {
                return _buildTypingIndicator();
              }
              return _buildMessageBubble(_messages[index], index: index);
            },
          ),
        ),

        // Completion Card
        if (_isCompleted)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: AppColors.warningLight,
              borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Column(
              children: [
                const Icon(
                  Icons.celebration,
                  size: 40,
                  color: AppColors.warning,
                ),
                const SizedBox(height: 8),
                const Text(
                  '회화 완료!',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.gray900,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  '피드백을 확인해보세요',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.gray600,
                  ),
                ),
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
          ),

        // Input
        if (!_isCompleted)
          Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: AppColors.gray100),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Suggestions
                if (_suggestions.isNotEmpty && !_isStreaming)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _suggestions.map((suggestion) {
                        return GestureDetector(
                          onTap: () {
                            _controller.text = suggestion.text;
                            _sendMessage();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  suggestion.text,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: AppColors.primaryDark,
                                  ),
                                ),
                                if (suggestion.textKr != null) ...[
                                  const SizedBox(height: 2),
                                  Text(
                                    suggestion.textKr!,
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: AppColors.gray500,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                // Input field
                Padding(
                  padding: EdgeInsets.only(
                    left: 16,
                    right: 16,
                    top: 12,
                    bottom: MediaQuery.of(context).padding.bottom + 12,
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
                              horizontal: 20,
                              vertical: 12,
                            ),
                          ),
                          onSubmitted: (_) => _sendMessage(),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: _controller.text.trim().isEmpty || _isStreaming
                              ? AppColors.gray200
                              : AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          onPressed: _isStreaming ? null : _sendMessage,
                          icon: Icon(
                            _isStreaming ? Icons.more_horiz : Icons.send,
                            color: _controller.text.trim().isEmpty || _isStreaming
                                ? AppColors.gray400
                                : Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildMessageBubble(Message message, {required int index, bool isStreaming = false}) {
    final isExpanded = _expandedMessages.contains(index);
    final hasTranslation = message.contentKr != null && !message.isUser;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            message.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!message.isUser) ...[
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Center(
                child: Text(
                  'AI',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: GestureDetector(
              onTap: hasTranslation
                  ? () {
                      setState(() {
                        if (isExpanded) {
                          _expandedMessages.remove(index);
                        } else {
                          _expandedMessages.add(index);
                        }
                      });
                    }
                  : null,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: message.isUser ? AppColors.primary : Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft: Radius.circular(message.isUser ? 16 : 4),
                    bottomRight: Radius.circular(message.isUser ? 4 : 16),
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
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Flexible(
                          child: Text(
                            message.content,
                            style: TextStyle(
                              fontSize: 16,
                              color:
                                  message.isUser ? Colors.white : AppColors.gray900,
                              height: 1.4,
                            ),
                          ),
                        ),
                        if (isStreaming) ...[
                          const SizedBox(width: 8),
                          SizedBox(
                            width: 12,
                            height: 12,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.gray400,
                            ),
                          ),
                        ],
                      ],
                    ),
                    // 번역 애니메이션
                    AnimatedCrossFade(
                      firstChild: const SizedBox.shrink(),
                      secondChild: hasTranslation
                          ? Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.gray50,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  message.contentKr!,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.gray600,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            )
                          : const SizedBox.shrink(),
                      crossFadeState: isExpanded
                          ? CrossFadeState.showSecond
                          : CrossFadeState.showFirst,
                      duration: const Duration(milliseconds: 200),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

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
              child: Text(
                'AI',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
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
              children: [
                _buildDot(0),
                const SizedBox(width: 4),
                _buildDot(1),
                const SizedBox(width: 4),
                _buildDot(2),
              ],
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
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/sentence_model.dart';
import '../../providers/auth_provider.dart';

class Message {
  final String content;
  final bool isUser;
  final DateTime timestamp;

  Message({
    required this.content,
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
  final List<Message> _messages = [];
  bool _isLoading = false;
  bool _isStreaming = false;
  bool _isCompleted = false;
  ChatSession? _session;
  int _currentTurn = 0;
  final int _maxTurns = 5;
  String _streamingText = '';

  final List<Map<String, String>> _topicSuggestions = [
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
    super.dispose();
  }

  Future<void> _startConversation(String topic, String label) async {
    setState(() => _isLoading = true);

    try {
      final apiService = ref.read(apiServiceProvider);
      final session = await apiService.createChatSession(
        topic: topic,
        topicDetail: label,
      );

      if (session != null && mounted) {
        setState(() {
          _session = session;
          _messages.add(Message(
            content: 'こんにちは！「$label」について話しましょう。日本語で話してみてください！',
            isUser: false,
          ));
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add(Message(
            content: 'こんにちは！今日は何について話しましょうか？',
            isUser: false,
          ));
          _isLoading = false;
        });
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
      _currentTurn++;
    });
    _controller.clear();
    _scrollToBottom();

    try {
      final apiService = ref.read(apiServiceProvider);
      final stream = apiService.sendMessageStream(
        sessionId: _session!.id,
        message: text,
      );

      await for (final chunk in stream) {
        if (chunk == '[ERROR]') {
          setState(() {
            _messages.add(Message(
              content: 'すみません、エラーが発生しました。もう一度試してください。',
              isUser: false,
            ));
          });
          break;
        }

        setState(() {
          _streamingText += chunk;
        });
        _scrollToBottom();
      }

      if (_streamingText.isNotEmpty) {
        setState(() {
          _messages.add(Message(content: _streamingText, isUser: false));
          _streamingText = '';

          if (_currentTurn >= _maxTurns) {
            _isCompleted = true;
          }
        });
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
      body: _session == null ? _buildTopicSelection() : _buildChatView(),
    );
  }

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
            style: TextStyle(
              fontSize: 16,
              color: AppColors.gray500,
            ),
          ),
          const SizedBox(height: 32),
          if (_isLoading)
            const Center(child: CircularProgressIndicator())
          else
            ..._topicSuggestions.map((topic) => _buildTopicCard(
                  topic: topic['topic']!,
                  label: topic['label']!,
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
              child: const Icon(
                Icons.chat_bubble_outline,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.gray900,
                ),
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: AppColors.gray400,
            ),
          ],
        ),
      ),
    );
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
                  isStreaming: true,
                );
              }
              if (index == _messages.length && _isStreaming) {
                return _buildTypingIndicator();
              }
              return _buildMessageBubble(_messages[index]);
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
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 12,
              bottom: MediaQuery.of(context).padding.bottom + 12,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: AppColors.gray100),
              ),
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
    );
  }

  Widget _buildMessageBubble(Message message, {bool isStreaming = false}) {
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
              child: Row(
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

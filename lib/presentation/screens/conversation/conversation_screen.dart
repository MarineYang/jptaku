import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/chat_provider.dart';

class ConversationScreen extends ConsumerStatefulWidget {
  const ConversationScreen({super.key});

  @override
  ConsumerState<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends ConsumerState<ConversationScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final Set<int> _expandedMessages = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(chatProvider.notifier).startConversation();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    
    _controller.clear();
    await ref.read(chatProvider.notifier).sendMessage(text);
  }

  Future<void> _endConversation() async {
    final notifier = ref.read(chatProvider.notifier);
    final state = ref.read(chatProvider);
    
    if (state.session == null) {
      context.go('/home');
      return;
    }

    final success = await notifier.endSession();
    if (mounted) {
      if (success) {
        context.push('/feedback/${state.session!.id}');
      } else {
        context.go('/home');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Listen to state changes to scroll to bottom when new messages arrive
    ref.listen(chatProvider, (previous, next) {
      if (previous?.messages.length != next.messages.length || 
          previous?.streamingText != next.streamingText) {
        // Debounce slightly or just post frame
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      }
    });

    final state = ref.watch(chatProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
        title: Column(
          children: [
            const Text(
              'AI 회화',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (state.session != null)
              Text(
                '${state.currentTurn} / ${state.maxTurns} 턴',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.gray500,
                ),
              ),
          ],
        ),
        actions: [
          if (state.session != null && state.messages.length > 1)
            TextButton(
              onPressed: _endConversation,
              child: const Text('종료'),
            ),
        ],
      ),
      body: _buildBody(state),
    );
  }

  Widget _buildBody(ChatState state) {
    if (state.isLoading && state.messages.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (state.error != null && state.messages.isEmpty) {
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
            Text(
              state.error!,
              style: const TextStyle(
                fontSize: 16,
                color: AppColors.gray500,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                ref.read(chatProvider.notifier).startConversation();
              },
              child: const Text('다시 시도'),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        // Progress Bar
        LinearProgressIndicator(
          value: state.maxTurns > 0 ? state.currentTurn / state.maxTurns : 0,
          backgroundColor: AppColors.gray200,
          color: AppColors.primary,
        ),

        // Messages
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: state.messages.length +
                (state.isStreaming && state.streamingText.isNotEmpty ? 1 : 0) +
                (state.isStreaming && state.streamingText.isEmpty ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == state.messages.length &&
                  state.isStreaming &&
                  state.streamingText.isNotEmpty) {
                return _buildMessageBubble(
                  Message(content: state.streamingText, isUser: false),
                  index: -1,
                  isStreaming: true,
                );
              }
              if (index == state.messages.length && state.isStreaming) {
                return _buildTypingIndicator();
              }
              return _buildMessageBubble(state.messages[index], index: index);
            },
          ),
        ),

        // Completion Card
        if (state.isCompleted)
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
        if (!state.isCompleted)
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
                if (state.suggestions.isNotEmpty && !state.isStreaming)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: state.suggestions.map((suggestion) {
                        final isTodaySentence = suggestion.isTodaySentence;
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
                              color: isTodaySentence
                                  ? AppColors.warningLight
                                  : AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isTodaySentence
                                    ? AppColors.warning.withValues(alpha: 0.5)
                                    : AppColors.primary.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // 오늘의 문장 배지
                                if (isTodaySentence) ...[
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    margin: const EdgeInsets.only(bottom: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.warning,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.star,
                                          size: 10,
                                          color: Colors.white,
                                        ),
                                        SizedBox(width: 2),
                                        Text(
                                          '오늘의 문장',
                                          style: TextStyle(
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                                Text(
                                  suggestion.text,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: isTodaySentence
                                        ? AppColors.warning
                                        : AppColors.primaryDark,
                                    fontWeight: isTodaySentence
                                        ? FontWeight.bold
                                        : FontWeight.normal,
                                  ),
                                ),
                                if (suggestion.textKr != null) ...[
                                  const SizedBox(height: 2),
                                  Text(
                                    suggestion.textKr!,
                                    style: const TextStyle(
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
                          enabled: !state.isStreaming,
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
                          color: _controller.text.trim().isEmpty || state.isStreaming
                              ? AppColors.gray200
                              : AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          onPressed: state.isStreaming ? null : _sendMessage,
                          icon: Icon(
                            state.isStreaming ? Icons.more_horiz : Icons.send,
                            color: _controller.text.trim().isEmpty || state.isStreaming
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
    // If index is -1, it's a streaming chunk, usually we don't expand translation for incomplete chunk yet
    // unless we have streaming translation.
    final state = ref.read(chatProvider);
    final isExpanded = _expandedMessages.contains(index);
    final hasTranslation = (message.contentKr != null || (isStreaming && state.streamingTranslation != null)) && !message.isUser;
    final translationText = isStreaming ? state.streamingTranslation : message.contentKr;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            message.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!message.isUser) ...[
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: AppColors.secondaryLight,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.secondary, width: 1.5),
              ),
              child: const Center(
                child: Icon(
                  Icons.auto_awesome,
                  color: AppColors.secondary,
                  size: 20,
                ),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: GestureDetector(
              onTap: hasTranslation && !isStreaming // Disable toggle during stream for simplicity
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
                      secondChild: (hasTranslation && translationText != null)
                          ? Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.gray50,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  translationText,
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
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: AppColors.secondaryLight,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.secondary, width: 1.5),
            ),
            child: const Center(
              child: Icon(
                Icons.auto_awesome,
                color: AppColors.secondary,
                size: 20,
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

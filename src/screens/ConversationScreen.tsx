import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAppStore } from '../store/useAppStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

type RootStackParamList = {
  Main: undefined;
  Feedback: { sessionId: number };
};

// Topics for conversation
const TOPICS = [
  { id: 'daily', label: '일상 대화', detail: '일상적인 인사와 대화', icon: 'chatbubbles-outline' },
  { id: 'travel', label: '여행', detail: '여행 중 필요한 표현', icon: 'airplane-outline' },
  { id: 'food', label: '음식 주문', detail: '레스토랑에서 주문하기', icon: 'restaurant-outline' },
  { id: 'shopping', label: '쇼핑', detail: '물건 사기와 가격 묻기', icon: 'cart-outline' },
  { id: 'anime', label: '애니메이션', detail: '애니메이션 관련 대화', icon: 'tv-outline' },
];

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  audioBase64?: string; // Base64 audio data for replay
  isPlaying?: boolean;
}

export default function ConversationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);

  // Store
  const accessToken = useAppStore((state) => state.accessToken);
  const currentSession = useAppStore((state) => state.currentSession);
  const createChatSession = useAppStore((state) => state.createChatSession);
  const endChatSession = useAppStore((state) => state.endChatSession);

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTopicSelection, setShowTopicSelection] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<typeof TOPICS[0] | null>(null);
  const [turnInfo, setTurnInfo] = useState({ current: 0, max: 8 });
  const [isCompleted, setIsCompleted] = useState(false);

  // Audio
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  // EventSource reference for cleanup
  const eventSourceRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Configure audio mode for playback
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Audio setup error:', error);
      }
    };

    setupAudio();

    return () => {
      // Cleanup on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.abort();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playAudioFromBase64 = async (base64Audio: string, messageId: string) => {
    try {
      // Stop any currently playing audio
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Store base64 for replay
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, audioBase64: base64Audio } : msg
        )
      );

      // Play directly from Base64 using data URI (no file save needed)
      const dataUri = `data:audio/wav;base64,${base64Audio}`;
      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPlayingMessageId(messageId);

      // Listen for playback status
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingMessageId(null);
        }
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      setPlayingMessageId(null);
    }
  };

  const handlePlayAudio = async (messageId: string, audioBase64?: string) => {
    if (!audioBase64) return;

    try {
      // If already playing this message, stop it
      if (playingMessageId === messageId && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlayingMessageId(null);
        return;
      }

      // Stop any currently playing audio
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Play from Base64 data URI
      const dataUri = `data:audio/wav;base64,${audioBase64}`;
      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPlayingMessageId(messageId);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingMessageId(null);
        }
      });
    } catch (error) {
      console.error('Audio replay error:', error);
      setPlayingMessageId(null);
    }
  };

  const handleSelectTopic = async (topic: typeof TOPICS[0]) => {
    setSelectedTopic(topic);
    setShowTopicSelection(false);
    setIsLoading(true);

    try {
      const session = await createChatSession(topic.id, topic.detail);
      if (session) {
        setTurnInfo({ current: session.current_turn, max: session.max_turn });

        // Start conversation with AI greeting using SSE
        await sendMessageWithSSE('', true);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      Alert.alert('오류', '세션을 시작할 수 없습니다.');
      setShowTopicSelection(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageWithSSE = async (userInput: string, isInitial: boolean = false) => {
    if (!accessToken || !currentSession) return;

    // Add user message if not initial
    if (!isInitial && userInput.trim()) {
      const userMessage: LocalMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userInput,
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    setIsLoading(true);

    // Create streaming assistant message placeholder
    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      },
    ]);

    try {
      // Create AbortController for cleanup
      const abortController = new AbortController();
      eventSourceRef.current = abortController;

      // Make SSE request
      const response = await fetch(
        `${API_URL}/api/chat/sessions/${currentSession.id}/message/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            message: userInput,
          }),
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              // Stream complete
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              );
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content') {
                // Text streaming
                fullContent += parsed.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              } else if (parsed.type === 'audio') {
                // Audio data received - play it
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
                await playAudioFromBase64(parsed.audio, assistantMessageId);
              } else if (parsed.type === 'done') {
                // Parse done content for turn info
                try {
                  const doneData = JSON.parse(parsed.content);
                  setTurnInfo({
                    current: doneData.current_turn,
                    max: doneData.max_turn,
                  });

                  if (doneData.is_completed) {
                    setIsCompleted(true);
                    // Navigate to feedback after a short delay
                    setTimeout(() => {
                      navigation.navigate('Feedback', { sessionId: currentSession.id });
                    }, 2000);
                  }
                } catch {
                  // If content is not JSON, just mark streaming as done
                }

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
              } else if (parsed.type === 'turn_info') {
                setTurnInfo({
                  current: parsed.current_turn,
                  max: parsed.max_turn,
                });
              } else if (parsed.type === 'session_end') {
                setIsCompleted(true);
                setTimeout(() => {
                  navigation.navigate('Feedback', { sessionId: currentSession.id });
                }, 1500);
              }
            } catch {
              // Non-JSON data, treat as content
              fullContent += data;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: fullContent }
                    : msg
                )
              );
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      console.error('SSE error:', error);

      // Fallback: show error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: '죄송합니다. 응답을 받아오는데 실패했습니다.', isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      eventSourceRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || isCompleted) return;

    const messageText = inputText.trim();
    setInputText('');

    await sendMessageWithSSE(messageText);
  };

  const handleEndSession = () => {
    Alert.alert(
      '대화 종료',
      '대화를 종료하시겠습니까? 피드백 화면으로 이동합니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '종료',
          style: 'destructive',
          onPress: async () => {
            // Stop any playing audio
            if (soundRef.current) {
              await soundRef.current.unloadAsync();
            }

            if (currentSession) {
              await endChatSession();
              navigation.navigate('Feedback', { sessionId: currentSession.id });
            } else {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  // Topic Selection Screen
  if (showTopicSelection) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>주제 선택</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.topicContainer} contentContainerStyle={styles.topicContent}>
          <Text style={styles.topicHeading}>어떤 주제로{'\n'}대화해볼까요?</Text>
          <Text style={styles.topicSubheading}>
            원하는 상황을 선택하면 AI와 실전 회화 연습을 시작합니다.{'\n'}
            AI가 일본어로 말하면 음성으로 들을 수 있어요!
          </Text>

          <View style={styles.topicList}>
            {TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicCard}
                onPress={() => handleSelectTopic(topic)}
              >
                <View style={styles.topicIconContainer}>
                  <Ionicons name={topic.icon as any} size={24} color="#2563EB" />
                </View>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicLabel}>{topic.label}</Text>
                  <Text style={styles.topicDetail}>{topic.detail}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEndSession} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{selectedTopic?.label || '실전 회화'}</Text>
          <Text style={styles.turnText}>
            {turnInfo.current}/{turnInfo.max} 턴
          </Text>
        </View>
        <TouchableOpacity onPress={handleEndSession} style={styles.endButton}>
          <Text style={styles.endButtonText}>종료</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text style={[styles.messageText, message.role === 'user' && styles.userMessageText]}>
                  {message.content}
                  {message.isStreaming && <Text style={styles.cursor}>|</Text>}
                </Text>

                {/* Audio play button for assistant messages */}
                {message.role === 'assistant' && message.audioBase64 && !message.isStreaming && (
                  <TouchableOpacity
                    style={[
                      styles.audioButton,
                      playingMessageId === message.id && styles.audioButtonPlaying,
                    ]}
                    onPress={() => handlePlayAudio(message.id, message.audioBase64)}
                  >
                    <Ionicons
                      name={playingMessageId === message.id ? 'pause' : 'volume-medium'}
                      size={18}
                      color={playingMessageId === message.id ? '#fff' : '#2563EB'}
                    />
                    <Text
                      style={[
                        styles.audioButtonText,
                        playingMessageId === message.id && styles.audioButtonTextPlaying,
                      ]}
                    >
                      {playingMessageId === message.id ? '재생 중...' : '다시 듣기'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {isLoading && messages.length === 0 && (
            <View style={[styles.messageWrapper, styles.assistantMessageWrapper]}>
              <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
                <View style={styles.loadingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            </View>
          )}

          {/* Completion message */}
          {isCompleted && (
            <View style={styles.completionMessage}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              <Text style={styles.completionText}>대화가 완료되었습니다!</Text>
              <Text style={styles.completionSubtext}>잠시 후 피드백 화면으로 이동합니다.</Text>
            </View>
          )}
        </ScrollView>

        {/* Turn Progress */}
        <View style={styles.turnProgressContainer}>
          <View style={styles.turnProgressBar}>
            <View
              style={[
                styles.turnProgressFill,
                { width: `${(turnInfo.current / turnInfo.max) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={isCompleted ? '대화가 완료되었습니다' : '일본어 또는 한국어로 대화해보세요...'}
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading && !isCompleted && turnInfo.current < turnInfo.max}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading || isCompleted) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading || isCompleted}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() && !isLoading && !isCompleted ? '#fff' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  turnText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  endButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  endButtonText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
  content: { flex: 1 },

  // Topic Selection
  topicContainer: { flex: 1 },
  topicContent: { padding: 24 },
  topicHeading: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8, lineHeight: 38 },
  topicSubheading: { fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 22 },
  topicList: { gap: 12 },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topicInfo: { flex: 1 },
  topicLabel: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  topicDetail: { fontSize: 14, color: '#6B7280' },

  // Messages
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 24 },
  messageWrapper: { marginBottom: 16 },
  userMessageWrapper: { alignItems: 'flex-end' },
  assistantMessageWrapper: { alignItems: 'flex-start' },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: { fontSize: 15, color: '#374151', lineHeight: 22 },
  userMessageText: { color: '#fff' },
  cursor: { color: '#2563EB', fontWeight: 'bold' },

  // Audio Button
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  audioButtonPlaying: {
    backgroundColor: '#2563EB',
  },
  audioButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  audioButtonTextPlaying: {
    color: '#fff',
  },

  // Loading
  loadingBubble: { paddingVertical: 20, paddingHorizontal: 24 },
  loadingDots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.8 },

  // Completion
  completionMessage: {
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
  },
  completionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 12,
  },
  completionSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  // Turn Progress
  turnProgressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  turnProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  turnProgressFill: {
    height: 4,
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },

  // Input
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: '#E5E7EB' },
});

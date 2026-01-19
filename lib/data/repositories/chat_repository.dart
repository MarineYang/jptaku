import '../services/api_service.dart';
import '../models/sentence_model.dart';

class ChatRepository {
  final ApiService _apiService;

  ChatRepository(this._apiService);

  Future<CreateSessionResponse?> createSession({required String topic}) async {
    return _apiService.createChatSession(topic: topic);
  }

  /// 특정 세션 조회
  Future<ChatSession?> getSession(int sessionId) async {
    return _apiService.getChatSession(sessionId);
  }

  Stream<SSEEvent> sendMessageStream({
    required int sessionId,
    required String message,
  }) {
    return _apiService.sendMessageStream(
      sessionId: sessionId,
      message: message,
    );
  }

  Future<bool> endSession(int sessionId) async {
    return _apiService.endChatSession(sessionId);
  }

  /// 오늘의 문장 일본어 텍스트 Set 가져오기
  Future<Set<String>> getTodaySentenceTexts() async {
    try {
      final response = await _apiService.getTodaySentences();
      if (response != null) {
        return response.sentences.map((s) => s.jp).toSet();
      }
      return {};
    } catch (e) {
      return {};
    }
  }
}

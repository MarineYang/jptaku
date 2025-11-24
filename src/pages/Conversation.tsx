import { useState, useRef, useEffect } from 'react';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { mockConversation, ChatTurn } from '@/mock/conversationMock';
import { todaySentences } from '@/mock/todaySentences';
import { Mic, MoreHorizontal, Star, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Updated Suggested Replies based on the current context of the conversation
// In a real app, this would be dynamic based on the last AI message
const getSuggestedReplies = (lastAiMessageId: string) => {
  const lastMsg = mockConversation.find(m => m.id === lastAiMessageId);
  if (!lastMsg || !lastMsg.suggestedTodaySentenceIds) return [];

  return lastMsg.suggestedTodaySentenceIds.map(id => {
    const sentence = todaySentences.find(s => s.id === id);
    return sentence ? {
      id: sentence.id as string,
      jp: sentence.japanese,
      kr: sentence.meaning,
      isTodaySentence: true
    } : null;
  }).filter(Boolean);
};

export default function Conversation() {
  // Initialize with the first few messages to simulate an ongoing chat or start fresh
  // For this demo, let's start with the first 2 messages
  const [messages, setMessages] = useState<ChatTurn[]>(mockConversation.slice(0, 2));
  const [inputText, setInputText] = useState('');
  
  // Calculate initial used count based on visible history
  const initialUsedCount = messages.filter(m => m.usedTodaySentenceId).length;
  const [usedCount, setUsedCount] = useState(initialUsedCount); 
  
  const totalCount = 5;
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get suggestions based on the last AI message
  const lastAiMessage = [...messages].reverse().find(m => m.speaker === 'ai');
  const suggestedReplies = lastAiMessage ? getSuggestedReplies(lastAiMessage.id) : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const progressPercentage = (usedCount / totalCount) * 100;

  const isTodaySentence = (text: string) => {
    return todaySentences.some(s => s.japanese === text);
  };

  const handleChipClick = (reply: { id: string, jp: string, kr: string }) => {
    // 1. Add Hint Bubble (System Message)
    const newHintMsg: ChatTurn = {
      id: `hint-${Date.now()}`,
      speaker: 'system',
      jp: reply.jp,
      kr: reply.kr,
    };
    setMessages(prev => [...prev, newHintMsg]);

    // 2. Fill Input
    setInputText(reply.jp);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const matchedSentence = todaySentences.find(s => s.japanese === inputText);
    const isToday = !!matchedSentence;
    
    const newUserMsg: ChatTurn = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      jp: inputText,
      usedTodaySentenceId: matchedSentence ? (matchedSentence.id as string) : undefined
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');

    if (isToday) {
      setUsedCount(prev => Math.min(prev + 1, totalCount));
      toast.success("오늘의 문장을 활용했어요! 🌟");
    }

    // Mock AI Response Logic
    // Find the next message in the mock conversation script
    const lastMsgIndex = mockConversation.findIndex(m => m.jp === newUserMsg.jp && m.speaker === 'user');
    
    if (lastMsgIndex !== -1 && lastMsgIndex + 1 < mockConversation.length) {
      setTimeout(() => {
        const nextAiMsg = mockConversation[lastMsgIndex + 1];
        if (nextAiMsg.speaker === 'ai') {
           setMessages(prev => [...prev, nextAiMsg]);
           
           // If there is another AI message immediately after (like t5, t6), add it too
           if (lastMsgIndex + 2 < mockConversation.length) {
             const nextNextAiMsg = mockConversation[lastMsgIndex + 2];
             if (nextNextAiMsg.speaker === 'ai') {
               setTimeout(() => {
                 setMessages(prev => [...prev, nextNextAiMsg]);
               }, 1000);
             }
           }
        }
      }, 1000);
    }
  };

  const toggleTranslation = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <MobileLayout className="pb-20 bg-gray-50">
      <Header
        title="실전 대화"
        rightAction={
          <Button variant="ghost" size="icon" className="text-gray-400">
            <MoreHorizontal />
          </Button>
        }
        className="bg-white border-b border-gray-100"
      />

      {/* Progress Section */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-[56px] z-10 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-gray-700">오늘의 문장 활용</span>
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {usedCount}/{totalCount} 사용
          </span>
        </div>
        <Progress value={progressPercentage} className="h-1.5 bg-gray-100" indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-500" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto" ref={scrollRef}>
        <div className="text-center">
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">오늘, 오전 10:00</span>
        </div>

        {messages.map((msg) => {
          // System / Hint Bubble
          if (msg.speaker === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 max-w-[85%] text-center space-y-1 shadow-sm">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 mb-1">
                    <Sparkles size={12} className="fill-gray-400 text-gray-400" />
                    이렇게 말해보는 건 어떤가요?
                  </div>
                  <p className="text-sm font-bold text-gray-800">{msg.jp}</p>
                  <p className="text-xs text-gray-500">{msg.kr}</p>
                </div>
              </div>
            );
          }

          const isToday = !!msg.usedTodaySentenceId;
          const isExpanded = expandedIds.has(msg.id);

          return (
            <div key={msg.id} className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.speaker === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>

                {msg.speaker === 'ai' && (
                  <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                    <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=Felix" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}

                <div className="relative group">
                  {/* Badge for Today's Sentence (User only) */}
                  {msg.speaker === 'user' && isToday && (
                    <div className="absolute -top-3 -right-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-yellow-200 shadow-sm flex items-center gap-0.5 z-10 animate-in zoom-in duration-300">
                      <Star size={8} className="fill-yellow-500 text-yellow-500" />
                      오늘 문장
                    </div>
                  )}

                  <div
                    onClick={() => msg.speaker === 'ai' && toggleTranslation(msg.id)}
                    className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative transition-all duration-200",
                      msg.speaker === 'user'
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none cursor-pointer hover:bg-gray-50 active:scale-[0.98]",
                      msg.speaker === 'user' && isToday && "border-2 border-yellow-300 shadow-yellow-100 ring-2 ring-yellow-100/50"
                    )}
                  >
                    {msg.jp}
                    
                    {/* Translation Toggle for AI */}
                    {msg.speaker === 'ai' && (
                      <div className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isExpanded ? "grid-rows-[1fr] opacity-100 mt-2 pt-2 border-t border-gray-100" : "grid-rows-[0fr] opacity-0"
                      )}>
                        <div className="overflow-hidden text-xs text-gray-500 font-medium">
                          {msg.kr}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-[64px] left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">

        {/* Suggested Replies */}
        {suggestedReplies.length > 0 && (
          <div className="pt-3 pb-2">
            <div className="px-4 flex items-center gap-1.5 mb-2">
              <Sparkles size={14} className="text-purple-500 fill-purple-100" />
              <span className="text-xs font-bold text-gray-500">이렇게 말해볼까요?</span>
            </div>

            <div className="flex overflow-x-auto px-4 gap-2 pb-2 scrollbar-hide">
              {suggestedReplies.map((reply) => (
                <button
                  key={reply!.id}
                  onClick={() => handleChipClick(reply!)}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-start text-left px-3 py-2 rounded-xl border transition-all active:scale-95 max-w-[200px]",
                    reply!.isTodaySentence
                      ? "bg-yellow-50 border-yellow-200 shadow-sm hover:bg-yellow-100"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-1 w-full mb-0.5">
                    {reply!.isTodaySentence && <Star size={10} className="fill-yellow-500 text-yellow-500 flex-shrink-0" />}
                    <span className={cn(
                      "text-sm font-bold truncate w-full",
                      reply!.isTodaySentence ? "text-gray-900" : "text-gray-700"
                    )}>
                      {reply!.jp}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 truncate w-full">
                    {reply!.kr}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Input */}
        <div className="p-4 pt-2 flex items-center gap-3">
          <div className="flex-1 bg-gray-100 h-12 rounded-full flex items-center px-5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="메시지를 입력하세요..."
              className="bg-transparent border-none outline-none text-sm w-full text-gray-800 placeholder:text-gray-400"
            />
          </div>
          <Button
            size="icon"
            onClick={handleSendMessage}
            className={cn(
              "h-12 w-12 rounded-full shadow-lg transition-all flex-shrink-0",
              inputText.trim()
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                : "bg-gray-300 hover:bg-gray-400 text-gray-500 shadow-none"
            )}
            disabled={!inputText.trim()}
          >
            {inputText.trim() ? <Send className="h-5 w-5 ml-0.5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <BottomNav />
    </MobileLayout>
  );
}
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { todaySentences } from '@/mock/todaySentences';
import { Play, ChevronLeft, CheckCircle2, Check, BookOpen, Lightbulb, Quote, Mic, Volume2, Turtle, HelpCircle, RefreshCw, XCircle, Pause, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type TabType = 'understand' | 'speak' | 'check';
type QuizStatus = 'idle' | 'correct' | 'incorrect';

export default function SentenceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('understand');
  
  // Speak Tab States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow'>('normal');

  // Check Tab States
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('idle');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [orderedPieces, setOrderedPieces] = useState<string[]>([]);
  
  // Handle both string and number IDs
  const sentence = todaySentences.find((s) => String(s.id) === id);
  const sentenceId = sentence?.id;
  
  const sentenceProgress = useAppStore((state) => state.sentenceProgress);
  const markSentenceAsMemorized = useAppStore((state) => state.markSentenceAsMemorized);
  const updateStepStatus = useAppStore((state) => state.updateStepStatus);

  const progress = (sentenceId && sentenceProgress[sentenceId]) || {
    status: 'not_started',
    steps: { understand: false, speak: false, check: false }
  };

  const isMemorized = progress.status === 'memorized';

  useEffect(() => {
    if (!sentence) {
      // If sentence not found, redirect to home
      // Using a timeout to prevent immediate redirect if data is loading (though mock data is instant)
      const timer = setTimeout(() => {
         navigate('/');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sentence, navigate]);

  // Reset quiz state when tab changes or sentence changes
  useEffect(() => {
    setQuizStatus('idle');
    setSelectedOption(null);
    setOrderedPieces([]);
  }, [activeTab, sentenceId]);

  // Auto-complete 'understand' step when tab is active
  useEffect(() => {
    if (activeTab === 'understand' && !progress.steps.understand && sentenceId) {
      const timer = setTimeout(() => {
        updateStepStatus(sentenceId, 'understand', true);
      }, 1000); // Mark as done after 1 second of viewing
      return () => clearTimeout(timer);
    }
  }, [activeTab, sentenceId, progress.steps.understand, updateStepStatus]);

  if (!sentence || !sentenceId) return null;

  const handleMemorize = () => {
    markSentenceAsMemorized(sentenceId);
    toast.success('이 문장을 외웠어요! 🎉');
    navigate('/');
  };

  const handlePlayAudio = (speed: 'normal' | 'slow' = 'normal') => {
    if (isPlaying && playbackSpeed === speed) {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      return;
    }

    window.speechSynthesis.cancel();
    setPlaybackSpeed(speed);
    setIsPlaying(true);
    
    const utterance = new SpeechSynthesisUtterance(sentence.japanese);
    utterance.lang = 'ja-JP';
    utterance.rate = speed === 'slow' ? 0.7 : 1.0;
    
    utterance.onend = () => {
      setIsPlaying(false);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleRecording = () => {
    if (isRecording) return;
    
    setIsRecording(true);
    setRecordingComplete(false);
    
    // Simulate recording duration
    setTimeout(() => {
      setIsRecording(false);
      setRecordingComplete(true);
      updateStepStatus(sentenceId, 'speak', true);
      toast.success('녹음 완료! 정확도: 98% 🎉');
    }, 2500);
  };

  const handleChatPractice = () => {
    navigate('/chat');
  };

  // Quiz Handlers
  const handleQuizOptionClick = (option: string) => {
    if (quizStatus === 'correct') return;

    setSelectedOption(option);
    
    if (option === sentence.quiz.answer) {
      setQuizStatus('correct');
      updateStepStatus(sentenceId, 'check', true);
      toast.success('정답입니다! 🎉');
    } else {
      setQuizStatus('incorrect');
      toast.error('다시 시도해보세요!');
      setTimeout(() => setQuizStatus('idle'), 1000);
    }
  };

  const handleOrderPieceClick = (piece: string) => {
    if (quizStatus === 'correct') return;
    
    if (orderedPieces.includes(piece)) {
      setOrderedPieces(orderedPieces.filter(p => p !== piece));
    } else {
      setOrderedPieces([...orderedPieces, piece]);
    }
  };

  const checkOrderAnswer = () => {
    const currentAnswer = orderedPieces.join(' ');
    if (currentAnswer === sentence.quiz.answer) {
      setQuizStatus('correct');
      updateStepStatus(sentenceId, 'check', true);
      toast.success('정답입니다! 🎉');
    } else {
      setQuizStatus('incorrect');
      toast.error('순서가 올바르지 않아요.');
      setTimeout(() => setQuizStatus('idle'), 1000);
    }
  };

  const resetOrderQuiz = () => {
    setOrderedPieces([]);
    setQuizStatus('idle');
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'understand', label: '이해하기' },
    { id: 'speak', label: '말하기' },
    { id: 'check', label: '확인하기' },
  ];

  const stepsList: TabType[] = ['understand', 'speak', 'check'];

  return (
    <MobileLayout className="pb-24 bg-gray-50">
      <Header 
        title="학습하기"
        leftAction={
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ChevronLeft size={24} />
          </Button>
        }
        className="bg-white border-b border-gray-100"
      />

      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        {/* Main Sentence Card - Unified Header Layout */}
        <div className="bg-white p-6 pb-8 shadow-sm z-10">
          <div className="flex flex-col items-center text-center space-y-2">
            
            {/* Step Indicator (Dots) */}
            <div className="flex gap-1.5 mb-2">
              {stepsList.map((step) => (
                <div 
                  key={step} 
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    progress.steps[step] ? "bg-blue-500" : "bg-gray-200"
                  )} 
                />
              ))}
            </div>

            {/* 1. Progress Text */}
            <p className="text-xs text-gray-400 font-medium">오늘의 문장 {sentence.id}/5</p>
            
            {/* 2. Romaji */}
            <p className="text-xs text-gray-400 font-medium">{sentence.romaji}</p>
            
            {/* 3. Japanese Sentence */}
            <h1 className="text-2xl font-bold text-gray-900 leading-relaxed mt-1">
              {sentence.japanese}
            </h1>
            
            {/* 4. Meaning */}
            <p className="text-lg text-gray-600">{sentence.meaning}</p>
            
            {/* 5. Action Row: Play + Badge */}
            <div className="flex items-center gap-3 mt-3">
              <Button 
                variant={isPlaying ? "default" : "outline"}
                size="icon" 
                className={cn(
                  "rounded-full w-12 h-12 transition-all",
                  isPlaying 
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md scale-110" 
                    : "border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                )}
                onClick={() => handlePlayAudio('normal')}
              >
                {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="ml-1 fill-current" />}
              </Button>

              {isMemorized ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 h-8">
                  <CheckCircle2 size={12} className="mr-1" /> 외운 문장
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 h-8">
                  학습 중
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 bg-white sticky top-[56px] z-20">
          {tabs.map((tab) => {
            const isCompleted = progress.steps[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 py-4 text-sm font-bold relative transition-colors",
                  activeTab === tab.id ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <span className="flex items-center justify-center gap-1.5">
                  {tab.label}
                  {isCompleted && <CheckCircle2 size={14} className="text-blue-500" />}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full mx-4" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 space-y-8">
          {activeTab === 'understand' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Word List Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <BookOpen size={20} className="text-blue-500" />
                  <h2>단어 풀이</h2>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 divide-y divide-gray-100">
                  {sentence.words.map((word, index) => (
                    <div key={index} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{word.term}</p>
                        {word.reading && <p className="text-xs text-gray-400">{word.reading}</p>}
                      </div>
                      <p className="text-gray-600 font-medium">{word.meaning}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Grammar Point Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Lightbulb size={20} className="text-yellow-500" />
                  <h2>핵심 문법</h2>
                </div>
                <div className="bg-yellow-50/50 rounded-2xl p-5 border border-yellow-100 shadow-sm">
                  <div className="bg-white/80 rounded-lg px-3 py-1 inline-block mb-3 border border-yellow-200">
                    <p className="font-bold text-yellow-700">{sentence.grammar.pattern}</p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {sentence.grammar.description}
                  </p>
                </div>
              </section>

              {/* Example Sentences Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Quote size={20} className="text-purple-500" />
                  <h2>예문으로 익히기</h2>
                </div>
                <div className="space-y-3">
                  {sentence.examples.map((ex, index) => (
                    <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <p className="font-bold text-gray-900 mb-1">{ex.japanese}</p>
                      <p className="text-gray-500 text-sm">{ex.meaning}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="h-8" /> {/* Bottom Spacer */}
            </div>
          )}

          {activeTab === 'speak' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Listen Section */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 text-center">먼저 들어보세요</h2>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-center gap-4">
                  <Button 
                    variant={playbackSpeed === 'normal' ? "default" : "outline"}
                    className={cn(
                      "h-14 px-6 rounded-xl border-2 transition-all",
                      playbackSpeed === 'normal' 
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md" 
                        : "border-blue-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    )}
                    onClick={() => handlePlayAudio('normal')}
                  >
                    {playbackSpeed === 'normal' && isPlaying ? <Pause className="mr-2" size={20} /> : <Volume2 className="mr-2" size={20} />}
                    보통 속도
                  </Button>
                  <Button 
                    variant={playbackSpeed === 'slow' ? "default" : "outline"}
                    className={cn(
                      "h-14 px-6 rounded-xl border-2 transition-all",
                      playbackSpeed === 'slow'
                        ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600 shadow-md"
                        : "border-orange-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                    )}
                    onClick={() => handlePlayAudio('slow')}
                  >
                    {playbackSpeed === 'slow' && isPlaying ? <Pause className="mr-2" size={20} /> : <Turtle className="mr-2" size={20} />}
                    느린 속도
                  </Button>
                </div>
                {isPlaying && (
                  <p className="text-center text-sm text-blue-500 font-bold animate-pulse">
                    재생 중입니다... 🔊
                  </p>
                )}
              </section>

              {/* Speaking Section */}
              <section className="space-y-6">
                 <h2 className="text-lg font-bold text-gray-900 text-center">따라 말해보세요</h2>
                 
                 <div className="flex flex-col items-center space-y-6">
                    <button
                      onClick={handleRecording}
                      disabled={isRecording}
                      className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                        isRecording 
                          ? "bg-red-500 shadow-red-200 scale-110 animate-pulse" 
                          : "bg-blue-500 hover:bg-blue-600 shadow-blue-200 hover:scale-105"
                      )}
                    >
                      <Mic size={40} className="text-white" />
                    </button>
                    
                    <div className="text-center min-h-[3rem]">
                      {isRecording ? (
                        <p className="text-red-500 font-bold animate-pulse">듣고 있어요... 🎧</p>
                      ) : recordingComplete ? (
                        <div className="animate-in zoom-in duration-300">
                          <p className="text-green-600 font-bold text-lg mb-1">정확도: 98% Excellent! 🎉</p>
                          <p className="text-gray-400 text-sm">다시 하려면 버튼을 누르세요</p>
                        </div>
                      ) : (
                        <p className="text-gray-400">마이크 버튼을 누르고 말해보세요</p>
                      )}
                    </div>

                    {recordingComplete && (
                      <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 text-center animate-in slide-in-from-bottom-2">
                         <p className="text-sm text-gray-500 mb-1">내가 말한 문장</p>
                         <p className="text-lg font-bold text-gray-800">{sentence.japanese}</p>
                      </div>
                    )}
                 </div>
              </section>
            </div>
          )}

          {activeTab === 'check' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-2">
                <HelpCircle size={20} className="text-blue-500" />
                <h2>퀴즈를 풀어보세요</h2>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">문제</p>
                  <p className="text-lg font-bold text-gray-900 leading-relaxed">
                    {sentence.quiz.question}
                  </p>
                </div>

                {/* Quiz Interface based on Type */}
                {(sentence.quiz.type === 'meaning' || sentence.quiz.type === 'blank') && (
                  <div className="space-y-3">
                    {sentence.quiz.options.map((option, index) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = quizStatus === 'correct' && option === sentence.quiz.answer;
                      const isIncorrect = quizStatus === 'incorrect' && isSelected;

                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className={cn(
                            "w-full h-auto py-4 px-4 justify-start text-left text-base whitespace-normal font-normal border-2 hover:bg-gray-50",
                            isSelected && "border-blue-500 bg-blue-50 text-blue-700",
                            isCorrect && "border-green-500 bg-green-50 text-green-700 hover:bg-green-50",
                            isIncorrect && "border-red-500 bg-red-50 text-red-700 hover:bg-red-50 animate-shake"
                          )}
                          onClick={() => handleQuizOptionClick(option)}
                          disabled={quizStatus === 'correct'}
                        >
                          <span className="mr-3 font-bold text-gray-400 w-5 shrink-0">{index + 1}.</span>
                          {option}
                          {isCorrect && <CheckCircle2 className="ml-auto text-green-600 shrink-0" size={20} />}
                          {isIncorrect && <XCircle className="ml-auto text-red-500 shrink-0" size={20} />}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {sentence.quiz.type === 'order' && (
                  <div className="space-y-6">
                    {/* Answer Slot Area */}
                    <div className="min-h-[60px] p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-wrap gap-2">
                      {orderedPieces.length === 0 ? (
                        <span className="text-gray-400 text-sm self-center w-full text-center">아래 단어를 순서대로 선택하세요</span>
                      ) : (
                        orderedPieces.map((piece, idx) => (
                          <Button 
                            key={idx} 
                            size="sm" 
                            variant="secondary"
                            className="h-8 bg-white border border-gray-200 shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                            onClick={() => handleOrderPieceClick(piece)}
                          >
                            {piece}
                          </Button>
                        ))
                      )}
                    </div>

                    {/* Word Pieces Area */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {sentence.quiz.options.map((option, idx) => {
                        const isSelected = orderedPieces.includes(option);
                        return (
                          <Button
                            key={idx}
                            variant="outline"
                            className={cn(
                              "transition-all",
                              isSelected ? "opacity-0 pointer-events-none" : "opacity-100"
                            )}
                            onClick={() => handleOrderPieceClick(option)}
                          >
                            {option}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button 
                        variant="ghost" 
                        className="flex-1 text-gray-500"
                        onClick={resetOrderQuiz}
                      >
                        <RefreshCw size={16} className="mr-2" /> 초기화
                      </Button>
                      <Button 
                        className={cn(
                          "flex-[2] font-bold",
                          quizStatus === 'correct' ? "bg-green-500 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"
                        )}
                        onClick={checkOrderAnswer}
                        disabled={orderedPieces.length === 0 || quizStatus === 'correct'}
                      >
                        {quizStatus === 'correct' ? "정답입니다! 🎉" : "정답 확인하기"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Chat Practice CTA */}
          <div className="mt-8 mb-4">
            <Button 
              variant="outline" 
              className="w-full h-14 border-2 border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 rounded-2xl font-bold"
              onClick={handleChatPractice}
            >
              <MessageCircle className="mr-2" size={20} />
              이 문장으로 대화 연습하기
            </Button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-area-bottom z-30 max-w-md mx-auto">
          <Button 
            className={cn(
              "w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-all",
              isMemorized 
                ? "bg-green-500 hover:bg-green-600 text-white shadow-green-200" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
            )}
            onClick={handleMemorize}
            disabled={isMemorized}
          >
            {isMemorized ? (
              <>
                <Check size={20} className="mr-2" />
                이미 외운 문장입니다
              </>
            ) : (
              "이 문장 외웠어요"
            )}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
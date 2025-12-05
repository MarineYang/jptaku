import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { userMock } from '@/mock/userMock';
import { useAppStore, DailySentence } from '@/store/useAppStore';
import { Play, ChevronRight, Flame, Circle, CheckCircle2, Disc, Pause, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

// Skeleton component for loading state
const SentenceSkeleton = () => (
  <div className="space-y-3 mt-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i} className="border-transparent bg-white shadow-sm">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2"></div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-100 rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const sentenceProgress = useAppStore((state) => state.sentenceProgress);
  const accessToken = useAppStore((state) => state.accessToken);
  const todaySentences = useAppStore((state) => state.todaySentences);
  const setTodaySentences = useAppStore((state) => state.setTodaySentences);
  const [playingId, setPlayingId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [historySentences, setHistorySentences] = useState<DailySentence[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Fetch today's sentences from API
  useEffect(() => {
    const fetchTodaySentences = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      // 이미 데이터가 있으면 로딩 표시 안함 (캐시된 데이터 활용)
      if (todaySentences.length > 0) {
        setIsLoading(false);
      }

      try {
        const response = await fetch('http://localhost:30001/api/sentences/today', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          // API 응답: { success: true, data: { sentences: [...] } }
          const sentencesData = responseData.data?.sentences || responseData.sentences || responseData || [];
          const sentences: DailySentence[] = sentencesData.map((s: Record<string, unknown>) => ({
            id: s.id,
            japanese: (s.jp || s.japanese || '') as string,
            reading: (s.reading || s.furigana || '') as string,
            meaning: (s.kr || s.meaning || '') as string,
            romaji: (s.romaji || '') as string,
            tags: (s.tags || []) as string[],
            categories: (s.categories || []) as number[],
            memorized: (s.memorized || false) as boolean,
            words: (s.words || []) as DailySentence['words'],
            grammar: (s.grammar || []) as string[],
            examples: (s.examples || []) as string[],
            quiz: (s.quiz || {}) as DailySentence['quiz'],
          }));
          setTodaySentences(sentences);
        }
      } catch (err) {
        console.error('Failed to fetch today sentences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaySentences();
  }, [accessToken, setTodaySentences]);

  // Fetch history sentences from API
  useEffect(() => {
    const fetchHistorySentences = async () => {
      if (!accessToken) {
        setIsHistoryLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:30001/api/sentences/history?page=1&per_page=5', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          // API 응답: { success: true, data: { history: { date, sentences: [...] } } }
          const sentencesData = responseData.data?.history?.sentences || responseData.data?.sentences || responseData.sentences || [];
          const sentences: DailySentence[] = sentencesData.map((s: Record<string, unknown>) => ({
            id: s.id,
            japanese: (s.jp || s.japanese || '') as string,
            reading: (s.reading || s.furigana || '') as string,
            meaning: (s.kr || s.meaning || '') as string,
            romaji: (s.romaji || '') as string,
            tags: (s.tags || []) as string[],
            categories: (s.categories || []) as number[],
            memorized: (s.memorized || false) as boolean,
            words: (s.words || []) as DailySentence['words'],
            grammar: (s.grammar || []) as string[],
            examples: (s.examples || []) as string[],
            quiz: (s.quiz || {}) as DailySentence['quiz'],
          }));
          setHistorySentences(sentences);
        }
      } catch (err) {
        console.error('Failed to fetch history sentences:', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchHistorySentences();
  }, [accessToken]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Calculate progress for "Today's 5 Sentences" - API memorized 필드 사용
  const memorizedCount = todaySentences.filter((s) => s.memorized).length;
  const progressPercentage = todaySentences.length > 0
    ? (memorizedCount / todaySentences.length) * 100
    : 0;

  const handlePlay = (e: React.MouseEvent, item: DailySentence) => {
    e.stopPropagation();

    // If currently playing this item, stop it
    if (playingId === item.id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }

    // Stop any existing audio
    window.speechSynthesis.cancel();

    // Start new audio
    setPlayingId(item.id);
    const utterance = new SpeechSynthesisUtterance(item.japanese);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9; // Slightly slower for better clarity
    
    utterance.onend = () => {
      setPlayingId(null);
    };

    utterance.onerror = () => {
      setPlayingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const getStatusIcon = (item: DailySentence) => {
    // API의 memorized 필드 사용
    if (item.memorized) {
      return <CheckCircle2 size={24} className="text-blue-500 fill-blue-100" />;
    }
    // 로컬 진행 상태 확인 (학습 중)
    const localStatus = sentenceProgress[item.id]?.status;
    if (localStatus === 'in_progress') {
      return <Disc size={24} className="text-blue-500" />;
    }
    return <Circle size={24} className="text-gray-300" />;
  };

  const getCardStyle = (item: DailySentence) => {
    if (item.memorized) {
      return "border-blue-100 bg-blue-50/50 shadow-sm";
    }
    return "border-transparent bg-white shadow-sm hover:shadow-md";
  };

  const renderSentenceList = (sentences: DailySentence[]) => (
    <div className="space-y-3 mt-4">
      {sentences.map((item) => {
        const isPlaying = playingId === item.id;

        return (
          <Card
            key={item.id}
            className={`transition-all duration-200 cursor-pointer ${getCardStyle(item)}`}
            onClick={() => navigate(`/sentence/${item.id}`)}
          >
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex-1 space-y-1 min-w-0">
                <p className="font-bold text-gray-900 text-lg truncate">{item.japanese}</p>
                <p className="text-sm text-gray-500 truncate">{item.meaning}</p>
                
                {/* Tags Rendering */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0 self-start mt-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={`h-8 w-8 rounded-full transition-colors ${
                    isPlaying 
                      ? "text-blue-600 bg-blue-100 hover:bg-blue-200" 
                      : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                  }`}
                  onClick={(e) => handlePlay(e, item)}
                >
                  {isPlaying ? (
                    <Pause size={16} className="fill-current" />
                  ) : (
                    <Play size={16} className="ml-0.5 fill-current" />
                  )}
                </Button>
                
                {getStatusIcon(item)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <MobileLayout className="pb-20 bg-gray-50">
      <Header 
        title="오늘의 학습" 
        rightAction={
          <div className="flex items-center text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full text-sm">
            <Flame size={16} className="mr-1 fill-orange-500" />
            {userMock.streak}일
          </div>
        } 
        className="bg-white"
      />
      
      <div className="px-6 py-6 space-y-8">
        {/* Main CTA */}
        <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-6 text-white shadow-lg shadow-blue-200">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">실전 회화 시작하기</h2>
            <p className="text-blue-100 mb-6">하루 10분으로 일본어 마스터하기</p>
            <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold h-12 rounded-xl" onClick={() => navigate('/chat')}>
              <Play size={18} className="mr-2 fill-blue-600" />
              지금 시작하기
            </Button>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full opacity-50 blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-400 rounded-full opacity-50 blur-2xl"></div>
        </div>

        {/* Total Learned Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Trophy size={20} className="text-yellow-600" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium">학습한 총 문장</p>
                    <p className="text-lg font-bold text-gray-900">
                        500 <span className="text-gray-400 text-sm font-normal">/ 6000</span>
                    </p>
                </div>
            </div>
            <div className="w-24">
                <Progress value={(500/6000)*100} className="h-2 bg-gray-100" indicatorClassName="bg-yellow-500" />
            </div>
        </div>

        {/* Today's 5 Sentences Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">오늘의 5문장</h3>
              <p className="text-sm text-gray-500">
                <span className="text-blue-600 font-bold">{memorizedCount}</span>/5 문장 외움
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 h-auto p-0 font-normal">
              전체 보기 <ChevronRight size={16} />
            </Button>
          </div>

          {/* Progress Bar */}
          <Progress value={progressPercentage} className="h-2 bg-gray-200" indicatorClassName="bg-blue-500" />

          {/* Sentence List */}
          {isLoading && todaySentences.length === 0 ? (
            <SentenceSkeleton />
          ) : todaySentences.length === 0 ? (
            <div className="mt-4 text-center py-8 text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm">오늘의 문장을 준비하고 있어요...</p>
            </div>
          ) : (
            renderSentenceList(todaySentences)
          )}
        </div>

        {/* Yesterday's Sentences Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">지난 학습 문장</h3>
              <p className="text-sm text-gray-500">
                복습이 중요해요!
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 h-auto p-0 font-normal">
              전체 보기 <ChevronRight size={16} />
            </Button>
          </div>

          {/* Sentence List */}
          {isHistoryLoading ? (
            <SentenceSkeleton />
          ) : historySentences.length === 0 ? (
            <div className="mt-4 text-center py-8 text-gray-400">
              <p className="text-sm">지난 학습 문장이 없습니다.</p>
            </div>
          ) : (
            renderSentenceList(historySentences)
          )}
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  );
}
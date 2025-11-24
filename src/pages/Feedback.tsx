import { MobileLayout } from '@/components/MobileLayout';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  feedbackScore, 
  feedbackSummaries, 
  todaySentenceUsage, 
  highlightCards, 
  otakuCategoryStats,
  SentenceUsage,
  HighlightCard
} from '@/mock/feedbackMock';
import { 
  CheckCircle2, 
  AlertCircle, 
  PlayCircle, 
  ChevronRight, 
  Sparkles, 
  Mic, 
  MessageSquare,
  XCircle,
  RotateCcw,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Feedback() {
  const navigate = useNavigate();
  
  const handlePlayAudio = (id: string) => {
    toast.info("오디오를 재생합니다 (Mock)", {
      description: `ID: ${id} - 오디오 재생 기능은 준비 중입니다.`
    });
  };

  const handleNavigateToPractice = (id: string) => {
    navigate(`/sentence/${id}`);
  };

  const getStatusBadge = (status: SentenceUsage['status']) => {
    switch (status) {
      case 'used_in_conversation':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1"><CheckCircle2 size={12} /> 대화 사용</Badge>;
      case 'practice_only':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 gap-1"><RotateCcw size={12} /> 연습만 함</Badge>;
      case 'not_used':
        return <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200 gap-1"><XCircle size={12} /> 미사용</Badge>;
    }
  };

  const getHighlightIcon = (type: HighlightCard['type']) => {
    switch (type) {
      case 'best_sentence':
        return <Sparkles className="text-yellow-500" size={20} />;
      case 'need_practice':
        return <Mic className="text-red-500" size={20} />;
      case 'fun_moment':
        return <MessageSquare className="text-blue-500" size={20} />;
    }
  };

  const getHighlightColor = (type: HighlightCard['type']) => {
    switch (type) {
      case 'best_sentence': return "bg-yellow-50 border-yellow-100";
      case 'need_practice': return "bg-red-50 border-red-100";
      case 'fun_moment': return "bg-blue-50 border-blue-100";
    }
  };

  return (
    <MobileLayout className="pb-20 bg-gray-50">
      <Header title="오늘의 피드백" className="bg-white border-b border-gray-100" />
      
      <div className="p-4 space-y-8">
        
        {/* 1. 기존 상단 점수 카드 (유지) */}
        <section className="space-y-4">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-2 text-center bg-gradient-to-b from-blue-50 to-white pt-6">
              <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[6px] border-blue-100" />
                <div className="absolute inset-0 rounded-full border-[6px] border-blue-500 border-t-transparent rotate-[-45deg]" />
                <div className="text-center">
                  <span className="text-4xl font-bold text-blue-600">{feedbackScore.total}</span>
                  <span className="text-sm text-gray-400 block">점</span>
                </div>
              </div>
              <CardTitle className="text-xl text-gray-800">훌륭해요!</CardTitle>
              <p className="text-sm text-gray-500">이대로 계속해보세요.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 pt-4 pb-6">
              {[
                { label: "문법", score: feedbackScore.grammar },
                { label: "발음", score: feedbackScore.pronunciation },
                { label: "자연스러움", score: feedbackScore.fluency }
              ].map((item) => (
                <div key={item.label} className="text-center p-2 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className="font-bold text-gray-700">{item.score}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-2">
            {feedbackSummaries.map((summary) => (
              <div key={summary.id} className="flex items-start gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                {summary.type === 'positive' ? (
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
                ) : (
                  <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                )}
                <p className="text-sm text-gray-700 leading-snug">{summary.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. [NEW] 오늘의 5문장 사용 결과 */}
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-lg text-gray-800">오늘의 5문장 사용 결과</h3>
          </div>
          
          <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-2 mb-2">
            <Sparkles size={14} className="fill-blue-200" />
            오늘의 5문장 중 3개를 실제 대화에서 사용했어요! 🎉
          </div>

          <div className="space-y-2">
            {todaySentenceUsage.map((sentence) => (
              <div 
                key={sentence.id}
                onClick={() => handleNavigateToPractice(sentence.id)}
                className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(sentence.status)}
                  </div>
                  <p className="text-sm font-bold text-gray-800 truncate">{sentence.jp}</p>
                  <p className="text-xs text-gray-500 truncate">{sentence.kr}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            ))}
          </div>
        </section>

        {/* 3. [NEW] 오늘 대화 하이라이트 */}
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <h3 className="font-bold text-lg text-gray-800 px-1">오늘 대화 하이라이트</h3>
          
          <div className="space-y-3">
            {highlightCards.map((card) => (
              <div key={card.id} className={cn("p-4 rounded-xl border shadow-sm relative", getHighlightColor(card.type))}>
                <div className="flex items-center gap-2 mb-2">
                  {getHighlightIcon(card.type)}
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{card.title}</span>
                </div>
                
                <div className="mb-3 pl-7">
                  <p className="text-base font-bold text-gray-800 mb-0.5">{card.jp}</p>
                  <p className="text-xs text-gray-500">{card.kr}</p>
                </div>

                <div className="bg-white/60 p-2 rounded-lg text-xs text-gray-700 font-medium pl-7 relative">
                  <div className="absolute left-2 top-2.5 w-1 h-1 rounded-full bg-gray-400" />
                  {card.comment}
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); handlePlayAudio(card.id); }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <PlayCircle size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 4. [NEW] 오타쿠 카테고리 진행도 */}
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <h3 className="font-bold text-lg text-gray-800 px-1">오늘은 어떤 오타쿠 영역을 키웠나요?</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {otakuCategoryStats.map((stat) => (
              <div key={stat.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{stat.icon}</span>
                    <span className="text-xs font-bold text-gray-700">{stat.label}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{stat.percent}%</span>
                </div>
                <Progress value={stat.percent} className="h-1.5 bg-gray-100" indicatorClassName="bg-blue-500" />
              </div>
            ))}
          </div>
        </section>

        {/* 5. [NEW] 내일을 위한 한 줄 가이드 + CTA */}
        <section className="space-y-4 pt-2 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <div className="bg-gray-800 text-white p-5 rounded-2xl shadow-lg">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              내일은 이렇게 연습해보세요
            </h3>
            <ul className="space-y-3">
              {[
                "오늘 말하지 못한 문장 1개 골라서 외워보기",
                "성지순례 표현으로 AI와 3분 대화하기",
                "‘は/が’ 구분 문장 3개 더 말해보기"
              ].map((guide, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-200">
                  <Square className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                  {guide}
                </li>
              ))}
            </ul>
          </div>

          <Button 
            className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg rounded-xl"
            onClick={() => navigate('/')}
          >
            오늘의 5문장 다시 보러가기
          </Button>
        </section>

      </div>

      <BottomNav />
    </MobileLayout>
  );
}
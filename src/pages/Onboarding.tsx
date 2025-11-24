import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { 
  ChevronLeft, 
  Check, 
  Tv, 
  Gamepad2, 
  Music, 
  ShoppingBag, 
  MessageCircle,
  ArrowRight
} from 'lucide-react';

// --- Data Definitions ---

const CATEGORIES = [
  { id: 'anime', label: '애니/만화', icon: Tv },
  { id: 'game', label: '게임', icon: Gamepad2 },
  { id: 'music', label: '음악/Jpop/버튜버', icon: Music },
  { id: 'lifestyle', label: '오타쿠 라이프스타일', icon: ShoppingBag },
  { id: 'situation', label: '실전 오타쿠 상황', icon: MessageCircle },
];

const SUB_CATEGORIES: Record<string, string[]> = {
  anime: [
    '이세계/판타지', '러브코미디', '일상물', '배틀/액션', 
    '스포츠물', 'SF/로봇', '음악/아이돌물', '미스터리/추리'
  ],
  game: [
    'JRPG', '모바일 가챠게임', '리듬게임', 'FPS', 
    '닌텐도 게임', '격투 게임'
  ],
  music: [
    'Jpop', 'Vocaloid', '애니송', '아이돌', 
    '버튜버(hololive, NIJISANJI 등)'
  ],
  lifestyle: [
    '성지순례', '굿즈 구매', '피규어/프라모델', 
    '코미케/행사 참가', '애니카페 방문', '게임센터 방문'
  ],
  situation: [
    '굿즈 예약하기', '행사에서 인사하기', '친구와 애니 얘기하기', 
    '일본 사이트 주문하기', '일본 여행 오타쿠 코스', '콘서트/라이브 관람'
  ]
};

const LEVELS = [
  { id: 'lv0', label: 'Lv 0 - 완전 초입문', desc: '히라가나/가타카나도 모름' },
  { id: 'lv1', label: 'Lv 1 - 기본 인사 가능', desc: 'N5 수준' },
  { id: 'lv2', label: 'Lv 2 - 일상 회화 조금 가능', desc: 'N4 수준' },
  { id: 'lv3', label: 'Lv 3 - 생각 표현 가능', desc: 'N3 수준' },
  { id: 'lv4', label: 'Lv 4 - 능숙', desc: 'N2 수준' },
  { id: 'lv5', label: 'Lv 5 - 거의 원어민 수준', desc: 'N1 수준' },
];

const PURPOSES = [
  '자막 없이 애니·만화 즐기려고',
  '일본 친구와 대화하고 싶어서',
  '일본 여행에서 말하고 싶어서',
  '버튜버 방송/콘텐츠 이해하고 싶어서',
  '좋아하는 게임의 일본 서버/콘텐츠 즐기려고',
  '굿즈 구매·이벤트 참가 때문에',
  '기타'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  
  const [step, setStep] = useState(1); // 1, 1.5 (sub-cat), 2, 3, 4
  
  // Selections
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);

  const handleNext = () => {
    if (step === 1 && selectedCategory) setStep(1.5);
    else if (step === 1.5 && selectedSubCategories.length > 0) setStep(2);
    else if (step === 2 && selectedLevel) setStep(3);
    else if (step === 3 && selectedPurposes.length > 0) setStep(4);
  };

  const handleBack = () => {
    if (step === 1.5) setStep(1);
    else if (step === 2) setStep(1.5);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
  };

  const handleFinish = () => {
    if (selectedCategory && selectedLevel) {
      completeOnboarding({
        interestCategory: selectedCategory,
        interestSubCategories: selectedSubCategories,
        level: selectedLevel,
        purposes: selectedPurposes
      });
      navigate('/');
    }
  };

  const toggleSubCategory = (sub: string) => {
    setSelectedSubCategories(prev => 
      prev.includes(sub) ? prev.filter(i => i !== sub) : [...prev, sub]
    );
  };

  const togglePurpose = (p: string) => {
    setSelectedPurposes(prev => 
      prev.includes(p) ? prev.filter(i => i !== p) : [...prev, p]
    );
  };

  // --- Step Components ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          어떤 관심사로<br />일본어를 배우고 싶나요?
        </h1>
        <p className="text-gray-500 text-sm">당신의 취향에 맞는 문장을 추천해 드릴게요.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`p-4 rounded-xl flex items-center gap-4 transition-all duration-200 border-2 text-left ${
              selectedCategory === cat.id
                ? 'bg-blue-50 border-blue-600 shadow-sm'
                : 'bg-white border-gray-100 hover:bg-gray-50'
            }`}
          >
            <div className={`p-2.5 rounded-full ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              <cat.icon size={20} />
            </div>
            <span className={`font-bold text-base ${selectedCategory === cat.id ? 'text-blue-700' : 'text-gray-900'}`}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep1_5 = () => {
    const currentCategoryLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label;
    const subList = selectedCategory ? SUB_CATEGORIES[selectedCategory] : [];

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-blue-600">{currentCategoryLabel}</span> 중<br />
            어떤 장르를 좋아하시나요?
          </h1>
          <p className="text-gray-500 text-sm">여러 개 선택할 수 있어요.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {subList.map((sub) => (
            <button
              key={sub}
              onClick={() => toggleSubCategory(sub)}
              className={`p-3 rounded-xl text-sm font-bold transition-all duration-200 border-2 h-20 flex items-center justify-center text-center break-keep ${
                selectedSubCategories.includes(sub)
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          현재 일본어 실력이<br />어느 정도인가요?
        </h1>
        <p className="text-gray-500 text-sm">난이도에 맞춰 학습을 도와드릴게요.</p>
      </div>
      <div className="space-y-3">
        {LEVELS.map((lvl) => (
          <button
            key={lvl.id}
            onClick={() => setSelectedLevel(lvl.id)}
            className={`w-full p-4 rounded-xl flex flex-col gap-1 transition-all duration-200 border-2 text-left ${
              selectedLevel === lvl.id
                ? 'bg-blue-50 border-blue-600 shadow-sm'
                : 'bg-white border-gray-100 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span className={`font-bold ${selectedLevel === lvl.id ? 'text-blue-700' : 'text-gray-900'}`}>
                {lvl.label}
              </span>
              {selectedLevel === lvl.id && <Check size={16} className="text-blue-600" />}
            </div>
            <span className="text-xs text-gray-500">{lvl.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          일본어를 왜<br />배우고 싶나요?
        </h1>
        <p className="text-gray-500 text-sm">여러 개 선택할 수 있어요.</p>
      </div>
      <div className="space-y-3">
        {PURPOSES.map((p) => (
          <button
            key={p}
            onClick={() => togglePurpose(p)}
            className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-200 border-2 text-left ${
              selectedPurposes.includes(p)
                ? 'bg-blue-50 border-blue-600 shadow-sm'
                : 'bg-white border-gray-100 hover:bg-gray-50'
            }`}
          >
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedPurposes.includes(p) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
              {selectedPurposes.includes(p) && <Check size={12} className="text-white" />}
            </div>
            <span className={`font-medium text-sm ${selectedPurposes.includes(p) ? 'text-blue-900' : 'text-gray-700'}`}>
              {p}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => {
    const catLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label;
    const lvlLabel = LEVELS.find(l => l.id === selectedLevel)?.label;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            모든 준비가<br />완료되었습니다!
          </h1>
          <p className="text-gray-500 text-sm">일타쿠가 아래 내용을 바탕으로 학습을 도와드릴게요.</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 space-y-6 border border-gray-100">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">관심 분야</h3>
            <div className="font-bold text-gray-900 text-lg mb-1">{catLabel}</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedSubCategories.map(sub => (
                <span key={sub} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600">
                  {sub}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">일본어 실력</h3>
            <div className="font-bold text-blue-600 text-lg">{lvlLabel}</div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">학습 목적</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {selectedPurposes.map(p => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <MobileLayout className="bg-white">
      <div className="flex flex-col h-screen max-h-screen overflow-hidden">
        {/* Top Navigation */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          {step > 1 ? (
            <button onClick={handleBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="w-10" /> 
          )}
          <div className="flex gap-1">
            {[1, 1.5, 2, 3, 4].map((s, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= s ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'
                }`} 
              />
            ))}
          </div>
          <div className="w-10" /> 
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 scrollbar-hide">
          {step === 1 && renderStep1()}
          {step === 1.5 && renderStep1_5()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Bottom Action Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-10">
          {step < 4 ? (
            <Button 
              onClick={handleNext}
              disabled={
                (step === 1 && !selectedCategory) ||
                (step === 1.5 && selectedSubCategories.length === 0) ||
                (step === 2 && !selectedLevel) ||
                (step === 3 && selectedPurposes.length === 0)
              }
              className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-100 disabled:text-gray-400 transition-all"
            >
              다음 <ArrowRight size={18} className="ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleFinish}
              className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 animate-pulse"
            >
              시작하기
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
export interface FeedbackScore {
  total: number;
  grammar: number;
  pronunciation: number;
  fluency: number;
}

export interface FeedbackSummary {
  id: number;
  text: string;
  type: 'positive' | 'improvement';
}

export const feedbackScore: FeedbackScore = {
  total: 85,
  grammar: 90,
  pronunciation: 80,
  fluency: 85,
};

export const feedbackSummaries: FeedbackSummary[] = [
  { id: 1, text: "전반적으로 자연스러운 대화였어요!", type: 'positive' },
  { id: 2, text: "조사 'に'와 'で'의 구분을 조금 더 연습해보세요.", type: 'improvement' },
];

// [1] 오늘의 5문장 사용 결과
export interface SentenceUsage {
  id: string;
  jp: string;
  kr: string;
  status: "used_in_conversation" | "practice_only" | "not_used";
}

export const todaySentenceUsage: SentenceUsage[] = [
  {
    id: "s1",
    jp: "このアニメは本当に面白いです。",
    kr: "이 애니메이션은 정말 재미있습니다.",
    status: "used_in_conversation"
  },
  {
    id: "s2",
    jp: "推しのライブに行きたいです。",
    kr: "최애의 라이브에 가고 싶습니다.",
    status: "practice_only"
  },
  {
    id: "s3",
    jp: "ガチャでレアキャラが出ました！",
    kr: "가챠에서 레어 캐릭터가 나왔습니다!",
    status: "not_used"
  },
  {
    id: "s4",
    jp: "聖地巡礼はどこから始めますか？",
    kr: "성지순례는 어디서부터 시작합니까?",
    status: "used_in_conversation"
  },
  {
    id: "s5",
    jp: "次のイベントはいつですか？",
    kr: "다음 이벤트는 언제입니까?",
    status: "not_used"
  }
];

// [2] 오늘 대화 하이라이트
export interface HighlightCard {
  id: string;
  type: "best_sentence" | "need_practice" | "fun_moment";
  title: string;
  jp: string;
  kr: string;
  comment: string;
}

export const highlightCards: HighlightCard[] = [
  {
    id: "h1",
    type: "best_sentence",
    title: "오늘의 베스트 문장",
    jp: "チェックインをお願いします。",
    kr: "체크인 부탁드립니다.",
    comment: "호텔 체크인 상황에서 아주 자연스럽게 말했어요!"
  },
  {
    id: "h2",
    type: "need_practice",
    title: "조금 더 연습하면 좋은 문장",
    jp: "聖地巡礼はどこから始めますか？",
    kr: "성지순례는 어디서부터 시작합니까?",
    comment: "『聖地巡礼』 발음이 살짝 어색했어요. 내일 한 번 더 연습해봐요."
  },
  {
    id: "h3",
    type: "fun_moment",
    title: "오늘의 오타쿠 순간",
    jp: "ガチャでレアキャラが出ました！",
    kr: "가챠에서 레어 캐릭터가 나왔습니다!",
    comment: "기쁜 느낌이 잘 살아 있었어요. 다음엔 친구에게 자랑하는 식으로도 말해보세요."
  }
];

// [3] 오타쿠 카테고리 진행도
export interface OtakuCategoryStat {
  id: string;
  label: string;
  icon: string;
  percent: number;
}

export const otakuCategoryStats: OtakuCategoryStat[] = [
  { id: "anime", label: "애니 감상 표현", icon: "📺", percent: 70 },
  { id: "gacha", label: "가챠·게임", icon: "🎮", percent: 50 },
  { id: "seichi", label: "성지순례·여행", icon: "🛫", percent: 30 },
  { id: "event", label: "라이브·이벤트", icon: "🎤", percent: 20 }
];
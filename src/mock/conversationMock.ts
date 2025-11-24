export interface ChatTurn {
  id: string;
  speaker: 'user' | 'ai' | 'system';
  jp: string;
  kr?: string;
  suggestedTodaySentenceIds?: string[];
  usedTodaySentenceId?: string;
}

export const mockConversation: ChatTurn[] = [
  {
    id: "t1",
    speaker: "ai",
    jp: "こんにちは！今日はアニメとかゲームの話をしませんか？",
    kr: "안녕하세요! 오늘은 애니나 게임 이야기 해볼까요?"
  },
  {
    id: "t2",
    speaker: "ai",
    jp: "最近ハマっている作品はありますか？どんな作品か教えてください。",
    kr: "최근에 빠져 있는 작품 있어요? 어떤 작품인지 알려 주세요.",
    suggestedTodaySentenceIds: ["s1"] // ▶︎ s1 recommended
  },
  {
    id: "t3",
    speaker: "user",
    jp: "このアニメは本当に面白いです。",
    kr: "이 애니메이션은 정말 재미있습니다.",
    usedTodaySentenceId: "s1"
  },
  {
    id: "t4",
    speaker: "ai",
    jp: "そうなんですね！どんなところが面白いんですか？",
    kr: "그렇군요! 어떤 점이 그렇게 재미있어요?"
  },

  // ---- Favorite & Live ( s2 ) ----
  {
    id: "t5",
    speaker: "ai",
    jp: "そのアニメに推しのキャラや声優はいますか？",
    kr: "그 애니에 최애 캐릭터나 성우가 있어요?"
  },
  {
    id: "t6",
    speaker: "ai",
    jp: "もし時間とお金に余裕があったら、何をしてみたいですか？",
    kr: "만약 시간과 돈이 넉넉하다면, 무엇을 해보고 싶나요?",
    suggestedTodaySentenceIds: ["s2"] // ▶︎ s2 recommended
  },
  {
    id: "t7",
    speaker: "user",
    jp: "推しのライブに行きたいです。",
    kr: "최애의 라이브에 가고 싶습니다.",
    usedTodaySentenceId: "s2"
  },
  {
    id: "t8",
    speaker: "ai",
    jp: "いいですね！生で推しを見るのは最高ですよね。",
    kr: "좋죠! 직접 최애를 보는 건 최고잖아요."
  },

  // ---- Gacha ( s3 ) ----
  {
    id: "t9",
    speaker: "ai",
    jp: "ところで、最近ガチャは回しましたか？結果はどうでした？",
    kr: "그나저나, 요즘 가챠는 돌려봤어요? 결과가 어땠어요?",
    suggestedTodaySentenceIds: ["s3"] // ▶︎ s3 recommended
  },
  {
    id: "t10",
    speaker: "user",
    jp: "ガチャでレアキャラが出ました！",
    kr: "가챠에서 레어 캐릭터가 나왔습니다!",
    usedTodaySentenceId: "s3"
  },
  {
    id: "t11",
    speaker: "ai",
    jp: "えっ、すごい！何連で出ましたか？",
    kr: "헉, 대박! 몇 연차만에 나온 거예요?"
  },

  // ---- Pilgrimage ( s4 ) ----
  {
    id: "t12",
    speaker: "ai",
    jp: "その作品の舞台に行ってみたいと思ったことはありますか？",
    kr: "그 작품의 배경이 된 장소에 가보고 싶다고 생각한 적 있어요?"
  },
  {
    id: "t13",
    speaker: "ai",
    jp: "もし聖地巡礼をするとしたら、まずどこに行きたいですか？",
    kr: "만약 성지순례를 한다면, 가장 먼저 어디에 가보고 싶어요?",
    suggestedTodaySentenceIds: ["s4"] // ▶︎ s4 recommended
  },
  {
    id: "t14",
    speaker: "user",
    jp: "聖地巡礼はどこから始めますか？",
    kr: "성지순례는 어디서부터 시작합니까?",
    usedTodaySentenceId: "s4"
  },
  {
    id: "t15",
    speaker: "ai",
    jp: "そうですね、まずは有名なロケ地から回るのがいいかもしれませんね。",
    kr: "그렇죠, 일단 유명한 촬영지를 먼저 돌아보는 게 좋을지도 몰라요."
  },

  // ---- Event/Concert Schedule ( s5 ) ----
  {
    id: "t16",
    speaker: "ai",
    jp: "イベントにも行ってみたいですよね。同じ作品が好きな人と会えるチャンスです。",
    kr: "이벤트도 가보고 싶죠. 같은 작품을 좋아하는 사람들을 만날 수 있는 기회니까요."
  },
  {
    id: "t17",
    speaker: "ai",
    jp: "今気になっているライブやイベントはありますか？",
    kr: "지금 가보고 싶은 라이브나 이벤트가 있어요?",
    suggestedTodaySentenceIds: ["s5"] // ▶︎ s5 recommended
  },
  {
    id: "t18",
    speaker: "user",
    jp: "次のイベントはいつですか？",
    kr: "다음 이벤트는 언제입니까?",
    usedTodaySentenceId: "s5"
  },
  {
    id: "t19",
    speaker: "ai",
    jp: "公式サイトをチェックしてみましょう。一緒に予定を立てるのも楽しそうですね。",
    kr: "공식 사이트 한번 확인해봐요. 함께 일정 짜 보는 것도 재밌겠네요."
  }
];
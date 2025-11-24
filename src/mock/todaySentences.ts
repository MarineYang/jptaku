import { DailySentence } from '@/store/useAppStore';

export const todaySentences: DailySentence[] = [
  {
    id: "s1",
    japanese: "このアニメは本当に面白いです。",
    reading: "Kono anime wa hontou ni omoshiroi desu.",
    meaning: "이 애니메이션은 정말 재미있습니다.",
    romaji: "Kono anime wa hontou ni omoshiroi desu.",
    tags: ["#애니토크", "#감상표현"],
    words: [
      { term: "この", reading: "kono", meaning: "이" },
      { term: "アニメ", reading: "anime", meaning: "애니메이션" },
      { term: "本当に", reading: "hontou ni", meaning: "정말" },
      { term: "面白い", reading: "omoshiroi", meaning: "재미있다" },
    ],
    grammar: {
      pattern: "AはBです",
      description: "A는 B입니다. 상태나 성질을 설명할 때 사용해요.",
    },
    examples: [
      {
        japanese: "このゲームは難しいです。",
        reading: "Kono geemu wa muzukashii desu.",
        meaning: "이 게임은 어렵습니다.",
      },
    ],
    quiz: {
      type: 'meaning',
      question: "このアニメは本当に面白いです。",
      options: [
        "이 만화는 별로 재미없습니다.",
        "이 애니메이션은 정말 재미있습니다.",
        "저 애니메이션은 조금 지루합니다.",
        "이 영화는 정말 슬픕니다.",
      ],
      answer: "이 애니메이션은 정말 재미있습니다.",
    },
  },
  {
    id: "s2",
    japanese: "推しのライブに行きたいです。",
    reading: "Oshi no raibu ni ikitai desu.",
    meaning: "최애의 라이브에 가고 싶습니다.",
    romaji: "Oshi no raibu ni ikitai desu.",
    tags: ["#덕질", "#희망표현"],
    words: [
      { term: "推し", reading: "oshi", meaning: "최애(가장 좋아하는 멤버/캐릭터)" },
      { term: "ライブ", reading: "raibu", meaning: "라이브/콘서트" },
      { term: "行きたい", reading: "ikitai", meaning: "가고 싶다" },
    ],
    grammar: {
      pattern: "〜たいです",
      description: "~하고 싶습니다. 희망을 나타내는 표현이에요.",
    },
    examples: [
      {
        japanese: "日本に行きたいです。",
        reading: "Nihon ni ikitai desu.",
        meaning: "일본에 가고 싶습니다.",
      },
    ],
    quiz: {
      type: 'blank',
      question: "推しの＿＿に行きたいです。",
      options: ["ライブ", "学校", "会社", "病院"],
      answer: "ライブ",
    },
  },
  {
    id: "s3",
    japanese: "ガチャでレアキャラが出ました！",
    reading: "Gacha de rea kyara ga demashita!",
    meaning: "가챠에서 레어 캐릭터가 나왔습니다!",
    romaji: "Gacha de rea kyara ga demashita!",
    tags: ["#가챠", "#게임"],
    words: [
      { term: "ガチャ", reading: "gacha", meaning: "뽑기(가챠)" },
      { term: "レアキャラ", reading: "rea kyara", meaning: "희귀 캐릭터" },
      { term: "出ました", reading: "demashita", meaning: "나왔습니다" },
    ],
    grammar: {
      pattern: "〜が出ました",
      description: "~가 나왔습니다. 결과나 현상을 보고할 때 써요.",
    },
    examples: [
      {
        japanese: "美味しい料理が出ました。",
        reading: "Oishii ryouri ga demashita.",
        meaning: "맛있는 요리가 나왔습니다.",
      },
    ],
    quiz: {
      type: 'meaning',
      question: "ガチャでレアキャラが出ました！",
      options: [
        "가챠를 돌리는 것을 실패했습니다.",
        "가챠에서 꽝이 나왔습니다.",
        "가챠에서 레어 캐릭터가 나왔습니다!",
        "가챠는 너무 비쌉니다.",
      ],
      answer: "가챠에서 레어 캐릭터가 나왔습니다!",
    },
  },
  {
    id: "s4",
    japanese: "聖地巡礼はどこから始めますか？",
    reading: "Seichi junrei wa doko kara hajimemasuka?",
    meaning: "성지순례는 어디서부터 시작합니까?",
    romaji: "Seichi junrei wa doko kara hajimemasuka?",
    tags: ["#여행", "#질문하기"],
    words: [
      { term: "聖地巡礼", reading: "seichi junrei", meaning: "성지순례(애니 배경지 방문)" },
      { term: "どこ", reading: "doko", meaning: "어디" },
      { term: "始めますか", reading: "hajimemasuka", meaning: "시작합니까?" },
    ],
    grammar: {
      pattern: "〜はどこですか？",
      description: "~은 어디입니까? 장소나 위치를 물을 때 사용해요.",
    },
    examples: [
      {
        japanese: "トイレはどこですか？",
        reading: "Toire wa doko desu ka?",
        meaning: "화장실은 어디입니까?",
      },
    ],
    quiz: {
      type: 'order',
      question: "순서대로 배열하세요: [始めますか] [どこから] [聖地巡礼は]",
      options: ["聖地巡礼は", "どこから", "始めますか"],
      answer: "聖地巡礼は どこから 始めますか",
    },
  },
  {
    id: "s5",
    japanese: "次のイベントはいつですか？",
    reading: "Tsugi no ibento wa itsu desu ka?",
    meaning: "다음 이벤트는 언제입니까?",
    romaji: "Tsugi no ibento wa itsu desu ka?",
    tags: ["#이벤트", "#일정확인"],
    words: [
      { term: "次の", reading: "tsugi no", meaning: "다음의" },
      { term: "イベント", reading: "ibento", meaning: "이벤트/행사" },
      { term: "いつ", reading: "itsu", meaning: "언제" },
    ],
    grammar: {
      pattern: "〜はいつですか？",
      description: "~은 언제입니까? 시간을 물을 때 사용해요.",
    },
    examples: [
      {
        japanese: "誕生日はいつですか？",
        reading: "Tanjoubi wa itsu desu ka?",
        meaning: "생일은 언제입니까?",
      },
    ],
    quiz: {
      type: 'blank',
      question: "次のイベントは＿＿ですか？",
      options: ["だれ", "いつ", "どこ", "なに"],
      answer: "いつ",
    },
  },
];

export const yesterdaySentences: DailySentence[] = [
  {
    id: 6,
    japanese: "昨日は楽しかったです。",
    reading: "Kinou wa tanoshikatta desu.",
    meaning: "어제는 즐거웠습니다.",
    romaji: "Kinou wa tanoshikatta desu.",
    tags: ["#일상", "#과거형"],
    words: [
      { term: "昨日", reading: "kinou", meaning: "어제" },
      { term: "楽しかった", reading: "tanoshikatta", meaning: "즐거웠다" },
    ],
    grammar: {
      pattern: "〜かったです",
      description: "이형용사의 과거형입니다.",
    },
    examples: [],
    quiz: {
      type: 'meaning',
      question: "昨日は楽しかったです。",
      options: ["어제는 즐거웠습니다.", "내일은 즐거울 것입니다.", "오늘은 바쁩니다.", "어제는 슬펐습니다."],
      answer: "어제는 즐거웠습니다.",
    },
  },
  {
    id: 7,
    japanese: "日本語を勉強しています。",
    reading: "Nihongo wo benkyou shiteimasu.",
    meaning: "일본어를 공부하고 있습니다.",
    romaji: "Nihongo wo benkyou shiteimasu.",
    tags: ["#공부", "#진행형"],
    words: [
        { term: "日本語", reading: "nihongo", meaning: "일본어" },
        { term: "勉強", reading: "benkyou", meaning: "공부" }
    ],
    grammar: { pattern: "〜ています", description: "현재 진행 중인 동작을 나타냅니다." },
    examples: [],
    quiz: { type: 'blank', question: "日本語を＿＿しています。", options: ["勉強", "運動", "食事", "睡眠"], answer: "勉強" }
  },
  {
    id: 8,
    japanese: "週末は何をしますか？",
    reading: "Shuumatsu wa nani wo shimasu ka?",
    meaning: "주말에는 무엇을 합니까?",
    romaji: "Shuumatsu wa nani wo shimasu ka?",
    tags: ["#주말", "#질문"],
    words: [
        { term: "週末", reading: "shuumatsu", meaning: "주말" },
        { term: "何", reading: "nani", meaning: "무엇" }
    ],
    grammar: { pattern: "〜ますか", description: "정중한 질문 형태입니다." },
    examples: [],
    quiz: { type: 'order', question: "순서대로 배열하세요.", options: ["何を", "週末は", "しますか"], answer: "週末は 何を しますか" }
  },
  {
    id: 9,
    japanese: "これは私の本です。",
    reading: "Kore wa watashi no hon desu.",
    meaning: "이것은 제 책입니다.",
    romaji: "Kore wa watashi no hon desu.",
    tags: ["#소유", "#기본"],
    words: [
        { term: "これ", reading: "kore", meaning: "이것" },
        { term: "私", reading: "watashi", meaning: "나/저" },
        { term: "本", reading: "hon", meaning: "책" }
    ],
    grammar: { pattern: "AのB", description: "A의 B (소유를 나타냄)" },
    examples: [],
    quiz: { type: 'meaning', question: "これは私の本です。", options: ["이것은 제 책입니다.", "그것은 당신의 책입니다.", "저것은 도서관입니다.", "여기는 서점입니다."], answer: "이것은 제 책입니다." }
  },
  {
    id: 10,
    japanese: "駅まで歩いて行きます。",
    reading: "Eki made aruite ikimasu.",
    meaning: "역까지 걸어서 갑니다.",
    romaji: "Eki made aruite ikimasu.",
    tags: ["#이동", "#수단"],
    words: [
        { term: "駅", reading: "eki", meaning: "역" },
        { term: "歩いて", reading: "aruite", meaning: "걸어서" },
        { term: "行きます", reading: "ikimasu", meaning: "갑니다" }
    ],
    grammar: { pattern: "〜て行きます", description: "수단이나 방법을 나타냅니다." },
    examples: [],
    quiz: { type: 'blank', question: "駅まで＿＿行きます。", options: ["歩いて", "食べて", "寝て", "見て"], answer: "歩いて" }
  }
];
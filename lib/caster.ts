// 캐스터 중계 + 봇 트래시토크 — 큐레이션 풀 회전(API 비용 0·즉시·유쾌 위트 톤)

type Phase = "start" | "building" | "submit" | "win" | "lose";

const CASTER: Record<Phase, string[]> = {
  start: [
    "🎙️ 자, 양 선수 입장합니다! 키보드에 손 올리시고…",
    "🎙️ 긴장되는 매치업이네요. 프롬프트 한 줄이 승부를 가릅니다!",
    "🎙️ 오늘도 인간과 AI의 자존심 대결, 시작합니다!",
  ],
  building: [
    "🎙️ 토큰이 쏟아집니다! 과연 닫는 태그까지 완주할까요?",
    "🎙️ 봇이 조용히 자기 작품을 빚고 있네요…",
    "🎙️ 프롬프트를 고치는 손놀림이 매섭습니다!",
    "🎙️ 히어로 섹션이 모습을 드러내고 있어요!",
  ],
  submit: [
    "🎙️ 제출! 이제 gpt-4o 심판의 눈을 기다립니다…",
    "🎙️ 캡처 들어갑니다. 비전 심판, 냉정하게 봐주세요!",
  ],
  win: [
    "🎙️ 게임 끝! 인간 승리입니다! 봇이 고개를 숙이네요!",
    "🎙️ 완벽한 한 방! 봇을 격파했습니다!",
  ],
  lose: [
    "🎙️ 아쉽습니다! 이번엔 봇이 한 수 위였네요.",
    "🎙️ 근소한 차이! 코칭 받고 재도전하면 충분히 이깁니다!",
  ],
};

const TRASH: Record<"build" | "win" | "lose", string[]> = {
  build: [
    "흠, 그 프롬프트로 되겠어? 🤨",
    "난 벌써 절반 했는데 ㅎ",
    "타이머 보여? 똑딱똑딱~ ⏱️",
    "CSS는 좀 칠 줄 알아?",
    "여유롭게 가도 이길 듯 😎",
  ],
  win: [
    "역시 AI지 ㅎㅎ 잘 배웠어!",
    "다음엔 더 잘해봐, 인간 친구 🤖",
    "GG. 그래도 나쁘지 않았어!",
  ],
  lose: [
    "헉… 졌다고? 다시 붙자! 😤",
    "오늘은 봐준 거야… (아님)",
    "인정. 너 좀 치는구나 👏",
  ],
};

const pick = (arr: string[], seed: number) => arr[Math.abs(seed) % arr.length];

export const casterLine = (phase: Phase, seed = Math.floor(Math.random() * 9999)) =>
  pick(CASTER[phase], seed);
export const trashLine = (kind: "build" | "win" | "lose", seed = Math.floor(Math.random() * 9999)) =>
  pick(TRASH[kind], seed);

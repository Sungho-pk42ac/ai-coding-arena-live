// 게임 모드 / 난이도 타입 + 난이도 메타

export type GameMode = "recreate" | "free"; // 🎯재현 / 🎨자유
export type Difficulty = "easy" | "normal" | "hard";

export type DiffMeta = {
  id: Difficulty;
  label: string;
  seconds: number;
  /** 봇 점수 밴드 [min,max] */
  botBand: [number, number];
  /** 봇 빌드 모델: fake | gpt-4o-mini | gpt-4o */
  botModel: "fake" | "gpt-4o-mini" | "gpt-4o";
  char: string; // 봇 캐릭터 이모지
  charName: string;
  accent: string;
};

export const DIFFICULTIES: Record<Difficulty, DiffMeta> = {
  easy: { id: "easy", label: "쉬움", seconds: 120, botBand: [42, 58], botModel: "fake", char: "🐣", charName: "코드뉴비", accent: "#3ecf8e" },
  normal: { id: "normal", label: "보통", seconds: 90, botBand: [62, 76], botModel: "gpt-4o-mini", char: "🏃", charName: "코드러너", accent: "#3992ff" },
  hard: { id: "hard", label: "어려움", seconds: 60, botBand: [80, 95], botModel: "gpt-4o", char: "🤖", charName: "코드마스터", accent: "#b22222" },
};

export const DIFF_LIST: DiffMeta[] = [DIFFICULTIES.easy, DIFFICULTIES.normal, DIFFICULTIES.hard];

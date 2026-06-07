// 레벨/XP/랭크 (localStorage 영속은 클라에서)

import { Difficulty } from "./mode";

export type Rank = { name: string; emoji: string; color: string };

const RANKS: { min: number; rank: Rank }[] = [
  { min: 0, rank: { name: "브론즈", emoji: "🥉", color: "#a16207" } },
  { min: 300, rank: { name: "실버", emoji: "🥈", color: "#71717a" } },
  { min: 800, rank: { name: "골드", emoji: "🥇", color: "#eab308" } },
  { min: 1600, rank: { name: "플래티넘", emoji: "🔷", color: "#0ea5e9" } },
  { min: 3000, rank: { name: "다이아", emoji: "💎", color: "#8b5cf6" } },
];

/** 매판 획득 XP — 점수·승리·난이도 비례 */
export function matchXp(score: number, won: boolean, diff: Difficulty): number {
  const diffMul = diff === "hard" ? 1.6 : diff === "normal" ? 1.3 : 1;
  return Math.round((score + (won ? 40 : 8)) * diffMul);
}

/** 누적 XP → 레벨/랭크/진행률 */
export function progressFromXp(totalXp: number) {
  // 레벨: 100 XP마다(완만 곡선)
  const level = Math.floor(Math.sqrt(totalXp / 50)) + 1;
  const curBase = (level - 1) * (level - 1) * 50;
  const nextBase = level * level * 50;
  const progress = Math.min(1, Math.max(0, (totalXp - curBase) / (nextBase - curBase)));
  let rank = RANKS[0].rank;
  for (const r of RANKS) if (totalXp >= r.min) rank = r.rank;
  return { level, rank, progress, toNext: Math.max(0, nextBase - totalXp) };
}

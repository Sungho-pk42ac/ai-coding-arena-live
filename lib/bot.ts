// 봇 점수(밴드 결정론) + 봇 독립 프롬프트(복붙 금지)

import { Difficulty, DIFFICULTIES, GameMode } from "./mode";
import { Target } from "./targets";

/** 봇 점수 = 밴드 내 결정론(시드 기반). 승부는 실제 판정과 비교 */
export function botScore(diff: Difficulty, seed: number): number {
  const [lo, hi] = DIFFICULTIES[diff].botBand;
  const span = hi - lo;
  // 시드 해시 → 0..1
  let x = (seed * 9301 + 49297) % 233280;
  const r = x / 233280;
  return Math.round(lo + r * span);
}

/** 봇 독립 프롬프트 — 재현=타깃 자기해석 / 자유=자기 브리프(시드별 다양화) */
export function botPrompt(mode: GameMode, target: Target, seed: number): string {
  const briefs = [
    "미니멀한 SaaS 랜딩 — 큰 헤드라인, 단일 CTA, 기능 카드 3개",
    "대담한 그라데이션 히어로와 통계 숫자가 있는 제품 페이지",
    "다크모드 개발자 도구 랜딩, 코드 스니펫 강조",
    "친근한 일러스트 느낌의 온보딩 히어로 + 가격 카드",
    "에디토리얼 매거진 스타일, 큰 타이포와 여백",
    "테크 스타트업 랜딩, 로고 마퀴와 후기 섹션",
  ];
  if (mode === "free") return briefs[seed % briefs.length];
  return `${target.name} 공식 사이트(${target.blurb})를 분위기·구조·색감을 살려 재현. 히어로 + 내비 + 핵심 섹션.`;
}

/** 난이도별 봇 빌드 모델(easy=fake) */
export function botModelFor(diff: Difficulty): "fake" | "gpt-4o-mini" | "gpt-4o" {
  return DIFFICULTIES[diff].botModel;
}

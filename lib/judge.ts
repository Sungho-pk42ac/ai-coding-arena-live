// 휴리스틱 폴백 채점 — 비전 심판 불가 시. 정직 채점(렌더 품질 신호 기반).

export type Rubric = { layout: number; color: number; typography: number; score: number; comment: string; coach: string };

/** HTML 신호로 결정론 점수(정직 — 후한 floor 없음, 단 렌더 가능하면 기본 신뢰) */
export function heuristicJudge(html: string, prompt: string, freeMode: boolean): Rubric {
  const x = html.toLowerCase();
  const sig = (re: RegExp) => (re.test(x) ? 1 : 0);

  // 레이아웃 신호
  let layout = 40;
  layout += sig(/flex|grid/) * 14;
  layout += sig(/<header|<nav/) * 10;
  layout += sig(/<section/) * 8;
  layout += sig(/max-width|container/) * 8;
  layout += Math.min(12, (x.match(/<div/g)?.length || 0));

  // 색 신호
  let color = 42;
  color += sig(/gradient/) * 14;
  const colorCount = (x.match(/#[0-9a-f]{3,6}/g)?.length || 0) + (x.match(/rgb/g)?.length || 0);
  color += Math.min(24, colorCount * 3);

  // 타이포 신호
  let typography = 44;
  typography += sig(/font-family/) * 12;
  typography += sig(/font-weight\s*:\s*[6-9]00|bold/) * 10;
  typography += sig(/letter-spacing|line-height/) * 10;
  typography += sig(/pretendard|inter|geist/) * 8;

  // 프롬프트 충실성 가점(구체 키워드 반영 여부)
  const kw = prompt.toLowerCase().match(/[가-힣a-z]+/g) || [];
  const hit = kw.filter((k) => k.length > 1 && x.includes(k)).length;
  const fidelity = Math.min(10, hit);

  const clamp = (n: number) => Math.max(20, Math.min(98, Math.round(n)));
  layout = clamp(layout);
  color = clamp(color);
  typography = clamp(typography);
  let score = clamp(layout * 0.4 + color * 0.3 + typography * 0.3 + fidelity);

  // 렌더 불가하면 강한 감점
  if (!/(<body|<div|<section|<h1)/.test(x) || html.length < 100) score = Math.min(score, 28);

  return {
    layout,
    color,
    typography,
    score,
    comment: freeMode
      ? score >= 78 ? "창의적이고 완성도 높은 결과네요!" : score >= 60 ? "콘셉트가 살아있어요. 디테일을 더!" : "기본 구조부터 탄탄히 잡아보죠."
      : score >= 78 ? "타깃의 분위기를 잘 잡았어요!" : score >= 60 ? "구조는 비슷해요. 색감을 더 맞춰보세요." : "레이아웃부터 타깃에 맞춰보세요.",
    coach:
      typography < color && typography < layout
        ? "타이포 계층(헤드라인 크기·굵기)을 더 과감하게."
        : color <= layout
        ? "포인트 컬러 1개로 대비를 강조해보세요."
        : "여백과 정렬로 시각적 리듬을 만들어보세요.",
  };
}

// 타깃 풀(임베드 검증된 12개 dev 사이트) + URL 헬퍼

export type Target = {
  id: string;
  name: string;
  url: string;
  /** 비전 심판/카피 참고용 브랜드 한 줄 */
  blurb: string;
  /** 더블베젤 카드 강조색(타깃 브랜드 힌트) */
  hint: string;
};

/** 프로토콜 없으면 https:// 붙임(임베드/스샷 404 방지 — §A 함정) */
export const embedUrl = (u: string): string =>
  /^https?:\/\//.test(u) ? u : `https://${u}`;

/** thum.io 정적 스크린샷 — 프로토콜 필수 포함 */
export const targetImageUrl = (u: string): string =>
  `https://image.thum.io/get/width/1000/crop/760/noanimate/${embedUrl(u)}`;

export const TARGETS: Target[] = [
  { id: "bootstrap", name: "Bootstrap", url: "getbootstrap.com", blurb: "Build fast, responsive sites", hint: "#7952b3" },
  { id: "tailwind", name: "Tailwind CSS", url: "tailwindcss.com", blurb: "Rapidly build modern websites", hint: "#38bdf8" },
  { id: "svelte", name: "Svelte", url: "svelte.dev", blurb: "Cybernetically enhanced web apps", hint: "#ff3e00" },
  { id: "astro", name: "Astro", url: "astro.build", blurb: "The web framework for content", hint: "#ff5d01" },
  { id: "remix", name: "Remix", url: "remix.run", blurb: "Build better websites", hint: "#3992ff" },
  { id: "supabase", name: "Supabase", url: "supabase.com", blurb: "The open source Firebase alternative", hint: "#3ecf8e" },
  { id: "mongodb", name: "MongoDB", url: "mongodb.com", blurb: "The developer data platform", hint: "#00ed64" },
  { id: "bun", name: "Bun", url: "bun.sh", blurb: "Incredibly fast JavaScript runtime", hint: "#fbf0df" },
  { id: "solid", name: "SolidJS", url: "solidjs.com", blurb: "Simple and performant reactivity", hint: "#2c4f7c" },
  { id: "htmx", name: "htmx", url: "htmx.org", blurb: "High power tools for HTML", hint: "#3366cc" },
  { id: "react", name: "React", url: "react.dev", blurb: "The library for web UIs", hint: "#58c4dc" },
  { id: "daisyui", name: "daisyUI", url: "daisyui.com", blurb: "The most popular Tailwind components", hint: "#1ad1a5" },
];

export const targetById = (id: string): Target =>
  TARGETS.find((t) => t.id === id) ?? TARGETS[0];

/** 시드 기반 결정론 랜덤(하이드레이션 안전 — 호출은 이벤트/useEffect에서) */
export const pickTarget = (seed?: number): Target => {
  const i = seed === undefined ? Math.floor(Math.random() * TARGETS.length) : seed % TARGETS.length;
  return TARGETS[i];
};

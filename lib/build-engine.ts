// HTML 추출/렌더검사/인젝션 가드 + 페이크 빌더 (서버·클라 공용)

/** 펜스 제거 + <!doctype>~</html> 추출 + 잘리면 닫는 태그 자동 보정(§A 함정) */
export function stripFences(raw: string): string {
  let out = raw
    .trim()
    .replace(/^```(?:html)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
  const lower = out.toLowerCase();
  const dIdx = lower.indexOf("<!doctype");
  const hIdx = lower.indexOf("<html");
  const start = dIdx >= 0 ? dIdx : hIdx;
  if (start >= 0) {
    const end = lower.lastIndexOf("</html>");
    out = end >= 0 ? out.slice(start, end + 7) : out.slice(start);
  }
  // 닫는 태그 자동 보정(부분이라도 안 깨짐)
  const lo = out.toLowerCase();
  if (!lo.includes("</body>") && lo.includes("<body")) out += "\n</body>";
  if (!lo.includes("</html>")) out += "\n</html>";
  return out.trim();
}

/** 렌더 가능한 HTML인지 최소 검사 */
export function isRenderableHtml(h: string): boolean {
  const x = h.toLowerCase();
  return h.length > 80 && /(<body|<div|<main|<section|<h1|<header)/.test(x);
}

/** 위험 인젝션 가드(javascript: / on*= 인라인 핸들러 일부 제거는 sandbox로 1차 차단) */
export function looksUnsafe(h: string): boolean {
  return /javascript:\s*[^"']/i.test(h);
}

/** 프롬프트에서 색/키워드 힌트 추출(페이크 빌더가 프롬프트를 "흉내"내게) */
function hints(prompt: string) {
  const p = prompt.toLowerCase();
  const colorMap: Record<string, string> = {
    보라: "#7c3aed", purple: "#7c3aed", violet: "#7c3aed",
    파랑: "#2563eb", blue: "#2563eb", 빨강: "#dc2626", red: "#dc2626",
    초록: "#16a34a", green: "#16a34a", 노랑: "#eab308", yellow: "#eab308",
    분홍: "#ec4899", pink: "#ec4899", 검정: "#111827", black: "#111827",
    주황: "#ea580c", orange: "#ea580c", 청록: "#0d9488", teal: "#0d9488",
  };
  let hero = "#1a1a1a";
  let btn = "#b22222";
  for (const k in colorMap) {
    if (p.includes(k)) {
      if (p.indexOf(k) < p.length / 2) hero = colorMap[k];
      else btn = colorMap[k];
    }
  }
  const cardMatch = p.match(/카드\s*(\d+)|(\d+)\s*(?:개|cards?)/);
  const cards = cardMatch ? Math.min(6, Math.max(1, parseInt(cardMatch[1] || cardMatch[2] || "3", 10))) : 3;
  const gradient = /그라데이션|gradient/.test(p);
  return { hero, btn, cards, gradient, title: prompt.slice(0, 40) };
}

/** 페이크 빌더 — 키 없거나 타임아웃 시 폴백. 프롬프트를 반영해 "깡통 아님" 보장 */
export function fakeHtml(prompt: string, targetName = "Target"): string {
  const h = hints(prompt);
  const heroBg = h.gradient
    ? `linear-gradient(135deg, ${h.hero}, ${h.btn})`
    : h.hero;
  const cards = Array.from({ length: h.cards })
    .map(
      (_, i) => `<div style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 10px 30px -12px rgba(0,0,0,.18);flex:1;min-width:200px">
        <div style="width:44px;height:44px;border-radius:12px;background:${h.btn};opacity:.9"></div>
        <h3 style="margin:16px 0 8px;font-size:20px">기능 ${i + 1}</h3>
        <p style="color:#6b6359;font-size:15px;line-height:1.6">프롬프트를 반영한 카드 콘텐츠입니다.</p>
      </div>`
    )
    .join("");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;box-sizing:border-box;font-family:Pretendard,system-ui,sans-serif}
.hero{background:${heroBg};color:#fff;padding:80px 40px;text-align:center}
.hero h1{font-size:44px;font-weight:800;letter-spacing:-.02em}
.hero p{margin-top:14px;opacity:.92;font-size:18px}
.btn{display:inline-block;margin-top:28px;background:${h.btn};color:#fff;padding:14px 32px;border-radius:999px;font-weight:700;font-size:17px}
.wrap{max-width:1000px;margin:48px auto;padding:0 24px;display:flex;gap:20px;flex-wrap:wrap}</style></head>
<body><section class="hero"><h1>${h.title || targetName}</h1><p>${prompt.slice(0, 80)}</p><span class="btn">시작하기 →</span></section>
<main class="wrap">${cards}</main></body></html>`;
}

/** 페이크 봇 빌더(자기 브리프 — 플레이어 프롬프트 복사 안 함) */
export function fakeBotHtml(targetName: string, seed: number): string {
  const palettes = ["#7952b3", "#38bdf8", "#ff3e00", "#3ecf8e", "#3992ff", "#ea580c"];
  const c = palettes[seed % palettes.length];
  return fakeHtml(`${targetName} 스타일 랜딩, 깔끔한 히어로와 카드 3개`, targetName).replace(/#b22222/g, c);
}

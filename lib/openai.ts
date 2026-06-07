// OpenAI 호출(server-only). 빌드 시스템 프롬프트 + gpt-4o 비전 심판.
import "server-only";

const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const hasOpenAI = !!KEY;

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

/** 빌드 시스템 프롬프트 — 사용자 프롬프트 PRIMARY + $150k 에이전시 미감, 10초 내 완주 */
export function buildSystemPrompt(targetName: string, mode: "recreate" | "free"): string {
  const base = `너는 세계 최고 수준의 프론트엔드 디자이너다. 단일 파일 HTML로 응답한다.
규칙: ① 사용자 요구가 최우선. 구체적 요청(색·버튼·카드 수 등)은 반드시 그대로 반영. ② $150k 에이전시급 미감(여백·타이포·계층). ③ ⚠️자기완결 렌더 필수: 스타일은 <head>의 <style>에 **순수 인라인 CSS**로만 작성한다. Tailwind 등 유틸리티 클래스명(bg-*, text-*, flex 등)을 CDN 없이 쓰지 마라(렌더 안 됨). 굳이 Tailwind를 쓸 거면 반드시 <script src="https://cdn.tailwindcss.com"></script>를 head에 포함. 폰트는 fonts.googleapis/jsdelivr Pretendard, 이미지는 picsum.photos만. Unsplash 금지. ④ 컴팩트하게! 10초 내 <!doctype>부터 </html>까지 반드시 완주. 장황 금지. ⑤ 코드펜스/설명 없이 순수 HTML만 출력(\`\`\`html 금지).`;
  if (mode === "free") return `${base}\n모드: 자유 창작. 사용자 프롬프트를 마음껏 표현하라(타깃 무관).`;
  return `${base}\n모드: 타깃 재현. 참고 타깃은 "${targetName}" — 분위기·구조·색감을 참고하되 사용자 프롬프트를 우선한다. 강제 템플릿 금지.`;
}

/** 비전 심판 — 첫 이미지=타깃, 둘째=결과 렌더. 정직 채점(후한 floor 없음). */
export async function realJudge(opts: {
  targetImageUrl?: string;
  renderDataUrl: string;
  prompt: string;
  freeMode: boolean;
}): Promise<null | { layout: number; color: number; typography: number; score: number; comment: string; coach: string }> {
  if (!KEY) return null;
  const sys =
    "너는 엄정한 UI 심사위원이다. 시각 결과물을 레이아웃/색/타이포 기준으로 정직하게 평가한다. 후하게 주지 말고 실제 품질대로 채점하라. " +
    'JSON만: {"layout":0-100,"color":0-100,"typography":0-100,"score":0-100,"comment":"한 줄 평","coach":"점수 올릴 구체 팁 한 줄"}';
  const content: Record<string, unknown>[] = [
    {
      type: "text",
      text: opts.freeMode
        ? `자유 창작 결과를 창의성·완성도·미감으로 평가하라. 사용자 프롬프트: "${opts.prompt}". 아래 이미지가 결과 렌더.`
        : `타깃 재현 결과를 평가하라. 사용자 프롬프트: "${opts.prompt}". 첫 이미지=타깃 참고, 둘째=결과 렌더. 분위기·구조·색감 재현도 중심.`,
    },
  ];
  if (!opts.freeMode && opts.targetImageUrl) {
    content.push({ type: "image_url", image_url: { url: opts.targetImageUrl } });
  }
  content.push({ type: "image_url", image_url: { url: opts.renderDataUrl } });

  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: sys },
          { role: "user", content },
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
        temperature: 0.3,
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const txt = j?.choices?.[0]?.message?.content;
    if (!txt) return null;
    const parsed = JSON.parse(txt);
    const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
    return {
      layout: clamp(parsed.layout),
      color: clamp(parsed.color),
      typography: clamp(parsed.typography),
      score: clamp(parsed.score),
      comment: String(parsed.comment || "평가 완료").slice(0, 120),
      coach: String(parsed.coach || "더 과감한 대비를 시도해보세요.").slice(0, 120),
    };
  } catch {
    return null;
  }
}

export { MODEL };

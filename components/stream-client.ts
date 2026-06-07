// 클라 스트리밍 빌드 — 30초 타임아웃 폴백(절대 안 멈춤, §E3)
import { stripFences, isRenderableHtml, fakeHtml } from "@/lib/build-engine";

export type BuildResult = { html: string; mode: "real" | "fake" };

export async function streamReal(
  prompt: string,
  targetId: string,
  targetName: string,
  mode: "recreate" | "free",
  onChunk: (acc: string) => void,
  model?: string,
  timeoutMs = 30000
): Promise<BuildResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let acc = "";
  try {
    const res = await fetch("/api/build/stream", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, targetId, mode, model }),
    });
    const headerMode = res.headers.get("x-build-mode");
    if (res.ok && res.body) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        onChunk(acc);
      }
      clearTimeout(timer);
      const cleaned = stripFences(acc);
      if (isRenderableHtml(cleaned)) {
        return { html: cleaned, mode: headerMode === "real" ? "real" : "fake" };
      }
    }
  } catch {
    /* 타임아웃/오류 → 폴백 */
  }
  clearTimeout(timer);
  // 폴백: 로컬 페이크(매치 안 멈춤)
  const fb = fakeHtml(prompt, targetName);
  let i = 0;
  const step = 30;
  while (i < fb.length) {
    onChunk(fb.slice(0, i + step));
    i += step;
    await new Promise((r) => setTimeout(r, 8));
  }
  return { html: fb, mode: "fake" };
}

// SSE 스트리밍 빌드 — gpt-4o-mini/gpt-4o stream:true 재스트리밍(줄 버퍼링) + 페이크 폴백
import { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/openai";
import { fakeHtml } from "@/lib/build-engine";
import { targetById } from "@/lib/targets";

export const runtime = "nodejs";
export const maxDuration = 10; // Hobby

const KEY = process.env.OPENAI_API_KEY;
const ALLOWED = new Set(["gpt-4o-mini", "gpt-4o"]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const prompt: string = (body.prompt || "").toString().slice(0, 1200);
  const targetId: string = (body.targetId || "tailwind").toString();
  const mode: "recreate" | "free" = body.mode === "free" ? "free" : "recreate";
  const model: string = ALLOWED.has(body.model) ? body.model : "gpt-4o-mini";
  const target = targetById(targetId);
  const enc = new TextEncoder();

  // 키 없으면 페이크 스트리밍(에디터 애니메이션 유지)
  if (!KEY) {
    return fakeStream(prompt, target.name, enc);
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: true,
        max_tokens: 1300, // Hobby 10초 컷 내 완주(§A)
        temperature: 0.8,
        messages: [
          { role: "system", content: buildSystemPrompt(target.name, mode) },
          { role: "user", content: prompt || `${target.name} 스타일의 멋진 랜딩 페이지를 만들어줘.` },
        ],
      }),
    });
  } catch {
    return fakeStream(prompt, target.name, enc);
  }
  if (!upstream.ok || !upstream.body) {
    return fakeStream(prompt, target.name, enc);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = ""; // 청크 경계 SSE 줄 보존(§E1 핵심)
  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // 마지막 미완성 줄 보존
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const payload = t.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
          if (typeof delta === "string") controller.enqueue(enc.encode(delta));
        } catch {
          /* 부분 청크 무시 */
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Build-Mode": "real",
      "Cache-Control": "no-store",
    },
  });
}

/** 페이크 스트리밍 — fakeHtml을 조각내어 타이핑 느낌 */
function fakeStream(prompt: string, targetName: string, enc: TextEncoder): Response {
  const html = fakeHtml(prompt, targetName);
  const stream = new ReadableStream({
    async start(controller) {
      const step = 24;
      for (let i = 0; i < html.length; i += step) {
        controller.enqueue(enc.encode(html.slice(i, i + step)));
        await new Promise((r) => setTimeout(r, 12));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Build-Mode": "fake",
      "Cache-Control": "no-store",
    },
  });
}

// 비전 심판 — gpt-4o(렌더 이미지) 우선, 실패 시 휴리스틱 폴백
import { NextRequest, NextResponse } from "next/server";
import { realJudge } from "@/lib/openai";
import { heuristicJudge } from "@/lib/judge";
import { targetById, targetImageUrl } from "@/lib/targets";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const html: string = (body.html || "").toString();
  const prompt: string = (body.prompt || "").toString();
  const targetId: string = (body.targetId || "tailwind").toString();
  const renderDataUrl: string | null = body.renderDataUrl || null;
  const freeMode: boolean = !!body.freeMode;
  const target = targetById(targetId);

  // 렌더 이미지 + 키 있으면 gpt-4o 비전
  if (renderDataUrl && typeof renderDataUrl === "string" && renderDataUrl.startsWith("data:")) {
    const real = await realJudge({
      targetImageUrl: freeMode ? undefined : targetImageUrl(target.url),
      renderDataUrl,
      prompt,
      freeMode,
    });
    if (real) {
      return NextResponse.json({ ...real, mode: "real", judge: "gpt-4o" });
    }
  }

  // 폴백: 휴리스틱
  const h = heuristicJudge(html, prompt, freeMode);
  return NextResponse.json({ ...h, mode: "fake", judge: "heuristic" });
}

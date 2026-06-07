// 명예의전당 갤러리 — html 미리보기 + 투표 + 베스트 프롬프트
import { NextResponse } from "next/server";
import { getGallery } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getGallery(24);
  const best = items.length ? items.reduce((a, b) => (a.score >= b.score ? a : b)) : null;
  return NextResponse.json({
    items,
    best: best ? { nickname: best.nickname, prompt: best.prompt, score: best.score, target_id: best.target_id } : null,
  });
}

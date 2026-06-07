// 리더보드 GET + 제출 POST (Supabase 자동감지 → 인메모리 폴백)
import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, saveSubmission, persistenceMode } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const targetId = req.nextUrl.searchParams.get("targetId") || undefined;
  const rows = await getLeaderboard(targetId, 50);
  return NextResponse.json({ items: rows, persistence: persistenceMode() });
}

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}));
  if (!b.nickname || typeof b.score !== "number") {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const saved = await saveSubmission({
    nickname: String(b.nickname).slice(0, 24),
    target_id: String(b.target_id || "tailwind"),
    score: Math.round(b.score),
    bot_score: Math.round(b.bot_score || 0),
    difficulty: String(b.difficulty || "normal"),
    outcome: String(b.outcome || "win"),
    mode: String(b.mode || "recreate"),
    html: b.html ? String(b.html).slice(0, 20000) : undefined,
    prompt: b.prompt ? String(b.prompt).slice(0, 400) : undefined,
  });
  return NextResponse.json({ ok: true, id: saved.id, persistence: persistenceMode() });
}

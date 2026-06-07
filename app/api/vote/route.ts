// ♥ 투표(1인 1표는 클라 localStorage로 중복방지, 서버는 증가만)
import { NextRequest, NextResponse } from "next/server";
import { voteSubmission } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ ok: false }, { status: 400 });
  const votes = await voteSubmission(String(b.id));
  return NextResponse.json({ ok: true, votes });
}

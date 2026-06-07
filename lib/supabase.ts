// Supabase REST 영속(자동감지) + 인메모리 폴백. service_role은 server-only.
import "server-only";
import { memInsert, memLeaderboard, memGallery, memVote, type Submission } from "./store";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = "aca_submissions";
const enabled = !!(URL && KEY);

const h = () => ({
  apikey: KEY as string,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
});

// 테이블 존재 여부 캐시(앱 시작 시 1회 감지 — 없으면 인메모리)
let tableOk: boolean | null = null;
async function detect(): Promise<boolean> {
  if (!enabled) return false;
  if (tableOk !== null) return tableOk;
  try {
    const r = await fetch(`${URL}/rest/v1/${TABLE}?select=id&limit=1`, { headers: h(), cache: "no-store" });
    tableOk = r.ok;
  } catch {
    tableOk = false;
  }
  return tableOk;
}

export type SubmitInput = {
  nickname: string;
  target_id: string;
  score: number;
  bot_score: number;
  difficulty: string;
  outcome: string;
  mode: string;
  html?: string;
  prompt?: string;
};

export async function saveSubmission(row: SubmitInput): Promise<Submission> {
  if (await detect()) {
    try {
      const r = await fetch(`${URL}/rest/v1/${TABLE}`, {
        method: "POST",
        headers: { ...h(), Prefer: "return=representation" },
        body: JSON.stringify({ ...row, votes: 0 }),
      });
      if (r.ok) {
        const [saved] = (await r.json()) as Submission[];
        if (saved) return saved;
      }
    } catch {
      /* fallthrough → mem */
    }
  }
  return memInsert(row);
}

export async function getLeaderboard(targetId?: string, limit = 50): Promise<Submission[]> {
  if (await detect()) {
    try {
      const q = new URLSearchParams({
        select: "id,nickname,target_id,score,bot_score,difficulty,outcome,mode,votes,created_at",
        order: "score.desc",
        limit: String(limit),
      });
      if (targetId) q.set("target_id", `eq.${targetId}`);
      const r = await fetch(`${URL}/rest/v1/${TABLE}?${q}`, { headers: h(), cache: "no-store" });
      if (r.ok) return (await r.json()) as Submission[];
    } catch {
      /* fallthrough */
    }
  }
  return memLeaderboard(targetId, limit);
}

export async function getGallery(limit = 24): Promise<Submission[]> {
  // html 컬럼은 Supabase 스키마에 없을 수 있어 갤러리는 인메모리 best-effort 우선
  const mem = memGallery(limit);
  if (mem.length > 0) return mem;
  return [];
}

export async function voteSubmission(id: string): Promise<number> {
  if (await detect()) {
    try {
      // 현재 votes 읽고 +1 (낙관적)
      const g = await fetch(`${URL}/rest/v1/${TABLE}?id=eq.${id}&select=votes`, { headers: h(), cache: "no-store" });
      if (g.ok) {
        const [row] = (await g.json()) as { votes: number }[];
        const next = (row?.votes ?? 0) + 1;
        await fetch(`${URL}/rest/v1/${TABLE}?id=eq.${id}`, {
          method: "PATCH",
          headers: { ...h(), Prefer: "return=minimal" },
          body: JSON.stringify({ votes: next }),
        });
        return next;
      }
    } catch {
      /* fallthrough */
    }
  }
  return memVote(id);
}

export function persistenceMode(): "supabase" | "memory" {
  return tableOk ? "supabase" : "memory";
}

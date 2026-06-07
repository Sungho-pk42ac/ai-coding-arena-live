// 인메모리 폴백 스토어(globalThis) — Supabase 미가용 시 데모 유지용
// ⚠️ 서버리스 멀티인스턴스에선 인스턴스별로 휘발될 수 있음(그래서 Supabase 우선)

export type Submission = {
  id: string;
  nickname: string;
  target_id: string;
  score: number;
  bot_score: number;
  difficulty: string;
  outcome: string; // win | lose
  mode: string; // recreate | free
  html?: string; // 갤러리 미리보기(srcDoc)
  prompt?: string;
  votes: number;
  created_at: string;
};

type Store = { rows: Submission[] };

const g = globalThis as unknown as { __aca?: Store };
if (!g.__aca) g.__aca = { rows: seed() };
const store = g.__aca;

let counter = 0;
export function genId(): string {
  counter += 1;
  return `m_${Date.now().toString(36)}_${counter}`;
}

export function memInsert(row: Omit<Submission, "id" | "votes" | "created_at"> & { id?: string }): Submission {
  const full: Submission = {
    id: row.id ?? genId(),
    votes: 0,
    created_at: new Date().toISOString(),
    ...row,
  };
  store.rows.unshift(full);
  if (store.rows.length > 500) store.rows.length = 500;
  return full;
}

export function memLeaderboard(targetId?: string, limit = 50): Submission[] {
  let rows = store.rows;
  if (targetId) rows = rows.filter((r) => r.target_id === targetId);
  return [...rows].sort((a, b) => b.score - a.score).slice(0, limit);
}

export function memGallery(limit = 24): Submission[] {
  return [...store.rows]
    .filter((r) => r.html)
    .sort((a, b) => b.score + b.votes * 5 - (a.score + a.votes * 5))
    .slice(0, limit);
}

export function memVote(id: string): number {
  const r = store.rows.find((x) => x.id === id);
  if (!r) return 0;
  r.votes += 1;
  return r.votes;
}

/** 상시 시드(빈 화면 금지 — §15 데모 철벽화) */
function seed(): Submission[] {
  const now = Date.now();
  const base = [
    { nickname: "전설의프롬프터4271", target_id: "tailwind", score: 94, bot_score: 88, difficulty: "hard", mode: "recreate", prompt: "Tailwind 공식 느낌, 청록 그라데이션 히어로와 코드 블록" },
    { nickname: "불꽃빌더8123", target_id: "svelte", score: 89, bot_score: 84, difficulty: "hard", mode: "recreate", prompt: "Svelte 오렌지 액센트, 큰 헤드라인" },
    { nickname: "고요한위자드3902", target_id: "supabase", score: 86, bot_score: 70, difficulty: "normal", mode: "recreate", prompt: "Supabase 다크 그린, 대시보드 미리보기" },
    { nickname: "강철해커5510", target_id: "react", score: 81, bot_score: 67, difficulty: "normal", mode: "free", prompt: "개발자 도구 랜딩, 코드 스니펫 강조" },
    { nickname: "번개루키2048", target_id: "astro", score: 77, bot_score: 55, difficulty: "easy", mode: "recreate", prompt: "Astro 보라-주황 그라데이션, 카드 3개" },
    { nickname: "황금닌자6677", target_id: "bun", score: 72, bot_score: 50, difficulty: "easy", mode: "free", prompt: "크림 배경 미니멀 런타임 소개" },
  ];
  return base.map((b, i) => ({
    id: `seed_${i}`,
    votes: [12, 9, 7, 5, 3, 2][i] ?? 1,
    created_at: new Date(now - i * 3600_000).toISOString(),
    outcome: b.score > b.bot_score ? "win" : "lose",
    html: seedHtml(b.nickname, b.prompt),
    ...b,
  }));
}

function seedHtml(name: string, prompt: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;font-family:Pretendard,sans-serif}.h{background:linear-gradient(135deg,#7c3aed,#b22222);color:#fff;padding:48px 24px;text-align:center}.h h1{font-size:28px;font-weight:800}.b{display:inline-block;margin-top:16px;background:#eab308;color:#111;padding:10px 22px;border-radius:99px;font-weight:700}</style></head><body><div class="h"><h1>${name}의 작품</h1><p style="margin-top:8px;opacity:.9">${prompt.slice(0, 40)}</p><span class="b">미리보기</span></div></body></html>`;
}

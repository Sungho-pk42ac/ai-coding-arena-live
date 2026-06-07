"use client";
// 글로벌 랭킹 + 명예의전당 갤러리(srcDoc 미리보기) + ♥투표(1인1표 localStorage) + 베스트 프롬프트
import { useEffect, useState } from "react";
import { TARGETS, targetById } from "@/lib/targets";
import { gradeOf } from "@/lib/grade";

type Row = {
  id: string; nickname: string; target_id: string; score: number; bot_score: number;
  difficulty: string; outcome: string; mode?: string; votes: number; created_at: string; html?: string; prompt?: string;
};

export default function VoteGallery() {
  const [rows, setRows] = useState<Row[]>([]);
  const [gallery, setGallery] = useState<Row[]>([]);
  const [best, setBest] = useState<{ nickname: string; prompt?: string; score: number; target_id: string } | null>(null);
  const [persistence, setPersistence] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const load = async (targetId?: string) => {
    setLoading(true);
    try {
      const [lb, gal] = await Promise.all([
        fetch(`/api/submission${targetId && targetId !== "all" ? `?targetId=${targetId}` : ""}`, { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/gallery", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setRows(lb.items || []);
      setPersistence(lb.persistence || "");
      setGallery(gal.items || []);
      setBest(gal.best || null);
    } catch {
      /* noop */
    }
    setLoading(false);
  };

  useEffect(() => {
    setVoted(JSON.parse(localStorage.getItem("aca_voted") || "{}"));
    void load();
  }, []);

  const vote = async (id: string) => {
    if (voted[id]) return;
    const next = { ...voted, [id]: true };
    setVoted(next);
    localStorage.setItem("aca_voted", JSON.stringify(next));
    setGallery((g) => g.map((r) => (r.id === id ? { ...r, votes: r.votes + 1 } : r)));
    try {
      await fetch("/api/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    } catch {
      /* optimistic */
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">명예의 전당 · 랭킹</h1>
      <p className="mt-2 text-mute">
        영속: <span className="font-semibold text-ink">{persistence === "supabase" ? "Supabase(교차 인스턴스)" : "인메모리(폴백)"}</span>
      </p>

      {/* 베스트 프롬프트 */}
      {best && (
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5 ambient-sm">
          <div className="text-xs font-semibold uppercase tracking-widest text-red">🏅 베스트 프롬프트</div>
          <div className="mt-2 text-lg font-bold">{best.nickname} · {targetById(best.target_id).name} · {best.score}점</div>
          {best.prompt && <p className="mt-1 text-mute">“{best.prompt}”</p>}
        </div>
      )}

      {/* 명예의전당 갤러리 */}
      <h2 className="mt-10 text-2xl font-bold">명예의 전당 갤러리</h2>
      <p className="text-sm text-mute">점수 + ♥투표 합산 순. 마음에 들면 ♥를 눌러주세요(1인 1표).</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((r) => {
          const g = gradeOf(r.score);
          return (
            <div key={r.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white ambient-sm">
              <iframe title={r.id} sandbox="allow-scripts allow-same-origin" srcDoc={r.html || ""} className="h-44 w-full border-b border-black/10 bg-white" />
              <div className="flex items-center justify-between p-3">
                <div>
                  <div className="font-bold">{r.nickname}</div>
                  <div className="text-xs text-mute">{targetById(r.target_id).name} · <span style={{ color: g.color }}>{g.grade}</span> {r.score}점</div>
                </div>
                <button
                  onClick={() => vote(r.id)}
                  disabled={!!voted[r.id]}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold ease-spring transition hover:scale-[1.05] ${voted[r.id] ? "bg-red/10 text-red" : "border border-black/15 hover:border-red"}`}
                >
                  {voted[r.id] ? "❤️" : "🤍"} {r.votes}
                </button>
              </div>
            </div>
          );
        })}
        {gallery.length === 0 && !loading && <p className="text-mute">아직 작품이 없어요. 첫 작품의 주인공이 되어보세요!</p>}
      </div>

      {/* 글로벌 랭킹 */}
      <div className="mt-12 flex flex-wrap items-center gap-2">
        <h2 className="mr-2 text-2xl font-bold">글로벌 랭킹</h2>
        <button onClick={() => { setFilter("all"); void load("all"); }} className={`rounded-full px-3 py-1 text-sm ${filter === "all" ? "bg-red text-cream" : "border border-black/15"}`}>전체</button>
        {TARGETS.slice(0, 6).map((t) => (
          <button key={t.id} onClick={() => { setFilter(t.id); void load(t.id); }} className={`rounded-full px-3 py-1 text-sm ${filter === t.id ? "bg-red text-cream" : "border border-black/15"}`}>{t.name}</button>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white ambient-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-mute">
            <tr>
              <th className="px-4 py-3">#</th><th className="px-4 py-3">닉네임</th><th className="px-4 py-3">타깃</th>
              <th className="px-4 py-3 text-right">점수</th><th className="hidden px-4 py-3 text-right sm:table-cell">봇</th><th className="px-4 py-3">결과</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-bold tabular-nums">{i + 1}</td>
                <td className="px-4 py-3 font-semibold">{r.nickname}</td>
                <td className="px-4 py-3">{targetById(r.target_id).name}</td>
                <td className="px-4 py-3 text-right font-bold tabular-nums">{r.score}</td>
                <td className="hidden px-4 py-3 text-right tabular-nums text-mute sm:table-cell">{r.bot_score}</td>
                <td className="px-4 py-3">{r.outcome === "win" ? "🏆" : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (<tr><td colSpan={6} className="px-4 py-8 text-center text-mute">{loading ? "불러오는 중…" : "기록이 없어요."}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

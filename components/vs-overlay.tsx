"use client";
// VS 풀스크린 연출 — intro(FIGHT!) / result(승패 + 점수 페이스오프 + 등급)
import { useEffect } from "react";
import { DiffMeta } from "@/lib/mode";
import { gradeOf } from "@/lib/grade";
import { CountUp } from "./celebrate";

export default function VsOverlay({
  mode,
  diff,
  nick,
  myScore,
  botScore,
  won,
  onDismiss,
}: {
  mode: "intro" | "result";
  diff: DiffMeta;
  nick: string;
  myScore?: number;
  botScore?: number;
  won?: boolean;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, mode === "intro" ? 1900 : 4200);
    return () => clearTimeout(t);
  }, [mode, onDismiss]);

  const g = gradeOf(myScore ?? 0);

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/92 text-cream backdrop-blur-sm"
    >
      {mode === "intro" ? (
        <div className="reveal flex flex-col items-center gap-8 text-center">
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center">
              <div className="text-7xl">🧑‍💻</div>
              <div className="mt-2 text-xl font-bold">{nick}</div>
            </div>
            <div className="text-6xl font-black text-red">VS</div>
            <div className="flex flex-col items-center">
              <div className="text-7xl">{diff.char}</div>
              <div className="mt-2 text-xl font-bold">{diff.charName}</div>
            </div>
          </div>
          <div className="text-8xl font-black tracking-tight text-red">⚔️ FIGHT!</div>
          <div className="text-cream/60">{diff.label} · {diff.seconds}초</div>
        </div>
      ) : (
        <div className="reveal flex w-full max-w-3xl flex-col items-center gap-8 px-6 text-center">
          <div className="text-6xl font-black tracking-tight">
            {won ? <span className="text-red">🏆 승리!</span> : <span className="text-cream/70">😢 패배</span>}
          </div>
          <div className="flex w-full items-end justify-center gap-12">
            <div className="flex flex-col items-center">
              <div className="text-sm text-cream/50">{nick}</div>
              <div className="text-7xl font-black tabular-nums">
                <CountUp to={myScore ?? 0} />
              </div>
              {won && <div className="mt-1 text-2xl">👑</div>}
            </div>
            <div className="pb-6 text-3xl text-cream/40">vs</div>
            <div className="flex flex-col items-center">
              <div className="text-sm text-cream/50">{diff.char} {diff.charName}</div>
              <div className="text-5xl font-bold tabular-nums text-cream/60">
                <CountUp to={botScore ?? 0} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl font-black text-cream"
              style={{ background: g.color }}
            >
              {g.grade}
            </span>
            <span className="text-cream/60">{g.label} 등급</span>
          </div>
          <button className="mt-2 rounded-full bg-cream px-7 py-3 font-bold text-ink ease-spring transition hover:scale-[1.03]">
            계속하기 →
          </button>
        </div>
      )}
    </div>
  );
}

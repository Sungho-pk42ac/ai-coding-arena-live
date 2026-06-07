"use client";
// 게임 루프 핵심 — 선택 → VS인트로 → 타임드 무제한 재빌드(봇 독립빌드 1회) → 제출 → 비전심판 → 승부 → 영속
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DIFF_LIST, DIFFICULTIES, Difficulty, GameMode } from "@/lib/mode";
import { TARGETS, Target, pickTarget } from "@/lib/targets";
import { botPrompt, botScore } from "@/lib/bot";
import { fakeBotHtml } from "@/lib/build-engine";
import { heuristicJudge, type Rubric } from "@/lib/judge";
import { matchXp, progressFromXp } from "@/lib/progress";
import { gradeOf } from "@/lib/grade";
import { randomNickname } from "@/lib/nickname";
import { casterLine, trashLine } from "@/lib/caster";
import { streamReal } from "./stream-client";
import CodeEditor from "./code-editor";
import TargetFrame from "./target-frame";
import VsOverlay from "./vs-overlay";
import { Confetti, CountUp, playWin } from "./celebrate";

type Phase = "select" | "fighting" | "done";
const PROMPT_CHIPS = [
  "보라 그라데이션 히어로, 노란 버튼, 카드 3개",
  "다크 개발자 도구 랜딩, 코드 블록 강조",
  "미니멀 SaaS, 큰 헤드라인 + 통계 숫자",
  "친근한 일러스트 온보딩 + 가격표",
];

export default function BotArena() {
  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<GameMode>("recreate");
  const [diff, setDiff] = useState<Difficulty>("normal");
  const [target, setTarget] = useState<Target>(TARGETS[1]);
  const [forceShot, setForceShot] = useState(false);
  const [muted, setMuted] = useState(false);

  const [nick, setNick] = useState("도전자");
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  // 빌드 상태
  const [prompt, setPrompt] = useState("");
  const [myCode, setMyCode] = useState("");
  const [myHtml, setMyHtml] = useState("");
  const [myMode, setMyMode] = useState<"real" | "fake">("fake");
  const [streaming, setStreaming] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const [estScore, setEstScore] = useState<number | null>(null);

  // 봇 상태
  const [botCode, setBotCode] = useState("");
  const [botHtml, setBotHtml] = useState("");
  const [botMode, setBotMode] = useState<"real" | "fake">("fake");
  const [botReady, setBotReady] = useState(false);
  const [botBubble, setBotBubble] = useState("");
  const [caster, setCaster] = useState("");

  // 결과
  const [timeLeft, setTimeLeft] = useState(0);
  const [overlay, setOverlay] = useState<null | "intro" | "result">(null);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [finalMy, setFinalMy] = useState<number | null>(null);
  const [finalBot, setFinalBot] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [judging, setJudging] = useState(false);
  const [noBuild, setNoBuild] = useState(false);

  const myIframe = useRef<HTMLIFrameElement>(null);
  const submittedRef = useRef(false);
  const seedRef = useRef(1);
  const diffMeta = DIFFICULTIES[diff];

  // 클라 마운트 후에만 랜덤/로컬 로드(하이드레이션 안전)
  useEffect(() => {
    setNick(localStorage.getItem("aca_nick") || randomNickname());
    setXp(Number(localStorage.getItem("aca_xp") || 0));
    setStreak(Number(localStorage.getItem("aca_streak") || 0));
    setMuted(localStorage.getItem("aca_muted") === "1");
  }, []);

  const prog = useMemo(() => progressFromXp(xp), [xp]);

  // 타이머
  useEffect(() => {
    if (phase !== "fighting" || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  // 타임아웃 자동 제출
  useEffect(() => {
    if (phase === "fighting" && timeLeft === 0 && !submittedRef.current && botReady) {
      void submitMatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, botReady]);

  // 캐스터 순환(빌드 중)
  useEffect(() => {
    if (phase !== "fighting") return;
    const t = setInterval(() => {
      setCaster(casterLine(streaming ? "building" : "start", Date.now()));
    }, 3500);
    return () => clearInterval(t);
  }, [phase, streaming]);

  const persistLocal = (nextXp: number, nextStreak: number) => {
    localStorage.setItem("aca_xp", String(nextXp));
    localStorage.setItem("aca_streak", String(nextStreak));
    localStorage.setItem("aca_nick", nick);
  };

  // 봇 독립 빌드(매치 시작 시 1회)
  const buildBot = useCallback(
    async (t: Target, d: Difficulty, m: GameMode, seed: number) => {
      setBotReady(false);
      setBotCode("");
      setBotBubble(trashLine("build", seed));
      const bm = DIFFICULTIES[d].botModel;
      if (bm === "fake") {
        const html = fakeBotHtml(t.name, seed);
        // 타이핑 흉내
        for (let i = 0; i < html.length; i += 40) {
          setBotCode(html.slice(0, i + 40));
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 6));
        }
        setBotHtml(html);
        setBotMode("fake");
      } else {
        const res = await streamReal(botPrompt(m, t, seed), t.id, t.name, m, (acc) => setBotCode(acc), bm, 28000);
        setBotHtml(res.html);
        setBotMode(res.mode);
      }
      setBotReady(true);
    },
    []
  );

  const startMatch = (opts?: { quick?: boolean }) => {
    submittedRef.current = false;
    const seed = (seedRef.current = (seedRef.current * 7 + Date.now()) % 99991);
    const t = target;
    setMyCode("");
    setMyHtml("");
    setEstScore(null);
    setEditCount(0);
    setRubric(null);
    setFinalMy(null);
    setFinalBot(null);
    setConfetti(false);
    setNoBuild(false);
    setPrompt(opts?.quick ? "크림 배경 미니멀 히어로, 빨강 버튼 1개, 카드 3개" : prompt);
    setTimeLeft(opts?.quick ? 30 : diffMeta.seconds);
    setPhase("fighting");
    setOverlay("intro");
    setCaster(casterLine("start", seed));
    void buildBot(t, diff, mode, seed);
    if (opts?.quick) {
      // 빠른 데모: 인트로 후 자동 1회 빌드
      setTimeout(() => void buildMine("크림 배경 미니멀 히어로, 빨강 버튼 1개, 카드 3개"), 2100);
    }
  };

  const buildMine = async (override?: string) => {
    const p = (override ?? prompt).trim();
    if (p.length < 5) {
      setCaster("🎙️ 프롬프트를 5자 이상 입력해 주세요!");
      return;
    }
    setStreaming(true);
    setEditCount((c) => c + 1);
    setMyCode("");
    const res = await streamReal(p, target.id, target.name, mode, (acc) => setMyCode(acc), undefined, 30000);
    setMyHtml(res.html);
    setMyMode(res.mode);
    setStreaming(false);
    // 라이브 추정 점수(휴리스틱)
    setEstScore(heuristicJudge(res.html, p, mode === "free").score);
  };

  const submitMatch = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    // 빈 빌드(시간 종료까지 한 번도 안 빌드) → 리더보드 오염 방지, 친절 종료
    if (!myHtml || myHtml.length < 50) {
      setOverlay(null);
      setPhase("done");
      setNoBuild(true);
      setCaster("🎙️ 시간 종료! 이번엔 빌드를 못 하셨네요. 다음 판엔 더 빨리 빌드해보세요!");
      return;
    }
    setJudging(true);
    setCaster(casterLine("submit", Date.now()));
    setOverlay(null);

    // 렌더 대기 후 캡처
    await new Promise((r) => setTimeout(r, 700));
    let renderDataUrl: string | null = null;
    try {
      const doc = myIframe.current?.contentDocument;
      if (doc?.body) {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(doc.body, { logging: false, backgroundColor: "#ffffff", useCORS: true });
        renderDataUrl = canvas.toDataURL("image/jpeg", 0.6);
      }
    } catch {
      /* 캡처 실패 → 휴리스틱 */
    }

    let myScore = estScore ?? heuristicJudge(myHtml, prompt, mode === "free").score;
    let rb: Rubric | null = null;
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: myHtml, prompt, targetId: target.id, renderDataUrl, freeMode: mode === "free" }),
      });
      const j = await res.json();
      if (typeof j.score === "number") {
        myScore = j.score;
        rb = j;
      }
    } catch {
      rb = heuristicJudge(myHtml, prompt, mode === "free");
      myScore = rb.score;
    }

    const bot = botScore(diff, seedRef.current);
    const isWin = myScore > bot;
    setFinalMy(myScore);
    setFinalBot(bot);
    setRubric(rb);
    setWon(isWin);
    setJudging(false);
    setPhase("done");
    setOverlay("result");
    setBotBubble(trashLine(isWin ? "lose" : "win", seedRef.current));
    setCaster(casterLine(isWin ? "win" : "lose", Date.now()));

    if (isWin) {
      setConfetti(true);
      playWin(muted);
      setTimeout(() => setConfetti(false), 2600);
    }

    // XP/연승 + 영속
    const nextXp = xp + matchXp(myScore, isWin, diff);
    const nextStreak = isWin ? streak + 1 : 0;
    setXp(nextXp);
    setStreak(nextStreak);
    persistLocal(nextXp, nextStreak);

    void fetch("/api/submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: nick,
        target_id: target.id,
        score: myScore,
        bot_score: bot,
        difficulty: diff,
        outcome: isWin ? "win" : "lose",
        mode,
        html: myHtml,
        prompt,
      }),
    }).catch(() => {});
  };

  const retryWithCoaching = () => {
    if (rubric?.coach) setPrompt((p) => `${p} (개선: ${rubric.coach})`);
    setPhase("select");
    setOverlay(null);
  };

  const shareUrl = useMemo(() => {
    const g = gradeOf(finalMy ?? 0).grade;
    const q = new URLSearchParams({
      nick,
      score: String(finalMy ?? 0),
      bot: String(finalBot ?? 0),
      grade: g,
      outcome: won ? "win" : "lose",
    });
    return `/api/og?${q.toString()}`;
  }, [nick, finalMy, finalBot, won]);

  // ===== 선택 화면 =====
  if (phase === "select") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <RankBar prog={prog} streak={streak} nick={nick} setNick={setNick} muted={muted} setMuted={(v) => { setMuted(v); localStorage.setItem("aca_muted", v ? "1" : "0"); }} />
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-5xl">대전 준비</h1>
        <p className="mt-2 text-mute">모드와 난이도를 고르면 — 어려울수록 봇이 진짜 더 잘 만듭니다.</p>

        {/* 모드 */}
        <div className="mt-8">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-red">모드</div>
          <div className="grid grid-cols-2 gap-3">
            {(["recreate", "free"] as GameMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-2xl border p-4 text-left ease-spring transition hover:scale-[1.01] ${mode === m ? "border-red bg-red/5 ambient-sm" : "border-black/10 bg-white"}`}
              >
                <div className="text-lg font-bold">{m === "recreate" ? "🎯 타깃 재현" : "🎨 자유 창작"}</div>
                <div className="mt-1 text-sm text-mute">{m === "recreate" ? "실제 사이트를 따라 만들고 유사도로 채점" : "타깃 없이 창의성으로 채점"}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 난이도 */}
        <div className="mt-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-red">난이도 = 제한시간 · 봇 실력</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {DIFF_LIST.map((d) => (
              <button
                key={d.id}
                onClick={() => setDiff(d.id)}
                className={`rounded-2xl border p-4 text-left ease-spring transition hover:scale-[1.01] ${diff === d.id ? "border-red bg-red/5 ambient-sm" : "border-black/10 bg-white"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{d.char} {d.label}</span>
                  <span className="text-sm tabular-nums text-mute">{d.seconds}초</span>
                </div>
                <div className="mt-1 text-sm text-mute">{d.charName} · {d.botModel === "fake" ? "안정 봇" : `실 ${d.botModel}`}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 타깃 선택 */}
        {mode === "recreate" && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-red">타깃 (랜덤 배정 · 변경 가능)</span>
              <label className="flex items-center gap-2 text-sm text-mute">
                <input type="checkbox" checked={forceShot} onChange={(e) => setForceShot(e.target.checked)} /> 🖼️ 스크린샷으로
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {TARGETS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTarget(t)}
                  className={`rounded-full border px-3 py-1.5 text-sm ease-spring transition ${target.id === t.id ? "border-red bg-red text-cream" : "border-black/15 bg-white hover:border-red"}`}
                >
                  {t.name}
                </button>
              ))}
              <button onClick={() => setTarget(pickTarget())} className="rounded-full border border-black/15 bg-white px-3 py-1.5 text-sm hover:border-red">🎲 랜덤</button>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={() => startMatch()} className="rounded-full bg-red px-8 py-4 text-lg font-bold text-cream ease-spring transition hover:scale-[1.02] ambient">
            대결 시작 ⚔️
          </button>
          <button onClick={() => startMatch({ quick: true })} className="rounded-full border border-black/15 bg-white px-6 py-4 font-semibold ease-spring transition hover:border-red">
            ⚡ 빠른 데모 매치
          </button>
        </div>
      </div>
    );
  }

  // ===== 아레나 (트리틱) =====
  const previewSrc = myHtml || "<!doctype html><body style='font-family:Pretendard,sans-serif;display:grid;place-items:center;height:100vh;color:#6b6359'>프롬프트로 빌드하면 여기에 결과가 나타납니다</body>";
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
      <Confetti fire={confetti} />
      {overlay && (
        <VsOverlay
          mode={overlay}
          diff={diffMeta}
          nick={nick}
          myScore={finalMy ?? undefined}
          botScore={finalBot ?? undefined}
          won={won}
          onDismiss={() => setOverlay(null)}
        />
      )}

      {/* 상단바 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <RankBar prog={prog} streak={streak} nick={nick} setNick={setNick} compact muted={muted} setMuted={(v) => { setMuted(v); localStorage.setItem("aca_muted", v ? "1" : "0"); }} />
        <div className="flex items-center gap-3">
          <div className={`rounded-full px-4 py-2 text-lg font-bold tabular-nums ${timeLeft <= 10 ? "bg-red text-cream" : "bg-white text-ink ambient-sm"}`}>
            ⏱ {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
          {phase === "fighting" && (
            <button onClick={() => void submitMatch()} className="rounded-full bg-ink px-5 py-2 font-semibold text-cream ease-spring transition hover:scale-[1.03]">
              지금 제출
            </button>
          )}
        </div>
      </div>

      {/* 캐스터 */}
      <div className="mt-3 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-ink/80 ambient-sm">{caster || "🎙️ 중계 준비 중…"}</div>

      {/* 트리틱: 타깃 | 나 | 봇 */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_1fr_1fr]" style={{ minHeight: 460 }}>
        {/* 타깃 */}
        <div className="min-h-[360px] md:min-h-0">
          {mode === "recreate" ? (
            <TargetFrame target={target} forceShot={forceShot} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-black/10 bg-paper p-8 text-center ambient-sm">
              <div>
                <div className="text-4xl">🎨</div>
                <div className="mt-2 text-xl font-bold">자유 창작</div>
                <div className="mt-1 text-sm text-mute">타깃 없이 당신의 창의성으로 승부</div>
              </div>
            </div>
          )}
        </div>

        {/* 나 */}
        <div className="flex min-h-[360px] flex-col gap-2 md:min-h-0">
          <Panel title={`🧑‍💻 나`} badge={myMode === "real" ? "실 AI 생성" : "페이크"} badgeReal={myMode === "real"} est={estScore} />
          <div className="grid flex-1 grid-rows-2 gap-2">
            <CodeEditor code={myCode} streaming={streaming} />
            <iframe
              ref={myIframe}
              title="my-preview"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={previewSrc}
              className="w-full rounded-xl border border-black/10 bg-white ambient-sm"
            />
          </div>
        </div>

        {/* 봇 */}
        <div className="relative flex min-h-[360px] flex-col gap-2 md:min-h-0">
          <Panel title={`${diffMeta.char} ${diffMeta.charName}`} badge={botReady ? (botMode === "real" ? "실 AI 생성" : "페이크") : "빌드 중…"} badgeReal={botMode === "real" && botReady} />
          {botBubble && (
            <div className="absolute right-2 top-12 z-10 max-w-[180px] rounded-2xl rounded-tr-sm bg-ink px-3 py-2 text-xs text-cream ambient-sm">
              {botBubble}
            </div>
          )}
          <div className="grid flex-1 grid-rows-2 gap-2">
            <CodeEditor code={botCode} streaming={!botReady} label="bot.html" />
            <iframe
              title="bot-preview"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={botHtml || "<!doctype html><body style='font-family:sans-serif;display:grid;place-items:center;height:100vh;color:#6b6359'>봇이 빌드 중…</body>"}
              className="w-full rounded-xl border border-black/10 bg-white ambient-sm"
            />
          </div>
        </div>
      </div>

      {/* 프롬프트 입력 */}
      {phase === "fighting" && (
        <div className="mt-4">
          <div className="mb-2 flex flex-wrap gap-2">
            {PROMPT_CHIPS.map((c) => (
              <button key={c} onClick={() => setPrompt(c)} className="rounded-full border border-black/15 bg-white px-3 py-1 text-xs text-mute hover:border-red">{c}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !streaming) void buildMine(); }}
              placeholder="예: 보라 그라데이션 히어로, 노란 버튼, 카드 3개 (5자 이상)"
              className="flex-1 rounded-full border border-black/15 bg-white px-5 py-3 outline-none focus:border-red"
            />
            <button
              onClick={() => void buildMine()}
              disabled={streaming}
              className="rounded-full bg-red px-7 py-3 font-bold text-cream ease-spring transition hover:scale-[1.02] disabled:opacity-50"
            >
              {streaming ? "빌드 중…" : `빌드 (${editCount}회)`}
            </button>
          </div>
        </div>
      )}

      {/* 시간 종료 · 빌드 미완료(리더보드 미기록) */}
      {phase === "done" && noBuild && (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-8 text-center ambient">
          <div className="text-4xl">⏱️</div>
          <div className="text-xl font-bold">시간 종료 — 이번엔 빌드를 못 하셨어요</div>
          <div className="text-sm text-mute">프롬프트를 입력하고 빌드해야 채점됩니다. 리더보드에는 기록되지 않았어요.</div>
          <button onClick={() => { setPhase("select"); setOverlay(null); }} className="mt-2 rounded-full bg-red px-6 py-3 font-bold text-cream ease-spring transition hover:scale-[1.03]">다시 도전 →</button>
        </div>
      )}

      {/* 결과 패널 */}
      {phase === "done" && rubric && (
        <ResultPanel
          rubric={rubric}
          myScore={finalMy ?? 0}
          botScore={finalBot ?? 0}
          won={won}
          shareUrl={shareUrl}
          onRetry={retryWithCoaching}
          onNew={() => { setPhase("select"); setOverlay(null); }}
        />
      )}

      {judging && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/70 text-cream">
          <div className="text-center">
            <div className="text-2xl font-bold">🔍 gpt-4o 비전 심판 채점 중…</div>
            <div className="mt-2 text-cream/60">결과를 캡처해 분석하고 있어요</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 보조 컴포넌트 =====
function RankBar({ prog, streak, nick, setNick, compact, muted, setMuted }: { prog: ReturnType<typeof progressFromXp>; streak: number; nick: string; setNick: (s: string) => void; compact?: boolean; muted: boolean; setMuted: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-cream" style={{ background: prog.rank.color }}>
        {prog.rank.emoji} {prog.rank.name} Lv.{prog.level}
      </span>
      {!compact && (
        <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-black/10 sm:block">
          <div className="h-full bg-red ease-spring transition-all" style={{ width: `${Math.round(prog.progress * 100)}%` }} />
        </div>
      )}
      {streak > 0 && <span className="rounded-full bg-red/10 px-2.5 py-1 text-sm font-bold text-red">🔥 {streak}연승</span>}
      <input
        value={nick}
        onChange={(e) => setNick(e.target.value.slice(0, 24))}
        className="w-28 rounded-full border border-black/10 bg-white px-3 py-1 text-sm outline-none focus:border-red"
        aria-label="닉네임"
      />
      <button onClick={() => setMuted(!muted)} className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-sm" aria-label="음소거 토글">
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}

function Panel({ title, badge, badgeReal, est }: { title: string; badge: string; badgeReal?: boolean; est?: number | null }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-2 ambient-sm">
      <span className="font-bold">{title}</span>
      <div className="flex items-center gap-2">
        {est != null && <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-semibold">예상 {est}</span>}
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeReal ? "bg-[#3ecf8e]/20 text-[#0f8a5f]" : "bg-mute/15 text-mute"}`}>
          {badgeReal ? "✅ " : ""}{badge}
        </span>
      </div>
    </div>
  );
}

function ResultPanel({ rubric, myScore, botScore, won, shareUrl, onRetry, onNew }: { rubric: Rubric; myScore: number; botScore: number; won: boolean; shareUrl: string; onRetry: () => void; onNew: () => void }) {
  const g = gradeOf(myScore);
  return (
    <div className="mt-5 grid gap-4 rounded-2xl border border-black/10 bg-white p-5 ambient sm:grid-cols-[auto_1fr]">
      <div className="flex items-center gap-4">
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl text-5xl font-black text-cream" style={{ background: g.color }}>{g.grade}</span>
        <div>
          <div className="text-3xl font-black tabular-nums"><CountUp to={myScore} /> <span className="text-lg text-mute">vs 봇 {botScore}</span></div>
          <div className={`text-sm font-bold ${won ? "text-red" : "text-mute"}`}>{won ? "🏆 봇 격파!" : "😢 패배 — 재도전!"}</div>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {([["레이아웃", rubric.layout], ["색", rubric.color], ["타이포", rubric.typography]] as const).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-cream px-2 py-3">
              <div className="text-xs text-mute">{k}</div>
              <div className="text-xl font-bold tabular-nums">{v}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm"><b>심판평:</b> {rubric.comment}</p>
        <p className="mt-1 text-sm text-red"><b>💡 코칭:</b> {rubric.coach}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onRetry} className="rounded-full bg-red px-5 py-2.5 font-bold text-cream ease-spring transition hover:scale-[1.03]">🔁 코칭대로 재도전</button>
          <button onClick={onNew} className="rounded-full border border-black/15 px-5 py-2.5 font-semibold hover:border-red">새 대결</button>
          <a href={shareUrl} target="_blank" rel="noreferrer" className="rounded-full border border-black/15 px-5 py-2.5 font-semibold hover:border-red">📤 결과 카드 공유</a>
          <a href="/leaderboard" className="rounded-full border border-black/15 px-5 py-2.5 font-semibold hover:border-red">🏆 리더보드</a>
        </div>
      </div>
    </div>
  );
}

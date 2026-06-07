// 피칭 직전 프리플라이트(§15 데모 철벽화) — 키·배포·라우트·실모드·OG 확인.
// 사용: node scripts/preflight.mjs [baseUrl]
const base = (process.argv[2] || "https://ai-coding-arena-live.vercel.app").replace(/\/$/, "");
let fail = 0;
const ok = (c, m) => { console.log(`${c ? "✅" : "❌"} ${m}`); if (!c) fail++; };

// 1) 핵심 라우트 200
for (const p of ["/", "/play", "/leaderboard", "/api/submission", "/api/gallery"]) {
  try {
    const r = await fetch(base + p);
    ok(r.ok, `${p} → ${r.status}`);
  } catch (e) { ok(false, `${p} ERROR ${e.message}`); }
}

// 2) 실모드 빌드 헤더
try {
  const r = await fetch(base + "/api/build/stream", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "프리플라이트 히어로 카드 3개", targetId: "tailwind", mode: "recreate" }),
  });
  const mode = r.headers.get("x-build-mode");
  ok(mode === "real", `build 실모드 X-Build-Mode=${mode}`);
  const txt = await r.text();
  ok(/<(div|section|h1|body)/i.test(txt), `build 본문에 실제 HTML 토큰 (${txt.length}자)`);
} catch (e) { ok(false, `build/stream ERROR ${e.message}`); }

// 3) OG 공유카드
try {
  const r = await fetch(base + "/api/og?nick=preflight&score=88&bot=70&grade=A&outcome=win");
  ok(r.ok && (r.headers.get("content-type") || "").includes("image"), `OG 카드 → ${r.status} ${r.headers.get("content-type")}`);
} catch (e) { ok(false, `OG ERROR ${e.message}`); }

console.log(fail === 0 ? "\n🟢 PREFLIGHT PASS — 데모 준비 완료" : `\n🔴 PREFLIGHT FAIL (${fail})`);
process.exit(fail === 0 ? 0 : 1);

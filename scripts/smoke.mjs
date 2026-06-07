// 라이트 스모크(§B-1) — 라우트 200 + 시그니처 문자열 단언. 사용: node scripts/smoke.mjs <baseUrl>
const base = (process.argv[2] || process.env.SMOKE_URL || "http://localhost:3000").replace(/\/$/, "");

const checks = [
  { path: "/", sig: ["AI 코딩 아레나", "누가 더 잘"] },
  { path: "/play", sig: ["대전 준비", "난이도"] },
  { path: "/leaderboard", sig: ["명예의 전당"] },
  { path: "/api/submission", sig: ["items"] },
  { path: "/api/gallery", sig: ["items"] },
];

let fail = 0;
for (const c of checks) {
  try {
    const res = await fetch(base + c.path, { headers: { accept: "text/html" } });
    const txt = await res.text();
    const okStatus = res.ok;
    const okSig = c.sig.every((s) => txt.includes(s));
    if (okStatus && okSig) {
      console.log(`✅ ${c.path} (${res.status})`);
    } else {
      fail++;
      console.log(`❌ ${c.path} status=${res.status} sigOk=${okSig}`);
    }
  } catch (e) {
    fail++;
    console.log(`❌ ${c.path} ERROR ${e.message}`);
  }
}

// 빌드 스트림 실모드 헤더 확인(있으면)
try {
  const res = await fetch(base + "/api/build/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "테스트 히어로 카드 3개", targetId: "tailwind", mode: "recreate" }),
  });
  const mode = res.headers.get("x-build-mode");
  console.log(`ℹ️  /api/build/stream X-Build-Mode=${mode || "(none)"}`);
} catch (e) {
  console.log(`⚠️  build/stream check skipped: ${e.message}`);
}

console.log(fail === 0 ? "\n🎉 SMOKE PASS" : `\n💥 SMOKE FAIL (${fail})`);
process.exit(fail === 0 ? 0 : 1);

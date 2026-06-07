// .ts/.tsx 수정 직후 타입 경고(비차단 — 중간 일시 타입에러로 루프 멈춤 방지)
let d = "";
process.stdin.on("data", (c) => (d += c)).on("end", () => {
  const f = (JSON.parse(d || "{}").tool_input?.file_path) || "";
  if (!/\.(ts|tsx)$/.test(f)) process.exit(0);
  const { execSync } = require("child_process");
  try {
    execSync("npx tsc --noEmit -p tsconfig.json", { stdio: "pipe" });
  } catch (e) {
    console.error("⚠️ 타입 경고(비차단):\n" + (e.stdout || "").toString().slice(0, 1200));
  }
  process.exit(0); // 차단하지 않음 — 최종 게이트는 §B-1 build
});

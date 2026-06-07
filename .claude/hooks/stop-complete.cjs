// §0②: "이슈만 닫고 ralph 없이 끝" 차단 + 탈출밸브/ fail-open(루프 영구정지 방지)
const fs = require("fs"), cp = require("child_process");
// ── 탈출 밸브(최우선): 취소/진짜블로커면 즉시 종료 허용 ──
if (fs.existsSync(".omc/stop-ok") || fs.existsSync(".omc/real-blocker")) process.exit(0);
// gh 조회는 실패해도 false-block 금지(예외→0=fail-open)
const count = (s) => {
  try {
    return cp.execSync(`gh issue list --state ${s} -L 200`, { stdio: ["ignore", "pipe", "ignore"] })
      .toString().trim().split("\n").filter(Boolean).length;
  } catch { return 0; }
};
const open = count("open"), closed = count("closed");
const dod = fs.existsSync(".omc/dod-verified"), ralph = fs.existsSync(".omc/ralph-ran");
if (open > 0) {
  console.error(`❌ 종료 차단: 열린 이슈 ${open}개 — 마저 구현/검증. (진짜 블로커면 'echo ok > .omc/real-blocker')`);
  process.exit(2);
}
if (closed > 0 && (!dod || !ralph)) {
  console.error("❌ 종료 차단(§0②): 이슈 다 닫았지만 " +
    [!dod ? "§B-2 DoD검증(echo ok > .omc/dod-verified)" : "", !ralph ? "/ralph 지속개선(echo ok > .omc/ralph-ran)" : ""]
      .filter(Boolean).join(" · ") + " 미완. (정말 끝이면 'echo ok > .omc/stop-ok')");
  process.exit(2);
}
process.exit(0);

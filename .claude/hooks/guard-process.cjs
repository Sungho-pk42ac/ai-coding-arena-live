// §0②: PRD+이슈 없이 app/lib/components 제품코드 작성 차단(=한 방 빌드 물리적 불가)
let d = "";
process.stdin.on("data", (c) => (d += c)).on("end", () => {
  const raw = (JSON.parse(d || "{}").tool_input?.file_path) || "";
  const f = raw.replace(/\\/g, "/"); // 윈도우 역슬래시 정규화
  if (!/(^|\/)(app|lib|components)\/.+\.(ts|tsx|js|jsx)$/.test(f)) process.exit(0);
  const fs = require("fs");
  const hasPRD = fs.existsSync("PRD.md") || fs.existsSync(".omc/PRD.md");
  const hasIssues = fs.existsSync(".omc/issues-created");
  if (!hasPRD || !hasIssues) {
    console.error("❌ 코드 작성 차단(§0②): 먼저 /to-prd(PRD.md)+/to-issues(.omc/issues-created). '한 방 빌드' 금지 — 슬라이스 루프로만.");
    process.exit(2);
  }
  process.exit(0);
});

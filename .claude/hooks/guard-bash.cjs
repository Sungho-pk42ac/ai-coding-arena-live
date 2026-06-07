// §F: 위험 배포/미검증 close 차단 (exit 2 = 블록)
let d = "";
process.stdin.on("data", (c) => (d += c)).on("end", () => {
  const cmd = (JSON.parse(d || "{}").tool_input?.command) || "";
  // ① prebuilt 배포 금지(Windows ENOENT 조용한 실패)
  if (/vercel\s+(deploy\s+)?--prebuilt/.test(cmd)) {
    console.error("❌ prebuilt 배포 금지. git push origin main 으로 Vercel 서버 빌드를 써라.");
    process.exit(2);
  }
  // ② vercel --prod 직접배포 금지(큐 폭주) — git push만. (단 --yes --scope 비대화 폴백은 §0-6.5 허용)
  if (/vercel\s+(deploy\s+)?--prod/.test(cmd) && !/--help/.test(cmd) && !/--yes/.test(cmd)) {
    console.error("❌ vercel --prod 직접배포 금지. 배포는 git push origin main, 폴백은 'vercel --prod --yes --scope pk42acs-projects'.");
    process.exit(2);
  }
  // ③ 검증 마커 없이 이슈 close 금지
  const m = cmd.match(/gh\s+issue\s+close\s+(\d+)/);
  if (m) {
    const fs = require("fs");
    if (!fs.existsSync(`.omc/verified-${m[1]}`)) {
      console.error(`❌ #${m[1]} 시각검증(§B-2) 먼저. 통과 후 'echo ok > .omc/verified-${m[1]}'.`);
      process.exit(2);
    }
  }
  process.exit(0);
});

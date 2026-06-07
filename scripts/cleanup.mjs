// 테스트 중 생긴 garbage 엔트리 정리(점수<50 인 자동제출 흔적). 1회용.
import fs from "node:fs";
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);
const URL = env.NEXT_PUBLIC_SUPABASE_URL, KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.log("no supabase env"); process.exit(0); }
const h = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };
try {
  // 점수 50 미만(빈/실패 빌드 흔적) 삭제
  const r = await fetch(`${URL}/rest/v1/aca_submissions?score=lt.50`, { method: "DELETE", headers: h });
  const txt = await r.text();
  console.log("DELETE status", r.status, "-", txt.slice(0, 200));
} catch (e) {
  console.log("cleanup skipped:", e.message);
}

// 규칙③: 자율 빌드 중 AskUserQuestion(진행 방식 되묻기) 결정론 차단(exit 2)
const fs = require("fs");
if (fs.existsSync(".omc/allow-ask")) process.exit(0); // 불가피할 때만 수동 허용
if (fs.existsSync(".omc/issues-created")) {
  console.error("❌ 자율 빌드 중 질문 금지(규칙③). 폴백으로 뚫고 진짜 블로커만 '보고하며 계속'. 정말 불가피하면 'echo ok > .omc/allow-ask' 후 재시도.");
  process.exit(2);
}
process.exit(0);

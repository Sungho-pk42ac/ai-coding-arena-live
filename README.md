# 🦞 AI 코딩 아레나 (AI Coding Arena)

> **바이브코딩 시대의 백준** — 프롬프트로 유명 dev 사이트를 따라 만드는 **AI 봇 대전 게임**.
> 난이도(=제한시간)를 고르면 라이브 임베드된 실제 사이트를 타깃으로, 제한시간 안에서 프롬프트를 몇 번이든 고쳐
> 빌드(진짜 바이브 코딩)하고 — AI 봇은 자기 방식으로 독립 빌드 — **gpt-4o 비전이 시각 유사도를 채점**해 승부한다.

🟢 **라이브:** https://ai-coding-arena-live.vercel.app
📦 **Repo:** https://github.com/Sungho-pk42ac/ai-coding-arena-live

---

## 핵심 기능
- **AI 봇 대전** — 혼자서도 항상 대전(데모 안정). 난이도 3티어로 봇이 *실제로* 더 잘 만든다.
  - 쉬움(120초·봇=페이크·🐣코드뉴비) / 보통(90초·gpt-4o-mini·🏃코드러너) / 어려움(60초·gpt-4o·🤖코드마스터)
- **타임드 무제한 재빌드** — 제한시간 안에서 프롬프트→결과→수정 반복. 매 빌드 **토큰 스트리밍 에디터**(라인넘버+커서).
- **타깃 12개** — Bootstrap·Tailwind·Svelte·Astro·Remix·Supabase·MongoDB·Bun·SolidJS·htmx·React·daisyUI. 라이브 iframe → 실패 시 스크린샷 → SVG 폴백.
- **2모드** — 🎯타깃 재현(유사도 채점) / 🎨자유 창작(창의성 채점).
- **비전 AI 심판** — 결과를 html2canvas로 캡처 → gpt-4o 비전이 레이아웃/색/타이포 루브릭 + 코칭. 실패 시 휴리스틱 폴백.
- **명예의전당 + ♥투표 + 베스트 프롬프트** + **글로벌 랭킹**(Supabase 영속, 인메모리 폴백).
- **게임화** — 레벨/XP/랭크(🥉→💎)·점수 등급 S~D·VS 풀스크린 연출·콘페티/사운드/카운트업·연승 스트릭·결과 OG 공유카드.
- **재미요소** — 실시간 AI 캐스터 중계·봇 트래시토크 말풍선·실/페이크 배지.
- **디자인** — 에이전시급 Warm Editorial(베이지·잉크·단일 레드·Pretendard). 100% 한국어. 데스크톱 우선 + 완전 반응형.

## 스택
Next.js 16(App Router) · React 19 · TypeScript · Tailwind v4 · Vercel(Hobby) · OpenAI(`gpt-4o-mini` 빌드 / `gpt-4o` 채점·어려움 봇) · html2canvas · Supabase(REST 영속).

## 로컬 실행
```bash
npm install
cp .env.local.example .env.local   # 키 입력(없어도 페이크 모드로 동작)
npm run dev                          # http://localhost:3000
npm run build                        # 프로덕션 빌드
npm run e2e                          # 라이트 스모크 검증
```

## 환경변수
| 키 | 용도 | 없을 때 |
|----|------|---------|
| `OPENAI_API_KEY` | 실 빌드/비전 심판 | 페이크 모드 폴백 |
| `OPENAI_MODEL` | 기본 `gpt-4o-mini` | — |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | 리더보드 영속 | 인메모리 폴백 |

## 위임 설계 (How it was built)
이 게임은 **README 빌드 스펙 1개**를 근거로 Claude Code 에이전트가 **무인 자율 루프**로 빌드했다:
- `/deep-interview`로 모호성 수렴 → `PRD.md`(FROZEN) → `/to-issues`(S0~S9 슬라이스)
- 슬라이스마다 **시그니처 E2E + Chrome MCP 시각 검증 게이트** 통과 후에만 close
- `.claude/settings.json` **강제 훅**(`guard-bash`/`guard-process`/`guard-ask`/`stop-complete`)이 미검증 배포·과정 생략·조기 종료를 *구조적으로* 차단
- 배포는 `git push` → Vercel 서버 빌드. DoD 후 `/ralph` 지속개선 루프.

발명이 아니라 **오픈소스 도구를 제대로 조합·검증**한 결과물이다.

## 라이선스
MIT

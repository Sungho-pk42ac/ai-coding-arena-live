# PRD — AI 코딩 아레나 (AI Coding Arena) · FROZEN v4

> 출처: `README.md`(완전 빌드 스펙 v4) + 제공 PRD 브리프. 충돌 시 **README v4가 최종 권위**.
> 상태: **FROZEN** (T0에 동결, 빌드 중 변경 금지). 모호성 self-resolve 완료(질문 0).

## 0. 목표 (한 문장)
프롬프트로 유명 dev 사이트를 따라 만드는(또는 자유 창작) **AI 봇 대전 게임** — 난이도(=제한시간)를 골라
제한시간 안에서 무제한 재빌드(진짜 바이브 코딩)하고, gpt-4o 비전이 시각 유사도를 채점해 봇과 승부하며,
결과물은 명예의 전당에 전시·투표된다. **프로덕션 라이브에서 항상 동작하는 데모**가 1순위.

## 1. Topology (최상위 컴포넌트 6)
| # | 컴포넌트 | 책임 |
|---|----------|------|
| C1 | Arena 게임루프 | 타임드 무제한 재빌드 + 봇 독립빌드 1회 + 타임아웃/제출 → 승부 |
| C2 | Build Engine | `/api/build/stream` SSE 스트리밍(gpt-4o-mini/4o) + fake 폴백 + HTML 추출/보정 |
| C3 | Vision Judge | `/api/judge` html2canvas 캡처 → gpt-4o 비전 루브릭+코칭 / 휴리스틱 폴백 |
| C4 | Persistence & Social | Supabase 리더보드 영속 + 명예의전당 갤러리 + ♥투표 + 베스트프롬프트 |
| C5 | Game Juice | XP/레벨/랭크 · 등급 S~D · VS 인트로/결과 오버레이 · 콘페티/사운드/카운트업 · 캐스터 · 봇 말풍선 · 연승 · 공유 OG |
| C6 | Design System | Warm Editorial(베이지#F5F5F0·잉크#1A1A1A·레드#B22222) · 가로 트리틱 · Pretendard · 모바일 반응형 · 100% 한국어 |

## 2. FROZEN 결정값 (모호성 해소 결과)
- **난이도/시간/봇:** easy 120초·밴드42~58·봇=fake·🐣코드뉴비 / normal 90초·62~76·gpt-4o-mini·🏃코드러너 / hard 60초·80~95·gpt-4o·🤖코드마스터.
- **모드:** 🎯타깃 재현(유사도) / 🎨자유 창작(창의성). 토글.
- **타깃 12개(임베드 검증):** getbootstrap.com·tailwindcss.com·svelte.dev·astro.build·remix.run·supabase.com·mongodb.com·bun.sh·solidjs.com·htmx.org·react.dev·daisyui.com. 기본=라이브 iframe, 토글=thum.io 스크린샷, 폴백=SVG.
- **빌드 모델:** `gpt-4o-mini`(나·normal봇), `gpt-4o`(hard봇·비전심판). `max_tokens≈1300`(Hobby 10초 컷 내 `</html>` 완주). runtime=nodejs, maxDuration=10.
- **영속:** Supabase `aca_submissions`(nickname,target_id,score,bot_score,difficulty,outcome). 키 없으면 인메모리 폴백.
- **배포:** `git push origin main` → Vercel 서버빌드(자동 승격). `vercel --prebuilt`/`--prod` 직접배포 금지(§F 훅 차단). 비대화 배포 폴백 `vercel --prod --yes --scope pk42acs-projects`.
- **인프라:** repo=ASCII `ai-coding-arena-live-20260607`(충돌 시 `-r2`), Vercel scope `pk42acs-projects`. 작업폴더=현재 cwd(`C:\dev\새 폴더`, OneDrive 밖) 그대로.
- **스택:** Next.js(App Router)·React 19·TS·Tailwind v4 / Vercel / OpenAI / html2canvas / Supabase(REST).
- **폰트:** Pretendard(한글)+Geist/Manrope(영문). `word-break:keep-all`.

## 3. MUST-HAVE (19 — 하나라도 빠지면 미완성)
1 AI봇 대전(혼자도 항상) · 2 난이도3티어+실모델차등 · 3 타깃12(라이브임베드+스샷토글+SVG폴백) ·
4 타임드 무제한 재빌드+토큰 스트리밍 에디터 · 5 2모드(재현/자유) · 6 비전AI심판(루브릭+코칭) ·
7 명예의전당+♥투표+베스트프롬프트 · 8 글로벌랭킹(Supabase영속) · 9 재미요소5종(캐스터·모델차등·콘페티/사운드·코칭·명전) ·
10 봇 트래시토크 말풍선 · 11 연승 스트릭 · 12 결과카드 공유(/api/og) · 13 실/페이크 배지 ·
14 레벨/XP/랭크(브론즈~다이아) · 15 점수 등급 S~D · 16 VS 풀스크린 연출(인트로+결과) ·
17 봇 캐릭터(난이도별) · 18 모바일 반응형 · 19 에이전시급 디자인(supanova Warm Editorial).

## 4. 슬라이스 (S0~S9, 트레이서불릿 · 순서대로 · 각 §B 게이트 통과 후 close)
- S0 스켈레톤+내비(`/`,`/play`,`/leaderboard` 200)
- S1 라이브 임베드 타깃(12) + 모드/난이도 선택
- S2 빌드 스트리밍(페이크) + 에디터 코드뷰 + 입력 5자 검증
- S3 비전 심판(html2canvas→gpt-4o 루브릭+코칭) / 휴리스틱 폴백
- S4 봇 대전(밴드+실모델 차등) + 승부 + 콘페티/카운트업/사운드
- S5 영속(Supabase 순위 + 글로벌랭킹/명예의전당/투표/베스트프롬프트)
- S6 재미요소(캐스터·봇 말풍선·연승·공유 OG·실/페이크 배지)
- S7 게임 연출(레벨/XP/랭크·등급 S~D·VS 인트로+결과·봇 캐릭터)
- S8 자유 창작 모드(창의성 채점) + 모바일 반응형
- S9 배포(git push) + §B-2 Chrome MCP 시각검증(DoD)

## 5. DoD (완료 정의)
프로덕션 라이브에서: 모드+난이도 → 실제 사이트 라이브 임베드 → 프롬프트로 토큰 스트리밍 빌드 →
"나" 결과 백지 아닌 고유 생성물 → gpt-4o 비전 루브릭+코칭 → 어려워진 봇과 승부(콘페티/카운트업/사운드/말풍선) →
글로벌랭킹/명예의전당 Supabase 영속 + 공유카드 → 멈춤·치명 콘솔에러 0. VS연출·등급·랭크·봇캐릭터 표시. 모바일 정상.
검증=여러 번+실제 스크린샷(§B-2 Chrome MCP). §A 함정 전부 적용, §B 검증 전부 통과.

## 6. Non-Goals (명시적 제외)
- 사람 vs 사람 실시간 매칭(봇 대전만). 회원가입/로그인(게스트만). 다크/네온 테마(빌드 결과물 내부는 자유).
- 모바일 우선(데스크톱 우선, 모바일은 반응형 collapse). 네이티브 앱.

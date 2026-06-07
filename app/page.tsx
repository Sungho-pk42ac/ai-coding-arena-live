// 랜딩 — "AI vs 인간" 후킹 (Warm Editorial, 스플릿 히어로)
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* 내비 */}
      <nav className="mx-auto mt-4 flex w-[min(1100px,92%)] items-center justify-between rounded-full border border-black/5 bg-white/60 px-5 py-3 backdrop-blur-xl ambient-sm">
        <span className="font-extrabold tracking-tight">🦞 AI 코딩 아레나</span>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/leaderboard" className="rounded-full px-3 py-1.5 hover:bg-black/5">리더보드</Link>
          <Link href="/play" className="rounded-full bg-red px-4 py-1.5 font-semibold text-cream">플레이</Link>
        </div>
      </nav>

      {/* 히어로: 스플릿 50/50 */}
      <section className="mx-auto grid w-[min(1100px,92%)] grid-cols-1 items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <div className="reveal">
          <span className="inline-block rounded-full bg-red/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-red">바이브코딩 시대의 백준</span>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            당신 vs AI,<br /><span className="text-red">누가 더 잘 시키나?</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-mute">
            프롬프트 한 줄로 유명 dev 사이트를 따라 만든다. 제한시간 안에 무제한 재빌드 →
            gpt-4o 비전이 채점 → AI 봇을 격파하라.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/play" className="group flex items-center gap-3 rounded-full bg-red px-8 py-4 text-lg font-bold text-cream ease-spring transition hover:scale-[1.02] ambient">
              지금 대결하기
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream/20 transition group-hover:translate-x-1">→</span>
            </Link>
            <Link href="/leaderboard" className="rounded-full border border-black/15 bg-white px-7 py-4 font-semibold ease-spring transition hover:border-red">명예의 전당</Link>
          </div>
        </div>

        {/* VS 비주얼 */}
        <div className="reveal relative">
          <div className="rounded-[2rem] bg-black/5 p-1.5 ring-1 ring-black/5">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex flex-col items-center justify-center rounded-[1.6rem] bg-white p-8 text-center ambient-sm">
                <div className="text-5xl">🧑‍💻</div>
                <div className="mt-3 font-bold">당신</div>
                <div className="text-sm text-mute">프롬프트 엔지니어</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-[1.6rem] bg-ink p-8 text-center text-cream ambient-sm">
                <div className="text-5xl floaty">🤖</div>
                <div className="mt-3 font-bold">AI 봇</div>
                <div className="text-sm text-cream/60">난이도별 실모델</div>
              </div>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red px-5 py-3 text-2xl font-black text-cream ambient">VS</div>
          </div>
        </div>
      </section>

      {/* 3-셀 기능 그리드 */}
      <section className="mx-auto w-[min(1100px,92%)] border-t border-black/10 py-16">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-3">
          {[
            { t: "토큰 스트리밍 빌드", d: "글자 단위로 흐르는 코드 + 라이브 미리보기. 진짜 바이브 코딩." },
            { t: "gpt-4o 비전 심판", d: "렌더 이미지를 보고 레이아웃·색·타이포를 채점 + AI 코칭." },
            { t: "게임화 풀세트", d: "XP·랭크·등급 S~D·VS 연출·연승·명예의 전당·공유 카드." },
          ].map((c) => (
            <div key={c.t} className="bg-cream p-7">
              <div className="h-1 w-10 bg-red" />
              <h3 className="mt-4 text-xl font-bold">{c.t}</h3>
              <p className="mt-2 text-sm text-mute">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 난이도 = 모델 차등 */}
      <section className="mx-auto w-[min(1100px,92%)] pb-24">
        <h2 className="text-3xl font-extrabold tracking-tight">난이도 = AI 모델 차등</h2>
        <p className="mt-2 text-mute">어려울수록 봇이 *실제로* 더 잘 만듭니다.</p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { c: "🐣", n: "코드뉴비", d: "쉬움 · 120초 · 안정 봇" },
            { c: "🏃", n: "코드러너", d: "보통 · 90초 · gpt-4o-mini" },
            { c: "🤖", n: "코드마스터", d: "어려움 · 60초 · gpt-4o" },
          ].map((b) => (
            <div key={b.n} className="rounded-[2rem] bg-black/5 p-1.5 ring-1 ring-black/5">
              <div className="rounded-[1.6rem] bg-white p-7 text-center ambient-sm">
                <div className="text-5xl">{b.c}</div>
                <div className="mt-3 text-lg font-bold">{b.n}</div>
                <div className="mt-1 text-sm text-mute">{b.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/play" className="rounded-full bg-red px-10 py-4 text-lg font-bold text-cream ease-spring transition hover:scale-[1.02] ambient">바이브코딩, 해보시죠 →</Link>
        </div>
      </section>

      <footer className="border-t border-black/10 py-8 text-center text-sm text-mute">
        바이브코딩 시대의 백준 · AI 코딩 아레나 · <span className="text-ink">ai-coding-arena-live.vercel.app</span>
      </footer>
    </main>
  );
}

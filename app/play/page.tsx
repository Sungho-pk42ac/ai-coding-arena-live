// 아레나 페이지 — BotArena 클라이언트 컴포넌트
import Link from "next/link";
import BotArena from "@/components/bot-arena";

export const metadata = { title: "플레이 · AI 코딩 아레나" };

export default function PlayPage() {
  return (
    <main className="min-h-[100dvh]">
      <nav className="mx-auto mt-4 flex w-[min(1500px,94%)] items-center justify-between rounded-full border border-black/5 bg-white/60 px-5 py-3 backdrop-blur-xl ambient-sm">
        <Link href="/" className="font-extrabold tracking-tight">🦞 AI 코딩 아레나</Link>
        <Link href="/leaderboard" className="rounded-full px-3 py-1.5 text-sm hover:bg-black/5">🏆 리더보드</Link>
      </nav>
      <BotArena />
    </main>
  );
}

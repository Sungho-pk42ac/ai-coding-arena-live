// 리더보드 페이지 — 글로벌 랭킹 + 명예의전당 + 투표 + 베스트 프롬프트
import Link from "next/link";
import VoteGallery from "@/components/vote-gallery";

export const metadata = { title: "명예의 전당 · AI 코딩 아레나" };
export const dynamic = "force-dynamic";

export default function LeaderboardPage() {
  return (
    <main className="min-h-[100dvh]">
      <nav className="mx-auto mt-4 flex w-[min(1100px,92%)] items-center justify-between rounded-full border border-black/5 bg-white/60 px-5 py-3 backdrop-blur-xl ambient-sm">
        <Link href="/" className="font-extrabold tracking-tight">🦞 AI 코딩 아레나</Link>
        <Link href="/play" className="rounded-full bg-red px-4 py-1.5 text-sm font-semibold text-cream">플레이</Link>
      </nav>
      <VoteGallery />
    </main>
  );
}

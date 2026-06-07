import type { Metadata } from "next";
import "./globals.css";

/** 사이트 전역 메타데이터 (OG 공유 카드 포함) */
export const metadata: Metadata = {
  title: "AI 코딩 아레나 — 바이브코딩 시대의 백준",
  description:
    "프롬프트로 AI 봇과 겨루는 실시간 코딩 대전. 제한시간 안에 빌드하고 gpt-4o 비전이 채점한다.",
  metadataBase: new URL("https://ai-coding-arena-live.vercel.app"),
  openGraph: {
    title: "AI 코딩 아레나 — 바이브코딩 시대의 백준",
    description: "프롬프트 한 줄로 AI와 맞붙는 실시간 코딩 대전",
    type: "website",
    url: "https://ai-coding-arena-live.vercel.app",
    images: [
      {
        url: "/api/og?nick=AI%20%EC%BD%94%EB%94%A9%20%EC%95%84%EB%A0%88%EB%82%98&score=94&bot=70&grade=S&outcome=win",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 코딩 아레나",
    description: "프롬프트 한 줄로 AI와 맞붙는 실시간 코딩 대전",
    images: ["/api/og?nick=AI%20%EC%BD%94%EB%94%A9%20%EC%95%84%EB%A0%88%EB%82%98&score=94&bot=70&grade=S&outcome=win"],
  },
};

/** 루트 레이아웃 — 한국어 고정, Warm Editorial 배경 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-[100dvh] bg-cream text-ink antialiased">
        <div className="noise" aria-hidden />
        {children}
      </body>
    </html>
  );
}

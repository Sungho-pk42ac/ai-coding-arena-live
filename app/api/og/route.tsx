// 결과 공유 OG 카드 (next/og)
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const nick = (p.get("nick") || "도전자").slice(0, 20);
  const score = p.get("score") || "0";
  const bot = p.get("bot") || "0";
  const grade = (p.get("grade") || "B").slice(0, 1);
  const outcome = p.get("outcome") || "win";
  const won = outcome === "win";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f5f5f0",
          color: "#1a1a1a",
          padding: "64px 72px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 4, color: "#6b6359" }}>
          <span>AI 코딩 아레나</span>
          <span>{won ? "🏆 WIN" : "😢 LOSE"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#b22222" }}>{nick}</div>
          <div style={{ fontSize: 30, color: "#6b6359", marginTop: 8 }}>
            {won ? "봇을 격파했습니다!" : "아쉬운 패배! 재도전 각."}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 48, marginTop: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 24, color: "#6b6359" }}>내 점수</span>
            <span style={{ fontSize: 120, fontWeight: 800, lineHeight: 1 }}>{score}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", paddingBottom: 18 }}>
            <span style={{ fontSize: 24, color: "#6b6359" }}>봇</span>
            <span style={{ fontSize: 64, fontWeight: 700, color: "#6b6359", lineHeight: 1 }}>{bot}</span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              width: 160,
              height: 160,
              borderRadius: 24,
              background: "#1a1a1a",
              color: "#f5f5f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 96,
              fontWeight: 800,
            }}
          >
            {grade}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

"use client";
// 타깃 표시 — 자동 폴백 체인: 라이브 iframe → 스크린샷 → SVG (절대 빈 타깃 금지)
import { useState } from "react";
import { Target, embedUrl, targetImageUrl } from "@/lib/targets";

type Stage = "iframe" | "shot" | "svg";

export default function TargetFrame({ target, forceShot = false }: { target: Target; forceShot?: boolean }) {
  const [stage, setStage] = useState<Stage>(forceShot ? "shot" : "iframe");

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-black/10 bg-paper ambient-sm">
      {stage === "iframe" && (
        <iframe
          title={target.name}
          src={embedUrl(target.url)}
          sandbox="allow-scripts allow-same-origin"
          loading="eager"
          className="h-full w-full"
          onError={() => setStage("shot")}
          onLoad={(e) => {
            // 일부 사이트는 onError 없이 빈 프레임 → 접근 차단 감지 시 스샷
            try {
              const f = e.currentTarget as HTMLIFrameElement;
              if (!f.contentWindow) setStage("shot");
            } catch {
              /* cross-origin 정상 */
            }
          }}
        />
      )}
      {stage === "shot" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={targetImageUrl(target.url)}
          alt={target.name}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover object-top"
          onError={() => setStage("svg")}
        />
      )}
      {stage === "svg" && (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-3 text-center"
          style={{ background: `linear-gradient(135deg, ${target.hint}22, ${target.hint}55)` }}
        >
          <div className="text-5xl font-black tracking-tight" style={{ color: target.hint }}>
            {target.name}
          </div>
          <div className="text-sm text-mute">{target.blurb}</div>
        </div>
      )}
      <div className="pointer-events-none absolute left-0 top-0 m-2 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-cream">
        🎯 타깃 · {target.name}
      </div>
    </div>
  );
}

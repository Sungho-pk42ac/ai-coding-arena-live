"use client";
// 스트리밍 코드 에디터 뷰 — 라인넘버 + 타이핑 커서 + 자동 스크롤
import { useEffect, useRef } from "react";

export default function CodeEditor({
  code,
  streaming,
  label = "code.html",
}: {
  code: string;
  streaming: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [code]);

  const lines = (code || "").split("\n");
  const shown = lines.slice(-200); // 너무 길면 뒤쪽만
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-[#15140f] text-[#e8e4da] ambient-sm">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 text-xs text-white/50">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        <span className="ml-2 font-mono">{label}</span>
        {streaming && <span className="ml-auto text-[#e0894a]">● 코딩 중…</span>}
      </div>
      <div ref={ref} className="flex-1 overflow-auto p-3 font-mono text-[12.5px] leading-relaxed">
        {code.length === 0 ? (
          <div className="space-y-2 p-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-3 animate-pulse rounded bg-white/5" style={{ width: `${40 + ((i * 13) % 50)}%` }} />
            ))}
            <div className="pt-2 text-white/30">첫 토큰을 기다리는 중…</div>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-all">
            {shown.map((ln, i) => (
              <div key={i} className="flex">
                <span className="mr-3 w-8 shrink-0 select-none text-right text-white/20">{lines.length - shown.length + i + 1}</span>
                <span className="flex-1">{ln || " "}</span>
              </div>
            ))}
            {streaming && <span className="cursor-blink" />}
          </pre>
        )}
      </div>
    </div>
  );
}

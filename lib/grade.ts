// 점수 → 등급 S/A/B/C/D 도장

export type Grade = "S" | "A" | "B" | "C" | "D";

export function gradeOf(score: number): { grade: Grade; color: string; label: string } {
  if (score >= 90) return { grade: "S", color: "#b22222", label: "전설" };
  if (score >= 78) return { grade: "A", color: "#ea580c", label: "탁월" };
  if (score >= 62) return { grade: "B", color: "#16a34a", label: "양호" };
  if (score >= 45) return { grade: "C", color: "#2563eb", label: "성장중" };
  return { grade: "D", color: "#6b6359", label: "도전" };
}

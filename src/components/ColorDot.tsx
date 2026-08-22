const HEX: Record<string, string> = {
  black: "#1e293b",
  white: "#ffffff",
  gray: "#9ca3af",
  silver: "#d1d5db",
  brown: "#92400e",
  beige: "#e7d8c0",
  red: "#dc2626",
  orange: "#ea580c",
  yellow: "#eab308",
  gold: "#ca8a04",
  green: "#16a34a",
  blue: "#2563eb",
  navy: "#1e3a8a",
  purple: "#9333ea",
  pink: "#ec4899",
};

export function ColorDot({ color }: { color: string }) {
  if (color === "unknown") return null;
  const style =
    color === "multicolor"
      ? { background: "conic-gradient(#dc2626, #eab308, #16a34a, #2563eb, #dc2626)" }
      : { backgroundColor: HEX[color] ?? "#9ca3af" };
  return (
    <span
      className="inline-block size-3 shrink-0 rounded-full border border-slate-300"
      style={style}
      aria-hidden
    />
  );
}

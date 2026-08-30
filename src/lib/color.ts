/** "#3557FF" -> "53 87 255" (space-separated, for Tailwind's rgb(var(...)/alpha) pattern) */
export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num) || full.length !== 6) return "0 0 0"; // safe fallback, never crash on bad admin input
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r} ${g} ${b}`;
}

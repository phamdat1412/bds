export function formatMoneyShort(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0";

  const num =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(num)) return "0";

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    const formatted = Number.isInteger(m) ? String(m) : trimTrailingZeros(m.toFixed(3));
    return `${sign}${formatted}m`;
  }

  if (abs >= 1_000) {
    const k = Math.floor(abs / 1_000);
    return `${sign}${k}k`;
  }

  return `${sign}${Math.floor(abs)}`;
}

function trimTrailingZeros(value: string): string {
  return value.replace(/\.?0+$/, "");
}
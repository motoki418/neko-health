export const TZ = "Asia/Tokyo";

export function startOfTodayJst(): Date {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return new Date(`${y}-${m}-${d}T00:00:00+09:00`);
}

export function daysAgoJst(n: number): Date {
  const d = startOfTodayJst();
  d.setDate(d.getDate() - n);
  return d;
}

export function toJstDateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function toJstWeekKey(iso: string): string {
  const d = new Date(iso);
  const jstStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const jst = new Date(`${jstStr}T00:00:00+09:00`);
  const day = jst.getDay();
  const diffToMonday = (day + 6) % 7;
  jst.setDate(jst.getDate() - diffToMonday);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(jst);
}

export function formatJstShort(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: TZ,
    month: "numeric",
    day: "numeric",
  }).format(new Date(iso));
}

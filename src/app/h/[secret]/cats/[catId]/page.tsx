import Link from "next/link";
import { notFound } from "next/navigation";
import { assertHousehold } from "@/lib/auth";
import { getCat, listRecordsSince } from "@/lib/queries";
import { daysAgoJst, toJstDateKey, toJstWeekKey, formatJstShort } from "@/lib/time";
import { listRecentRecords } from "@/lib/queries";
import Charts from "./_components/charts";
import RecordList from "./_components/record-list";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function CatPage({
  params,
}: {
  params: Promise<{ secret: string; catId: string }>;
}) {
  const { secret, catId } = await params;
  const household = await assertHousehold(secret);
  const cat = await getCat(household.id, catId);
  if (!cat) notFound();

  const [since, recentRecords] = await Promise.all([
    Promise.resolve(daysAgoJst(27)),
    listRecentRecords(cat.id, 30),
  ]);
  const records = await listRecordsSince([cat.id], since.toISOString());

  const dailyMap = new Map<
    string,
    { date: string; food: number; water: number }
  >();
  for (let i = 6; i >= 0; i--) {
    const d = daysAgoJst(i);
    const key = toJstDateKey(d.toISOString());
    dailyMap.set(key, { date: key, food: 0, water: 0 });
  }
  for (const r of records) {
    const key = toJstDateKey(r.recorded_at);
    const row = dailyMap.get(key);
    if (!row) continue;
    if (r.kind === "food") row.food += r.amount;
    else row.water += r.amount;
  }
  const daily = Array.from(dailyMap.values()).map((row) => ({
    ...row,
    label: formatJstShort(`${row.date}T00:00:00+09:00`),
  }));

  const weeklyMap = new Map<
    string,
    { week: string; food: number; water: number }
  >();
  for (let i = 3; i >= 0; i--) {
    const d = daysAgoJst(i * 7);
    const key = toJstWeekKey(d.toISOString());
    weeklyMap.set(key, { week: key, food: 0, water: 0 });
  }
  for (const r of records) {
    const key = toJstWeekKey(r.recorded_at);
    const row = weeklyMap.get(key);
    if (!row) continue;
    if (r.kind === "food") row.food += r.amount;
    else row.water += r.amount;
  }
  const weekly = Array.from(weeklyMap.values()).map((row) => ({
    ...row,
    label: formatJstShort(`${row.week}T00:00:00+09:00`) + "週",
  }));

  return (
    <main className="min-h-dvh px-5 pt-8 pb-16 max-w-2xl mx-auto">
      <Link
        href={`/h/${secret}`}
        className="eyebrow hover:text-ink transition"
      >
        ← ダッシュボード
      </Link>

      <header className="mt-6 mb-8 flex items-center gap-4">
        <div className="text-6xl leading-none">{cat.icon}</div>
        <div>
          <p className="eyebrow mb-1">health log</p>
          <h1 className="jp-display text-2xl text-ink">{cat.name}</h1>
        </div>
      </header>

      <Charts daily={daily} weekly={weekly} />

      <section className="mt-10">
        <p className="eyebrow mb-4">直近の記録</p>
        <div className="rounded-2xl border border-rule bg-card px-4">
          <RecordList secret={secret} catId={cat.id} records={recentRecords} />
        </div>
      </section>
    </main>
  );
}

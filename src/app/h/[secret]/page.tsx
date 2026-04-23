import Link from "next/link";
import { assertHousehold } from "@/lib/auth";
import { listCats, listRecordsSince } from "@/lib/queries";
import { startOfTodayJst } from "@/lib/time";
import RecordSheet from "./_components/record-sheet";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;
  const household = await assertHousehold(secret);

  const cats = await listCats(household.id);
  const today = startOfTodayJst();
  const records = await listRecordsSince(
    cats.map((c) => c.id),
    today.toISOString()
  );

  const byCat = new Map<string, { food: number; water: number }>();
  for (const c of cats) byCat.set(c.id, { food: 0, water: 0 });
  for (const r of records) {
    const agg = byCat.get(r.cat_id);
    if (!agg) continue;
    if (r.kind === "food") agg.food += r.amount;
    else agg.water += r.amount;
  }

  const totalFood = records
    .filter((r) => r.kind === "food")
    .reduce((a, b) => a + b.amount, 0);
  const totalWater = records
    .filter((r) => r.kind === "water")
    .reduce((a, b) => a + b.amount, 0);

  const dateLabel = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  return (
    <main className="min-h-dvh pb-32 px-5 pt-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <p className="eyebrow mb-2">{dateLabel}</p>
        <h1 className="jp-display text-2xl text-ink">今日のねこ</h1>
      </header>

      <section className="grid grid-cols-2 gap-3 mb-8">
        <div className="rounded-2xl bg-food-bg p-5">
          <p className="eyebrow text-food mb-3">今日の食事</p>
          <div className="hero-number text-4xl text-food">{totalFood}</div>
          <p className="font-mono text-xs text-food mt-1.5 opacity-60">g</p>
        </div>
        <div className="rounded-2xl bg-water-bg p-5">
          <p className="eyebrow text-water mb-3">今日の飲水</p>
          <div className="hero-number text-4xl text-water">{totalWater}</div>
          <p className="font-mono text-xs text-water mt-1.5 opacity-60">ml</p>
        </div>
      </section>

      <section>
        <p className="eyebrow mb-4">ねこたち</p>
        {cats.length === 0 ? (
          <p className="jp-display text-sm text-ink-muted leading-loose">
            猫がまだ登録されていません。
            <br />
            Supabase 管理画面から cats テーブルに追加してください。
          </p>
        ) : (
          <div className="space-y-2">
            {cats.map((c) => {
              const agg = byCat.get(c.id)!;
              return (
                <Link
                  key={c.id}
                  href={`/h/${secret}/cats/${c.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-rule bg-card px-4 py-4 transition hover:bg-paper-2 active:scale-[0.99]"
                >
                  <div className="text-4xl leading-none">{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="jp-display text-base text-ink">{c.name}</p>
                    <div className="flex gap-4 mt-1.5">
                      <span className="font-mono text-xs text-food">
                        {agg.food}
                        <span className="ml-0.5 opacity-70">g</span>
                      </span>
                      <span className="font-mono text-xs text-water">
                        {agg.water}
                        <span className="ml-0.5 opacity-70">ml</span>
                      </span>
                    </div>
                  </div>
                  <div className="side-index text-xl">›</div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <RecordSheet secret={secret} cats={cats} />
    </main>
  );
}

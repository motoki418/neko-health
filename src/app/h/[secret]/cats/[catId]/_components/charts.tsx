"use client";

type DailyRow = { date: string; label: string; food: number; water: number };
type WeeklyRow = { week: string; label: string; food: number; water: number };

const COLOR_FOOD = "#c55a35";
const COLOR_WATER = "#2d6b6a";
const COLOR_GRID = "#e5dcc8";
const CHART_HEIGHT = 144;

export default function Charts({
  daily,
  weekly,
}: {
  daily: DailyRow[];
  weekly: WeeklyRow[];
}) {
  const dailyWithDow = daily.map((d) => ({
    ...d,
    label: toDowLabel(d.date),
  }));

  return (
    <div className="space-y-10">
      <DualChart title="直近7日" data={dailyWithDow} />
      <DualChart title="直近4週 (週合計)" data={weekly} />
    </div>
  );
}

function DualChart({
  title,
  data,
}: {
  title: string;
  data: Array<{ label: string; food: number; water: number }>;
}) {
  return (
    <section>
      <p className="eyebrow-lg mb-4">{title}</p>
      <div className="space-y-4">
        <ChartBlock
          label="食事"
          unit="g"
          color={COLOR_FOOD}
          data={data}
          dataKey="food"
        />
        <ChartBlock
          label="飲水"
          unit="ml"
          color={COLOR_WATER}
          data={data}
          dataKey="water"
        />
      </div>
    </section>
  );
}

function ChartBlock({
  label,
  unit,
  color,
  data,
  dataKey,
}: {
  label: string;
  unit: string;
  color: string;
  data: Array<{ label: string; food: number; water: number }>;
  dataKey: "food" | "water";
}) {
  const max = Math.max(1, ...data.map((d) => (d[dataKey] as number) || 0));
  const yMax = Math.ceil((max * 1.25) / 10) * 10;
  const yTicks = [yMax, Math.round(yMax / 2), 0];
  const columns =
    data.length > 0 ? `repeat(${data.length}, minmax(0, 1fr))` : "1fr";

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span
          className="font-mono text-[10.5px] tracking-[0.22em] font-medium"
          style={{ color }}
        >
          {label}
          <span className="ml-1 opacity-60 tracking-normal">({unit})</span>
        </span>
      </div>
      <div className="rounded-2xl border border-rule bg-paper-2 px-3 pb-3 pt-4">
        <div className="flex gap-2">
          <div
            className="flex w-8 flex-col justify-between text-right font-mono text-[10px] leading-none text-muted"
            style={{ height: CHART_HEIGHT }}
            aria-hidden="true"
          >
            {yTicks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="relative border-b"
              style={{ borderColor: COLOR_GRID, height: CHART_HEIGHT }}
            >
              <div
                className="absolute inset-x-0 top-0 border-t border-dashed"
                style={{ borderColor: COLOR_GRID }}
              />
              <div
                className="absolute inset-x-0 top-1/2 border-t border-dashed"
                style={{ borderColor: COLOR_GRID }}
              />
              <div
                className="relative z-10 grid h-full items-end gap-2"
                style={{ gridTemplateColumns: columns }}
              >
                {data.map((row) => {
                  const value = Number(row[dataKey]) || 0;
                  const height = Math.max(0, Math.round((value / yMax) * 100));

                  return (
                    <div
                      key={row.label}
                      className="flex h-full items-end justify-center"
                      title={`${row.label}: ${value} ${unit}`}
                    >
                      <div
                        className="w-full max-w-9 rounded-t-[5px]"
                        style={{
                          backgroundColor: color,
                          height: `${height}%`,
                          minHeight: value > 0 ? 4 : 0,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              className="mt-2 grid gap-2"
              style={{ gridTemplateColumns: columns }}
            >
              {data.map((row) => (
                <div key={row.label} className="min-w-0 text-center">
                  <div className="text-[11px] leading-none text-muted">
                    {row.label}
                  </div>
                  <div className="mt-1 truncate font-mono text-[10px] leading-none text-ink">
                    {Number(row[dataKey]) || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function toDowLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00+09:00`);
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    weekday: "narrow",
  }).format(d);
}

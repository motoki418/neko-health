"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type DailyRow = { date: string; label: string; food: number; water: number };
type WeeklyRow = { week: string; label: string; food: number; water: number };

const COLOR_FOOD = "#c55a35";
const COLOR_WATER = "#2d6b6a";
const COLOR_GRID = "#e5dcc8";

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
      <div className="h-48 rounded-2xl border border-rule p-3 bg-paper-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            barCategoryGap="24%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLOR_GRID}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: COLOR_GRID }}
              interval={0}
              height={24}
              tick={{ fill: "#6f6459" }}
            />
            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, yMax]}
              width={36}
              tick={{ fill: "#9f948a" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(168,134,80,0.08)" }}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${COLOR_GRID}`,
                backgroundColor: "#f9f4eb",
                fontSize: 13,
                padding: "6px 10px",
                color: "#1f1914",
              }}
              formatter={(value) => [`${value} ${unit}`, label]}
            />
            <Bar dataKey={dataKey} fill={color} radius={[5, 5, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
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

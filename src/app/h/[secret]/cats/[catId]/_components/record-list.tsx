"use client";

import { useState, useTransition } from "react";
import type { CatRecord, FoodType } from "@/lib/supabase";
import { deleteRecord, updateRecord } from "../../../actions";

type EditState = { id: string; amount: string; foodType: FoodType | null };

export default function RecordList({
  secret,
  catId,
  records,
}: {
  secret: string;
  catId: string;
  records: CatRecord[];
}) {
  const [editing, setEditing] = useState<EditState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startEdit(r: CatRecord) {
    setEditing({ id: r.id, amount: String(r.amount), foodType: r.food_type });
  }

  function saveEdit() {
    if (!editing) return;
    const n = parseInt(editing.amount, 10);
    if (!Number.isFinite(n) || n <= 0) return;
    startTransition(async () => {
      await updateRecord(secret, editing.id, catId, n, editing.foodType);
      setEditing(null);
    });
  }

  function handleDelete(recordId: string) {
    setDeletingId(recordId);
    startTransition(async () => {
      await deleteRecord(secret, recordId, catId);
      setDeletingId(null);
    });
  }

  if (records.length === 0) {
    return (
      <p className="jp-display text-sm text-ink-faint">まだ記録がありません。</p>
    );
  }

  return (
    <div>
      {records.map((r, i) => {
        const isEditing = editing?.id === r.id;
        const isDeleting = deletingId === r.id;
        const timeLabel = formatTime(r.recorded_at);
        const kindLabel =
          r.kind === "food"
            ? r.food_type === "dry"
              ? "ドライ"
              : "ウェット"
            : "水";
        const colorClass = r.kind === "food" ? "text-food" : "text-water";

        return (
          <div
            key={r.id}
            className={`py-3.5 transition-opacity ${
              i < records.length - 1 ? "border-b border-rule" : ""
            } ${isDeleting ? "opacity-30 pointer-events-none" : ""}`}
          >
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink-faint">{timeLabel}</span>
                  <span className={`font-mono text-xs font-medium ${colorClass}`}>
                    {kindLabel}
                  </span>
                </div>
                {r.kind === "food" && editing && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, foodType: "dry" })}
                      className={`rounded-xl py-2 text-sm font-semibold border-2 transition ${
                        editing.foodType === "dry"
                          ? "border-food bg-food-bg text-food"
                          : "border-rule text-ink-muted"
                      }`}
                    >
                      🥣 ドライ
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, foodType: "wet" })}
                      className={`rounded-xl py-2 text-sm font-semibold border-2 transition ${
                        editing.foodType === "wet"
                          ? "border-food bg-food-bg text-food"
                          : "border-rule text-ink-muted"
                      }`}
                    >
                      🥫 ウェット
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editing!.amount}
                    onChange={(e) =>
                      setEditing({ ...editing!, amount: e.target.value.replace(/\D/g, "") })
                    }
                    className="flex-1 rounded-xl border border-rule bg-paper px-4 py-2.5 text-lg text-ink focus:outline-none focus:border-ink transition"
                  />
                  <span className="font-mono text-xs text-ink-muted self-center">{r.unit}</span>
                  <button
                    type="button"
                    disabled={isPending || !editing!.amount}
                    onClick={saveEdit}
                    className="rounded-xl bg-ink text-paper font-semibold px-4 py-2.5 text-sm disabled:opacity-40 transition"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-xl border border-rule text-ink-muted px-3 py-2.5 text-sm transition hover:border-ink"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs text-ink-faint mr-2">{timeLabel}</span>
                  <span className={`font-mono text-xs font-medium ${colorClass}`}>
                    {kindLabel}
                  </span>
                </div>
                <span className="font-mono text-sm text-ink font-medium">
                  {r.amount}
                  <span className="text-xs text-ink-faint ml-0.5">{r.unit}</span>
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(r)}
                  className="eyebrow text-ink-faint hover:text-ink transition px-1 py-0.5"
                >
                  編集
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(r.id)}
                  className="eyebrow text-food opacity-40 hover:opacity-100 transition px-1 py-0.5 disabled:pointer-events-none"
                >
                  削除
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

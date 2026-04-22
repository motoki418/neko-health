"use client";

import { useState, useTransition } from "react";
import type { Cat, FoodType } from "@/lib/supabase";
import { createRecord } from "../actions";

const DRY_CHIPS = [5, 10, 15, 20, 25];
const WET_CHIPS = [5, 10, 15, 20, 25];
const WATER_CHIPS = [20, 30, 50, 80, 100];

type Kind = "food" | "water";

export default function RecordSheet({
  secret,
  cats,
}: {
  secret: string;
  cats: Cat[];
}) {
  const [open, setOpen] = useState(false);
  const [catId, setCatId] = useState<string>(cats[0]?.id ?? "");
  const [kind, setKind] = useState<Kind>("food");
  const [foodType, setFoodType] = useState<FoodType>("dry");
  const [custom, setCustom] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  function submit(amount: number) {
    if (!catId) return;
    const unit = kind === "food" ? "g" : "ml";
    const ft: FoodType | null = kind === "food" ? foodType : null;

    startTransition(async () => {
      const res = await createRecord(secret, catId, kind, amount, unit, ft);
      if (res.ok) {
        const catName = cats.find((c) => c.id === catId)?.name ?? "";
        const label =
          kind === "food"
            ? `${foodType === "dry" ? "ドライ" : "ウェット"} ${amount}g`
            : `水 ${amount}ml`;
        setToast(`✓ ${catName} に ${label} を記録`);
        setCustom("");
        setTimeout(() => setToast(null), 2500);
      } else {
        setToast(`エラー: ${res.error}`);
        setTimeout(() => setToast(null), 3000);
      }
    });
  }

  const chips =
    kind === "water"
      ? WATER_CHIPS
      : foodType === "dry"
        ? DRY_CHIPS
        : WET_CHIPS;
  const unit = kind === "food" ? "g" : "ml";

  function closeSheet() {
    setOpen(false);
    setToast(null);
    setCustom("");
  }

  return (
    <>
      {!open && toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-ink text-paper text-sm rounded-full px-4 py-2 shadow-lg">
          {toast}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={cats.length === 0}
        style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        className="fixed left-1/2 -translate-x-1/2 z-40 rounded-full bg-ink text-paper text-base font-semibold px-8 py-4 shadow-2xl disabled:opacity-40 active:scale-95 transition"
      >
        ＋ 記録
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40" onClick={closeSheet}>
          <div
            className="absolute bottom-0 inset-x-0 bg-card rounded-t-3xl p-5 pb-10 max-h-[88dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12" />
              <div className="w-10 h-1 bg-rule rounded-full" />
              <button
                type="button"
                onClick={closeSheet}
                className="eyebrow px-2 py-1 hover:text-ink transition"
                aria-label="閉じる"
              >
                閉じる
              </button>
            </div>

            {toast && (
              <div
                className={`mb-5 rounded-xl text-sm px-4 py-3 ${
                  toast.startsWith("エラー")
                    ? "bg-red-50 text-red-700"
                    : "bg-food-bg text-food"
                }`}
                role="status"
              >
                {toast}
              </div>
            )}

            <div className="mb-5">
              <p className="eyebrow mb-3">どの子？</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {cats.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCatId(c.id)}
                    className={`flex-shrink-0 rounded-2xl px-4 py-3 border-2 transition ${
                      c.id === catId
                        ? "border-ink bg-paper-2"
                        : "border-rule"
                    }`}
                  >
                    <div className="text-3xl leading-none">{c.icon}</div>
                    <div className="jp-display text-xs mt-1.5 text-ink">{c.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="eyebrow mb-3">種類</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setKind("food")}
                  className={`rounded-xl py-3 font-semibold transition ${
                    kind === "food"
                      ? "bg-food text-paper"
                      : "bg-food-bg text-food"
                  }`}
                >
                  🍚 食事 (g)
                </button>
                <button
                  type="button"
                  onClick={() => setKind("water")}
                  className={`rounded-xl py-3 font-semibold transition ${
                    kind === "water"
                      ? "bg-water text-paper"
                      : "bg-water-bg text-water"
                  }`}
                >
                  💧 水 (ml)
                </button>
              </div>
            </div>

            {kind === "food" && (
              <div className="mb-5">
                <p className="eyebrow mb-3">フード種別</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFoodType("dry")}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition border-2 ${
                      foodType === "dry"
                        ? "border-food bg-food-bg text-food"
                        : "border-rule text-ink-muted"
                    }`}
                  >
                    🥣 ドライ
                  </button>
                  <button
                    type="button"
                    onClick={() => setFoodType("wet")}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition border-2 ${
                      foodType === "wet"
                        ? "border-food bg-food-bg text-food"
                        : "border-rule text-ink-muted"
                    }`}
                  >
                    🥫 ウェット
                  </button>
                </div>
              </div>
            )}

            <div className="mb-5">
              <p className="eyebrow mb-3">量 (タップで即保存)</p>
              <div className="grid grid-cols-5 gap-2">
                {chips.map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={isPending || !catId}
                    onClick={() => submit(n)}
                    className="rounded-xl bg-paper-2 py-4 font-bold text-lg text-ink active:scale-95 transition disabled:opacity-40"
                  >
                    {n}
                    <span className="text-xs font-normal ml-0.5 text-ink-muted">{unit}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">自由入力</p>
              <div className="flex gap-2">
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
                  placeholder="例: 25"
                  className="flex-1 rounded-xl border border-rule bg-paper px-4 py-3 text-lg text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition"
                />
                <button
                  type="button"
                  disabled={isPending || !catId || !custom}
                  onClick={() => {
                    const n = parseInt(custom, 10);
                    if (Number.isFinite(n) && n > 0) submit(n);
                  }}
                  className="rounded-xl bg-ink text-paper font-semibold px-5 disabled:opacity-40 transition"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

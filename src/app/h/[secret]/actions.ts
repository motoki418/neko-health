"use server";

import { revalidatePath } from "next/cache";
import { assertHousehold } from "@/lib/auth";
import {
  supabase,
  type FoodType,
  type RecordKind,
  type RecordUnit,
} from "@/lib/supabase";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function createRecord(
  secret: string,
  catId: string,
  kind: RecordKind,
  amount: number,
  unit: RecordUnit,
  foodType: FoodType | null,
  recordedAtIso?: string
): Promise<ActionResult<{ id: string }>> {
  const household = await assertHousehold(secret);

  if (!Number.isInteger(amount) || amount <= 0 || amount > 100000) {
    return { ok: false, error: "amount が不正です" };
  }
  if (kind === "food") {
    if (unit !== "g") return { ok: false, error: "food は g で記録してください" };
    if (foodType !== "dry" && foodType !== "wet") {
      return { ok: false, error: "food_type (dry/wet) を指定してください" };
    }
  }
  if (kind === "water") {
    if (unit !== "ml") return { ok: false, error: "water は ml で記録してください" };
    if (foodType !== null) {
      return { ok: false, error: "water には food_type は指定できません" };
    }
  }

  const { data: cat, error: catErr } = await supabase
    .from("cats")
    .select("id")
    .eq("id", catId)
    .eq("household_id", household.id)
    .maybeSingle();
  if (catErr || !cat) return { ok: false, error: "猫が見つかりません" };

  const payload: Record<string, unknown> = {
    cat_id: catId,
    kind,
    food_type: foodType,
    amount,
    unit,
  };
  if (recordedAtIso) payload.recorded_at = recordedAtIso;

  const { data, error } = await supabase
    .from("records")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: "保存に失敗しました" };

  revalidatePath(`/h/${secret}`);
  revalidatePath(`/h/${secret}/cats/${catId}`);
  return { ok: true, data: { id: data.id as string } };
}

export async function deleteRecord(
  secret: string,
  recordId: string,
  catId: string
): Promise<ActionResult<null>> {
  const household = await assertHousehold(secret);

  const { data: cat, error: catErr } = await supabase
    .from("cats")
    .select("id")
    .eq("id", catId)
    .eq("household_id", household.id)
    .maybeSingle();
  if (catErr || !cat) return { ok: false, error: "猫が見つかりません" };

  const { error } = await supabase
    .from("records")
    .delete()
    .eq("id", recordId)
    .eq("cat_id", catId);

  if (error) return { ok: false, error: "削除に失敗しました" };

  revalidatePath(`/h/${secret}`);
  revalidatePath(`/h/${secret}/cats/${catId}`);
  return { ok: true, data: null };
}

export async function updateRecord(
  secret: string,
  recordId: string,
  catId: string,
  amount: number,
  foodType: FoodType | null
): Promise<ActionResult<null>> {
  const household = await assertHousehold(secret);

  if (!Number.isInteger(amount) || amount <= 0 || amount > 100000) {
    return { ok: false, error: "amount が不正です" };
  }

  const { data: cat, error: catErr } = await supabase
    .from("cats")
    .select("id")
    .eq("id", catId)
    .eq("household_id", household.id)
    .maybeSingle();
  if (catErr || !cat) return { ok: false, error: "猫が見つかりません" };

  const { data: record, error: recordErr } = await supabase
    .from("records")
    .select("kind")
    .eq("id", recordId)
    .eq("cat_id", catId)
    .maybeSingle();
  if (recordErr || !record) return { ok: false, error: "記録が見つかりません" };

  const updatePayload: Record<string, unknown> = { amount };
  if ((record as { kind: string }).kind === "food") {
    if (foodType !== "dry" && foodType !== "wet") {
      return { ok: false, error: "food_type (dry/wet) を指定してください" };
    }
    updatePayload.food_type = foodType;
  }

  const { error } = await supabase
    .from("records")
    .update(updatePayload)
    .eq("id", recordId)
    .eq("cat_id", catId);

  if (error) return { ok: false, error: "更新に失敗しました" };

  revalidatePath(`/h/${secret}`);
  revalidatePath(`/h/${secret}/cats/${catId}`);
  return { ok: true, data: null };
}

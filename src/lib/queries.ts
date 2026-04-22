import "server-only";
import { supabase, type Cat, type CatRecord } from "./supabase";

export async function listCats(householdId: string): Promise<Cat[]> {
  const { data, error } = await supabase
    .from("cats")
    .select("id, household_id, name, icon, created_at")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Cat[];
}

export async function listRecordsSince(
  catIds: string[],
  sinceIso: string
): Promise<CatRecord[]> {
  if (catIds.length === 0) return [];
  const { data, error } = await supabase
    .from("records")
    .select("id, cat_id, kind, food_type, amount, unit, recorded_at, created_at")
    .in("cat_id", catIds)
    .gte("recorded_at", sinceIso)
    .order("recorded_at", { ascending: true });
  if (error) throw error;
  return data as CatRecord[];
}

export async function listRecentRecords(
  catId: string,
  limit = 30
): Promise<CatRecord[]> {
  const { data, error } = await supabase
    .from("records")
    .select("id, cat_id, kind, food_type, amount, unit, recorded_at, created_at")
    .eq("cat_id", catId)
    .order("recorded_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as CatRecord[];
}

export async function getCat(
  householdId: string,
  catId: string
): Promise<Cat | null> {
  const { data, error } = await supabase
    .from("cats")
    .select("id, household_id, name, icon, created_at")
    .eq("household_id", householdId)
    .eq("id", catId)
    .maybeSingle();
  if (error) throw error;
  return (data as Cat) ?? null;
}

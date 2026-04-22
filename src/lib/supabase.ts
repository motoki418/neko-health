import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
}

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

export type Household = { id: string; secret_slug: string; created_at: string };
export type Cat = {
  id: string;
  household_id: string;
  name: string;
  icon: string;
  created_at: string;
};
export type RecordKind = "food" | "water";
export type RecordUnit = "g" | "ml";
export type FoodType = "dry" | "wet";
export type CatRecord = {
  id: string;
  cat_id: string;
  kind: RecordKind;
  food_type: FoodType | null;
  amount: number;
  unit: RecordUnit;
  recorded_at: string;
  created_at: string;
};

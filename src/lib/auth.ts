import "server-only";
import { notFound } from "next/navigation";
import { supabase, type Household } from "./supabase";

export async function assertHousehold(secret: string): Promise<Household> {
  const { data, error } = await supabase
    .from("households")
    .select("id, secret_slug, created_at")
    .eq("secret_slug", secret)
    .maybeSingle();

  if (error || !data) notFound();
  return data as Household;
}

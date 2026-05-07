"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const platformSchema = z.string().min(1).max(50);

export async function togglePlatformConnection(platform: string): Promise<void> {
  const parsed = platformSchema.safeParse(platform);
  if (!parsed.success) throw new Error("Plataforma inválida");

  const supabase = await createClient();

  const { data: conn } = await supabase
    .from("social_connections")
    .select("id, is_connected")
    .eq("platform", parsed.data)
    .maybeSingle();

  if (!conn) throw new Error("Plataforma no encontrada");

  const { error } = await supabase
    .from("social_connections")
    .update({ is_connected: !conn.is_connected })
    .eq("id", conn.id);

  if (error) throw new Error(error.message);

  revalidatePath("/configuracion");
}

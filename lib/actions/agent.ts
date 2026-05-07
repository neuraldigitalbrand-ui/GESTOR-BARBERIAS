"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const agentConfigSchema = z.object({
  agent_name: z.string().min(1).max(50),
  personality: z.enum(["formal", "casual", "amigable", "profesional"]),
  tone: z.enum(["entusiasta", "calmo", "divertido", "serio", "cercano"]),
  greeting: z.string().min(1).max(500),
});

export type AgentConfigInput = z.infer<typeof agentConfigSchema>;

export async function updateAgentConfig(data: AgentConfigInput): Promise<void> {
  const parsed = agentConfigSchema.safeParse(data);
  if (!parsed.success) throw new Error("Datos inválidos");

  const supabase = await createClient();

  const { data: config } = await supabase
    .from("ai_agent_config")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!config) throw new Error("Configuración no encontrada");

  const { error } = await supabase
    .from("ai_agent_config")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", config.id);

  if (error) throw new Error(error.message);
  revalidatePath("/agente");
}

const systemPromptSchema = z.string().min(1).max(10000);

export async function updateSystemPrompt(prompt: string): Promise<void> {
  const parsed = systemPromptSchema.safeParse(prompt);
  if (!parsed.success) throw new Error("Prompt inválido");

  const supabase = await createClient();

  const { data: config } = await supabase
    .from("ai_agent_config")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!config) throw new Error("Configuración no encontrada");

  const { error } = await supabase
    .from("ai_agent_config")
    .update({ system_prompt: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", config.id);

  if (error) throw new Error(error.message);
  revalidatePath("/agente/prompt");
}

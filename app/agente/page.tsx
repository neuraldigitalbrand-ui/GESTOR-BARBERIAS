import { createClient } from "@/lib/supabase/server";
import { AgentWizard } from "@/components/agente/agent-wizard";

export default async function AgentePage() {
  const supabase = await createClient();

  const { data: config } = await supabase
    .from("ai_agent_config")
    .select("agent_name, personality, tone, greeting")
    .limit(1)
    .maybeSingle();

  const initialConfig = config
    ? {
        agent_name: config.agent_name ?? "Asistente",
        personality: config.personality ?? "amigable",
        tone: config.tone ?? "cercano",
        greeting: config.greeting ?? "¡Hola! ¿En qué te puedo ayudar hoy?",
      }
    : null;

  return <AgentWizard initialConfig={initialConfig} />;
}

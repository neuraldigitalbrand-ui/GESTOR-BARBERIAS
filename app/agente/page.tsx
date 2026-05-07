import { createClient } from "@/lib/supabase/server";
import { ConfigWizard } from "@/components/agente/config-wizard";
import { type AgentConfigInput } from "@/lib/actions/agent";
import { Bot } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function AgentePage() {
  const supabase = await createClient();

  const { data: config } = await supabase
    .from("ai_agent_config")
    .select("agent_name, personality, tone, greeting")
    .limit(1)
    .maybeSingle();

  const initial: AgentConfigInput = {
    agent_name: config?.agent_name ?? "Asistente",
    personality: (config?.personality as AgentConfigInput["personality"]) ?? "amigable",
    tone: (config?.tone as AgentConfigInput["tone"]) ?? "cercano",
    greeting: config?.greeting ?? "¡Hola! ¿En qué te puedo ayudar hoy?",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Agente IA</h1>
            <p className="text-sm text-muted-foreground">
              Personalizá el comportamiento del asistente virtual.
            </p>
          </div>
        </div>
        <Link href="/agente/prompt" className={buttonVariants({ variant: "outline" })}>
          Editar prompt del sistema
        </Link>
      </div>

      <ConfigWizard initial={initial} />
    </div>
  );
}

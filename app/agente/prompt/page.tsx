import { createClient } from "@/lib/supabase/server";
import { PromptEditor } from "@/components/agente/prompt-editor";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function AgentPromptPage() {
  const supabase = await createClient();

  const { data: config } = await supabase
    .from("ai_agent_config")
    .select("system_prompt, updated_at")
    .limit(1)
    .maybeSingle();

  const initialPrompt = config?.system_prompt ?? "";
  const updatedAt = config?.updated_at ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/agente" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Prompt del sistema</h1>
          <p className="text-sm text-muted-foreground">
            Instrucciones base que definen el comportamiento del agente.
          </p>
        </div>
      </div>

      <PromptEditor initialPrompt={initialPrompt} updatedAt={updatedAt} />
    </div>
  );
}

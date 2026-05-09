import { createClient } from "@/lib/supabase/server";
import { PromptEditor } from "@/components/agente/prompt-editor";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileCode2 } from "lucide-react";
import Link from "next/link";

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
      <PageHeader
        icon={<FileCode2 className="w-5 h-5" />}
        title="Prompt del sistema"
        subtitle="Instrucciones base que definen el comportamiento del agente"
        right={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/agente">
              <ArrowLeft className="w-4 h-4" />
              Volver al agente
            </Link>
          </Button>
        }
      />
      <PromptEditor initialPrompt={initialPrompt} updatedAt={updatedAt} />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileCode2,
  Sparkles,
  Smile,
  Briefcase,
  Palette,
  ShieldCheck,
  Heart,
  Flame,
  Coffee,
  PartyPopper,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { OptionCard } from "@/components/agente/option-card";
import { StepTabs } from "@/components/agente/step-tabs";
import { toast } from "@/components/shared/toast-provider";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { updateAgentConfig } from "@/lib/actions/agent";

const PERSONALITIES = [
  { id: "amigable",    name: "Amigable",     desc: "Cálido, cercano, hace que el cliente se sienta en confianza desde el primer mensaje.", Icon: Smile      },
  { id: "profesional", name: "Profesional",  desc: "Directo y eficiente. Foco en resolver y reservar rápido.",                            Icon: Briefcase  },
  { id: "casual",      name: "Casual",       desc: "Estilo relajado, como hablar con un amigo que sabe del rubro.",                       Icon: Palette    },
  { id: "formal",      name: "Formal",       desc: "Trato respetuoso y elegante. Ideal para clientela tradicional.",                     Icon: ShieldCheck },
] as const;

const TONES = [
  { id: "cercano",    name: "Cercano",    desc: "Cálido y empático.",                                  Icon: Heart      },
  { id: "entusiasta", name: "Entusiasta", desc: "Energía positiva, transmite ganas.",                  Icon: Flame      },
  { id: "calmo",      name: "Calmo",      desc: "Pausado, sin urgencia. Transmite confianza.",         Icon: Coffee     },
  { id: "serio",      name: "Serio",      desc: "Foco en la información, sin adornos.",                Icon: ShieldCheck},
  { id: "divertido",  name: "Divertido",  desc: "Toques de humor sutil. Para barbería con onda.",     Icon: PartyPopper},
] as const;

type Personality = (typeof PERSONALITIES)[number]["id"];
type Tone = (typeof TONES)[number]["id"];

interface Config {
  name: string;
  personality: Personality;
  tone: Tone;
  greeting: string;
}

interface AgentWizardProps {
  initialConfig: {
    agent_name: string;
    personality: string;
    tone: string;
    greeting: string;
  } | null;
}

const STEPS = ["Nombre", "Personalidad", "Tono", "Saludo", "Resumen"];

export function AgentWizard({ initialConfig }: AgentWizardProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<Config>({
    name: initialConfig?.agent_name ?? "Capital",
    personality: (initialConfig?.personality as Personality) ?? "amigable",
    tone: (initialConfig?.tone as Tone) ?? "cercano",
    greeting:
      initialConfig?.greeting ??
      "¡Hola! Soy Capital, el asistente de Barbería Capital. ¿En qué te puedo ayudar?",
  });

  const update = <K extends keyof Config>(k: K, v: Config[K]) =>
    setConfig((p) => ({ ...p, [k]: v }));

  const next = () => setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const isValid =
    config.name.length >= 2 &&
    config.greeting.length >= 20 &&
    config.greeting.length <= 500;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await updateAgentConfig({
        agent_name: config.name,
        personality: config.personality,
        tone: config.tone,
        greeting: config.greeting,
      });
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-[920px]">
      <PageHeader
        icon={<Bot className="w-5 h-5" />}
        title="Agente IA"
        subtitle="Personalizá cómo responde tu asistente automatizado."
        right={
          <Button variant="outline" asChild>
            <Link href="/agente/prompt">
              <FileCode2 className="w-4 h-4" /> Editar prompt del sistema
            </Link>
          </Button>
        }
      />

      <StepTabs steps={STEPS} active={step} onSelect={setStep} />

      <div
        className="bg-surface border border-white/[0.06] rounded-2xl p-7 mt-6 animate-fade-in"
        key={step}
      >
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-text-1">¿Cómo se llama el agente?</h2>
            <p className="text-sm text-text-2 mt-1">Este nombre aparece en los mensajes automáticos.</p>
            <div className="mt-5">
              <label className="text-xs text-text-2 mb-2 block">Nombre del agente</label>
              <Input
                value={config.name}
                onChange={(e) => update("name", e.target.value.slice(0, 50))}
                placeholder="Ej: Capital, Bruno, Asistente..."
                maxLength={50}
              />
              <div className="flex justify-end text-xs text-text-3 mt-1.5">
                {config.name.length}/50
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-bg border border-white/[0.06]">
              <div className="text-[11px] uppercase tracking-wider text-text-3 mb-2">Vista previa</div>
              <p className="text-sm text-text-1">
                &quot;¡Hola! Soy{" "}
                <span className="text-brand font-medium">
                  {config.name || "..."}
                </span>
                , el asistente de Barbería Capital.&quot;
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-text-1">¿Qué personalidad tiene?</h2>
            <p className="text-sm text-text-2 mt-1">Define el carácter base del agente.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
              {PERSONALITIES.map((p) => (
                <OptionCard
                  key={p.id}
                  selected={config.personality === p.id}
                  onClick={() => update("personality", p.id)}
                  Icon={p.Icon}
                  name={p.name}
                  desc={p.desc}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-text-1">¿Qué tono usa?</h2>
            <p className="text-sm text-text-2 mt-1">Cómo se siente la conversación al leerla.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
              {TONES.map((t) => (
                <OptionCard
                  key={t.id}
                  selected={config.tone === t.id}
                  onClick={() => update("tone", t.id)}
                  Icon={t.Icon}
                  name={t.name}
                  desc={t.desc}
                />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-text-1">¿Con qué mensaje saluda?</h2>
            <p className="text-sm text-text-2 mt-1">Primer mensaje cuando alguien escribe por primera vez.</p>
            <div className="mt-5">
              <Textarea
                value={config.greeting}
                onChange={(e) => update("greeting", e.target.value.slice(0, 500))}
                placeholder="Escribí el saludo del agente..."
                className="min-h-[140px]"
              />
              <div className="flex justify-between text-xs mt-1.5">
                <span className={cn(config.greeting.length < 20 ? "text-warning" : "text-text-3")}>
                  {config.greeting.length < 20 ? "Mínimo 20 caracteres" : "Listo para usar"}
                </span>
                <span className="text-text-3">{config.greeting.length}/500</span>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-text-1">Revisá la configuración</h2>
            <p className="text-sm text-text-2 mt-1">Confirmá antes de guardar.</p>
            <div className="mt-5 bg-bg rounded-xl border border-white/[0.06] divide-y divide-white/[0.04]">
              {[
                ["Nombre del agente", config.name],
                ["Personalidad", PERSONALITIES.find((p) => p.id === config.personality)!.name],
                ["Tono", TONES.find((t) => t.id === config.tone)!.name],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-text-2">{l}</span>
                  <span className="text-sm text-text-1 font-medium">{v}</span>
                </div>
              ))}
              <div className="px-5 py-3.5">
                <div className="text-sm text-text-2 mb-2">Saludo configurado</div>
                <p className="text-sm text-text-1 leading-relaxed">&quot;{config.greeting}&quot;</p>
              </div>
            </div>
            <div
              className={cn(
                "mt-4 flex items-center gap-2 text-sm rounded-lg p-3 border",
                isValid
                  ? "bg-success/5 border-success/20 text-success"
                  : "bg-warning/5 border-warning/20 text-warning"
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isValid ? "Configuración lista para guardar" : "Completá los pasos anteriores"}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <Button variant="ghost" onClick={prev} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
        {step < 4 ? (
          <Button onClick={next}>
            Siguiente <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={!isValid || saving}>
            <Sparkles className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar configuración"}
          </Button>
        )}
      </div>
    </div>
  );
}

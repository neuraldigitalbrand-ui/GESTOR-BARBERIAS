"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateAgentConfig, type AgentConfigInput } from "@/lib/actions/agent";

type Personality = AgentConfigInput["personality"];
type Tone = AgentConfigInput["tone"];

const PERSONALITY_OPTIONS: { value: Personality; label: string; description: string }[] = [
  { value: "amigable",    label: "Amigable",      description: "Cálido, cercano y accesible" },
  { value: "profesional", label: "Profesional",   description: "Serio, confiable y eficiente" },
  { value: "casual",      label: "Casual",         description: "Relajado y natural" },
  { value: "formal",      label: "Formal",         description: "Correcto y respetuoso" },
];

const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "cercano",    label: "Cercano",     description: "Como un conocido de confianza" },
  { value: "entusiasta", label: "Entusiasta",  description: "Energético y positivo" },
  { value: "calmo",      label: "Calmo",       description: "Tranquilo y pausado" },
  { value: "serio",      label: "Serio",       description: "Directo y sin vueltas" },
  { value: "divertido",  label: "Divertido",   description: "Con humor y ligereza" },
];

const STEPS = ["nombre", "personalidad", "tono", "saludo", "resumen"] as const;
type Step = (typeof STEPS)[number];

interface ConfigWizardProps {
  initial: AgentConfigInput;
}

export function ConfigWizard({ initial }: ConfigWizardProps) {
  const [step, setStep] = useState<Step>("nombre");
  const [agentName, setAgentName] = useState(initial.agent_name);
  const [personality, setPersonality] = useState<Personality>(initial.personality);
  const [tone, setTone] = useState<Tone>(initial.tone);
  const [greeting, setGreeting] = useState(initial.greeting);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentIndex = STEPS.indexOf(step);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEPS.length - 1;

  const goNext = () => setStep(STEPS[currentIndex + 1]);
  const goPrev = () => setStep(STEPS[currentIndex - 1]);

  const handleSave = () => {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      try {
        await updateAgentConfig({ agent_name: agentName, personality, tone, greeting });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch {
        setError("No se pudo guardar. Intentá de nuevo.");
      }
    });
  };

  const personalityLabel = PERSONALITY_OPTIONS.find((o) => o.value === personality)?.label ?? personality;
  const toneLabel = TONE_OPTIONS.find((o) => o.value === tone)?.label ?? tone;

  return (
    <Tabs value={step} onValueChange={(v) => setStep(v as Step)} className="space-y-6">
      <TabsList className="w-full">
        <TabsTrigger value="nombre"        className="flex-1">Nombre</TabsTrigger>
        <TabsTrigger value="personalidad"  className="flex-1">Personalidad</TabsTrigger>
        <TabsTrigger value="tono"          className="flex-1">Tono</TabsTrigger>
        <TabsTrigger value="saludo"        className="flex-1">Saludo</TabsTrigger>
        <TabsTrigger value="resumen"       className="flex-1">Resumen</TabsTrigger>
      </TabsList>

      {/* Paso 1 — Nombre */}
      <TabsContent value="nombre" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">¿Cómo se llama el agente?</h2>
          <p className="text-sm text-muted-foreground">
            Este es el nombre con el que el agente se identifica ante los clientes.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="agent-name">Nombre del agente</Label>
          <Input
            id="agent-name"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="Ej: Capital, Asistente, Bot..."
            maxLength={50}
          />
        </div>
      </TabsContent>

      {/* Paso 2 — Personalidad */}
      <TabsContent value="personalidad" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">¿Qué personalidad tiene el agente?</h2>
          <p className="text-sm text-muted-foreground">
            Define el carácter general de las respuestas.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Personalidad</Label>
          <Select value={personality} onValueChange={(v) => setPersonality(v as Personality)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccioná una personalidad" />
            </SelectTrigger>
            <SelectContent>
              {PERSONALITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="ml-2 text-muted-foreground">— {opt.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      {/* Paso 3 — Tono */}
      <TabsContent value="tono" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">¿Con qué tono habla el agente?</h2>
          <p className="text-sm text-muted-foreground">
            El tono complementa la personalidad en cada interacción.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Tono</Label>
          <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccioná un tono" />
            </SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="ml-2 text-muted-foreground">— {opt.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      {/* Paso 4 — Saludo */}
      <TabsContent value="saludo" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">¿Cómo saluda el agente?</h2>
          <p className="text-sm text-muted-foreground">
            Primer mensaje que recibe el cliente al iniciar una conversación.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="greeting">Mensaje de saludo</Label>
          <Textarea
            id="greeting"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            placeholder="¡Hola! ¿En qué te puedo ayudar hoy?"
            rows={4}
            maxLength={500}
          />
          <p className="text-right text-xs text-muted-foreground">{greeting.length}/500</p>
        </div>
      </TabsContent>

      {/* Paso 5 — Resumen */}
      <TabsContent value="resumen" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Resumen de configuración</h2>
          <p className="text-sm text-muted-foreground">
            Revisá los datos antes de guardar.
          </p>
        </div>
        <div className="rounded-lg border divide-y text-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground">Nombre</span>
            <span className="font-medium">{agentName || "—"}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground">Personalidad</span>
            <Badge variant="secondary">{personalityLabel}</Badge>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground">Tono</span>
            <Badge variant="secondary">{toneLabel}</Badge>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3">
            <span className="text-muted-foreground">Saludo</span>
            <span className="italic">&ldquo;{greeting || "—"}&rdquo;</span>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saved && (
          <p className="text-sm text-green-600 dark:text-green-400">
            ¡Configuración guardada correctamente!
          </p>
        )}
      </TabsContent>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={goPrev} disabled={isFirst}>
          Anterior
        </Button>
        {isLast ? (
          <Button onClick={handleSave} disabled={isPending || !agentName.trim()}>
            {isPending ? "Guardando..." : saved ? "¡Guardado!" : "Guardar"}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={isLast}>
            Siguiente
          </Button>
        )}
      </div>
    </Tabs>
  );
}

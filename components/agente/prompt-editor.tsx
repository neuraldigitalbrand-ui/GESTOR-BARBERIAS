"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateSystemPrompt } from "@/lib/actions/agent";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const DEFAULT_PROMPT = `Sos el asistente virtual de Barbería Capital, una barbería profesional ubicada en Montevideo, Uruguay.

Tu rol es ayudar a los clientes a:
- Consultar servicios disponibles y sus precios
- Reservar turnos (corte, degradado, barba, cejas, tinte, etc.)
- Responder preguntas sobre horarios y disponibilidad
- Brindar información general sobre la barbería

Servicios disponibles:
- Corte clásico: $600 (30 min)
- Corte degradado: $800 (45 min)
- Barba: $400 (20 min)
- Corte + barba: $1.100 (60 min)
- Diseño de cejas: $200 (15 min)
- Tinte: $1.500 (60 min)

Horario de atención: Lunes a sábado, 9:00 a 20:00 hs.

Directrices de comportamiento:
1. Siempre saludá cordialmente al cliente al iniciar la conversación.
2. Usá un lenguaje natural y cercano, en español rioplatense.
3. Si el cliente quiere reservar un turno, pedí: nombre, servicio deseado y horario preferido.
4. Confirmá siempre los detalles antes de dar por reservado el turno.
5. Si no podés resolver algo, informá que un humano del equipo lo va a contactar pronto.
6. No inventes información que no tenés. Si no sabés algo, decilo con honestidad.
7. Sé breve y directo. Evitá respuestas largas o innecesarias.`;

interface PromptEditorProps {
  initialPrompt: string;
  updatedAt: string | null;
}

export function PromptEditor({ initialPrompt, updatedAt }: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      try {
        await updateSystemPrompt(prompt);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch {
        setError("No se pudo guardar. Intentá de nuevo.");
      }
    });
  };

  const handleRestore = () => {
    setPrompt(DEFAULT_PROMPT);
    setSaved(false);
    setError(null);
  };

  const updatedLabel = updatedAt
    ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: es })
    : null;

  return (
    <div className="space-y-4">
      {updatedLabel && (
        <p className="text-xs text-muted-foreground">
          Última modificación: {updatedLabel}
        </p>
      )}

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[400px] font-mono text-sm"
        placeholder="Escribí el prompt del sistema aquí..."
        maxLength={10000}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{prompt.length}/10.000 caracteres</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRestore} disabled={isPending}>
            Restaurar default
          </Button>
          <Button onClick={handleSave} disabled={isPending || !prompt.trim()}>
            {isPending ? "Guardando..." : saved ? "¡Guardado!" : "Guardar"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ¡Prompt guardado correctamente!
        </p>
      )}
    </div>
  );
}

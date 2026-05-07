"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon, platformLabel } from "@/components/platform-icon";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface HistoryItem {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  service_name: string;
}

export interface AppointmentDetail {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  notes: string | null;
  lead: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    source_platform: string | null;
  };
  service: {
    name: string;
    duration_minutes: number;
    price: number;
  };
  history: HistoryItem[];
  conversation_id: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado",
  pending: "Pendiente",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  completed: "secondary",
  cancelled: "destructive",
  pending: "outline",
};

interface AppointmentCardProps {
  appointment: AppointmentDetail;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const [open, setOpen] = useState(false);
  const start = new Date(appointment.start_at);
  const end = new Date(appointment.end_at);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-md border bg-background p-2 text-left text-xs transition-colors hover:bg-muted/60"
      >
        <p className="font-medium leading-tight">{appointment.lead.name}</p>
        <p className="text-muted-foreground">
          {format(start, "HH:mm")}–{format(end, "HH:mm")}
        </p>
        <p className="truncate text-muted-foreground">{appointment.service.name}</p>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{appointment.lead.name}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Lead info */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cliente
              </h3>
              <div className="space-y-1 text-sm">
                {appointment.lead.phone && (
                  <p>
                    <span className="text-muted-foreground">Teléfono: </span>
                    {appointment.lead.phone}
                  </p>
                )}
                {appointment.lead.email && (
                  <p>
                    <span className="text-muted-foreground">Email: </span>
                    {appointment.lead.email}
                  </p>
                )}
                {appointment.lead.source_platform && (
                  <p className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Plataforma: </span>
                    <PlatformIcon platform={appointment.lead.source_platform} size={14} />
                    {platformLabel(appointment.lead.source_platform)}
                  </p>
                )}
              </div>
            </section>

            {/* Appointment info */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Turno
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Servicio: </span>
                  {appointment.service.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Fecha: </span>
                  <span className="capitalize">
                    {format(start, "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Horario: </span>
                  {format(start, "HH:mm")}–{format(end, "HH:mm")}
                </p>
                <p>
                  <span className="text-muted-foreground">Duración: </span>
                  {appointment.service.duration_minutes} min
                </p>
                <p>
                  <span className="text-muted-foreground">Precio: </span>
                  ${Number(appointment.service.price).toLocaleString("es-UY")}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Estado: </span>
                  <Badge variant={STATUS_VARIANT[appointment.status] ?? "secondary"}>
                    {STATUS_LABEL[appointment.status] ?? appointment.status}
                  </Badge>
                </div>
                {appointment.notes && (
                  <p>
                    <span className="text-muted-foreground">Notas: </span>
                    {appointment.notes}
                  </p>
                )}
              </div>
            </section>

            {/* Conversation link */}
            {appointment.conversation_id && (
              <Link
                href={`/conversaciones/${appointment.conversation_id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Ver conversación
              </Link>
            )}

            {/* History */}
            {appointment.history.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Historial ({appointment.history.length})
                </h3>
                <div className="space-y-1">
                  {appointment.history.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                    >
                      <span>
                        <span className="capitalize">
                          {format(new Date(h.start_at), "d MMM yyyy", { locale: es })}
                        </span>
                        {" · "}
                        {h.service_name}
                      </span>
                      <Badge
                        variant={STATUS_VARIANT[h.status] ?? "secondary"}
                        className="ml-2 text-[0.65rem]"
                      >
                        {STATUS_LABEL[h.status] ?? h.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

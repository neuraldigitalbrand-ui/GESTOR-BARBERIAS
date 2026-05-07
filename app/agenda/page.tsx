import { createClient } from "@/lib/supabase/server";
import { WeekView } from "@/components/agenda/week-view";
import { WeekNav } from "@/components/agenda/week-nav";
import { type AppointmentDetail } from "@/components/agenda/appointment-sheet";
import { CalendarDays } from "lucide-react";
import { startOfWeek, addWeeks, addDays, format } from "date-fns";
import { es } from "date-fns/locale";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekOffset = parseInt(week ?? "0", 10) || 0;

  const now = new Date();
  const monday = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), weekOffset);

  // Build Mon–Sat date range
  const days = Array.from({ length: 6 }, (_, i) => addDays(monday, i));
  const rangeStart = days[0];
  const rangeEnd = addDays(days[5], 1); // exclusive end

  const weekLabel = `${format(rangeStart, "d MMM", { locale: es })} – ${format(days[5], "d MMM yyyy", { locale: es })}`;

  const supabase = await createClient();

  // Fetch appointments in the week window
  const { data: rawApts } = await supabase
    .from("appointments")
    .select("id, lead_id, service_id, start_at, end_at, status, notes")
    .gte("start_at", rangeStart.toISOString())
    .lt("start_at", rangeEnd.toISOString())
    .order("start_at", { ascending: true });

  const appointments = rawApts ?? [];

  if (appointments.length === 0) {
    return (
      <div className="space-y-6">
        <AgendaHeader weekOffset={weekOffset} weekLabel={weekLabel} />
        <WeekView columns={days.map((d) => ({ date: d, appointments: [] }))} />
      </div>
    );
  }

  // Collect unique lead_ids and service_ids
  const leadIds = [...new Set(appointments.map((a) => a.lead_id))];
  const serviceIds = [...new Set(appointments.map((a) => a.service_id))];

  const [leadsResult, servicesResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id, name, phone, email, source_platform")
      .in("id", leadIds),
    supabase
      .from("services")
      .select("id, name, duration_minutes, price")
      .in("id", serviceIds),
  ]);

  const leadMap = new Map((leadsResult.data ?? []).map((l) => [l.id, l]));
  const serviceMap = new Map((servicesResult.data ?? []).map((s) => [s.id, s]));

  // Fetch all appointments history + conversations in parallel
  const [historyResult, convResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, lead_id, service_id, start_at, end_at, status")
      .in("lead_id", leadIds)
      .not("id", "in", `(${appointments.map((a) => `"${a.id}"`).join(",")})`)
      .order("start_at", { ascending: false }),
    supabase
      .from("conversations")
      .select("id, lead_id")
      .in("lead_id", leadIds),
  ]);

  // Map lead_id → first conversation id
  const convByLead = new Map<string, string>();
  for (const c of convResult.data ?? []) {
    if (!convByLead.has(c.lead_id)) convByLead.set(c.lead_id, c.id);
  }

  // Build history per lead
  const historyByLead = new Map<string, AppointmentDetail["history"]>();
  for (const h of historyResult.data ?? []) {
    const svc = serviceMap.get(h.service_id);
    if (!historyByLead.has(h.lead_id)) historyByLead.set(h.lead_id, []);
    historyByLead.get(h.lead_id)!.push({
      id: h.id,
      start_at: h.start_at,
      end_at: h.end_at,
      status: h.status,
      service_name: svc?.name ?? "Servicio",
    });
  }

  // Build full AppointmentDetail list
  const details: AppointmentDetail[] = appointments.flatMap((apt) => {
    const lead = leadMap.get(apt.lead_id);
    const service = serviceMap.get(apt.service_id);
    if (!lead || !service) return [];

    return [
      {
        id: apt.id,
        start_at: apt.start_at,
        end_at: apt.end_at,
        status: apt.status,
        notes: apt.notes,
        lead: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          source_platform: lead.source_platform,
        },
        service: {
          name: service.name,
          duration_minutes: service.duration_minutes,
          price: Number(service.price),
        },
        history: historyByLead.get(apt.lead_id) ?? [],
        conversation_id: convByLead.get(apt.lead_id) ?? null,
      },
    ];
  });

  // Group by day
  const columns = days.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return {
      date,
      appointments: details.filter(
        (a) => format(new Date(a.start_at), "yyyy-MM-dd") === dateStr
      ),
    };
  });

  return (
    <div className="space-y-6">
      <AgendaHeader weekOffset={weekOffset} weekLabel={weekLabel} />
      <WeekView columns={columns} />
    </div>
  );
}

function AgendaHeader({
  weekOffset,
  weekLabel,
}: {
  weekOffset: number;
  weekLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-sm text-muted-foreground">Vista semanal</p>
        </div>
      </div>
      <WeekNav weekOffset={weekOffset} weekLabel={weekLabel} />
    </div>
  );
}

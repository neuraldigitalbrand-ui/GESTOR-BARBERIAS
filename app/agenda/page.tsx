import { createClient } from "@/lib/supabase/server";
import { WeekView } from "@/components/agenda/week-view";
import { WeekNav } from "@/components/agenda/week-nav";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarDays } from "lucide-react";
import { startOfWeek, addWeeks, addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import type { AgendaAppointment, AppointmentStatus, Platform } from "@/lib/types";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekOffset = parseInt(week ?? "0", 10) || 0;

  const now = new Date();
  const monday = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), weekOffset);
  const days = Array.from({ length: 6 }, (_, i) => addDays(monday, i));
  const rangeStart = days[0];
  const rangeEnd = addDays(days[5], 1);

  const weekLabel = `${format(rangeStart, "d MMM", { locale: es })} – ${format(days[5], "d MMM yyyy", { locale: es })}`;

  const supabase = await createClient();

  const { data: rawApts } = await supabase
    .from("appointments")
    .select("id, lead_id, service_id, start_at, end_at, status")
    .gte("start_at", rangeStart.toISOString())
    .lt("start_at", rangeEnd.toISOString())
    .order("start_at", { ascending: true });

  const appointments = rawApts ?? [];

  const emptyCols = days.map((d) => ({ dateStr: d.toISOString(), appointments: [] as AgendaAppointment[] }));

  if (appointments.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={<CalendarDays className="w-5 h-5" />}
          title="Agenda"
          subtitle="Vista semanal"
          right={<WeekNav weekOffset={weekOffset} weekLabel={weekLabel} />}
        />
        <WeekView columns={emptyCols} />
      </div>
    );
  }

  const leadIds = [...new Set(appointments.map((a) => a.lead_id))];
  const serviceIds = [...new Set(appointments.map((a) => a.service_id))];

  const [leadsResult, servicesResult] = await Promise.all([
    supabase.from("leads").select("id, name, phone, email, source_platform").in("id", leadIds),
    supabase.from("services").select("id, name, duration_minutes, price").in("id", serviceIds),
  ]);

  const leadMap = new Map((leadsResult.data ?? []).map((l) => [l.id, l]));
  const serviceMap = new Map((servicesResult.data ?? []).map((s) => [s.id, s]));

  const details: AgendaAppointment[] = appointments.flatMap((apt) => {
    const lead = leadMap.get(apt.lead_id);
    const service = serviceMap.get(apt.service_id);
    if (!lead || !service) return [];

    const start = new Date(apt.start_at);
    return [
      {
        id: apt.id,
        time: format(start, "HH:mm"),
        endTime: format(new Date(apt.end_at), "HH:mm"),
        name: lead.name,
        phone: lead.phone ?? null,
        email: lead.email ?? null,
        service: service.name,
        duration: service.duration_minutes,
        price: Number(service.price),
        status: apt.status as AppointmentStatus,
        platform: ((lead.source_platform as Platform) || "instagram"),
        startAt: apt.start_at,
      },
    ];
  });

  const columns = days.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return {
      dateStr: date.toISOString(),
      appointments: details.filter(
        (a) => format(new Date(a.startAt), "yyyy-MM-dd") === dateStr
      ),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CalendarDays className="w-5 h-5" />}
        title="Agenda"
        subtitle="Vista semanal"
        right={<WeekNav weekOffset={weekOffset} weekLabel={weekLabel} />}
      />
      <WeekView columns={columns} />
    </div>
  );
}

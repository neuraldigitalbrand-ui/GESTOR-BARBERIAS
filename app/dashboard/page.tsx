import { createClient } from "@/lib/supabase/server";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TopServices } from "@/components/dashboard/top-services";
import { NextAppointmentCard } from "@/components/dashboard/next-appointment";
import { RevenueCard } from "@/components/dashboard/revenue-card";
import { PageHeader } from "@/components/shared/page-header";
import {
  CalendarCheck,
  CalendarDays,
  MessageSquare,
  Inbox,
  LayoutDashboard,
} from "lucide-react";
import { startOfWeek, addDays, format } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const monday = startOfWeek(now, { weekStartsOn: 1 });
  const saturday = addDays(monday, 5);
  saturday.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);

  const [
    todayResult,
    weekCountResult,
    activeConvsResult,
    unreadResult,
    weekAptsResult,
    allServicesResult,
    topAptsResult,
    nextAptResult,
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed")
      .gte("start_at", todayStart.toISOString())
      .lte("start_at", todayEnd.toISOString()),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .in("status", ["confirmed", "completed"])
      .gte("start_at", monday.toISOString())
      .lte("start_at", saturday.toISOString()),
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .gte("last_message_at", sevenDaysAgo.toISOString()),
    supabase.from("conversations").select("unread_count"),
    supabase
      .from("appointments")
      .select("service_id, start_at")
      .in("status", ["confirmed", "completed"])
      .gte("start_at", monday.toISOString())
      .lte("start_at", saturday.toISOString()),
    supabase.from("services").select("id, name, price, duration_minutes"),
    supabase
      .from("appointments")
      .select("service_id")
      .eq("status", "completed")
      .gte("start_at", oneMonthAgo.toISOString()),
    supabase
      .from("appointments")
      .select("id, start_at, end_at, lead_id, service_id")
      .eq("status", "confirmed")
      .gt("start_at", now.toISOString())
      .order("start_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const todayCount = todayResult.count ?? 0;
  const weekCount = weekCountResult.count ?? 0;
  const activeConvs = activeConvsResult.count ?? 0;
  const unreadTotal = (unreadResult.data ?? []).reduce(
    (acc, c) => acc + (c.unread_count ?? 0),
    0
  );

  const serviceMap = new Map(
    (allServicesResult.data ?? []).map((s) => [s.id, s])
  );

  const weekRevenue = (weekAptsResult.data ?? []).reduce((acc, apt) => {
    return acc + Number(serviceMap.get(apt.service_id)?.price ?? 0);
  }, 0);

  // Build daily revenue bars (Mon–Sat)
  const todayStr = format(now, "yyyy-MM-dd");
  const maxDayRevenue = Math.max(
    ...Array.from({ length: 6 }, (_, i) => {
      const dateStr = format(addDays(monday, i), "yyyy-MM-dd");
      return (weekAptsResult.data ?? [])
        .filter((a) => a.start_at.startsWith(dateStr))
        .reduce((acc, a) => acc + Number(serviceMap.get(a.service_id)?.price ?? 0), 0);
    }),
    1
  );
  const weekBars = Array.from({ length: 6 }, (_, i) => {
    const day = addDays(monday, i);
    const dateStr = format(day, "yyyy-MM-dd");
    const dayRevenue = (weekAptsResult.data ?? [])
      .filter((a) => a.start_at.startsWith(dateStr))
      .reduce((acc, a) => acc + Number(serviceMap.get(a.service_id)?.price ?? 0), 0);
    return {
      d: format(day, "EEE", { locale: es }),
      v: dayRevenue / maxDayRevenue,
      today: dateStr === todayStr,
      future: day > now,
    };
  });

  // Top 3 services
  const serviceCounts = new Map<string, number>();
  for (const apt of topAptsResult.data ?? []) {
    serviceCounts.set(apt.service_id, (serviceCounts.get(apt.service_id) ?? 0) + 1);
  }
  const topServices = Array.from(serviceCounts.entries())
    .map(([id, count]) => ({ name: serviceMap.get(id)?.name ?? "Desconocido", count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Next appointment
  const nextAptRaw = nextAptResult.data;
  let nextAppointment: { leadName: string; serviceName: string; durationMinutes: number; startAt: string; endAt: string } | null = null;

  if (nextAptRaw) {
    const { data: lead } = await supabase
      .from("leads")
      .select("name")
      .eq("id", nextAptRaw.lead_id)
      .maybeSingle();

    const svc = serviceMap.get(nextAptRaw.service_id);
    nextAppointment = {
      leadName: lead?.name ?? "Cliente",
      serviceName: svc?.name ?? "Servicio",
      durationMinutes: svc?.duration_minutes ?? 30,
      startAt: nextAptRaw.start_at,
      endAt: nextAptRaw.end_at,
    };
  }

  const dateSubtitle = format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<LayoutDashboard className="w-5 h-5" />}
        title="Dashboard"
        subtitle={dateSubtitle}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Turnos de hoy"
          value={todayCount}
          description="Confirmados"
          icon={<CalendarCheck className="w-4 h-4" />}
        />
        <MetricCard
          label="Turnos esta semana"
          value={weekCount}
          description="Lunes a sábado"
          icon={<CalendarDays className="w-4 h-4" />}
        />
        <MetricCard
          label="Conversaciones activas"
          value={activeConvs}
          description="Últimos 7 días"
          icon={<MessageSquare className="w-4 h-4" />}
        />
        <MetricCard
          label="Sin leer"
          value={unreadTotal}
          description="Todas las plataformas"
          icon={<Inbox className="w-4 h-4" />}
          warning={unreadTotal > 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueCard revenue={weekRevenue} weekBars={weekBars} />
        <div className="grid gap-4">
          <TopServices services={topServices} />
          {nextAppointment ? (
            <NextAppointmentCard
              leadName={nextAppointment.leadName}
              serviceName={nextAppointment.serviceName}
              durationMinutes={nextAppointment.durationMinutes}
              startAt={nextAppointment.startAt}
              endAt={nextAppointment.endAt}
            />
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-6">
              <p className="text-sm text-text-3">No hay turnos próximos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

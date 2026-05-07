import { createClient } from "@/lib/supabase/server";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TopServices } from "@/components/dashboard/top-services";
import { NextAppointment } from "@/components/dashboard/next-appointment";
import {
  CalendarCheck,
  CalendarDays,
  MessageSquare,
  Inbox,
  DollarSign,
} from "lucide-react";
import { startOfWeek } from "date-fns";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function formatCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-UY")}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();

  // Date ranges
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const monday = startOfWeek(now, { weekStartsOn: 1 });
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
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
    // 1. Turnos de hoy (confirmed)
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed")
      .gte("start_at", todayStart.toISOString())
      .lte("start_at", todayEnd.toISOString()),

    // 2. Turnos de la semana (confirmed + completed, Mon–Sat)
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .in("status", ["confirmed", "completed"])
      .gte("start_at", monday.toISOString())
      .lte("start_at", saturday.toISOString()),

    // 3. Conversaciones activas (last 7 days)
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .gte("last_message_at", sevenDaysAgo.toISOString()),

    // 4. Mensajes sin leer (sum unread_count)
    supabase.from("conversations").select("unread_count"),

    // 5. Appointments this week for revenue calculation
    supabase
      .from("appointments")
      .select("service_id")
      .in("status", ["confirmed", "completed"])
      .gte("start_at", monday.toISOString())
      .lte("start_at", saturday.toISOString()),

    // 6. All services (price + name lookup table)
    supabase.from("services").select("id, name, price"),

    // 7. Completed appointments last month (for top services)
    supabase
      .from("appointments")
      .select("service_id")
      .eq("status", "completed")
      .gte("start_at", oneMonthAgo.toISOString()),

    // 8. Next upcoming confirmed appointment
    supabase
      .from("appointments")
      .select("id, start_at, end_at, lead_id, service_id")
      .eq("status", "confirmed")
      .gt("start_at", now.toISOString())
      .order("start_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  // --- Process metrics ---
  const todayCount = todayResult.count ?? 0;
  const weekCount = weekCountResult.count ?? 0;
  const activeConvs = activeConvsResult.count ?? 0;
  const unreadTotal = (unreadResult.data ?? []).reduce(
    (acc, c) => acc + c.unread_count,
    0
  );

  const serviceMap = new Map(
    (allServicesResult.data ?? []).map((s) => [s.id, s])
  );

  const weekRevenue = (weekAptsResult.data ?? []).reduce((acc, apt) => {
    return acc + Number(serviceMap.get(apt.service_id)?.price ?? 0);
  }, 0);

  // Top 3 services by appointment count
  const serviceCounts = new Map<string, number>();
  for (const apt of topAptsResult.data ?? []) {
    serviceCounts.set(apt.service_id, (serviceCounts.get(apt.service_id) ?? 0) + 1);
  }
  const topServices = Array.from(serviceCounts.entries())
    .map(([id, count]) => ({
      name: serviceMap.get(id)?.name ?? "Desconocido",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Next appointment with lead name
  const nextAptRaw = nextAptResult.data;
  let nextAppointment: {
    leadName: string;
    serviceName: string;
    startAt: string;
    endAt: string;
  } | null = null;

  if (nextAptRaw) {
    const { data: lead } = await supabase
      .from("leads")
      .select("name")
      .eq("id", nextAptRaw.lead_id)
      .maybeSingle();

    nextAppointment = {
      leadName: lead?.name ?? "Cliente",
      serviceName: serviceMap.get(nextAptRaw.service_id)?.name ?? "Servicio",
      startAt: nextAptRaw.start_at,
      endAt: nextAptRaw.end_at,
    };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm capitalize text-muted-foreground">
          {format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* 5 metric cards — 4-col grid, responsive */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Turnos de hoy"
          value={todayCount}
          description="Confirmados"
          icon={CalendarCheck}
        />
        <MetricCard
          title="Turnos de la semana"
          value={weekCount}
          description="Lunes a sábado"
          icon={CalendarDays}
        />
        <MetricCard
          title="Conversaciones activas"
          value={activeConvs}
          description="Últimos 7 días"
          icon={MessageSquare}
        />
        <MetricCard
          title="Mensajes sin leer"
          value={unreadTotal}
          description="Todas las plataformas"
          icon={Inbox}
        />
        <MetricCard
          title="Ingresos estimados"
          value={formatCurrency(weekRevenue)}
          description="Esta semana"
          icon={DollarSign}
        />
      </div>

      {/* Bottom row: top services + next appointment */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopServices services={topServices} />
        {nextAppointment ? (
          <NextAppointment
            leadName={nextAppointment.leadName}
            serviceName={nextAppointment.serviceName}
            startAt={nextAppointment.startAt}
            endAt={nextAppointment.endAt}
          />
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
            <p className="text-sm text-muted-foreground">
              No hay turnos próximos confirmados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

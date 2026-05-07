import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface NextAppointmentProps {
  leadName: string;
  serviceName: string;
  startAt: string;
  endAt: string;
}

export function NextAppointment({
  leadName,
  serviceName,
  startAt,
  endAt,
}: NextAppointmentProps) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const dateLabel = format(start, "EEEE d 'de' MMMM", { locale: es });
  const timeLabel = `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Próximo turno
        </CardTitle>
        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xl font-bold">{leadName}</div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{serviceName}</Badge>
        </div>
        <div className="text-sm text-muted-foreground capitalize">{dateLabel}</div>
        <div className="text-sm font-medium">{timeLabel}</div>
      </CardContent>
    </Card>
  );
}

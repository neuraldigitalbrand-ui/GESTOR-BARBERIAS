import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface TopServicesProps {
  services: { name: string; count: number }[];
}

export function TopServices({ services }: TopServicesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Top servicios (último mes)
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos</p>
        ) : (
          <ol className="space-y-2">
            {services.map((s, i) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-5 text-right font-mono text-muted-foreground">
                    {i + 1}.
                  </span>
                  <span className="font-medium">{s.name}</span>
                </span>
                <span className="text-muted-foreground">
                  {s.count} {s.count === 1 ? "turno" : "turnos"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

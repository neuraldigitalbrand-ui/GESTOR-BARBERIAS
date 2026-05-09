import { Building2, MapPin, Clock, Users } from "lucide-react";

interface AccountInfoProps {
  name?: string;
  address?: string;
  schedule?: string;
  team?: string;
}

export function AccountInfo({
  name = "Barbería Capital",
  address = "Av. 18 de Julio 1234, Montevideo",
  schedule = "09:00 – 19:00 · Lunes a sábado",
  team = "2 barberos activos",
}: AccountInfoProps) {
  return (
    <div className="bg-surface border border-white/[0.06] rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-5">
      <Cell
        icon={<Building2 className="w-3.5 h-3.5" />}
        label="Local"
        value={name}
        sub="Plan Pro · activo"
      />
      <Cell
        icon={<MapPin className="w-3.5 h-3.5" />}
        label="Dirección"
        value={address.split(",")[0]}
        sub={address.split(",").slice(1).join(",").trim() || "Montevideo, UY"}
      />
      <Cell
        icon={<Clock className="w-3.5 h-3.5" />}
        label="Horario"
        value={schedule.split("·")[0].trim()}
        sub={schedule.split("·").slice(1).join("·").trim() || "Lunes a sábado"}
      />
      <Cell
        icon={<Users className="w-3.5 h-3.5" />}
        label="Equipo"
        value={team}
        sub=""
      />
    </div>
  );
}

function Cell({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-text-3">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm text-text-1 font-medium mt-1.5">{value}</div>
      {sub && <div className="text-[11px] text-text-3 mt-0.5">{sub}</div>}
    </div>
  );
}

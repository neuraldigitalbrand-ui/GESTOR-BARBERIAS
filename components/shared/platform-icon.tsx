import {
  SiInstagram,
  SiWhatsapp,
  SiMessenger,
  SiTiktok,
  SiGooglecalendar,
} from "@icons-pack/react-simple-icons";
import type { Platform } from "@/lib/types";

const MAP = {
  instagram: { Icon: SiInstagram, color: "#E4405F", label: "Instagram" },
  whatsapp: { Icon: SiWhatsapp, color: "#25D366", label: "WhatsApp" },
  messenger: { Icon: SiMessenger, color: "#0084FF", label: "Messenger" },
  tiktok: { Icon: SiTiktok, color: "#FFFFFF", label: "TikTok" },
  google: { Icon: SiGooglecalendar, color: "#4285F4", label: "Google Calendar" },
} as const;

export function PlatformIcon({
  platform,
  size = 14,
}: {
  platform: Platform;
  size?: number;
}) {
  const entry = MAP[platform];
  if (!entry) return null;
  const { Icon, color } = entry;
  return <Icon size={size} color={color} />;
}

export function platformLabel(p: Platform): string {
  return MAP[p]?.label ?? p;
}

export function platformColor(p: Platform): string {
  return MAP[p]?.color ?? "#fff";
}

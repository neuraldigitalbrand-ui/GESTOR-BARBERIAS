import {
  SiInstagram,
  SiWhatsapp,
  SiMessenger,
  SiTiktok,
} from "@icons-pack/react-simple-icons";

const PLATFORMS: Record<
  string,
  { icon: React.ComponentType<{ color?: string; size?: number | string; className?: string }>; color: string; label: string }
> = {
  instagram:       { icon: SiInstagram, color: "#E4405F", label: "Instagram" },
  whatsapp:        { icon: SiWhatsapp,  color: "#25D366", label: "WhatsApp" },
  messenger:       { icon: SiMessenger, color: "#0084FF", label: "Messenger" },
  tiktok:          { icon: SiTiktok,    color: "#000000", label: "TikTok" },
};

interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

export function PlatformIcon({ platform, size = 16, className }: PlatformIconProps) {
  const entry = PLATFORMS[platform.toLowerCase()];
  if (!entry) return null;

  const Icon = entry.icon;
  return <Icon color={entry.color} size={size} className={className} />;
}

export function platformLabel(platform: string): string {
  return PLATFORMS[platform.toLowerCase()]?.label ?? platform;
}

export const ALL_PLATFORMS = Object.keys(PLATFORMS);

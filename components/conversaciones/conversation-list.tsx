import Link from "next/link";
import { PlatformIcon, platformLabel } from "@/components/platform-icon";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Conversation {
  id: string;
  platform: string;
  last_message_at: string | null;
  unread_count: number;
  leads: { name: string } | null;
  last_message: string | null;
}

interface ConversationListProps {
  conversations: Conversation[];
  activePlatform: string | null;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function ConversationList({ conversations, activePlatform }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-sm text-muted-foreground">
          {activePlatform
            ? `No hay conversaciones de ${platformLabel(activePlatform)}`
            : "No hay conversaciones aún"}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border">
      {conversations.map((conv) => {
        const name = conv.leads?.name ?? "Cliente";
        const timeAgo = conv.last_message_at
          ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: es })
          : null;

        return (
          <Link
            key={conv.id}
            href={`/conversaciones/${conv.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
          >
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {initials(name)}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-muted-foreground">
                  {conv.last_message ?? "Sin mensajes"}
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <PlatformIcon platform={conv.platform} size={14} />
                  {conv.unread_count > 0 && (
                    <Badge className="h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

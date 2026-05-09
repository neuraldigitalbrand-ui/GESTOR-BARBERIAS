export type Platform = "instagram" | "whatsapp" | "messenger" | "tiktok" | "google";
export type AppointmentStatus = "confirmed" | "completed" | "pending" | "cancelled" | "no_show";

export interface AgendaAppointment {
  id: string;
  time: string;
  endTime: string;
  name: string;
  phone: string | null;
  email: string | null;
  service: string;
  duration: number;
  price: number;
  status: AppointmentStatus;
  platform: Platform;
  startAt: string;
}

export interface ConvMessage {
  from: "lead" | "agent";
  text: string;
  time: string;
  date: "today" | "yesterday" | string;
}

export interface DesignConversation {
  id: string;
  name: string;
  platform: Platform;
  handle: string;
  unread: number;
  time: string;
  preview: string;
  messages: ConvMessage[];
}

export interface PlatformConnection {
  id: Platform;
  name: string;
  display: string;
  connected: boolean;
  since: string | null;
  description: string;
  metrics: { msgs: string; resp: string } | null;
}

export type Message = ConvMessage;
export type Conversation = DesignConversation;

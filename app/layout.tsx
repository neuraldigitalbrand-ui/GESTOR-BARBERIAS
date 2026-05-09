import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarWrapper } from "@/components/layout/sidebar-wrapper";
import { ToastProvider } from "@/components/shared/toast-provider";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "BarberOS · Panel de gestión",
  description: "Sistema de gestión para Barbería Capital",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-bg text-text-1 font-sans">
        <SidebarWrapper>{children}</SidebarWrapper>
        <ToastProvider />
      </body>
    </html>
  );
}

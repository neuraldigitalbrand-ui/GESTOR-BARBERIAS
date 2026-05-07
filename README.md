# Gestor Barberías — Demo

Sistema de gestión para barberías construido con Next.js 15 y Supabase. Demo funcional de single-tenant con datos de ejemplo.

## Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Base de datos**: Supabase (PostgreSQL)
- **UI**: Shadcn UI + Tailwind CSS
- **Tipado**: TypeScript strict, tipos generados desde Supabase
- **Fechas**: date-fns v4 con locale español
- **Íconos**: Lucide React + @icons-pack/react-simple-icons

## Secciones

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Métricas del día/semana: turnos, conversaciones, ingresos, top servicios |
| `/agente` | Wizard para personalizar nombre, personalidad y tono del agente IA |
| `/agente/prompt` | Editor del prompt del sistema con historial de cambios |
| `/conversaciones` | Lista de chats filtrable por plataforma (Instagram, WhatsApp, Messenger, TikTok) |
| `/conversaciones/[id]` | Vista de chat con mensajes alineados por remitente |
| `/agenda` | Vista semanal Lun–Sáb con navegación por semanas y Sheet de detalle |
| `/configuracion` | Switches de conexión por plataforma con actualización optimista |

## Requisitos

- Node.js 18+
- Proyecto en Supabase con las 8 tablas del esquema

## Instalación

```bash
cp .env.example .env.local
# Completar las variables con los valores del proyecto Supabase
npm install
npm run dev
```

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL       URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY  Clave anon (cliente)
SUPABASE_SERVICE_ROLE_KEY      Clave service role (servidor)
```

## Comandos

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run lint     # Verificación de estilo
```

## Deploy en Vercel

1. Importar el repositorio en Vercel
2. Agregar las tres variables de entorno
3. Deploy automático en cada push a `main`

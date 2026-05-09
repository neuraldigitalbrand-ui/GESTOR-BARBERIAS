import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — Meta verifica que el webhook existe
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// POST — Meta envía los mensajes entrantes
export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ status: 'invalid_json' }, { status: 400 })
  }

  if (body.object !== 'whatsapp_business_account') {
    return NextResponse.json({ status: 'ignored' })
  }

  const supabase = await createClient()

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue

      const value = change.value
      const incomingMsgs: any[] = value.messages ?? []
      const contacts: any[] = value.contacts ?? []

      for (const msg of incomingMsgs) {
        // Solo procesamos mensajes de texto por ahora
        if (msg.type !== 'text') continue

        const waId: string = msg.from
        const text: string = msg.text?.body ?? ''
        const timestamp = new Date(parseInt(msg.timestamp) * 1000).toISOString()

        const contact = contacts.find((c) => c.wa_id === waId)
        const name: string = contact?.profile?.name ?? `WhatsApp ${waId}`

        // 1. Buscar o crear lead por número de teléfono
        let { data: lead } = await supabase
          .from('leads')
          .select('id')
          .eq('phone', waId)
          .maybeSingle()

        if (!lead) {
          const { data: newLead } = await supabase
            .from('leads')
            .insert({ name, phone: waId, source_platform: 'whatsapp' })
            .select('id')
            .single()
          lead = newLead
        }

        if (!lead) continue

        // 2. Buscar o crear conversación
        let { data: conv } = await supabase
          .from('conversations')
          .select('id, unread_count')
          .eq('lead_id', lead.id)
          .eq('platform', 'whatsapp')
          .maybeSingle()

        if (!conv) {
          const { data: newConv } = await supabase
            .from('conversations')
            .insert({
              lead_id: lead.id,
              platform: 'whatsapp',
              external_thread_id: waId,
              unread_count: 1,
              last_message_at: timestamp,
            })
            .select('id, unread_count')
            .single()
          conv = newConv
        } else {
          await supabase
            .from('conversations')
            .update({
              unread_count: (conv.unread_count ?? 0) + 1,
              last_message_at: timestamp,
            })
            .eq('id', conv.id)
        }

        if (!conv) continue

        // 3. Guardar el mensaje
        await supabase.from('messages').insert({
          conversation_id: conv.id,
          content: text,
          sender: 'lead',
          sent_at: timestamp,
        })
      }
    }
  }

  // Meta requiere siempre un 200 o reintenta
  return NextResponse.json({ status: 'ok' })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

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

interface WaMessage {
  from: string
  type: string
  text?: { body: string }
  timestamp: string
}

interface WaContact {
  wa_id: string
  profile?: { name: string }
}

async function sendWhatsAppMessage(to: string, text: string) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  if (!phoneId || !token) return

  await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })
}

async function generateAIReply(
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const client = new Anthropic({ apiKey })
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: systemPrompt,
    messages: history,
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text : null
}

// POST — Meta envía los mensajes entrantes
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ status: 'invalid_json' }, { status: 400 })
  }

  if (body.object !== 'whatsapp_business_account') {
    return NextResponse.json({ status: 'ignored' })
  }

  const supabase = await createClient()

  for (const entry of (body.entry as Record<string, unknown>[]) ?? []) {
    for (const change of (entry.changes as Record<string, unknown>[]) ?? []) {
      if (change.field !== 'messages') continue

      const value = change.value as Record<string, unknown>
      const incomingMsgs = (value.messages as WaMessage[]) ?? []
      const contacts = (value.contacts as WaContact[]) ?? []

      for (const msg of incomingMsgs) {
        if (msg.type !== 'text') continue

        const waId: string = msg.from
        const text: string = msg.text?.body ?? ''
        const timestamp = new Date(parseInt(msg.timestamp) * 1000).toISOString()

        const contact = contacts.find((c) => c.wa_id === waId)
        const name: string = contact?.profile?.name ?? `WhatsApp ${waId}`

        // 1. Buscar o crear lead
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

        // 3. Guardar mensaje entrante
        await supabase.from('messages').insert({
          conversation_id: conv.id,
          content: text,
          sender: 'lead',
          sent_at: timestamp,
        })

        // 4. Agente IA — solo si está activo y hay API key
        const { data: agentConfig } = await supabase
          .from('ai_agent_config')
          .select('system_prompt, is_active, greeting')
          .eq('is_active', true)
          .maybeSingle()

        if (!agentConfig) continue

        // Historial de los últimos 10 mensajes para contexto
        const { data: recentMsgs } = await supabase
          .from('messages')
          .select('sender, content')
          .eq('conversation_id', conv.id)
          .order('sent_at', { ascending: false })
          .limit(10)

        const history = (recentMsgs ?? [])
          .reverse()
          .map((m) => ({
            role: (m.sender === 'agent' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: m.content,
          }))

        const reply = await generateAIReply(agentConfig.system_prompt, history)
        if (!reply) continue

        const replyTimestamp = new Date().toISOString()

        // Guardar respuesta del agente
        await supabase.from('messages').insert({
          conversation_id: conv.id,
          content: reply,
          sender: 'agent',
          sent_at: replyTimestamp,
        })

        // Enviar por WhatsApp
        await sendWhatsAppMessage(waId, reply)
      }
    }
  }

  return NextResponse.json({ status: 'ok' })
}

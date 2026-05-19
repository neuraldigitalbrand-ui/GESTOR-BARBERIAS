import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Groq from 'groq-sdk'

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

async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.replace(/\s+/g, '')

  if (!phoneId || !token) {
    console.error('[WA] WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN no definidos')
    return
  }

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`
  const body = JSON.stringify({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  })

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    })

    const json = await res.json()

    if (!res.ok) {
      console.error('[WA] Error al enviar mensaje:', res.status, JSON.stringify(json))
    } else {
      console.log('[WA] Mensaje enviado a', to, '- ID:', json?.messages?.[0]?.id)
    }
  } catch (err) {
    console.error('[WA] Fetch error:', err)
  }
}

async function generateAIReply(
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('[AI] GROQ_API_KEY no definida')
    return null
  }

  const clean = history.filter((m) => m.content && m.content.trim().length > 0)
  const firstUser = clean.findIndex((m) => m.role === 'user')
  const messages = firstUser >= 0 ? clean.slice(firstUser) : clean
  if (messages.length === 0) return null

  const client = new Groq({ apiKey })
  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 300,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    })
    return response.choices[0]?.message?.content ?? null
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    console.error('[AI] Groq error:', e.status, e.message)
    return null
  }
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

  const supabase = createAdminClient()

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

        console.log(`[WH] Mensaje de ${name} (${waId}): "${text}"`)

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

        // 4. Agente IA
        try {
          const { data: agentConfig } = await supabase
            .from('ai_agent_config')
            .select('system_prompt, is_active')
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (!agentConfig?.system_prompt) {
            console.log('[AI] Sin config activa — no responde')
            continue
          }

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

          const reply = await generateAIReply(agentConfig.system_prompt as string, history)

          if (!reply) {
            console.log('[AI] Sin respuesta generada')
            continue
          }

          console.log('[AI] Respuesta:', reply.slice(0, 80))

          const replyTimestamp = new Date().toISOString()

          await supabase.from('messages').insert({
            conversation_id: conv.id,
            content: reply,
            sender: 'agent',
            sent_at: replyTimestamp,
          })

          // Detectar confirmación de turno y crear appointment
          if (/turno confirmado|confirmado/i.test(reply)) {
            try {
              // Buscar el servicio más mencionado en la conversación
              const { data: allMsgs } = await supabase
                .from('messages')
                .select('content')
                .eq('conversation_id', conv.id)
                .order('sent_at', { ascending: true })

              const convText = (allMsgs ?? []).map(m => m.content).join(' ').toLowerCase()

              const { data: services } = await supabase
                .from('services')
                .select('id, name, duration_minutes')

              let matchedService = services?.[0]
              for (const svc of services ?? []) {
                if (convText.includes(svc.name.toLowerCase())) {
                  matchedService = svc
                  break
                }
              }

              if (matchedService && lead) {
                // Detectar hora mencionada (ej: "14:00", "las 14", "14hs")
                const timeMatch = convText.match(/(\d{1,2})[:\s]?(\d{0,2})\s*(?:hs|horas?|:00)?/)
                const hour = timeMatch ? parseInt(timeMatch[1]) : 10
                const validHour = hour >= 8 && hour <= 20 ? hour : 10

                // Detectar día (mañana o hoy)
                const isTomorrow = /mañana/i.test(convText)
                const aptDate = new Date()
                if (isTomorrow) aptDate.setDate(aptDate.getDate() + 1)
                aptDate.setHours(validHour, 0, 0, 0)

                const endDate = new Date(aptDate)
                endDate.setMinutes(endDate.getMinutes() + (matchedService.duration_minutes ?? 30))

                // Solo crear si no existe ya uno para este lead en esa fecha
                const { data: existing } = await supabase
                  .from('appointments')
                  .select('id')
                  .eq('lead_id', lead.id)
                  .eq('status', 'confirmed')
                  .gte('start_at', aptDate.toISOString().split('T')[0])
                  .maybeSingle()

                if (!existing) {
                  await supabase.from('appointments').insert({
                    lead_id: lead.id,
                    service_id: matchedService.id,
                    start_at: aptDate.toISOString(),
                    end_at: endDate.toISOString(),
                    status: 'confirmed',
                  })
                  console.log('[BOOKING] Turno creado para', name, 'a las', validHour)
                }
              }
            } catch (bookingErr) {
              console.error('[BOOKING] Error creando turno:', bookingErr)
            }
          }

          await sendWhatsAppMessage(waId, reply)

        } catch (err) {
          console.error('[AI] Error en agente:', err)
        }
      }
    }
  }

  return NextResponse.json({ status: 'ok' })
}
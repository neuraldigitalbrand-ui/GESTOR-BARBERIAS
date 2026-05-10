'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteConversation(conversationId: string) {
  const supabase = await createClient()

  await supabase.from('messages').delete().eq('conversation_id', conversationId)
  await supabase.from('conversations').delete().eq('id', conversationId)

  revalidatePath('/conversaciones')
}

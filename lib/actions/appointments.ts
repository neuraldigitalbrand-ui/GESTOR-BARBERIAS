'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(
  id: string,
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'pending'
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/agenda')
  revalidatePath('/dashboard')
}

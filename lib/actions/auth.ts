'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createAuthClient } from '@/lib/supabase/auth-server'

const DEMO_EMAIL = 'demo@barberia.com'
const DEMO_PASSWORD = 'Demo1234!'
const DEMO_TOKEN = 'barberos_demo_v1'

export async function signIn(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // ─── Demo bypass ─── no requiere Supabase Auth
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set('barberos_demo', DEMO_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
    })
    redirect('/dashboard')
  }

  // ─── Auth real via Supabase ───
  const supabase = await createAuthClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Credenciales incorrectas. Verificá tu email y contraseña.' }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('barberos_demo')

  try {
    const supabase = await createAuthClient()
    await supabase.auth.signOut()
  } catch {
    // sesión demo, no hay sesión Supabase — ignorar
  }

  redirect('/login')
}

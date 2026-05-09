'use client'

import { useActionState } from 'react'
import { signIn } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { error: null })

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] text-text-2">Email</label>
        <Input
          name="email"
          type="email"
          placeholder="tu@email.com"
          defaultValue="demo@barberia.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] text-text-2">Contraseña</label>
        <Input
          name="password"
          type="password"
          placeholder="••••••••"
          defaultValue="Demo1234!"
          required
          autoComplete="current-password"
        />
      </div>

      {state.error && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full mt-2" disabled={pending}>
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
        {pending ? 'Ingresando...' : 'Ingresar al panel'}
      </Button>
    </form>
  )
}

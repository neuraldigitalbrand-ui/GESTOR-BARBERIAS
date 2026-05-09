import { Scissors } from 'lucide-react'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[360px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(201,168,76,0.12)]">
            <Scissors className="w-6 h-6 text-brand" strokeWidth={2.2} />
          </div>
          <h1 className="text-[22px] font-semibold text-text-1 tracking-tight">BarberOS</h1>
          <p className="text-sm text-text-3 mt-1">Accedé a tu panel de gestión</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-white/[0.07] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <LoginForm />
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-4 rounded-xl bg-surface/60 border border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-widest text-text-3 mb-2.5">
            Credenciales demo
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-2">Email</span>
              <span className="text-[13px] text-text-1 font-mono">demo@barberia.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-2">Contraseña</span>
              <span className="text-[13px] text-text-1 font-mono">Demo1234!</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-text-3 mt-6">
          BarberOS v1 · Demo
        </p>
      </div>
    </div>
  )
}

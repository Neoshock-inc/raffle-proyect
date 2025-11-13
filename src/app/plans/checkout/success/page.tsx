'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, Calendar, Mail, User, Rocket } from 'lucide-react'

export default function SuccessPage() {
  const params = useSearchParams()
  const router = useRouter()
  const session = params.get('session')
  const plan = params.get('plan')
  const onSchedule = () => {}
  const onGoDashboard = () => { router.push('/') }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-400" />
            <h1 className="text-2xl font-bold text-white">Pago verificado (Simulado)</h1>
          </div>
          <div className="text-white/80 text-sm mb-6">Sesión {session} • Plan {plan}</div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white mb-2"><User className="w-5 h-5" /><span className="font-semibold">Tenant creado</span></div>
              <div className="text-white/70 text-sm">Se ha creado tu espacio de trabajo (simulado).</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white mb-2"><Mail className="w-5 h-5" /><span className="font-semibold">Invitación enviada</span></div>
              <div className="text-white/70 text-sm">Te enviamos un enlace de acceso (simulado).</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/20 md:col-span-2">
              <div className="flex items-center gap-2 text-white mb-2"><Calendar className="w-5 h-5" /><span className="font-semibold">Agendar onboarding</span></div>
              <div className="text-white/70 text-sm mb-4">Agenda tu reunión según tu plan. Este paso es simulado.</div>
              <button onClick={onSchedule} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold">Agendar</button>
            </div>
          </div>
          <div className="mt-6">
            <button onClick={onGoDashboard} className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2"><Rocket className="w-5 h-5" />Ir al inicio</button>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { Mail, Send, CheckCircle, Baby, Lock, RefreshCw, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'

export function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar o link. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--bg-base)] w-full relative overflow-hidden">
      {/* Abstract decorative background */}
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] rounded-[100%] bg-gradient-to-b from-baby-200/50 to-transparent dark:from-baby-900/40 blur-3xl pointer-events-none" />
      
      <div className="flex flex-col items-center justify-center flex-1 px-6 w-full max-w-md mx-auto z-10">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center mb-10 animate-fade-in">
          <div className="flex items-center justify-center w-20 h-20 bg-[var(--bg-card)] rounded-3xl shadow-xl shadow-baby-500/10 mb-6 border border-[var(--border-color)] text-baby-500">
            <Baby size={40} strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-[var(--text-primary)] mb-2 tracking-tight">Baby Routine</h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] px-4 leading-relaxed">
            Acompanhe a rotina do seu bebê com elegância e tranquilidade.
          </p>
        </div>

        {!sent ? (
          <div className="w-full bg-[var(--bg-card)] p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] animate-slide-up">
            <h2 className="font-heading text-xl font-extrabold text-[var(--text-primary)] mb-2">Entrar</h2>
            <p className="text-xs font-medium text-[var(--text-secondary)] mb-6 leading-relaxed">
              Informe seu e-mail e enviaremos um link de acesso. Sem senhas para esquecer.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-[var(--text-tertiary)]" />
                <input
                  id="login-email-input"
                  type="email"
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-baby-500 focus:ring-2 focus:ring-baby-500/20 transition-all placeholder-[var(--text-tertiary)]"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  autoCapitalize="none"
                  required
                />
              </div>

              {error && (
                <div className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
                  {error}
                </div>
              )}

              <Button
                id="login-submit-btn"
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={<Send size={18} />}
                className="shadow-md shadow-baby-500/20"
              >
                Enviar link mágico
              </Button>
            </form>

            <div className="flex flex-col gap-3 border-t border-[var(--border-color)] pt-6">
              <div className="flex items-center gap-3 text-xs font-medium text-[var(--text-secondary)]">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-baby-50 dark:bg-baby-900/30 text-baby-500">
                  <Lock size={12} />
                </div>
                <span>Acesso totalmente seguro</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-[var(--text-secondary)]">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-baby-50 dark:bg-baby-900/30 text-baby-500">
                  <RefreshCw size={12} />
                </div>
                <span>Sincronização em tempo real</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-[var(--text-secondary)]">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-baby-50 dark:bg-baby-900/30 text-baby-500">
                  <Users size={12} />
                </div>
                <span>Compartilhável com a família</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-[var(--bg-card)] p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] flex flex-col items-center text-center animate-scale-in">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500 mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="font-heading text-xl font-extrabold text-[var(--text-primary)] mb-2">Link enviado!</h2>
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-6 leading-relaxed">
              Verifique o e-mail <strong className="text-[var(--text-primary)]">{email}</strong> e clique no link mágico para entrar.
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">Não recebeu? Olhe na caixa de spam ou</p>
            <Button
              id="login-retry-btn"
              variant="secondary"
              size="md"
              onClick={() => { setSent(false); setEmail('') }}
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

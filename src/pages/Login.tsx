import { useState } from 'react'
import { Baby, Lock, RefreshCw, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function Login() {
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com Google.')
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

        <div className="w-full bg-[var(--bg-card)] p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] animate-slide-up">
          <h2 className="font-heading text-xl font-extrabold text-[var(--text-primary)] mb-2">Entrar</h2>
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-6 leading-relaxed">
            Acesse sua conta para visualizar a rotina do seu bebê.
          </p>

          {error && (
            <div className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-xl border border-red-100 dark:border-red-900/50 mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#222] transition-colors shadow-sm mb-6"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Continuar com o Google
          </button>

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
      </div>
    </div>
  )
}

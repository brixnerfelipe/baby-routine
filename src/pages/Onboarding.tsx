import { useState } from 'react'
import { Baby, Calendar, ArrowRight, Users, Copy, Check, Sparkles, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'

type Step = 'baby-info' | 'invite'

export function Onboarding() {
  const { user, setBaby } = useAuth()
  const [step, setStep] = useState<Step>('baby-info')
  const [createdBaby, setCreatedBaby] = useState<any>(null)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [saving, setSaving] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [joiningCode, setJoiningCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [createError, setCreateError] = useState('')

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const handleCreateBaby = async () => {
    if (!user || !name.trim() || !birthDate) return
    setSaving(true)
    setCreateError('')
    try {
      const code = generateInviteCode()
      const { data, error } = await supabase.from('babies').insert({
        name: name.trim(),
        birth_date: birthDate,
        gender,
        created_by: user.id,
        invite_code: code,
      }).select().single()

      if (error) throw error

      await supabase.from('care_team').insert({
        baby_id: data.id,
        user_id: user.id,
        role: 'owner',
        display_name: user.email?.split('@')[0] ?? 'Mamãe',
      })

      setCreatedBaby(data)
      setInviteCode(code)
      setStep('invite')
    } catch (err: any) {
      console.error('Error creating baby:', err)
      setCreateError(err?.message || 'Erro desconhecido ao tentar criar o perfil.')
    } finally {
      setSaving(false)
    }
  }

  const handleJoinWithCode = async () => {
    if (!user || !joiningCode.trim()) return
    setJoining(true)
    setJoinError('')
    try {
      const { data: babyData, error } = await supabase.rpc('join_baby_by_code', {
        invite_code_param: joiningCode.trim().toUpperCase()
      })

      if (error || !babyData) {
        setJoinError('Código inválido ou erro ao entrar na rede de apoio.')
        return
      }

      setBaby(babyData)
    } catch {
      setJoinError('Erro ao entrar no perfil. Tente novamente.')
    } finally {
      setJoining(false)
    }
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFinish = () => {
    if (createdBaby) {
      setBaby(createdBaby)
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--bg-base)] w-full relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] rounded-[100%] bg-gradient-to-b from-baby-200/50 to-transparent dark:from-baby-900/40 blur-3xl pointer-events-none" />
      
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 w-full max-w-md mx-auto z-10">
        {step === 'baby-info' && (
          <div className="w-full bg-[var(--bg-card)] p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] animate-slide-up flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 bg-baby-50 dark:bg-baby-900/30 rounded-2xl text-baby-500 mb-6">
              <Baby size={32} strokeWidth={1.5} />
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-[var(--text-primary)] text-center mb-2 tracking-tight">Bem-vinda ao Baby Routine!</h1>
            <p className="text-sm font-medium text-[var(--text-secondary)] text-center mb-8 leading-relaxed px-2">
              Vamos configurar o perfil do seu bebê para começar a acompanhar a rotina.
            </p>

            <div className="flex flex-col w-full gap-5 mb-8">
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  <Baby size={14} /> Nome do bebê
                </label>
                <input
                  id="baby-name-input"
                  type="text"
                  className="bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-baby-500 focus:ring-2 focus:ring-baby-500/20 transition-all placeholder-[var(--text-tertiary)]"
                  placeholder="Ex: Felipe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoCapitalize="words"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  <Calendar size={14} /> Data de nascimento
                </label>
                <input
                  id="baby-birth-date-input"
                  type="date"
                  className="bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-baby-500 focus:ring-2 focus:ring-baby-500/20 transition-all"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Sexo (opcional)</label>
                <div className="flex gap-3 bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border-color)]">
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${gender === 'male' ? 'bg-[var(--bg-card)] text-baby-600 dark:text-baby-400 shadow-sm' : 'text-[var(--text-secondary)] opacity-70 hover:opacity-100'}`}
                    onClick={() => setGender(g => g === 'male' ? null : 'male')}
                  >
                    Menino
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${gender === 'female' ? 'bg-[var(--bg-card)] text-rose-500 shadow-sm' : 'text-[var(--text-secondary)] opacity-70 hover:opacity-100'}`}
                    onClick={() => setGender(g => g === 'female' ? null : 'female')}
                  >
                    Menina
                  </button>
                </div>
              </div>

              {createError && (
                <div className="text-xs font-medium text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                  {createError}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={saving}
                disabled={!name.trim() || !birthDate}
                iconRight={<ArrowRight size={18} />}
                onClick={handleCreateBaby}
                className="mt-2 shadow-md shadow-baby-500/20"
              >
                Criar perfil
              </Button>
            </div>

            <div className="flex items-center w-full gap-4 mb-6 opacity-50">
              <div className="flex-1 h-px bg-[var(--border-color)]"></div>
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">ou</span>
              <div className="flex-1 h-px bg-[var(--border-color)]"></div>
            </div>

            <div className="flex flex-col w-full bg-baby-50 dark:bg-baby-900/20 p-5 rounded-2xl border border-baby-100 dark:border-baby-800/50">
              <p className="text-sm font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <UserPlus size={16} className="text-baby-500" /> Tem um convite?
              </p>
              <p className="text-xs text-[var(--text-secondary)] mb-4">Insira o código para entrar na rede de apoio de um bebê existente.</p>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-baby-500 tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal placeholder-[var(--text-tertiary)]"
                  placeholder="Ex: AB3X9Z"
                  value={joiningCode}
                  onChange={e => setJoiningCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <Button
                  variant="secondary"
                  loading={joining}
                  disabled={joiningCode.length < 6}
                  onClick={handleJoinWithCode}
                >
                  Entrar
                </Button>
              </div>
              {joinError && <p className="text-xs font-medium text-red-500 mt-2">{joinError}</p>}
            </div>
          </div>
        )}

        {step === 'invite' && (
          <div className="w-full bg-[var(--bg-card)] p-8 rounded-[2rem] shadow-sm border border-[var(--border-color)] flex flex-col items-center animate-scale-in text-center">
            <div className="w-20 h-20 bg-baby-50 dark:bg-baby-900/20 rounded-full flex items-center justify-center text-baby-500 mb-6">
              <Sparkles size={36} strokeWidth={1.5} />
            </div>
            <h2 className="font-heading text-2xl font-extrabold text-[var(--text-primary)] mb-2 tracking-tight">Perfil criado!</h2>
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-8 leading-relaxed">
              Compartilhe o código abaixo com a família para que eles possam ajudar a registrar a rotina.
            </p>

            <div className="w-full bg-[var(--bg-base)] p-6 rounded-2xl border border-[var(--border-color)] mb-8 flex flex-col items-center">
              <span className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                <Users size={14} /> Código de convite
              </span>
              <div className="flex items-center gap-3 bg-[var(--bg-card)] px-6 py-4 rounded-xl border border-[var(--border-color)] shadow-sm">
                <span className="font-heading text-3xl font-extrabold tracking-[0.2em] text-baby-500">{inviteCode}</span>
                <button
                  className="text-[var(--text-secondary)] hover:text-baby-500 hover:bg-baby-50 dark:hover:bg-baby-900/30 p-2.5 rounded-xl transition-colors"
                  onClick={handleCopyCode}
                >
                  {copied ? <Check size={24} className="text-emerald-500" /> : <Copy size={24} />}
                </button>
              </div>
              <p className="text-xs font-medium mt-4 transition-colors duration-300" style={{ color: copied ? '#10b981' : 'var(--text-tertiary)' }}>
                {copied ? 'Copiado para a área de transferência!' : 'Toque para copiar e compartilhar'}
              </p>
            </div>

            <Button
              variant="primary"
              size="xl"
              fullWidth
              onClick={handleFinish}
              className="shadow-md shadow-baby-500/20"
            >
              Começar a usar!
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

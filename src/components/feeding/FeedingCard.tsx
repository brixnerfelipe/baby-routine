import { useState, useCallback, useEffect } from 'react'
import { Play, Square, RotateCcw, Clock, ArrowLeftRight, Baby, Milk, Calendar, Plus } from 'lucide-react'
import { useTimer, useCountdown } from '../../hooks/useTimer'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

type Side = 'left' | 'right' | 'bottle'

export function FeedingCard({ onNewSession }: { onNewSession?: () => void }) {
  const { user, baby } = useAuth()
  const [activeSide, setActiveSide] = useState<Side>('left')
  const [lastSide, setLastSide] = useState<Side | null>(null)
  const [showBurpTimer, setShowBurpTimer] = useState(false)
  const [saving, setSaving] = useState(false)

  // Manual input states
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualMode, setManualMode] = useState<'retro' | 'full'>('retro')
  const [retroTime, setRetroTime] = useState(() => {
    const date = new Date(Date.now() - 15 * 60 * 1000)
    return date.toTimeString().slice(0, 5)
  })
  const [manualStart, setManualStart] = useState(() => new Date(Date.now() - 20 * 60 * 1000).toISOString().slice(0, 16))
  const [manualEnd, setManualEnd] = useState(() => new Date().toISOString().slice(0, 16))
  const [manualSide, setManualSide] = useState<Side>('left')

  useEffect(() => {
    async function fetchLastFeeding() {
      if (!baby) return
      try {
        const { data, error } = await supabase
          .from('feeding_sessions')
          .select('side')
          .eq('baby_id', baby.id)
          .not('ended_at', 'is', null)
          .order('ended_at', { ascending: false })
          .limit(1)
          .single()
        
        if (data && !error) {
          setLastSide(data.side as Side)
        }
      } catch (err) {
        // ignore
      }
    }
    fetchLastFeeding()
  }, [baby])

  const feedingTimer = useTimer({
    storageKey: `baby-feeding-timer-${baby?.id}`,
  })

  const burpCountdown = useCountdown(15 * 60, () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🍼 Hora do arrotinho!', {
        body: 'Já faz 15 minutos da mamada. Lembre de arrotar o bebê!',
        icon: '/icon-192.png',
      })
    }
  }, `baby-burp-timer-${baby?.id}`)

  const handleStart = () => {
    feedingTimer.start()
  }

  const handleStop = useCallback(async () => {
    if (!user || !baby || feedingTimer.elapsed < 5) {
      feedingTimer.reset()
      return
    }

    setSaving(true)
    try {
      const now = new Date()
      const startedAt = new Date(now.getTime() - feedingTimer.elapsed * 1000)

      await supabase.from('feeding_sessions').insert({
        baby_id: baby.id,
        side: activeSide,
        started_at: startedAt.toISOString(),
        ended_at: now.toISOString(),
        duration_seconds: feedingTimer.elapsed,
        logged_by: user.id,
        logged_by_name: user.email?.split('@')[0] ?? 'Cuidador',
      })

      setLastSide(activeSide)
      feedingTimer.reset()
      onNewSession?.()
      setShowBurpTimer(true)
    } catch (err) {
      console.error('Error saving feeding session:', err)
    } finally {
      setSaving(false)
    }
  }, [user, baby, feedingTimer, activeSide, onNewSession])

  const handleStartRetroactive = () => {
    const [hours, minutes] = retroTime.split(':').map(Number)
    const startTimeDate = new Date()
    startTimeDate.setHours(hours, minutes, 0, 0)
    
    if (startTimeDate.getTime() > Date.now()) {
      startTimeDate.setDate(startTimeDate.getDate() - 1)
    }

    const elapsedSeconds = Math.floor((Date.now() - startTimeDate.getTime()) / 1000)
    if (elapsedSeconds < 0) return

    feedingTimer.start(elapsedSeconds)
    setShowManualModal(false)
  }

  const handleSaveFullManual = async () => {
    if (!user || !baby) return
    const start = new Date(manualStart)
    const end = new Date(manualEnd)
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000)
    if (duration <= 0) return

    setSaving(true)
    try {
      await supabase.from('feeding_sessions').insert({
        baby_id: baby.id,
        side: manualSide,
        started_at: start.toISOString(),
        ended_at: end.toISOString(),
        duration_seconds: duration,
        logged_by: user.id,
        logged_by_name: user.email?.split('@')[0] ?? 'Cuidador',
      })
      setLastSide(manualSide)
      setShowManualModal(false)
      onNewSession?.()
    } catch (err) {
      console.error('Error saving manual feeding:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleStartBurp = () => {
    burpCountdown.start()
    setShowBurpTimer(false)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const sideLabel = (side: Side) => {
    if (side === 'left') return 'Esquerdo'
    if (side === 'right') return 'Direito'
    return 'Mamadeira'
  }

  const sideIcon = (side: Side) => {
    if (side === 'left') return <ArrowLeftRight size={18} className="rotate-180" />
    if (side === 'right') return <ArrowLeftRight size={18} />
    return <Milk size={18} />
  }

  return (
    <>
      <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-baby-100 dark:bg-baby-900 rounded-2xl text-baby-600 dark:text-baby-400">
              <Milk size={24} strokeWidth={2} />
            </div>
            <h3 className="font-heading text-lg font-extrabold text-[var(--text-primary)] m-0">Amamentação</h3>
          </div>
          {lastSide && !feedingTimer.isRunning && (
            <div className="px-3 py-1 bg-baby-50 dark:bg-baby-900/30 rounded-full border border-baby-100 dark:border-baby-800">
              <span className="text-xs font-bold text-baby-700 dark:text-baby-300">Último: {sideLabel(lastSide)}</span>
            </div>
          )}
        </div>

        {/* Side Selector */}
        <div className="flex bg-[var(--bg-base)] p-1 rounded-2xl mb-6">
          {(['left', 'right', 'bottle'] as Side[]).map(side => (
            <button
              key={side}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSide === side 
                  ? 'bg-[var(--bg-card)] shadow-sm text-baby-600 dark:text-baby-400' 
                  : 'text-[var(--text-secondary)] opacity-70 hover:opacity-100'
              }`}
              onClick={() => !feedingTimer.isRunning && setActiveSide(side)}
              disabled={feedingTimer.isRunning}
            >
              {sideIcon(side)}
              {sideLabel(side)}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className={`flex items-center justify-center py-6 mb-6 rounded-2xl font-heading text-5xl font-extrabold tracking-tight transition-colors ${
          feedingTimer.isRunning 
            ? 'bg-baby-50 text-baby-600 dark:bg-baby-900/20 dark:text-baby-400' 
            : 'bg-[var(--bg-base)] text-[var(--text-primary)]'
        }`}>
          <span>{feedingTimer.display}</span>
          {feedingTimer.isRunning && (
            <span className="w-3 h-3 rounded-full bg-baby-500 animate-pulse ml-4" aria-label="Em andamento" />
          )}
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          {!feedingTimer.isRunning ? (
            <>
              <Button
                variant="primary"
                size="xl"
                fullWidth
                icon={<Play size={20} fill="currentColor" />}
                onClick={handleStart}
              >
                Iniciar Mamada
              </Button>
              <button
                className="flex items-center justify-center w-14 rounded-xl bg-baby-100 hover:bg-baby-200 dark:bg-baby-900/50 dark:text-baby-300 transition-colors"
                onClick={() => setShowManualModal(true)}
                title="Manual / Passado"
              >
                <Clock size={20} />
              </button>
            </>
          ) : (
            <>
              <Button
                variant="danger"
                size="xl"
                fullWidth
                icon={<Square size={20} fill="currentColor" />}
                loading={saving}
                onClick={handleStop}
              >
                Parar ({feedingTimer.display})
              </Button>
              <button
                className="flex items-center justify-center w-14 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                onClick={feedingTimer.reset}
                title="Descartar"
              >
                <RotateCcw size={20} />
              </button>
            </>
          )}
        </div>

        {/* Burp Countdown (when active) */}
        {burpCountdown.isRunning && (
          <div className="flex items-center justify-between mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-500 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span className="text-sm">Arroto em: <strong>{burpCountdown.display}</strong></span>
            </div>
            <button className="p-1 hover:bg-amber-200/50 rounded-lg transition-colors" onClick={burpCountdown.stop}>
              <RotateCcw size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Manual / Retroactive Modal */}
      <Modal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        title="Registro Manual de Mamada"
      >
        <div className="flex flex-col gap-6">
          {/* Mode Selector */}
          <div className="flex bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border-color)]">
            <button
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                manualMode === 'retro' 
                  ? 'bg-[var(--bg-card)] text-baby-500 shadow-sm' 
                  : 'text-[var(--text-secondary)] opacity-70'
              }`}
              onClick={() => setManualMode('retro')}
            >
              Iniciar no Passado
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                manualMode === 'full' 
                  ? 'bg-[var(--bg-card)] text-baby-500 shadow-sm' 
                  : 'text-[var(--text-secondary)] opacity-70'
              }`}
              onClick={() => setManualMode('full')}
            >
              Lançar Registro
            </button>
          </div>

          {manualMode === 'retro' ? (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Útil se o bebê começou a mamar minutos atrás e você quer que o timer continue rodando a partir daquele momento.
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Que horas começou?</label>
                <input
                  type="time"
                  className="bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none text-center text-lg"
                  value={retroTime}
                  onChange={e => setRetroTime(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                fullWidth
                icon={<Play size={18} fill="currentColor" />}
                onClick={handleStartRetroactive}
              >
                Iniciar Cronômetro
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Lado / Tipo</label>
                <div className="flex bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border-color)]">
                  {(['left', 'right', 'bottle'] as Side[]).map(side => (
                    <button
                      key={side}
                      type="button"
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        manualSide === side 
                          ? 'bg-[var(--bg-card)] text-baby-500 shadow-sm' 
                          : 'text-[var(--text-secondary)] opacity-70'
                      }`}
                      onClick={() => setManualSide(side)}
                    >
                      {sideLabel(side)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Horário de Início</label>
                <input
                  type="datetime-local"
                  className="bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-medium outline-none"
                  value={manualStart}
                  onChange={e => setManualStart(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Horário de Término</label>
                <input
                  type="datetime-local"
                  className="bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-medium outline-none"
                  value={manualEnd}
                  onChange={e => setManualEnd(e.target.value)}
                />
              </div>

              <Button
                variant="primary"
                fullWidth
                loading={saving}
                icon={<Plus size={18} />}
                onClick={handleSaveFullManual}
                disabled={new Date(manualEnd).getTime() <= new Date(manualStart).getTime()}
              >
                Salvar Registro
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Burp Suggestion Modal */}
      <Modal
        isOpen={showBurpTimer}
        onClose={() => setShowBurpTimer(false)}
        title="Hora do arrotinho!"
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-5">
          <div className="p-4 bg-baby-100 dark:bg-baby-900 rounded-full text-baby-600 dark:text-baby-400">
            <Baby size={32} />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
            A mamada foi registrada com sucesso! Quer ativar um lembrete de <strong>15 minutos</strong> para o arroto?
          </p>
          <div className="flex flex-col w-full gap-2">
            <Button
              variant="primary"
              fullWidth
              icon={<Clock size={18} />}
              onClick={handleStartBurp}
            >
              Sim, ativar lembrete
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowBurpTimer(false)}
            >
              Pular
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

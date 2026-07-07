import { useState, useCallback } from 'react'
import { Play, Square, RotateCcw, Moon, Star, Clock, Plus } from 'lucide-react'
import { useTimer } from '../../hooks/useTimer'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

export function SleepCard({ onNewSession }: { onNewSession?: () => void }) {
  const { user, baby } = useAuth()
  const [showQualityModal, setShowQualityModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Manual entry states
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualMode, setManualMode] = useState<'retro' | 'full'>('retro')
  const [retroTime, setRetroTime] = useState(() => {
    const date = new Date(Date.now() - 30 * 60 * 1000) // Default 30 min ago
    return date.toTimeString().slice(0, 5)
  })
  const [manualStart, setManualStart] = useState(() => new Date(Date.now() - 60 * 60 * 1000).toISOString().slice(0, 16))
  const [manualEnd, setManualEnd] = useState(() => new Date().toISOString().slice(0, 16))
  const [manualQuality, setManualQuality] = useState<'short' | 'ideal' | 'long'>('ideal')

  const sleepTimer = useTimer({
    storageKey: `baby-sleep-timer-${baby?.id}`,
  })

  const handleStart = () => {
    sleepTimer.start()
  }

  const handleStopOpen = () => {
    if (sleepTimer.elapsed < 5) {
      sleepTimer.reset()
      return
    }
    setShowQualityModal(true)
  }

  const handleSave = useCallback(async (quality: 'short' | 'ideal' | 'long') => {
    if (!user || !baby) return

    setSaving(true)
    try {
      const now = new Date()
      const sleptAt = new Date(now.getTime() - sleepTimer.elapsed * 1000)

      await supabase.from('sleep_sessions').insert({
        baby_id: baby.id,
        slept_at: sleptAt.toISOString(),
        woke_at: now.toISOString(),
        duration_seconds: sleepTimer.elapsed,
        quality,
        logged_by: user.id,
        logged_by_name: user.email?.split('@')[0] ?? 'Cuidador',
      })

      sleepTimer.reset()
      setShowQualityModal(false)
      onNewSession?.()
    } catch (err) {
      console.error('Error saving sleep session:', err)
    } finally {
      setSaving(false)
    }
  }, [user, baby, sleepTimer, onNewSession])

  const handleStartRetroactive = () => {
    const [hours, minutes] = retroTime.split(':').map(Number)
    const startTimeDate = new Date()
    startTimeDate.setHours(hours, minutes, 0, 0)
    
    if (startTimeDate.getTime() > Date.now()) {
      startTimeDate.setDate(startTimeDate.getDate() - 1)
    }

    const elapsedSeconds = Math.floor((Date.now() - startTimeDate.getTime()) / 1000)
    if (elapsedSeconds < 0) return

    sleepTimer.start(elapsedSeconds)
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
      await supabase.from('sleep_sessions').insert({
        baby_id: baby.id,
        slept_at: start.toISOString(),
        woke_at: end.toISOString(),
        duration_seconds: duration,
        quality: manualQuality,
        logged_by: user.id,
        logged_by_name: user.email?.split('@')[0] ?? 'Cuidador',
      })
      setShowManualModal(false)
      onNewSession?.()
    } catch (err) {
      console.error('Error saving manual sleep:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-500 dark:text-indigo-400">
            <Moon size={24} strokeWidth={2} />
          </div>
          <h3 className="font-heading text-lg font-extrabold text-[var(--text-primary)] m-0">Sonecas</h3>
        </div>

        {/* Timer Display */}
        <div className={`flex items-center justify-center py-6 mb-6 rounded-2xl font-heading text-5xl font-extrabold tracking-tight transition-colors ${
          sleepTimer.isRunning 
            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
            : 'bg-[var(--bg-base)] text-[var(--text-primary)]'
        }`}>
          <span>{sleepTimer.display}</span>
          {sleepTimer.isRunning && (
            <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse ml-4" aria-label="Em andamento" />
          )}
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          {!sleepTimer.isRunning ? (
            <>
              <Button
                className="bg-indigo-500 hover:bg-indigo-600 text-white flex-1"
                size="xl"
                fullWidth
                icon={<Play size={20} fill="currentColor" />}
                onClick={handleStart}
              >
                Iniciar Soneca
              </Button>
              <button
                className="flex items-center justify-center w-14 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 text-indigo-600 transition-colors"
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
                onClick={handleStopOpen}
              >
                Acordou ({sleepTimer.display})
              </Button>
              <button
                className="flex items-center justify-center w-14 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                onClick={sleepTimer.reset}
                title="Descartar"
              >
                <RotateCcw size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Manual / Retroactive Modal */}
      <Modal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        title="Registro Manual de Soneca"
      >
        <div className="flex flex-col gap-6">
          {/* Mode Selector */}
          <div className="flex bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border-color)]">
            <button
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                manualMode === 'retro' 
                  ? 'bg-[var(--bg-card)] text-indigo-500 shadow-sm' 
                  : 'text-[var(--text-secondary)] opacity-70'
              }`}
              onClick={() => setManualMode('retro')}
            >
              Iniciar no Passado
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                manualMode === 'full' 
                  ? 'bg-[var(--bg-card)] text-indigo-500 shadow-sm' 
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
                Útil se o bebê dormiu minutos atrás e você quer que o timer continue rodando a partir daquele momento.
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Que horas começou a dormir?</label>
                <input
                  type="time"
                  className="bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none text-center text-lg"
                  value={retroTime}
                  onChange={e => setRetroTime(e.target.value)}
                />
              </div>
              <Button
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
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
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Qualidade do Sono</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['short', 'ideal', 'long'] as const).map(q => (
                    <button
                      key={q}
                      type="button"
                      className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                        manualQuality === q 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30' 
                          : 'border-[var(--border-color)] text-[var(--text-secondary)] opacity-70'
                      }`}
                      onClick={() => setManualQuality(q)}
                    >
                      {q === 'short' ? 'Agitada' : q === 'ideal' ? 'Tranquila' : 'Longa'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Início do Sono</label>
                <input
                  type="datetime-local"
                  className="bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-medium outline-none"
                  value={manualStart}
                  onChange={e => setManualStart(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Fim do Sono</label>
                <input
                  type="datetime-local"
                  className="bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-medium outline-none"
                  value={manualEnd}
                  onChange={e => setManualEnd(e.target.value)}
                />
              </div>

              <Button
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
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

      {/* Quality Selection Modal (live sleep end) */}
      <Modal
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        title="Como foi a soneca?"
        size="sm"
      >
        <div className="flex flex-col gap-3">
          <button
            className="flex items-center justify-between p-4 bg-[var(--bg-base)] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-[var(--border-color)] hover:border-indigo-200 rounded-xl transition-all group"
            onClick={() => handleSave('ideal')}
            disabled={saving}
          >
            <div className="flex items-center gap-3">
              <Star size={20} className="text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold text-[var(--text-primary)]">Tranquila</span>
                <span className="text-xs text-[var(--text-secondary)]">Dormiu super bem</span>
              </div>
            </div>
          </button>

          <button
            className="flex items-center justify-between p-4 bg-[var(--bg-base)] hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-[var(--border-color)] hover:border-amber-200 rounded-xl transition-all group"
            onClick={() => handleSave('short')}
            disabled={saving}
          >
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-amber-505 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold text-[var(--text-primary)]">Agitada / Curta</span>
                <span className="text-xs text-[var(--text-secondary)]">Acordou várias vezes ou cedo demais</span>
              </div>
            </div>
          </button>

          <button
            className="flex items-center justify-between p-4 bg-[var(--bg-base)] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-[var(--border-color)] hover:border-emerald-200 rounded-xl transition-all group"
            onClick={() => handleSave('long')}
            disabled={saving}
          >
            <div className="flex items-center gap-3">
              <Star size={20} className="text-emerald-500 fill-emerald-500 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold text-[var(--text-primary)]">Longa / Profunda</span>
                <span className="text-xs text-[var(--text-secondary)]">Dormiu mais que o habitual</span>
              </div>
            </div>
          </button>
        </div>
      </Modal>
    </>
  )
}

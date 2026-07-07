import { useState } from 'react'
import { AlertTriangle, Droplets, Baby, Activity } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

type DiaperType = 'pee' | 'poop' | 'both'
type PoopColor = 'yellow' | 'green' | 'brown' | 'red' | 'white' | 'black'
type PoopConsistency = 'liquid' | 'paste' | 'hard'

const POOP_COLORS: { key: PoopColor; label: string; hex: string }[] = [
  { key: 'yellow', label: 'Amarelo', hex: '#fcd34d' },
  { key: 'green',  label: 'Verde',   hex: '#4ade80' },
  { key: 'brown',  label: 'Marrom',  hex: '#92400e' },
  { key: 'red',    label: 'Vermelho', hex: '#ef4444' },
  { key: 'white',  label: 'Branco',  hex: '#f3f4f6' },
  { key: 'black',  label: 'Preto',   hex: '#1f2937' },
]

const POOP_CONSISTENCIES: { key: PoopConsistency; label: string; icon: React.ReactNode }[] = [
  { key: 'liquid', label: 'Líquido', icon: <Droplets size={20} /> },
  { key: 'paste',  label: 'Pastoso', icon: <Droplets size={20} className="opacity-70" /> },
  { key: 'hard',   label: 'Duro',    icon: <Droplets size={20} className="opacity-30" /> },
]

const ALERT_COLORS: PoopColor[] = ['red', 'white', 'black']
const ALERT_MESSAGES: Record<PoopColor, string> = {
  red: 'Cocô vermelho pode indicar sangramento intestinal ou fissura anal. Isso merece avaliação pediátrica urgente.',
  white: 'Cocô branco ou acinzentado pode indicar problemas no fígado ou nas vias biliares. Ligue para o pediatra hoje.',
  black: 'Cocô preto após as primeiras 48h de vida pode indicar sangramento. Contate o pediatra imediatamente.',
  yellow: '', green: '', brown: '',
}

export function DiaperCard({ onNewSession }: { onNewSession?: () => void }) {
  const { user, baby } = useAuth()
  const [showPoopModal, setShowPoopModal] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')
  
  const [pendingType, setPendingType] = useState<DiaperType>('poop')
  const [selectedColor, setSelectedColor] = useState<PoopColor | null>(null)
  const [selectedConsistency, setSelectedConsistency] = useState<PoopConsistency | null>(null)
  
  const [saving, setSaving] = useState(false)
  const [lastChange, setLastChange] = useState<{ type: DiaperType; time: Date } | null>(null)

  const handlePee = async () => {
    if (!user || !baby) return
    setSaving(true)
    try {
      await supabase.from('diaper_changes').insert({
        baby_id: baby.id,
        type: 'pee',
        changed_at: new Date().toISOString(),
        logged_by: user.id,
        logged_by_name: user.email?.split('@')[0] ?? 'Cuidador',
      })
      setLastChange({ type: 'pee', time: new Date() })
      onNewSession?.()
    } catch (err) {
      console.error('Error saving diaper:', err)
    } finally {
      setSaving(false)
    }
  }

  const handlePoopOpen = (type: 'poop' | 'both') => {
    setPendingType(type)
    setSelectedColor(null)
    setSelectedConsistency(null)
    setShowPoopModal(true)
  }

  const handlePoopSave = async () => {
    if (!user || !baby || !selectedColor || !selectedConsistency) return

    if (ALERT_COLORS.includes(selectedColor)) {
      setAlertMsg(ALERT_MESSAGES[selectedColor])
      setShowAlert(true)
    }

    setSaving(true)
    try {
      await supabase.from('diaper_changes').insert({
        baby_id: baby.id,
        type: pendingType,
        poop_color: selectedColor,
        poop_consistency: selectedConsistency,
        changed_at: new Date().toISOString(),
        logged_by: user.id,
        logged_by_name: user.email?.split('@')[0] ?? 'Cuidador',
      })
      setLastChange({ type: pendingType, time: new Date() })
      setShowPoopModal(false)
      onNewSession?.()
    } catch (err) {
      console.error('Error saving diaper:', err)
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const getDiaperIcon = (type: DiaperType) => {
    if (type === 'pee') return <Droplets size={16} />
    if (type === 'poop') return <Activity size={16} />
    return <Baby size={16} />
  }

  return (
    <>
      <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-baby-100 dark:bg-baby-900 rounded-2xl text-baby-600 dark:text-baby-400">
              <Baby size={24} strokeWidth={2} />
            </div>
            <h3 className="font-heading text-lg font-extrabold text-[var(--text-primary)] m-0">Fraldas</h3>
          </div>
          {lastChange && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-baby-50 dark:bg-baby-900/30 rounded-full border border-baby-100 dark:border-baby-800">
              <span className="text-baby-500">{getDiaperIcon(lastChange.type)}</span>
              <span className="text-xs font-bold text-baby-700 dark:text-baby-300">{formatTime(lastChange.time)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            className="flex flex-col items-center justify-center p-4 bg-baby-50 hover:bg-baby-100 active:bg-baby-200 dark:bg-baby-900/30 dark:hover:bg-baby-800/50 rounded-2xl border border-transparent hover:border-baby-200 transition-all text-baby-600 dark:text-baby-400 disabled:opacity-50 min-h-[90px]"
            onClick={handlePee}
            disabled={saving}
          >
            <Droplets size={28} strokeWidth={1.5} className="mb-2" />
            <span className="text-xs font-bold">Xixi</span>
          </button>

          <button
            className="flex flex-col items-center justify-center p-4 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 rounded-2xl border border-transparent hover:border-amber-200 transition-all text-amber-700 dark:text-amber-500 disabled:opacity-50 min-h-[90px]"
            onClick={() => handlePoopOpen('poop')}
            disabled={saving}
          >
            <Activity size={28} strokeWidth={1.5} className="mb-2" />
            <span className="text-xs font-bold">Cocô</span>
          </button>

          <button
            className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-2xl border border-transparent hover:border-emerald-200 transition-all text-emerald-700 dark:text-emerald-500 disabled:opacity-50 min-h-[90px]"
            onClick={() => handlePoopOpen('both')}
            disabled={saving}
          >
            <div className="flex -space-x-2 mb-2">
              <Droplets size={24} strokeWidth={1.5} />
              <Activity size={24} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Ambos</span>
          </button>
        </div>
      </div>

      <Modal
        isOpen={showPoopModal}
        onClose={() => setShowPoopModal(false)}
        title={pendingType === 'both' ? 'Triagem: Xixi + Cocô' : 'Triagem do Cocô'}
      >
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Cor da Evacuação</h4>
            <div className="grid grid-cols-3 gap-3">
              {POOP_COLORS.map(color => (
                <button
                  key={color.key}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${selectedColor === color.key ? 'border-baby-500 bg-baby-50 dark:bg-baby-900/20' : 'border-[var(--border-color)] bg-[var(--bg-base)]'}`}
                  onClick={() => setSelectedColor(color.key)}
                >
                  <span 
                    className="w-8 h-8 rounded-full shadow-sm relative flex items-center justify-center" 
                    style={{ backgroundColor: color.hex }}
                  >
                    {ALERT_COLORS.includes(color.key as PoopColor) && (
                      <AlertTriangle size={14} className="absolute -top-1 -right-1 text-red-500 bg-white rounded-full p-0.5" />
                    )}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-secondary)]">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Consistência</h4>
            <div className="grid grid-cols-3 gap-3">
              {POOP_CONSISTENCIES.map(c => (
                <button
                  key={c.key}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-[var(--text-secondary)] ${selectedConsistency === c.key ? 'border-baby-500 bg-baby-50 text-baby-600 dark:bg-baby-900/20' : 'border-[var(--border-color)] bg-[var(--bg-base)]'}`}
                  onClick={() => setSelectedConsistency(c.key)}
                >
                  {c.icon}
                  <span className="text-xs font-bold">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={saving}
            disabled={!selectedColor || !selectedConsistency}
            onClick={handlePoopSave}
            className="mt-2"
          >
            Registrar Troca
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="Atenção — Alerta de Saúde"
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle size={32} />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">{alertMsg}</p>
          <Button
            variant="danger"
            fullWidth
            onClick={() => setShowAlert(false)}
            className="mt-4"
          >
            Entendido, contatarei pediatra
          </Button>
        </div>
      </Modal>
    </>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { Plus, Milk, Trash2, ArrowLeftRight, Archive } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

type Side = 'left' | 'right' | 'both'

interface PumpingSession {
  id: string
  volume_ml: number
  side: Side
  pumped_at: string
  logged_by_name: string | null
}

export function Pumping() {
  const { user, baby } = useAuth()
  const [sessions, setSessions] = useState<PumpingSession[]>([])
  const [showModal, setShowModal] = useState(false)
  const [volume, setVolume] = useState('')
  const [side, setSide] = useState<Side>('both')
  const [pumpedAt, setPumpedAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' })

  const fetchSessions = useCallback(async () => {
    if (!baby) return
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data } = await supabase
      .from('pumping_sessions')
      .select('id, volume_ml, side, pumped_at, logged_by_name')
      .eq('baby_id', baby.id)
      .gte('pumped_at', weekAgo.toISOString())
      .order('pumped_at', { ascending: false })

    setSessions((data ?? []) as PumpingSession[])
  }, [baby])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const handleSave = async () => {
    if (!user || !baby || !volume) return
    setSaving(true)
    try {
      await supabase.from('pumping_sessions').insert({
        baby_id: baby.id,
        volume_ml: Number(volume),
        side,
        pumped_at: new Date(pumpedAt).toISOString(),
        logged_by: user.id,
        logged_by_name: user.email?.split('@')[0] ?? 'Cuidador',
      })
      setVolume('')
      setSide('both')
      setPumpedAt(new Date().toISOString().slice(0, 16))
      setShowModal(false)
      fetchSessions()
    } catch (err) {
      console.error('Error saving pumping:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    await supabase.from('pumping_sessions').delete().eq('id', deleteConfirm.id)
    setDeleteConfirm({ isOpen: false, id: '' })
    fetchSessions()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySessions = sessions.filter(s => new Date(s.pumped_at) >= today)
  const weekSessions = sessions

  const todayTotal = todaySessions.reduce((a, s) => a + s.volume_ml, 0)
  const weekTotal = weekSessions.reduce((a, s) => a + s.volume_ml, 0)

  const sideLabel = (s: Side) => s === 'left' ? 'Esq' : s === 'right' ? 'Dir' : 'Ambos'
  const sideIcon = (s: Side) => {
    if (s === 'left') return <ArrowLeftRight size={14} className="rotate-180" />
    if (s === 'right') return <ArrowLeftRight size={14} />
    return <ArrowLeftRight size={14} /> // could use a different icon for both
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col p-4 sm:p-6 pb-8 gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 bg-baby-100 dark:bg-baby-900/30 rounded-3xl border border-baby-200 dark:border-baby-800">
          <div className="p-3 bg-[var(--bg-card)] text-baby-500 rounded-2xl shadow-sm">
            <Milk size={24} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-2xl font-extrabold text-[var(--text-primary)] leading-none">{todayTotal}</span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">ml</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">Hoje ({todaySessions.length})</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)]">
          <div className="p-3 bg-baby-50 dark:bg-baby-900/20 text-baby-400 rounded-2xl">
            <Archive size={24} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-2xl font-extrabold text-[var(--text-primary)] leading-none">{weekTotal}</span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">ml</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">7 dias ({weekSessions.length})</span>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        icon={<Plus size={20} />}
        onClick={() => setShowModal(true)}
        className="shadow-md shadow-baby-500/20"
      >
        Registrar Extração
      </Button>

      {/* History List */}
      <div className="flex flex-col gap-3">
        <h3 className="font-heading text-base font-extrabold text-[var(--text-primary)] pl-1">Histórico (7 dias)</h3>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 gap-3 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] text-[var(--text-secondary)] opacity-70">
            <Milk size={40} strokeWidth={1} />
            <p className="text-sm font-medium">Nenhuma extração registrada</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3.5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-10 h-10 bg-baby-50 dark:bg-baby-900/20 text-baby-500 rounded-xl">
                    {sideIcon(s.side)}
                    <span className="text-[9px] font-bold mt-0.5">{sideLabel(s.side)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-[var(--text-primary)]">{s.volume_ml} ml</span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium flex items-center gap-1">
                      {formatDate(s.pumped_at)}
                      {s.logged_by_name && <span className="opacity-60">• {s.logged_by_name}</span>}
                    </span>
                  </div>
                </div>
                <button
                  className="p-2 text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  onClick={() => handleDelete(s.id)}
                  aria-label="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Extração"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="pumping-volume">Volume extraído</label>
            <div className="flex items-center bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] focus-within:border-baby-500 focus-within:ring-2 focus-within:ring-baby-500/20 transition-all">
              <input
                id="pumping-volume"
                type="number"
                className="flex-1 bg-transparent px-4 py-3 text-lg font-bold text-[var(--text-primary)] outline-none"
                placeholder="0"
                value={volume}
                onChange={e => setVolume(e.target.value)}
                min="0"
                max="500"
                step="5"
              />
              <span className="px-4 text-[var(--text-secondary)] font-medium">ml</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Seio</label>
            <div className="flex bg-[var(--bg-base)] p-1 rounded-2xl border border-[var(--border-color)]">
              {(['left', 'both', 'right'] as Side[]).map(s => (
                <button
                  key={s}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all ${
                    side === s 
                      ? 'bg-[var(--bg-card)] shadow-sm text-baby-600 dark:text-baby-400 font-bold' 
                      : 'text-[var(--text-secondary)] opacity-70 hover:opacity-100 font-medium'
                  }`}
                  onClick={() => setSide(s)}
                >
                  {sideIcon(s)}
                  <span className="text-[10px]">{sideLabel(s)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="pumping-datetime">Data e hora</label>
            <input
              id="pumping-datetime"
              type="datetime-local"
              className="bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-medium outline-none focus:border-baby-500 focus:ring-2 focus:ring-baby-500/20 transition-all"
              value={pumpedAt}
              onChange={e => setPumpedAt(e.target.value)}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={saving}
            disabled={!volume || Number(volume) <= 0}
            onClick={handleSave}
            className="mt-2"
          >
            Salvar
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Tem certeza que deseja apagar este registro de extração? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setDeleteConfirm({ isOpen: false, id: '' })}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={confirmDelete}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

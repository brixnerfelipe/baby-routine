import { useState, useEffect, useCallback } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Milk, Moon, Droplets, HeartHandshake, Baby, Activity, Trash2, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { FeedingCard } from '../components/feeding/FeedingCard'
import { SleepCard } from '../components/sleep/SleepCard'
import { DiaperCard } from '../components/diaper/DiaperCard'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DailyStats {
  feedingCount: number
  feedingTotalMin: number
  sleepCount: number
  sleepTotalMin: number
  diaperPee: number
  diaperPoop: number
  diaperBoth: number
}

interface TimelineItem {
  id: string
  type: 'feeding' | 'sleep' | 'diaper'
  time: Date
  title: string
  details: string
}

const DAILY_TIPS = [
  { icon: <HeartHandshake size={20} />, tip: 'A exterogestação dura cerca de 9 meses. Seu bebê ainda precisa muito do seu colo!' },
  { icon: <Milk size={20} />, tip: 'Amamentação frequente ajuda a estabelecer a produção de leite. Não se preocupe com relógio nas primeiras semanas.' },
  { icon: <Moon size={20} />, tip: 'Bebês recém-nascidos dormem entre 14-17 horas por dia, mas em intervalos curtos.' },
  { icon: <Baby size={20} />, tip: 'Os saltos de desenvolvimento podem deixar o bebê mais agitado e faminto por alguns dias. É temporário!' },
  { icon: <Baby size={20} />, tip: 'Bebês enxergam melhor a distância de 20-30cm — exatamente a distância do rosto durante a amamentação.' },
  { icon: <Activity size={20} />, tip: 'Cada mamada reforça conexões neurais no cérebro do bebê. O contato pele a pele é igualmente poderoso.' },
  { icon: <HeartHandshake size={20} />, tip: 'Cuidar de você mesma não é egoísmo — é necessidade. Você não pode servir de um copo vazio.' },
  { icon: <Baby size={20} />, tip: 'A voz da mãe é o som mais reconfortante para o bebê. Cantar, conversar e sussurrar faz toda diferença.' },
]

export function Home() {
  const { baby } = useAuth()
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: TimelineItem | null }>({ isOpen: false, item: null })
  const [refresh, setRefresh] = useState(0)
  const todayTip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length]

  const fetchStats = useCallback(async () => {
    if (!baby) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [feedings, sleeps, diapers] = await Promise.all([
      supabase
        .from('feeding_sessions')
        .select('*')
        .eq('baby_id', baby.id)
        .gte('started_at', today.toISOString())
        .not('ended_at', 'is', null),
      supabase
        .from('sleep_sessions')
        .select('*')
        .eq('baby_id', baby.id)
        .gte('slept_at', today.toISOString())
        .not('woke_at', 'is', null),
      supabase
        .from('diaper_changes')
        .select('*')
        .eq('baby_id', baby.id)
        .gte('changed_at', today.toISOString()),
    ])

    // Compute stats
    const feedingTotalSecs = (feedings.data ?? []).reduce((a, f) => a + (f.duration_seconds ?? 0), 0)
    const sleepTotalSecs = (sleeps.data ?? []).reduce((a, s) => a + (s.duration_seconds ?? 0), 0)
    const diaperPee = (diapers.data ?? []).filter(d => d.type === 'pee').length
    const diaperPoop = (diapers.data ?? []).filter(d => d.type === 'poop').length
    const diaperBoth = (diapers.data ?? []).filter(d => d.type === 'both').length

    setStats({
      feedingCount: feedings.data?.length ?? 0,
      feedingTotalMin: Math.round(feedingTotalSecs / 60),
      sleepCount: sleeps.data?.length ?? 0,
      sleepTotalMin: Math.round(sleepTotalSecs / 60),
      diaperPee,
      diaperPoop,
      diaperBoth,
    })

    // Build timeline
    const items: TimelineItem[] = []

    ;(feedings.data ?? []).forEach(f => {
      const durationMin = Math.round((f.duration_seconds ?? 0) / 60)
      const sideStr = f.side === 'left' ? 'Seio Esquerdo' : f.side === 'right' ? 'Seio Direito' : 'Mamadeira'
      items.push({
        id: f.id,
        type: 'feeding',
        time: new Date(f.started_at),
        title: 'Mamada',
        details: `${sideStr} • ${durationMin} min`,
      })
    })

    ;(sleeps.data ?? []).forEach(s => {
      const durationMin = Math.round((s.duration_seconds ?? 0) / 60)
      const durationStr = durationMin >= 60 
        ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}min` 
        : `${durationMin} min`
      const qualityStr = s.quality === 'short' ? 'Agitada' : s.quality === 'ideal' ? 'Tranquila' : 'Longa'
      items.push({
        id: s.id,
        type: 'sleep',
        time: new Date(s.slept_at),
        title: 'Soneca',
        details: `${durationStr} • ${qualityStr}`,
      })
    })

    ;(diapers.data ?? []).forEach(d => {
      const typeStr = d.type === 'pee' ? 'Somente Xixi' : d.type === 'poop' ? 'Somente Cocô' : 'Xixi e Cocô'
      items.push({
        id: d.id,
        type: 'diaper',
        time: new Date(d.changed_at),
        title: 'Troca de Fralda',
        details: typeStr,
      })
    })

    // Sort descending
    items.sort((a, b) => b.time.getTime() - a.time.getTime())
    setTimeline(items)
  }, [baby])

  useEffect(() => { fetchStats() }, [fetchStats, refresh])

  useEffect(() => {
    if (!baby) return
    const channel = supabase
      .channel(`baby-${baby.id}-home`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feeding_sessions', filter: `baby_id=eq.${baby.id}` }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sleep_sessions', filter: `baby_id=eq.${baby.id}` }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diaper_changes', filter: `baby_id=eq.${baby.id}` }, () => fetchStats())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [baby, fetchStats])

  const onNewSession = () => setRefresh(r => r + 1)

  const totalDiapers = stats ? (stats.diaperPee + stats.diaperPoop + stats.diaperBoth) : 0

  const doughnutData = stats ? {
    labels: ['Amamentação', 'Sono', 'Fraldas'],
    datasets: [{
      data: [stats.feedingCount, stats.sleepCount, totalDiapers],
      backgroundColor: [
        '#0c95eb', 
        '#7cc7fb', 
        '#0077c9', 
      ],
      borderColor: ['transparent'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  } : null

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          font: { family: 'Nunito', size: 12, weight: 'bold' as const },
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#0c436e',
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; raw: unknown }) => ` ${ctx.label}: ${ctx.raw} registros`,
        },
      },
    },
    cutout: '72%',
  }

  const handleDeleteTimelineItem = (item: TimelineItem) => {
    setDeleteConfirm({ isOpen: true, item })
  }

  const confirmDeleteTimelineItem = async () => {
    if (!deleteConfirm.item) return
    const { id, type } = deleteConfirm.item

    try {
      const table = type === 'feeding' 
        ? 'feeding_sessions' 
        : type === 'sleep' 
        ? 'sleep_sessions' 
        : 'diaper_changes'
        
      await supabase.from(table).delete().eq('id', id)
      setDeleteConfirm({ isOpen: false, item: null })
      onNewSession()
    } catch (err) {
      console.error('Error deleting activity:', err)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 pb-8">
      {/* Daily Dashboard */}
      {stats && (
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
          <h2 className="font-heading text-lg font-extrabold text-[var(--text-primary)] mb-5">Resumo de Hoje</h2>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="flex flex-col items-center text-center p-3 bg-baby-50 dark:bg-baby-900/30 rounded-2xl">
              <div className="text-baby-500 mb-1"><Milk size={20} /></div>
              <span className="font-heading text-xl font-extrabold text-baby-700 dark:text-baby-300 leading-none mb-1">{stats.feedingCount}</span>
              <span className="text-[10px] font-bold text-baby-600 uppercase tracking-wider mb-0.5">Mamadas</span>
              <span className="text-[10px] text-baby-500/80">{stats.feedingTotalMin}m total</span>
            </div>
            
            <div className="flex flex-col items-center text-center p-3 bg-baby-50 dark:bg-baby-900/30 rounded-2xl">
              <div className="text-baby-500 mb-1"><Moon size={20} /></div>
              <span className="font-heading text-xl font-extrabold text-baby-700 dark:text-baby-300 leading-none mb-1">{stats.sleepCount}</span>
              <span className="text-[10px] font-bold text-baby-600 uppercase tracking-wider mb-0.5">Sonecas</span>
              <span className="text-[10px] text-baby-500/80">{Math.floor(stats.sleepTotalMin / 60)}h {stats.sleepTotalMin % 60}m</span>
            </div>
            
            <div className="flex flex-col items-center text-center p-3 bg-baby-50 dark:bg-baby-900/30 rounded-2xl">
              <div className="text-baby-500 mb-1"><Droplets size={20} /></div>
              <span className="font-heading text-xl font-extrabold text-baby-700 dark:text-baby-300 leading-none mb-1">{totalDiapers}</span>
              <span className="text-[10px] font-bold text-baby-600 uppercase tracking-wider mb-0.5">Fraldas</span>
              <span className="text-[10px] text-baby-500/80">{stats.diaperPee}💧 {stats.diaperPoop}💩 {stats.diaperBoth > 0 ? `${stats.diaperBoth}🔁` : ''}</span>
            </div>
          </div>

          {doughnutData && (stats.feedingCount + stats.sleepCount + totalDiapers > 0) && (
            <div className="relative h-[220px] w-full flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          )}
        </div>
      )}

      {/* Daily Tip */}
      <div className="flex items-start gap-4 p-5 bg-baby-50 dark:bg-baby-900/40 rounded-3xl border border-baby-100 dark:border-baby-800">
        <div className="p-2.5 bg-baby-100 dark:bg-baby-800 rounded-full text-baby-600 dark:text-baby-400 shrink-0">
          {todayTip.icon}
        </div>
        <p className="text-sm font-medium text-baby-800 dark:text-baby-300 leading-relaxed m-0">
          {todayTip.tip}
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        <FeedingCard onNewSession={onNewSession} />
        <SleepCard onNewSession={onNewSession} />
        <DiaperCard onNewSession={onNewSession} />
      </div>

      {/* Timeline Section */}
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="font-heading text-base font-extrabold text-[var(--text-primary)] pl-1">Histórico de Hoje</h3>
        {timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 gap-2 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] text-[var(--text-secondary)] opacity-70">
            <Clock size={32} strokeWidth={1.5} className="text-baby-400 mb-1" />
            <p className="text-xs font-medium">Nenhuma atividade registrada hoje</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {timeline.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3.5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-baby-50 dark:bg-baby-900/20 text-baby-500 rounded-xl shrink-0">
                    {item.type === 'feeding' && <Milk size={18} />}
                    {item.type === 'sleep' && <Moon size={18} />}
                    {item.type === 'diaper' && <Droplets size={18} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                      {item.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm font-extrabold text-[var(--text-primary)] leading-tight mt-0.5">{item.title}</span>
                    <span className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">{item.details}</span>
                  </div>
                </div>
                <button
                  className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  onClick={() => handleDeleteTimelineItem(item)}
                  title="Excluir atividade"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Tem certeza que deseja apagar este registro de {deleteConfirm.item?.type === 'feeding' ? 'mamada' : deleteConfirm.item?.type === 'sleep' ? 'soneca' : 'fralda'}? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setDeleteConfirm({ isOpen: false, item: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={confirmDeleteTimelineItem}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

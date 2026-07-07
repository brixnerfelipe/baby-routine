import { useState, useEffect, useCallback } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Plus, CheckCircle, Circle, ChevronDown, ChevronUp, Ruler, Syringe, Info, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useBabyAge } from '../hooks/useBabyAge'
import { supabase } from '../lib/supabase'
import { WHO_WEIGHT_BOYS, WHO_WEIGHT_GIRLS } from '../lib/whoData'
import { VACCINE_SCHEDULE, VACCINE_AGE_GROUPS } from '../lib/vaccineData'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface GrowthRecord {
  id: string
  recorded_at: string
  weight_kg: number | null
  height_cm: number | null
  head_circumference_cm: number | null
}

interface VaccineRecord {
  vaccine_key: string
  administered_at: string
}

export function Health() {
  const { user, baby } = useAuth()
  const { theme } = useTheme()
  const age = useBabyAge(baby?.birth_date ?? null)
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>([])
  const [showGrowthModal, setShowGrowthModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' })
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([0, 1, 2]))

  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formWeight, setFormWeight] = useState('')
  const [formHeight, setFormHeight] = useState('')
  const [formHead, setFormHead] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    if (!baby) return
    const [growth, vaccines] = await Promise.all([
      supabase.from('growth_records').select('*').eq('baby_id', baby.id).order('recorded_at'),
      supabase.from('vaccine_records').select('vaccine_key, administered_at').eq('baby_id', baby.id),
    ])
    setGrowthRecords((growth.data ?? []) as GrowthRecord[])
    setVaccineRecords((vaccines.data ?? []) as VaccineRecord[])
  }, [baby])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSaveGrowth = async () => {
    if (!user || !baby) return
    setSaving(true)
    try {
      await supabase.from('growth_records').insert({
        baby_id: baby.id,
        recorded_at: formDate,
        weight_kg: formWeight ? Number(formWeight) : null,
        height_cm: formHeight ? Number(formHeight) : null,
        head_circumference_cm: formHead ? Number(formHead) : null,
      })
      setFormDate(new Date().toISOString().split('T')[0])
      setFormWeight('')
      setFormHeight('')
      setFormHead('')
      setShowGrowthModal(false)
      fetchData()
    } catch (err) {
      console.error('Error saving growth:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGrowth = (id: string) => {
    setDeleteConfirm({ isOpen: true, id })
  }

  const confirmDeleteGrowth = async () => {
    if (!deleteConfirm.id) return
    try {
      await supabase.from('growth_records').delete().eq('id', deleteConfirm.id)
      fetchData()
      setDeleteConfirm({ isOpen: false, id: '' })
    } catch (err) {
      console.error('Error deleting growth record:', err)
    }
  }

  const handleToggleVaccine = async (vaccineKey: string) => {
    if (!user || !baby) return
    const existing = vaccineRecords.find(v => v.vaccine_key === vaccineKey)
    if (existing) {
      await supabase.from('vaccine_records').delete()
        .eq('baby_id', baby.id).eq('vaccine_key', vaccineKey)
    } else {
      await supabase.from('vaccine_records').insert({
        baby_id: baby.id,
        vaccine_key: vaccineKey,
        administered_at: new Date().toISOString().split('T')[0],
      })
    }
    fetchData()
  }

  const toggleGroup = (ageMonths: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(ageMonths)) next.delete(ageMonths)
      else next.add(ageMonths)
      return next
    })
  }

  const isVaccineDone = (key: string) => vaccineRecords.some(v => v.vaccine_key === key)

  const whoData = baby?.gender === 'female' ? WHO_WEIGHT_GIRLS : WHO_WEIGHT_BOYS
  const chartLabels = whoData.map(p => `${p.age}m`)

  const growthChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'P3',
        data: whoData.map(p => p.p3),
        borderColor: 'rgba(12, 149, 235, 0.2)', // baby-500 light
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'P15',
        data: whoData.map(p => p.p15),
        borderColor: 'rgba(12, 149, 235, 0.4)',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'P50',
        data: whoData.map(p => p.p50),
        borderColor: 'rgba(12, 149, 235, 0.8)',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'P85',
        data: whoData.map(p => p.p85),
        borderColor: 'rgba(12, 149, 235, 0.4)',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'P97',
        data: whoData.map(p => p.p97),
        borderColor: 'rgba(12, 149, 235, 0.2)',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
      ...(growthRecords.length > 0 ? [{
        label: baby?.name ?? 'Bebê',
        data: growthRecords.map(r => ({
          x: r.recorded_at.slice(0, 7),
          y: r.weight_kg,
        })),
        borderColor: '#025fa3', // baby-700
        backgroundColor: 'rgba(2, 95, 163, 0.2)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#025fa3',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        fill: false,
        tension: 0.3,
      }] : []),
    ],
  }

  const isDark = theme === 'dark'
  const textColor = isDark ? '#bae0fd' : '#0c436e'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(12, 149, 235, 0.1)'

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        labels: {
          font: { family: 'Nunito', size: 11 },
          color: textColor,
          padding: 12,
          usePointStyle: true,
          filter: (item: { text: string }) => item.text !== 'P3' && item.text !== 'P97',
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) => {
            if (!ctx.parsed.y) return ''
            return ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} kg`
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 10 },
          color: textColor,
          maxRotation: 0,
          maxTicksLimit: 8,
        },
        grid: { color: gridColor, lineWidth: 1 },
      },
      y: {
        title: { display: true, text: 'Peso (kg)', color: textColor, font: { size: 11 } },
        ticks: { font: { size: 10 }, color: textColor },
        grid: { color: gridColor, lineWidth: 1 },
      },
    },
  }

  const vaccinesDone = vaccineRecords.length
  const vaccinesTotal = VACCINE_SCHEDULE.length
  const vaccineProgress = Math.round((vaccinesDone / vaccinesTotal) * 100)

  return (
    <div className="flex flex-col p-4 sm:p-6 pb-8 gap-6">
      {/* Growth Section */}
      <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Ruler size={24} strokeWidth={2} />
            </div>
            <h3 className="font-heading text-lg font-extrabold text-[var(--text-primary)] m-0">Crescimento</h3>
            <button
              onClick={() => setShowInfoModal(true)}
              className="text-[var(--text-secondary)] hover:text-baby-500 dark:hover:text-baby-300 transition-colors p-1"
              title="Informações sobre Percentis"
            >
              <Info size={16} />
            </button>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => setShowGrowthModal(true)}
            className="text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border-none dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-800/60"
          >
            Consulta
          </Button>
        </div>

        {growthRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 gap-3 bg-[var(--bg-base)] rounded-3xl border border-[var(--border-color)] text-[var(--text-secondary)] opacity-70">
            <Ruler size={40} strokeWidth={1} />
            <p className="text-sm font-medium text-center">Adicione os dados da primeira consulta pediátrica</p>
          </div>
        ) : (
          <>
            <div className="relative h-[250px] w-full mb-6">
              <Line data={growthChartData} options={chartOptions} />
            </div>
            <div className="flex flex-col gap-2">
               {growthRecords.slice().reverse().map(r => (
                <div key={r.id} className="flex items-center justify-between p-3.5 bg-[var(--bg-base)] rounded-2xl border border-[var(--border-color)]">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">{new Date(r.recorded_at).toLocaleDateString('pt-BR')}</span>
                    <div className="flex items-center gap-3 text-sm font-extrabold text-[var(--text-primary)] mt-1">
                      {r.weight_kg && <span>{r.weight_kg} kg</span>}
                      {r.height_cm && <span>{r.height_cm} cm</span>}
                      {r.head_circumference_cm && <span className="text-xs opacity-60">PC {r.head_circumference_cm}cm</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGrowth(r.id)}
                    className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Excluir registro"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Vaccines Section */}
      <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 rounded-2xl text-rose-500 dark:text-rose-400">
              <Syringe size={24} strokeWidth={2} />
            </div>
            <h3 className="font-heading text-lg font-extrabold text-[var(--text-primary)] m-0">Vacinas</h3>
          </div>
          <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 font-bold text-xs rounded-full">
            {vaccinesDone}/{vaccinesTotal}
          </span>
        </div>

        <div className="w-full h-2 bg-[var(--bg-base)] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-rose-500 transition-all duration-500 ease-out"
            style={{ width: `${vaccineProgress}%` }}
          />
        </div>
        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right mb-6">{vaccineProgress}% completo</p>

        <div className="flex flex-col gap-3">
          {VACCINE_AGE_GROUPS.map(group => {
            const groupVaccines = VACCINE_SCHEDULE.filter(v => v.ageMonths === group.ageMonths)
            const doneBadge = groupVaccines.filter(v => isVaccineDone(v.key)).length
            const isExpanded = expandedGroups.has(group.ageMonths)
            const isPast = age ? (age.totalMonths >= group.ageMonths) : false
            const isAllDone = doneBadge === groupVaccines.length

            return (
              <div key={group.ageMonths} className={`flex flex-col bg-[var(--bg-base)] rounded-2xl overflow-hidden transition-all ${isPast && !isAllDone ? 'ring-1 ring-rose-500/30' : 'border border-[var(--border-color)]'}`}>
                <button
                  className="flex items-center justify-between p-4 w-full text-left focus:outline-none"
                  onClick={() => toggleGroup(group.ageMonths)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${isAllDone ? 'bg-emerald-500' : isPast ? 'bg-rose-500' : 'bg-[var(--border-color)]'}`} />
                    <span className="font-bold text-[var(--text-primary)] text-sm">{group.label}</span>
                    <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">{doneBadge}/{groupVaccines.length}</span>
                  </div>
                  <div className="text-[var(--text-secondary)] opacity-50">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="flex flex-col px-4 pb-4 gap-2">
                    {groupVaccines.map(vaccine => {
                      const done = isVaccineDone(vaccine.key)
                      return (
                        <button
                          key={vaccine.key}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${done ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-[var(--bg-card)] border-[var(--border-color)]'}`}
                          onClick={() => handleToggleVaccine(vaccine.key)}
                        >
                          <div className="mt-0.5">
                            {done
                              ? <CheckCircle size={20} className="text-emerald-500" />
                              : <Circle size={20} className="text-[var(--text-tertiary)]" />
                            }
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${done ? 'text-emerald-900 dark:text-emerald-100' : 'text-[var(--text-primary)]'}`}>{vaccine.name}</span>
                            <span className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{vaccine.protects}</span>
                            {vaccine.notes && <span className="text-[10px] text-baby-600 dark:text-baby-400 mt-1 font-medium bg-baby-50 dark:bg-baby-900/30 px-2 py-1 rounded inline-block w-fit">{vaccine.notes}</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Modal
        isOpen={showGrowthModal}
        onClose={() => setShowGrowthModal(false)}
        title="Registrar Consulta"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="growth-date">Data da consulta</label>
            <input
              id="growth-date"
              type="date"
              className="bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-medium outline-none focus:border-baby-500 focus:ring-2 focus:ring-baby-500/20 transition-all"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="growth-weight">Peso (kg)</label>
              <input
                id="growth-weight"
                type="number"
                className="bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-baby-500 focus:ring-2 focus:ring-baby-500/20 transition-all"
                placeholder="5.2"
                value={formWeight}
                onChange={e => setFormWeight(e.target.value)}
                step="0.01"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="growth-height">Altura (cm)</label>
              <input
                id="growth-height"
                type="number"
                className="bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-baby-500 focus:ring-2 focus:ring-baby-500/20 transition-all"
                placeholder="58"
                value={formHeight}
                onChange={e => setFormHeight(e.target.value)}
                step="0.1"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="growth-head">Perímetro Cefálico (cm)</label>
            <input
              id="growth-head"
              type="number"
              className="bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-baby-500 focus:ring-2 focus:ring-baby-500/20 transition-all"
              placeholder="35"
              value={formHead}
              onChange={e => setFormHead(e.target.value)}
              step="0.1"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={saving}
            disabled={!formWeight && !formHeight && !formHead}
            onClick={handleSaveGrowth}
            className="mt-2"
          >
            Salvar Dados
          </Button>
        </div>
      </Modal>

      {/* Percentiles Info Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Entendendo os Percentis (OMS/SBP)"
      >
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-[var(--text-secondary)]">
          <p>
            Os <strong>percentis de crescimento</strong> são curvas estatísticas desenvolvidas pela <strong>Organização Mundial da Saúde (OMS)</strong> e adotadas pela <strong>Sociedade Brasileira de Pediatria (SBP)</strong> para acompanhar o desenvolvimento infantil de forma saudável.
          </p>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-[var(--text-primary)]">O que significam as linhas?</h4>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li><strong>P50 (Percentil 50):</strong> É a média exata de peso e altura. Significa que 50% dos bebês saudáveis têm peso/altura acima dessa linha e 50% abaixo.</li>
              <li><strong>P85 e P97:</strong> Indicam que o bebê está acima da média (um bebê no P85 é mais pesado/alto do que 85% das outras crianças da mesma idade).</li>
              <li><strong>P15 e P3:</strong> Indicam que o bebê está abaixo da média (um bebê no P15 é mais pesado/alto do que apenas 15% das outras crianças da mesma idade).</li>
            </ul>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <h4 className="font-bold mb-1">Qual é o percentil ideal?</h4>
            <p className="text-xs">
              <strong>Não existe um percentil ideal!</strong> Um bebê no percentil 15 é tão saudável quanto um no percentil 85. O mais importante para o pediatra é observar se o bebê <strong>mantenha o seu próprio ritmo de crescimento</strong> ao longo do tempo, desenhando uma curva ascendente paralela às linhas de referência, sem quedas repentinas de canal.
            </p>
          </div>
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
            Tem certeza que deseja apagar este registro de crescimento? Esta ação não pode ser desfeita.
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
              onClick={confirmDeleteGrowth}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

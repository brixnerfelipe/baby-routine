import { useState, useEffect } from 'react'
import { Moon, Sun, LogOut, Users, Copy, Check, Baby, Edit, AlertTriangle } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { useBabyAge } from '../../hooks/useBabyAge'
import { supabase } from '../../lib/supabase'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { baby, signOut, setBaby, deleteAccount } = useAuth()
  const age = useBabyAge(baby?.birth_date ?? null)
  
  const [showProfile, setShowProfile] = useState(false)
  const [copied, setCopied] = useState(false)
  const [careTeam, setCareTeam] = useState<any[]>([])

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBirthDate, setEditBirthDate] = useState('')
  const [editGender, setEditGender] = useState<'male' | 'female' | null>(null)
  const [updating, setUpdating] = useState(false)

  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (baby) {
      setEditName(baby.name)
      setEditBirthDate(baby.birth_date ? baby.birth_date.slice(0, 10) : '')
      setEditGender(baby.gender)
    }
  }, [baby, showProfile])

  useEffect(() => {
    if (showProfile && baby) {
      supabase.from('care_team').select('*').eq('baby_id', baby.id)
        .then(({ data }) => {
          if (data) setCareTeam(data)
        })
    }
  }, [showProfile, baby])

  const handleCopyCode = async () => {
    if (!baby?.invite_code) return
    await navigator.clipboard.writeText(baby.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUpdateBaby = async () => {
    if (!baby || !editName.trim() || !editBirthDate) return
    setUpdating(true)
    try {
      const { data, error } = await supabase.from('babies').update({
        name: editName.trim(),
        birth_date: editBirthDate,
        gender: editGender
      }).eq('id', baby.id).select().single()

      if (error) throw error
      if (data) {
        setBaby(data)
      }
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating baby profile:', err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-baby-100 dark:bg-baby-900 rounded-full text-baby-600 dark:text-baby-300">
            <Baby size={24} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-heading text-lg font-extrabold text-[var(--text-primary)] m-0 leading-tight">
              {baby?.name ?? 'Meu Bebê'}
            </h1>
            {age && (
              <span className="text-xs text-[var(--text-secondary)] font-medium">{age.label}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--text-secondary)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] transition-colors"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Ativar modo noturno' : 'Ativar modo claro'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button
            className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--text-secondary)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] transition-colors"
            onClick={() => setShowProfile(true)}
            aria-label="Rede de apoio"
          >
            <Users size={20} />
          </button>
        </div>
      </header>

      <Modal
        isOpen={showProfile}
        onClose={() => {
          setShowProfile(false)
          setShowDeleteConfirm(false)
          setDeleteConfirmText('')
        }}
        title="Perfil e Rede de Apoio"
      >
        <div className="flex flex-col gap-6">
          {isEditing ? (
            <div className="flex flex-col gap-4 p-5 bg-[var(--bg-base)] rounded-2xl">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Nome do bebê</label>
                <input
                  type="text"
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-baby-500"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Data de Nascimento</label>
                <input
                  type="date"
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-baby-500"
                  value={editBirthDate}
                  onChange={e => setEditBirthDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Sexo</label>
                <div className="flex gap-3 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-color)]">
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editGender === 'male' ? 'bg-baby-100 text-baby-600 dark:bg-baby-900 shadow-sm' : 'text-[var(--text-secondary)] opacity-70'}`}
                    onClick={() => setEditGender('male')}
                  >
                    Menino
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editGender === 'female' ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30 shadow-sm' : 'text-[var(--text-secondary)] opacity-70'}`}
                    onClick={() => setEditGender('female')}
                  >
                    Menina
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={updating}
                  onClick={handleUpdateBaby}
                  disabled={!editName.trim() || !editBirthDate}
                >
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-2 p-6 bg-[var(--bg-base)] rounded-2xl relative">
              <button
                className="absolute top-4 right-4 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-baby-50 dark:hover:bg-baby-900/30 text-[var(--text-secondary)] rounded-xl transition-colors"
                onClick={() => setIsEditing(true)}
                title="Editar Perfil"
              >
                <Edit size={16} />
              </button>
              <div className="p-4 bg-baby-100 dark:bg-baby-900 rounded-full text-baby-600 dark:text-baby-300 mb-2">
                <Baby size={40} strokeWidth={1.5} />
              </div>
              <h3 className="font-heading text-xl font-extrabold text-[var(--text-primary)] m-0">{baby?.name}</h3>
              <p className="text-sm text-[var(--text-secondary)] m-0">Nascimento: {baby?.birth_date ? new Date(baby.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}</p>
            </div>
          )}

          <div className="flex flex-col items-center text-center bg-baby-50 dark:bg-baby-900/50 p-6 rounded-2xl border border-baby-100 dark:border-baby-800">
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">Código de Convite</p>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Compartilhe com a família para ajudar na rotina</p>
            <div className="flex items-center gap-3 bg-[var(--bg-card)] px-5 py-3 rounded-xl border border-[var(--border-color)]">
              <span className="font-heading text-xl font-extrabold tracking-widest text-[var(--color-primary)]">{baby?.invite_code}</span>
              <button 
                className="text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-base)] p-2 rounded-lg transition-colors" 
                onClick={handleCopyCode}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">Rede de Apoio Atual</p>
            <div className="flex flex-col gap-2">
              {careTeam.map(member => (
                <div key={member.id} className="flex items-center p-3 bg-[var(--bg-base)] rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{member.display_name}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{member.role === 'owner' ? 'Criador(a)' : 'Cuidador(a)'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showDeleteConfirm ? (
            <div className="flex flex-col gap-3 mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                <AlertTriangle size={18} />
                <span>Excluir Conta Permanentemente</span>
              </div>
              <p className="text-xs text-red-800 dark:text-red-300">
                Esta ação apagará <b>permanentemente</b> sua conta e todos os dados criados por você. Digite <strong className="select-none">EXCLUIR</strong> abaixo para confirmar.
              </p>
              <input
                type="text"
                className="bg-white dark:bg-black/20 border border-red-300 dark:border-red-800 rounded-lg px-3 py-2 text-sm font-bold text-red-900 dark:text-red-100 outline-none focus:border-red-500 uppercase placeholder:text-red-300 dark:placeholder:text-red-900"
                placeholder="EXCLUIR"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value.toUpperCase())}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={isDeleting}
                  disabled={deleteConfirmText !== 'EXCLUIR'}
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await deleteAccount();
                      setShowProfile(false);
                    } catch (e) {
                      setIsDeleting(false);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white border-none shadow-red-500/20"
                >
                  Confirmar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              <Button
                variant="secondary"
                fullWidth
                icon={<LogOut size={18} />}
                onClick={() => { setShowProfile(false); signOut(); }}
              >
                Sair da conta
              </Button>
              
              <button
                className="text-xs font-bold text-red-500 hover:text-red-600 py-2 mt-2 transition-colors"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Excluir minha conta
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

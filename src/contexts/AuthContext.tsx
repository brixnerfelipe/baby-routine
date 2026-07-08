import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Baby {
  id: string
  name: string
  birth_date: string
  gender: 'male' | 'female' | null
  photo_url: string | null
  created_by: string
  invite_code: string
}

interface AuthContextType {
  session: Session | null
  user: User | null
  baby: Baby | null
  setBaby: (baby: Baby | null) => void
  loading: boolean
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  baby: null,
  setBaby: () => {},
  loading: true,
  signOut: async () => {},
  deleteAccount: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [baby, setBaby] = useState<Baby | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchBaby(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchBaby(session.user.id)
      } else {
        setBaby(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchBaby = async (userId: string) => {
    try {
      // First check if user owns a baby
      const { data: ownedBaby, error: ownedError } = await supabase
        .from('babies')
        .select('*')
        .eq('created_by', userId)
        .maybeSingle()

      if (ownedBaby) {
        setBaby(ownedBaby)
        setLoading(false)
        return
      }

      // Check if user is part of a care team
      const { data: careTeam, error: careTeamError } = await supabase
        .from('care_team')
        .select('babies(*)')
        .eq('user_id', userId)
        .maybeSingle()

      if (careTeam?.babies) {
        setBaby(careTeam.babies as unknown as Baby)
      }
    } catch {
      // No baby found — will redirect to onboarding
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setBaby(null)
  }

  const deleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_current_user')
      if (error) throw error
      await supabase.auth.signOut()
      setBaby(null)
    } catch (err) {
      console.error('Error deleting account:', err)
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, baby, setBaby, loading, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

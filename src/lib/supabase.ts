import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      babies: {
        Row: {
          id: string
          name: string
          birth_date: string
          gender: 'male' | 'female' | null
          photo_url: string | null
          created_by: string
          created_at: string
          invite_code: string
        }
        Insert: Omit<Database['public']['Tables']['babies']['Row'], 'id' | 'created_at' | 'invite_code'>
        Update: Partial<Database['public']['Tables']['babies']['Insert']>
      }
      care_team: {
        Row: {
          id: string
          baby_id: string
          user_id: string
          role: 'owner' | 'caregiver'
          display_name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['care_team']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['care_team']['Insert']>
      }
      feeding_sessions: {
        Row: {
          id: string
          baby_id: string
          side: 'left' | 'right' | 'bottle'
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          volume_ml: number | null
          notes: string | null
          logged_by: string
          logged_by_name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['feeding_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['feeding_sessions']['Insert']>
      }
      sleep_sessions: {
        Row: {
          id: string
          baby_id: string
          slept_at: string
          woke_at: string | null
          duration_seconds: number | null
          quality: 'short' | 'ideal' | 'long' | null
          logged_by: string
          logged_by_name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sleep_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sleep_sessions']['Insert']>
      }
      diaper_changes: {
        Row: {
          id: string
          baby_id: string
          type: 'pee' | 'poop'
          poop_color: string | null
          poop_consistency: string | null
          changed_at: string
          logged_by: string
          logged_by_name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['diaper_changes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['diaper_changes']['Insert']>
      }
      pumping_sessions: {
        Row: {
          id: string
          baby_id: string
          volume_ml: number
          side: 'left' | 'right' | 'both'
          pumped_at: string
          logged_by: string
          logged_by_name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['pumping_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['pumping_sessions']['Insert']>
      }
      growth_records: {
        Row: {
          id: string
          baby_id: string
          recorded_at: string
          weight_kg: number | null
          height_cm: number | null
          head_circumference_cm: number | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['growth_records']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['growth_records']['Insert']>
      }
      vaccine_records: {
        Row: {
          id: string
          baby_id: string
          vaccine_key: string
          administered_at: string
          lot_number: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['vaccine_records']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['vaccine_records']['Insert']>
      }
    }
  }
}

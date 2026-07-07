-- ============================================================
-- Baby Routine App — Supabase Database Schema
-- Run this in your Supabase project SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: babies
-- ============================================================
CREATE TABLE IF NOT EXISTS public.babies (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  birth_date    DATE NOT NULL,
  gender        TEXT CHECK (gender IN ('male', 'female')),
  photo_url     TEXT,
  created_by    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code   TEXT NOT NULL UNIQUE DEFAULT substring(md5(random()::text), 1, 6),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: care_team
-- ============================================================
CREATE TABLE IF NOT EXISTS public.care_team (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id       UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('owner', 'caregiver')),
  display_name  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(baby_id, user_id)
);

-- ============================================================
-- TABLE: feeding_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feeding_sessions (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id          UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  side             TEXT NOT NULL CHECK (side IN ('left', 'right', 'bottle')),
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,
  duration_seconds INTEGER,
  volume_ml        INTEGER,
  notes            TEXT,
  logged_by        UUID NOT NULL REFERENCES auth.users(id),
  logged_by_name   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: sleep_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sleep_sessions (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id          UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  slept_at         TIMESTAMPTZ NOT NULL,
  woke_at          TIMESTAMPTZ,
  duration_seconds INTEGER,
  quality          TEXT CHECK (quality IN ('short', 'ideal', 'long')),
  logged_by        UUID NOT NULL REFERENCES auth.users(id),
  logged_by_name   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: diaper_changes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.diaper_changes (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id              UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  type                 TEXT NOT NULL CHECK (type IN ('pee', 'poop')),
  poop_color           TEXT CHECK (poop_color IN ('yellow', 'green', 'brown', 'red', 'white', 'black')),
  poop_consistency     TEXT CHECK (poop_consistency IN ('liquid', 'paste', 'hard')),
  changed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logged_by            UUID NOT NULL REFERENCES auth.users(id),
  logged_by_name       TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: pumping_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pumping_sessions (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id         UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  volume_ml       INTEGER NOT NULL CHECK (volume_ml > 0),
  side            TEXT NOT NULL CHECK (side IN ('left', 'right', 'both')),
  pumped_at       TIMESTAMPTZ NOT NULL,
  logged_by       UUID NOT NULL REFERENCES auth.users(id),
  logged_by_name  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: growth_records
-- ============================================================
CREATE TABLE IF NOT EXISTS public.growth_records (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id               UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  recorded_at           DATE NOT NULL,
  weight_kg             DECIMAL(5,3),
  height_cm             DECIMAL(5,1),
  head_circumference_cm DECIMAL(5,1),
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: vaccine_records
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vaccine_records (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id         UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  vaccine_key     TEXT NOT NULL,
  administered_at DATE NOT NULL,
  lot_number      TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(baby_id, vaccine_key)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.babies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_team       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaper_changes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pumping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_records ENABLE ROW LEVEL SECURITY;

-- Helper logic via subqueries (safer than SECURITY DEFINER for RLS)

-- Babies: users can see and create their own babies + babies they're in care_team for
CREATE POLICY "babies_insert" ON public.babies
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "babies_select" ON public.babies
  FOR SELECT TO authenticated USING (
    created_by = auth.uid() OR
    id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())
  );

CREATE POLICY "babies_update" ON public.babies
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- Care team: members can see their team
CREATE POLICY "care_team_select" ON public.care_team
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "care_team_insert" ON public.care_team
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- All feature tables use the same pattern
CREATE POLICY "feeding_all" ON public.feeding_sessions FOR ALL TO authenticated
  USING (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())))
  WITH CHECK (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())));

CREATE POLICY "sleep_all" ON public.sleep_sessions FOR ALL TO authenticated
  USING (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())))
  WITH CHECK (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())));

CREATE POLICY "diaper_all" ON public.diaper_changes FOR ALL TO authenticated
  USING (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())))
  WITH CHECK (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())));

CREATE POLICY "pumping_all" ON public.pumping_sessions FOR ALL TO authenticated
  USING (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())))
  WITH CHECK (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())));

CREATE POLICY "growth_all" ON public.growth_records FOR ALL TO authenticated
  USING (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())))
  WITH CHECK (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())));

CREATE POLICY "vaccine_all" ON public.vaccine_records FOR ALL TO authenticated
  USING (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())))
  WITH CHECK (baby_id IN (SELECT id FROM public.babies WHERE created_by = auth.uid() OR id IN (SELECT baby_id FROM public.care_team WHERE user_id = auth.uid())));

-- ============================================================
-- RPC: Join baby by code
-- ============================================================
CREATE OR REPLACE FUNCTION public.join_baby_by_code(invite_code_param TEXT)
RETURNS json AS $$
DECLARE
  found_baby public.babies;
BEGIN
  SELECT * INTO found_baby FROM public.babies WHERE invite_code = invite_code_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Código inválido';
  END IF;

  INSERT INTO public.care_team (baby_id, user_id, role, display_name)
  VALUES (
    found_baby.id, 
    auth.uid(), 
    'caregiver', 
    COALESCE(split_part(current_setting('request.jwt.claims', true)::json->>'email', '@', 1), 'Cuidador')
  )
  ON CONFLICT (baby_id, user_id) DO NOTHING;

  RETURN row_to_json(found_baby);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- REALTIME: Enable realtime on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.feeding_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sleep_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diaper_changes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pumping_sessions;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_feeding_baby_started ON public.feeding_sessions(baby_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_baby_slept ON public.sleep_sessions(baby_id, slept_at DESC);
CREATE INDEX IF NOT EXISTS idx_diaper_baby_changed ON public.diaper_changes(baby_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_pumping_baby_pumped ON public.pumping_sessions(baby_id, pumped_at DESC);
CREATE INDEX IF NOT EXISTS idx_growth_baby_recorded ON public.growth_records(baby_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_vaccine_baby ON public.vaccine_records(baby_id);
CREATE INDEX IF NOT EXISTS idx_care_team_user ON public.care_team(user_id);
CREATE INDEX IF NOT EXISTS idx_babies_invite_code ON public.babies(invite_code);

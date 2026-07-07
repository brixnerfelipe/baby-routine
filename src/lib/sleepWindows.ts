/**
 * Sleep Window Logic — Janelas de sono ideais por faixa etária
 * Baseado em evidências de desenvolvimento infantil e sono
 */

export interface SleepWindow {
  minMinutes: number
  maxMinutes: number
  wakingWindowMinutes: number // tempo acordado ideal antes de dormir
  label: string
  tip: string
}

export function getSleepWindowByAgeWeeks(ageWeeks: number): SleepWindow {
  if (ageWeeks < 4) {
    return {
      minMinutes: 45,
      maxMinutes: 90,
      wakingWindowMinutes: 45,
      label: '45 a 90 minutos',
      tip: 'Recém-nascidos dormem muito! A janela de sono é curta — fique de olho nos primeiros sinais de cansaço.',
    }
  }
  if (ageWeeks < 8) {
    return {
      minMinutes: 60,
      maxMinutes: 90,
      wakingWindowMinutes: 60,
      label: '1 a 1,5 hora',
      tip: 'Com 4-8 semanas, o bebê consegue ficar acordado um pouco mais. Observe o bocejar e esfregar os olhos.',
    }
  }
  if (ageWeeks < 12) {
    return {
      minMinutes: 75,
      maxMinutes: 120,
      wakingWindowMinutes: 75,
      label: '1,5 a 2 horas',
      tip: 'Por volta dos 2-3 meses, o bebê começa a ter um ritmo mais previsível. A janela de vigília aumenta gradualmente.',
    }
  }
  if (ageWeeks < 20) {
    return {
      minMinutes: 90,
      maxMinutes: 120,
      wakingWindowMinutes: 90,
      label: '1,5 a 2 horas',
      tip: 'Fase de desenvolvimento acelerado! O bebê pode ter dias mais agitados — é normal, são os saltos de desenvolvimento.',
    }
  }
  if (ageWeeks < 28) {
    return {
      minMinutes: 120,
      maxMinutes: 150,
      wakingWindowMinutes: 120,
      label: '2 a 2,5 horas',
      tip: 'Com 5-7 meses, o bebê está mais ativo e a janela de sono aumenta. Sonecas podem começar a se consolidar.',
    }
  }
  if (ageWeeks < 36) {
    return {
      minMinutes: 150,
      maxMinutes: 180,
      wakingWindowMinutes: 150,
      label: '2,5 a 3 horas',
      tip: 'Por volta dos 7-9 meses, muitos bebês transitam de 3 para 2 sonecas por dia.',
    }
  }
  if (ageWeeks < 52) {
    return {
      minMinutes: 180,
      maxMinutes: 210,
      wakingWindowMinutes: 180,
      label: '3 a 3,5 horas',
      tip: 'Com 9-12 meses, o bebê já tem um ritmo mais estabelecido. A janela antes da soneca da tarde pode ser um pouco maior.',
    }
  }
  return {
    minMinutes: 240,
    maxMinutes: 300,
    wakingWindowMinutes: 240,
    label: '4 a 5 horas',
    tip: 'Após 1 ano, a maioria das crianças dorme apenas 1 soneca por dia, com janelas de vigília maiores.',
  }
}

export function evaluateSleepQuality(
  durationSeconds: number,
  ageWeeks: number
): { quality: 'short' | 'ideal' | 'long'; label: string; emoji: string; color: string } {
  const durationMinutes = durationSeconds / 60
  const window = getSleepWindowByAgeWeeks(ageWeeks)

  if (durationMinutes < window.minMinutes * 0.75) {
    return {
      quality: 'short',
      label: 'Soneca curta',
      emoji: '⚡',
      color: 'var(--color-warning)',
    }
  }
  if (durationMinutes <= window.maxMinutes * 1.2) {
    return {
      quality: 'ideal',
      label: 'Soneca ideal',
      emoji: '✨',
      color: 'var(--color-success)',
    }
  }
  return {
    quality: 'long',
    label: 'Soneca longa',
    emoji: '😴',
    color: 'var(--color-info)',
  }
}

export function formatSleepDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}min`
  if (m > 0) return `${m}min ${s}s`
  return `${s}s`
}

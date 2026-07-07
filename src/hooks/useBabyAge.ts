import { useMemo } from 'react'

export interface BabyAge {
  totalDays: number
  totalWeeks: number
  totalMonths: number
  months: number
  days: number
  label: string
  labelShort: string
}

export function useBabyAge(birthDate: string | null): BabyAge | null {
  return useMemo(() => {
    if (!birthDate) return null

    const birth = new Date(birthDate)
    const now = new Date()
    const diffMs = now.getTime() - birth.getTime()

    if (diffMs < 0) return null

    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const totalWeeks = Math.floor(totalDays / 7)
    const totalMonths = Math.floor(totalDays / 30.437)

    const months = Math.floor(totalDays / 30.437)
    const remainingDays = totalDays - Math.floor(months * 30.437)

    let label = ''
    let labelShort = ''

    if (totalDays < 7) {
      label = `${totalDays} ${totalDays === 1 ? 'dia' : 'dias'} de vida`
      labelShort = `${totalDays}d`
    } else if (totalDays < 30) {
      const w = Math.floor(totalDays / 7)
      const d = totalDays % 7
      const dPart = d > 0 ? ` e ${d} ${d === 1 ? 'dia' : 'dias'}` : ''
      label = `${w} ${w === 1 ? 'semana' : 'semanas'}${dPart} de vida`
      labelShort = d > 0 ? `${w}sem ${d}d` : `${w}sem`
    } else if (months < 12) {
      const w = Math.floor(remainingDays / 7)
      const d = remainingDays % 7
      
      const parts = []
      parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`)
      if (w > 0) parts.push(`${w} ${w === 1 ? 'sem' : 'semanas'}`)
      if (d > 0) parts.push(`${d} ${d === 1 ? 'dia' : 'dias'}`)
      
      if (parts.length === 1) label = parts[0]
      else if (parts.length === 2) label = `${parts[0]} e ${parts[1]}`
      else label = `${parts[0]}, ${parts[1]} e ${parts[2]}`

      let short = `${months}m`
      if (w > 0) short += ` ${w}sem`
      if (d > 0) short += ` ${d}d`
      labelShort = short
    } else {
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      const monthsPart = remainingMonths > 0 ? ` e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}` : ''
      label = `${years} ${years === 1 ? 'ano' : 'anos'}${monthsPart}`
      labelShort = `${years}a ${remainingMonths}m`
    }

    return { totalDays, totalWeeks, totalMonths, months, days: remainingDays, label, labelShort }
  }, [birthDate])
}

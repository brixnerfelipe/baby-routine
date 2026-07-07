/**
 * Vaccine schedule for Brazil (SUS + SBP guidelines)
 * Updated: 2024
 */

export interface Vaccine {
  key: string
  name: string
  fullName: string
  protects: string
  ageLabel: string
  ageMonths: number
  doses: number
  doseNumber: number
  notes?: string
}

export const VACCINE_SCHEDULE: Vaccine[] = [
  // Ao nascer
  {
    key: 'hepb_1',
    name: 'Hepatite B',
    fullName: 'Vacina contra Hepatite B (1ª dose)',
    protects: 'Hepatite B (doença hepática grave causada pelo vírus HBV)',
    ageLabel: 'Ao nascer',
    ageMonths: 0,
    doses: 3,
    doseNumber: 1,
    notes: 'Aplicada nas primeiras 12 horas de vida',
  },
  {
    key: 'bcg',
    name: 'BCG',
    fullName: 'BCG (Bacilo Calmette-Guérin)',
    protects: 'Formas graves de tuberculose (meningite e miliar)',
    ageLabel: 'Ao nascer',
    ageMonths: 0,
    doses: 1,
    doseNumber: 1,
    notes: 'Dose única, aplicada ao nascer',
  },
  // 1 mês
  {
    key: 'hepb_2',
    name: 'Hepatite B',
    fullName: 'Vacina contra Hepatite B (2ª dose)',
    protects: 'Hepatite B',
    ageLabel: '1 mês',
    ageMonths: 1,
    doses: 3,
    doseNumber: 2,
  },
  // 2 meses
  {
    key: 'penta_1',
    name: 'Penta (DTP+Hib+HepB)',
    fullName: 'Vacina Pentavalente (1ª dose)',
    protects: 'Difteria, Tétano, Coqueluche, Meningite por Haemophilus e Hepatite B',
    ageLabel: '2 meses',
    ageMonths: 2,
    doses: 3,
    doseNumber: 1,
  },
  {
    key: 'vip_1',
    name: 'VIP (Poliomielite)',
    fullName: 'Vacina Inativada Poliomielite (1ª dose)',
    protects: 'Poliomielite (paralisia infantil)',
    ageLabel: '2 meses',
    ageMonths: 2,
    doses: 4,
    doseNumber: 1,
  },
  {
    key: 'pneumo10_1',
    name: 'Pneumocócica 10V',
    fullName: 'Vacina Pneumocócica 10-valente (1ª dose)',
    protects: 'Pneumonia, meningite e otite causadas pelo pneumococo',
    ageLabel: '2 meses',
    ageMonths: 2,
    doses: 3,
    doseNumber: 1,
  },
  {
    key: 'rota_1',
    name: 'Rotavírus',
    fullName: 'Vacina contra Rotavírus Humano (1ª dose)',
    protects: 'Diarreia grave por rotavírus',
    ageLabel: '2 meses',
    ageMonths: 2,
    doses: 2,
    doseNumber: 1,
    notes: 'Administrada por via oral',
  },
  // 3 meses
  {
    key: 'meningo_c_1',
    name: 'Meningocócica C',
    fullName: 'Vacina Meningocócica C conjugada (1ª dose)',
    protects: 'Meningite meningocócica por sorogrupo C',
    ageLabel: '3 meses',
    ageMonths: 3,
    doses: 3,
    doseNumber: 1,
  },
  // 4 meses
  {
    key: 'penta_2',
    name: 'Penta (DTP+Hib+HepB)',
    fullName: 'Vacina Pentavalente (2ª dose)',
    protects: 'Difteria, Tétano, Coqueluche, Meningite por Haemophilus e Hepatite B',
    ageLabel: '4 meses',
    ageMonths: 4,
    doses: 3,
    doseNumber: 2,
  },
  {
    key: 'vip_2',
    name: 'VIP (Poliomielite)',
    fullName: 'Vacina Inativada Poliomielite (2ª dose)',
    protects: 'Poliomielite (paralisia infantil)',
    ageLabel: '4 meses',
    ageMonths: 4,
    doses: 4,
    doseNumber: 2,
  },
  {
    key: 'pneumo10_2',
    name: 'Pneumocócica 10V',
    fullName: 'Vacina Pneumocócica 10-valente (2ª dose)',
    protects: 'Pneumonia, meningite e otite causadas pelo pneumococo',
    ageLabel: '4 meses',
    ageMonths: 4,
    doses: 3,
    doseNumber: 2,
  },
  {
    key: 'rota_2',
    name: 'Rotavírus',
    fullName: 'Vacina contra Rotavírus Humano (2ª dose)',
    protects: 'Diarreia grave por rotavírus',
    ageLabel: '4 meses',
    ageMonths: 4,
    doses: 2,
    doseNumber: 2,
    notes: 'Administrada por via oral',
  },
  // 5 meses
  {
    key: 'meningo_c_2',
    name: 'Meningocócica C',
    fullName: 'Vacina Meningocócica C conjugada (2ª dose)',
    protects: 'Meningite meningocócica por sorogrupo C',
    ageLabel: '5 meses',
    ageMonths: 5,
    doses: 3,
    doseNumber: 2,
  },
  // 6 meses
  {
    key: 'penta_3',
    name: 'Penta (DTP+Hib+HepB)',
    fullName: 'Vacina Pentavalente (3ª dose)',
    protects: 'Difteria, Tétano, Coqueluche, Meningite por Haemophilus e Hepatite B',
    ageLabel: '6 meses',
    ageMonths: 6,
    doses: 3,
    doseNumber: 3,
  },
  {
    key: 'vip_3',
    name: 'VIP (Poliomielite)',
    fullName: 'Vacina Inativada Poliomielite (3ª dose)',
    protects: 'Poliomielite (paralisia infantil)',
    ageLabel: '6 meses',
    ageMonths: 6,
    doses: 4,
    doseNumber: 3,
  },
  {
    key: 'pneumo10_3',
    name: 'Pneumocócica 10V',
    fullName: 'Vacina Pneumocócica 10-valente (3ª dose — reforço)',
    protects: 'Pneumonia, meningite e otite causadas pelo pneumococo',
    ageLabel: '6 meses',
    ageMonths: 6,
    doses: 3,
    doseNumber: 3,
  },
  {
    key: 'influenza_1',
    name: 'Influenza',
    fullName: 'Vacina contra Influenza (gripe) — 1ª dose',
    protects: 'Gripe sazonal (influenza)',
    ageLabel: '6 meses',
    ageMonths: 6,
    doses: 2,
    doseNumber: 1,
    notes: 'Para bebês de 6 a 35 meses: 2 doses com intervalo de 30 dias. Após isso, 1 dose anual.',
  },
  // 9 meses
  {
    key: 'meningo_c_3',
    name: 'Meningocócica C',
    fullName: 'Vacina Meningocócica C conjugada (3ª dose)',
    protects: 'Meningite meningocócica por sorogrupo C',
    ageLabel: '9 meses',
    ageMonths: 9,
    doses: 3,
    doseNumber: 3,
  },
  {
    key: 'febre_amarela',
    name: 'Febre Amarela',
    fullName: 'Vacina contra Febre Amarela',
    protects: 'Febre amarela (doença viral transmitida por mosquitos)',
    ageLabel: '9 meses',
    ageMonths: 9,
    doses: 2,
    doseNumber: 1,
    notes: 'Para crianças residentes em áreas de risco ou que viajam para essas áreas',
  },
  // 12 meses
  {
    key: 'triplice_viral_1',
    name: 'Tríplice Viral',
    fullName: 'Vacina Tríplice Viral — SCR (1ª dose)',
    protects: 'Sarampo, Caxumba e Rubéola',
    ageLabel: '12 meses',
    ageMonths: 12,
    doses: 2,
    doseNumber: 1,
  },
  {
    key: 'meningo_acwy',
    name: 'Meningocócica ACWY',
    fullName: 'Vacina Meningocócica Quadrivalente ACWY',
    protects: 'Meningite meningocócica pelos sorogrupos A, C, W e Y',
    ageLabel: '12 meses',
    ageMonths: 12,
    doses: 1,
    doseNumber: 1,
  },
  {
    key: 'varicela_1',
    name: 'Varicela',
    fullName: 'Vacina contra Varicela (catapora) — 1ª dose',
    protects: 'Catapora (varicela) e suas complicações',
    ageLabel: '12 meses',
    ageMonths: 12,
    doses: 2,
    doseNumber: 1,
  },
  {
    key: 'hepatitea',
    name: 'Hepatite A',
    fullName: 'Vacina contra Hepatite A (dose única)',
    protects: 'Hepatite A (doença hepática transmitida pela água e alimentos)',
    ageLabel: '12 meses',
    ageMonths: 12,
    doses: 1,
    doseNumber: 1,
  },
  // 15 meses
  {
    key: 'dtp_reforco1',
    name: 'DTP (1º reforço)',
    fullName: 'Vacina DTP — Difteria, Tétano e Pertussis (1º reforço)',
    protects: 'Difteria, Tétano e Coqueluche',
    ageLabel: '15 meses',
    ageMonths: 15,
    doses: 2,
    doseNumber: 1,
  },
  {
    key: 'vop_1',
    name: 'VOP (Gotinha)',
    fullName: 'Vacina Oral Poliomielite — gotinha (1º reforço)',
    protects: 'Poliomielite (paralisia infantil)',
    ageLabel: '15 meses',
    ageMonths: 15,
    doses: 2,
    doseNumber: 1,
    notes: 'Administrada por via oral (gotinha)',
  },
  {
    key: 'triplice_viral_2',
    name: 'Tríplice Viral',
    fullName: 'Vacina Tríplice Viral — SCR (2ª dose)',
    protects: 'Sarampo, Caxumba e Rubéola',
    ageLabel: '15 meses',
    ageMonths: 15,
    doses: 2,
    doseNumber: 2,
  },
  {
    key: 'varicela_2',
    name: 'Varicela',
    fullName: 'Vacina contra Varicela (catapora) — 2ª dose',
    protects: 'Catapora (varicela) e suas complicações',
    ageLabel: '15 meses',
    ageMonths: 15,
    doses: 2,
    doseNumber: 2,
  },
]

export const VACCINE_AGE_GROUPS = [
  { label: 'Ao nascer', ageMonths: 0 },
  { label: '1 mês', ageMonths: 1 },
  { label: '2 meses', ageMonths: 2 },
  { label: '3 meses', ageMonths: 3 },
  { label: '4 meses', ageMonths: 4 },
  { label: '5 meses', ageMonths: 5 },
  { label: '6 meses', ageMonths: 6 },
  { label: '9 meses', ageMonths: 9 },
  { label: '12 meses', ageMonths: 12 },
  { label: '15 meses', ageMonths: 15 },
]

export function getUpcomingVaccines(babyAgeMonths: number, administeredKeys: string[]): Vaccine[] {
  return VACCINE_SCHEDULE.filter(
    v => v.ageMonths > babyAgeMonths && v.ageMonths <= babyAgeMonths + 2 && !administeredKeys.includes(v.key)
  )
}

/**
 * WHO Growth Chart Percentile Data
 * Source: World Health Organization Child Growth Standards
 * https://www.who.int/childgrowth/standards/
 *
 * Values represent weight (kg) for boys and girls at key percentiles
 * by age in months (0-24)
 */

export interface PercentilePoint {
  age: number // months
  p3: number
  p15: number
  p50: number
  p85: number
  p97: number
}

// WHO Weight-for-age: BOYS (kg)
export const WHO_WEIGHT_BOYS: PercentilePoint[] = [
  { age: 0,  p3: 2.5,  p15: 2.9,  p50: 3.3,  p85: 3.9,  p97: 4.4  },
  { age: 1,  p3: 3.4,  p15: 3.9,  p50: 4.5,  p85: 5.1,  p97: 5.7  },
  { age: 2,  p3: 4.4,  p15: 4.9,  p50: 5.6,  p85: 6.3,  p97: 7.1  },
  { age: 3,  p3: 5.1,  p15: 5.6,  p50: 6.4,  p85: 7.2,  p97: 8.0  },
  { age: 4,  p3: 5.6,  p15: 6.2,  p50: 7.0,  p85: 7.9,  p97: 8.7  },
  { age: 5,  p3: 6.1,  p15: 6.7,  p50: 7.5,  p85: 8.4,  p97: 9.3  },
  { age: 6,  p3: 6.4,  p15: 7.1,  p50: 7.9,  p85: 8.8,  p97: 9.7  },
  { age: 7,  p3: 6.7,  p15: 7.4,  p50: 8.3,  p85: 9.2,  p97: 10.2 },
  { age: 8,  p3: 6.9,  p15: 7.7,  p50: 8.6,  p85: 9.6,  p97: 10.5 },
  { age: 9,  p3: 7.1,  p15: 7.9,  p50: 8.9,  p85: 9.9,  p97: 10.9 },
  { age: 10, p3: 7.4,  p15: 8.2,  p50: 9.2,  p85: 10.2, p97: 11.2 },
  { age: 11, p3: 7.6,  p15: 8.4,  p50: 9.4,  p85: 10.5, p97: 11.5 },
  { age: 12, p3: 7.7,  p15: 8.6,  p50: 9.6,  p85: 10.8, p97: 11.8 },
  { age: 15, p3: 8.3,  p15: 9.2,  p50: 10.3, p85: 11.5, p97: 12.6 },
  { age: 18, p3: 8.8,  p15: 9.8,  p50: 10.9, p85: 12.2, p97: 13.3 },
  { age: 21, p3: 9.2,  p15: 10.2, p50: 11.5, p85: 12.8, p97: 14.0 },
  { age: 24, p3: 9.7,  p15: 10.8, p50: 12.0, p85: 13.5, p97: 14.8 },
]

// WHO Weight-for-age: GIRLS (kg)
export const WHO_WEIGHT_GIRLS: PercentilePoint[] = [
  { age: 0,  p3: 2.4,  p15: 2.8,  p50: 3.2,  p85: 3.7,  p97: 4.2  },
  { age: 1,  p3: 3.2,  p15: 3.6,  p50: 4.2,  p85: 4.8,  p97: 5.5  },
  { age: 2,  p3: 4.0,  p15: 4.5,  p50: 5.1,  p85: 5.9,  p97: 6.6  },
  { age: 3,  p3: 4.6,  p15: 5.2,  p50: 5.8,  p85: 6.7,  p97: 7.5  },
  { age: 4,  p3: 5.1,  p15: 5.7,  p50: 6.4,  p85: 7.3,  p97: 8.2  },
  { age: 5,  p3: 5.5,  p15: 6.1,  p50: 6.9,  p85: 7.8,  p97: 8.8  },
  { age: 6,  p3: 5.8,  p15: 6.5,  p50: 7.3,  p85: 8.2,  p97: 9.3  },
  { age: 7,  p3: 6.1,  p15: 6.8,  p50: 7.6,  p85: 8.6,  p97: 9.7  },
  { age: 8,  p3: 6.3,  p15: 7.0,  p50: 7.9,  p85: 9.0,  p97: 10.1 },
  { age: 9,  p3: 6.6,  p15: 7.3,  p50: 8.2,  p85: 9.3,  p97: 10.5 },
  { age: 10, p3: 6.8,  p15: 7.5,  p50: 8.5,  p85: 9.6,  p97: 10.9 },
  { age: 11, p3: 7.0,  p15: 7.8,  p50: 8.7,  p85: 9.9,  p97: 11.2 },
  { age: 12, p3: 7.1,  p15: 7.9,  p50: 8.9,  p85: 10.1, p97: 11.5 },
  { age: 15, p3: 7.6,  p15: 8.5,  p50: 9.6,  p85: 10.9, p97: 12.4 },
  { age: 18, p3: 8.1,  p15: 9.1,  p50: 10.2, p85: 11.7, p97: 13.2 },
  { age: 21, p3: 8.6,  p15: 9.6,  p50: 10.9, p85: 12.5, p97: 14.1 },
  { age: 24, p3: 9.0,  p15: 10.0, p50: 11.5, p85: 13.2, p97: 14.9 },
]

// WHO Height-for-age: BOYS (cm)
export const WHO_HEIGHT_BOYS: PercentilePoint[] = [
  { age: 0,  p3: 46.1, p15: 47.9, p50: 49.9, p85: 51.8, p97: 53.4 },
  { age: 1,  p3: 50.8, p15: 52.8, p50: 54.7, p85: 56.7, p97: 58.5 },
  { age: 2,  p3: 54.4, p15: 56.4, p50: 58.4, p85: 60.4, p97: 62.2 },
  { age: 3,  p3: 57.3, p15: 59.4, p50: 61.4, p85: 63.5, p97: 65.5 },
  { age: 4,  p3: 59.7, p15: 61.8, p50: 63.9, p85: 66.0, p97: 68.0 },
  { age: 5,  p3: 61.7, p15: 63.8, p50: 65.9, p85: 68.0, p97: 70.1 },
  { age: 6,  p3: 63.3, p15: 65.5, p50: 67.6, p85: 69.8, p97: 71.9 },
  { age: 7,  p3: 64.8, p15: 67.0, p50: 69.2, p85: 71.3, p97: 73.5 },
  { age: 8,  p3: 66.2, p15: 68.4, p50: 70.6, p85: 72.8, p97: 75.0 },
  { age: 9,  p3: 67.5, p15: 69.7, p50: 72.0, p85: 74.2, p97: 76.5 },
  { age: 10, p3: 68.7, p15: 71.0, p50: 73.3, p85: 75.6, p97: 77.9 },
  { age: 11, p3: 69.9, p15: 72.2, p50: 74.5, p85: 76.9, p97: 79.2 },
  { age: 12, p3: 71.0, p15: 73.4, p50: 75.7, p85: 78.1, p97: 80.5 },
  { age: 15, p3: 74.0, p15: 76.5, p50: 79.1, p85: 81.7, p97: 84.2 },
  { age: 18, p3: 76.9, p15: 79.6, p50: 82.3, p85: 85.1, p97: 87.7 },
  { age: 21, p3: 79.4, p15: 82.3, p50: 85.1, p85: 88.1, p97: 90.9 },
  { age: 24, p3: 81.7, p15: 84.8, p50: 87.8, p85: 90.9, p97: 93.9 },
]

// WHO Height-for-age: GIRLS (cm)
export const WHO_HEIGHT_GIRLS: PercentilePoint[] = [
  { age: 0,  p3: 45.6, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.7 },
  { age: 1,  p3: 49.8, p15: 51.7, p50: 53.7, p85: 55.6, p97: 57.4 },
  { age: 2,  p3: 53.0, p15: 55.0, p50: 57.1, p85: 59.1, p97: 61.1 },
  { age: 3,  p3: 55.6, p15: 57.7, p50: 59.8, p85: 62.0, p97: 64.0 },
  { age: 4,  p3: 57.8, p15: 59.9, p50: 62.1, p85: 64.3, p97: 66.4 },
  { age: 5,  p3: 59.6, p15: 61.8, p50: 64.0, p85: 66.2, p97: 68.5 },
  { age: 6,  p3: 61.2, p15: 63.5, p50: 65.7, p85: 68.0, p97: 70.3 },
  { age: 7,  p3: 62.7, p15: 65.0, p50: 67.3, p85: 69.6, p97: 72.0 },
  { age: 8,  p3: 64.1, p15: 66.4, p50: 68.7, p85: 71.2, p97: 73.5 },
  { age: 9,  p3: 65.3, p15: 67.7, p50: 70.1, p85: 72.6, p97: 75.0 },
  { age: 10, p3: 66.5, p15: 68.9, p50: 71.5, p85: 74.0, p97: 76.5 },
  { age: 11, p3: 67.7, p15: 70.2, p50: 72.8, p85: 75.3, p97: 77.8 },
  { age: 12, p3: 68.9, p15: 71.4, p50: 74.0, p85: 76.6, p97: 79.2 },
  { age: 15, p3: 72.0, p15: 74.7, p50: 77.5, p85: 80.3, p97: 83.0 },
  { age: 18, p3: 74.9, p15: 77.8, p50: 80.7, p85: 83.7, p97: 86.5 },
  { age: 21, p3: 77.5, p15: 80.5, p50: 83.7, p85: 86.8, p97: 89.8 },
  { age: 24, p3: 80.0, p15: 83.2, p50: 86.4, p85: 89.8, p97: 93.0 },
]

export function getPercentileLabel(value: number, data: PercentilePoint[], ageMonths: number, field: keyof Omit<PercentilePoint, 'age'>): string {
  const point = data.reduce((prev, curr) =>
    Math.abs(curr.age - ageMonths) < Math.abs(prev.age - ageMonths) ? curr : prev
  )
  if (value < point.p3) return 'Abaixo do P3'
  if (value < point.p15) return 'P3 - P15'
  if (value < point.p50) return 'P15 - P50'
  if (value < point.p85) return 'P50 - P85'
  if (value < point.p97) return 'P85 - P97'
  return 'Acima do P97'
}

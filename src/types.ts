export interface StatItem {
  id: string
  label: string
  value: number
}

export const MIN_VALUE = 1
export const MAX_VALUE = 10
export const DEFAULT_VALUE = 5
export const MIN_AXES = 3
export const MAX_AXES = 12

export const MIN_CHART_SIZE = 500
export const DEFAULT_CHART_SIZE = 550

export const DEFAULT_STATS: StatItem[] = [
  { id: 'stat-a', label: 'stat a', value: 5 },
  { id: 'stat-b', label: 'stat b', value: 5 },
  { id: 'stat-c', label: 'stat c', value: 5 },
]

export const SHAPE_NAMES: Record<number, string> = {
  3: 'Equilateral Triangle',
  4: 'Square',
  5: 'Pentagon',
  6: 'Hexagon',
  7: 'Heptagon',
  8: 'Octagon',
  9: 'Nonagon',
  10: 'Decagon',
  11: 'Hendecagon',
  12: 'Dodecagon',
}

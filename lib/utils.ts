import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 500) + 1
}

export function getTopicLabel(topic: string): string {
  const labels: Record<string, string> = {
    planimetriya: 'Planimetriya',
    uchburchaklar: 'Uchburchaklar',
    tortburchaklar: "To'rtburchaklar",
    doiralar: 'Doiralar',
    koppurchaklar: "Ko'pburchaklar",
    stereometriya: 'Stereometriya',
    koordinatalar: 'Koordinatalar',
  }
  return labels[topic] || topic
}

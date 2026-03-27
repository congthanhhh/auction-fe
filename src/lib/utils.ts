import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"

dayjs.extend(duration)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to calculate remaining time between now and a given end time
// Returns short human-readable format: "Xd Yh", "Xh Ym" or "Xm"
export function calculateTimeRemaining(endTime: string): string {
  const now = dayjs()
  const end = dayjs(endTime)
  const diffMs = end.diff(now)

  if (diffMs <= 0) return "Ended"

  const timeDuration = dayjs.duration(diffMs)
  const days = Math.floor(timeDuration.asDays())
  const hours = timeDuration.hours()
  const minutes = timeDuration.minutes()

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Shared number & currency formatting helpers
const numberFormatter = new Intl.NumberFormat('vi-VN')

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export function formatNumber(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0'
  return numberFormatter.format(value)
}

export function formatCurrency(amount?: number | null): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '0 ₫'
  return currencyFormatter.format(amount)
}

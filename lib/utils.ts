import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number, currency = 'RON') {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export function formatHours(value: number) {
  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('ro-RO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

export function monthLabel(date = new Date()) {
  return new Intl.DateTimeFormat('ro-RO', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function getMonthOptions(count = 12) {
  const base = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(base.getFullYear(), base.getMonth() - index, 1)
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: monthLabel(date),
    }
  })
}

export function isEntryInMonth(workDate: string, monthValue: string) {
  return workDate.startsWith(monthValue)
}

export function statusLabel(status: 'active' | 'paused' | 'closed') {
  switch (status) {
    case 'active':
      return 'activ'
    case 'paused':
      return 'pauză'
    case 'closed':
      return 'închis'
    default:
      return status
  }
}

/**
 * Display formatters for the YouTube Brand Campaign module.
 * Fixtures/API keep raw numeric + currency fields (release-plan-09 §8.2);
 * these helpers turn them into display strings at the view layer only.
 */

type CurrencyAmount = number | string | null | undefined

function numericAmount(value: CurrencyAmount): number | null {
  if (value === null || value === undefined || value === '') return null
  const amount = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(amount) ? amount : null
}

export function formatNumber(value: CurrencyAmount): string {
  const amount = numericAmount(value)
  if (amount === null) return '—'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(amount)
}

export function formatCurrency(value: CurrencyAmount, currency = 'IDR'): string {
  const amount = numericAmount(value)
  if (amount === null) return '—'

  const code = currency.toUpperCase()
  let maximumFractionDigits = 2
  try {
    maximumFractionDigits = new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits
  } catch {
    // Keep the displayed ISO code and use a safe decimal precision for unknown codes.
  }
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(amount)
  return `${code} ${formatted}`
}

export function formatCurrencyRange(min: CurrencyAmount, max: CurrencyAmount, currency: string): string {
  return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`
}

export function formatCompactNumber(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

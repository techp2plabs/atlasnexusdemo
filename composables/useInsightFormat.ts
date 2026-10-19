export function useInsightFormat() {
  const fmtNumber = (n: number | null | undefined): string =>
    n == null ? 'Not available' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

  const fmtPercent = (n: number | null | undefined): string =>
    n == null ? 'Not available' : `${n.toFixed(2)}%`

  const fmtText = (s: string | null | undefined): string => (s == null || s === '' ? 'Not available' : s)

  return { fmtNumber, fmtPercent, fmtText }
}

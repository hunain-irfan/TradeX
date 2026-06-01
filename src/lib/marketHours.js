/**
 * Returns true if US stock market is open (9:30 AM – 4:00 PM EST, Mon–Fri).
 * Used before starting any Finnhub polling.
 */
export function isMarketOpen() {
  const now = new Date()

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })

  const parts = formatter.formatToParts(now)
  const weekday = parts.find((p) => p.type === 'weekday')?.value
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10)
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10)

  if (weekday === 'Sat' || weekday === 'Sun') {
    return false
  }

  const totalMinutes = hour * 60 + minute
  const marketOpen = 9 * 60 + 30 // 9:30 AM
  const marketClose = 16 * 60 // 4:00 PM

  return totalMinutes >= marketOpen && totalMinutes < marketClose
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { getQuote } from '../lib/finnhub'
import { isMarketOpen } from '../lib/marketHours'

export function useFinnhub(symbols = [], intervalMs = 30000) {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const symbolsRef = useRef(symbols)

  symbolsRef.current = symbols

  const poll = useCallback(async () => {
    const syms = symbolsRef.current.filter(Boolean)
    if (syms.length === 0) {
      setLoading(false)
      return
    }

    if (!isMarketOpen()) {
      setLoading(false)
      return
    }

    try {
      const results = await Promise.all(
        syms.map(async (symbol) => {
          const quote = await getQuote(symbol)
          return [symbol, quote]
        }),
      )
      setPrices((prev) => ({
        ...prev,
        ...Object.fromEntries(results),
      }))
      setError(null)
    } catch (err) {
      setError(err.message ?? 'Failed to fetch quotes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!symbols.length) {
      setLoading(false)
      return
    }

    setLoading(true)
    poll()

    if (!isMarketOpen()) {
      return
    }

    const id = setInterval(poll, intervalMs)
    return () => clearInterval(id)
  }, [symbols.join(','), intervalMs, poll])

  return { prices, loading, error }
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { getQuotes } from '../lib/finnhub'
import { isMarketOpen } from '../lib/marketHours'

export function useFinnhub(symbols = [], intervalMs = 60000) {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const symbolsRef = useRef(symbols)
  const hasPricesRef = useRef(false)

  symbolsRef.current = symbols

  const poll = useCallback(async (isRefresh = false) => {
    const syms = symbolsRef.current.filter(Boolean)
    if (syms.length === 0) {
      setLoading(false)
      setRefreshing(false)
      return
    }

    if (isRefresh) setRefreshing(true)
    else if (!hasPricesRef.current) setLoading(true)

    try {
      await getQuotes(syms, {
        onSymbol: (symbol, quote) => {
          hasPricesRef.current = true
          setPrices((prev) => ({ ...prev, [symbol]: quote }))
          setLoading(false)
        },
      })
      setError(null)
    } catch (err) {
      setError(err.message ?? 'Failed to fetch quotes')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!symbols.length) {
      setLoading(false)
      return undefined
    }

    hasPricesRef.current = false
    poll(false)

    if (!isMarketOpen()) {
      return undefined
    }

    const id = setInterval(() => poll(true), intervalMs)
    return () => clearInterval(id)
  }, [symbols.join(','), intervalMs, poll])

  return { prices, loading, refreshing, error }
}

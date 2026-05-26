import { useState, useEffect, useRef } from 'react'
import { getQuotes, applyTradeToQuote } from '../lib/finnhub'

const WS_URL = 'wss://ws.finnhub.io'
const API_KEY = import.meta.env.VITE_FINNHUB_KEY
const MAX_SYMBOLS = 50
/** Batch WebSocket ticks so stat cards do not flicker every trade */
const WS_UI_THROTTLE_MS = 2000

export function useFinnhubSocket(symbols = []) {
  const [prices, setPrices] = useState({})
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const wsRef = useRef(null)
  const symbolsRef = useRef(symbols)
  const pendingTicksRef = useRef({})
  const flushTimerRef = useRef(null)

  symbolsRef.current = symbols.slice(0, MAX_SYMBOLS).filter(Boolean)

  // Seed quotes via REST (progressive) — then WebSocket keeps prices live
  useEffect(() => {
    const syms = symbolsRef.current
    if (syms.length === 0) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    ;(async () => {
      await getQuotes(syms, {
        onSymbol: (symbol, quote) => {
          if (cancelled) return
          setPrices((prev) => ({ ...prev, [symbol]: { ...prev[symbol], ...quote } }))
          setLoading(false)
        },
      })
      if (!cancelled) setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [symbols.slice(0, MAX_SYMBOLS).join(',')])

  useEffect(() => {
    const syms = symbolsRef.current
    if (syms.length === 0) return

    const ws = new WebSocket(`${WS_URL}?token=${API_KEY}`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      syms.forEach((symbol) => {
        ws.send(JSON.stringify({ type: 'subscribe', symbol }))
      })
    }

    const flushTicks = () => {
      flushTimerRef.current = null
      const batch = pendingTicksRef.current
      pendingTicksRef.current = {}
      if (Object.keys(batch).length === 0) return

      setPrices((prev) => {
        const next = { ...prev }
        Object.entries(batch).forEach(([sym, price]) => {
          next[sym] = applyTradeToQuote(next[sym], price)
        })
        return next
      })
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'trade' && Array.isArray(msg.data)) {
          msg.data.forEach((trade) => {
            if (trade.s != null && trade.p != null) {
              pendingTicksRef.current[trade.s] = trade.p
            }
          })
          if (!flushTimerRef.current) {
            flushTimerRef.current = setTimeout(flushTicks, WS_UI_THROTTLE_MS)
          }
        }
      } catch {
        // ignore malformed messages
      }
    }

    ws.onerror = () => setConnected(false)
    ws.onclose = () => setConnected(false)

    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current)
        flushTimerRef.current = null
      }
      pendingTicksRef.current = {}
      if (ws.readyState === WebSocket.OPEN) {
        syms.forEach((symbol) => {
          ws.send(JSON.stringify({ type: 'unsubscribe', symbol }))
        })
      }
      ws.close()
      wsRef.current = null
      setConnected(false)
    }
  }, [symbols.slice(0, MAX_SYMBOLS).join(',')])

  return { prices, connected, loading }
}

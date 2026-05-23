import { useState, useEffect, useRef } from 'react'

const WS_URL = 'wss://ws.finnhub.io'
const API_KEY = import.meta.env.VITE_FINNHUB_KEY
const MAX_SYMBOLS = 50

export function useFinnhubSocket(symbols = []) {
  const [prices, setPrices] = useState({})
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const symbolsRef = useRef(symbols)

  symbolsRef.current = symbols.slice(0, MAX_SYMBOLS).filter(Boolean)

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

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'trade' && Array.isArray(msg.data)) {
          setPrices((prev) => {
            const next = { ...prev }
            msg.data.forEach((trade) => {
              if (trade.s != null && trade.p != null) {
                next[trade.s] = { ...next[trade.s], c: trade.p, p: trade.p, s: trade.s }
              }
            })
            return next
          })
        }
      } catch {
        // ignore malformed messages
      }
    }

    ws.onerror = () => setConnected(false)
    ws.onclose = () => setConnected(false)

    return () => {
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

  return { prices, connected }
}

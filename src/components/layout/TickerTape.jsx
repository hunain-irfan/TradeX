import { useEffect, useRef } from 'react'
import { STOCK_LIST, toTradingViewSymbol } from '../../data/stocks'
import { mountTradingViewWidget } from '../../lib/tradingviewEmbed'

const TICKER_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'

/** App stocks only — no indices, forex, or commodities */
const TAPE_SYMBOLS = STOCK_LIST.map((s) => ({
  proName: toTradingViewSymbol(s.symbol),
  title: s.symbol,
}))

const CONFIG = {
  symbols: TAPE_SYMBOLS,
  showSymbolLogo: true,
  colorTheme: 'dark',
  isTransparent: true,
  displayMode: 'adaptive',
  locale: 'en',
}

export default function TickerTape() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cleanup = () => {}
    let cancelled = false

    const frameId = requestAnimationFrame(() => {
      if (cancelled) return
      cleanup = mountTradingViewWidget(container, TICKER_SCRIPT, CONFIG)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      cleanup()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container ticker-tape-container w-full border-b border-[#1A1A1A]"
    />
  )
}

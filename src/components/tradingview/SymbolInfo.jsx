import { useEffect, useRef } from 'react'
import { mountTradingViewWidget } from '../../lib/tradingviewEmbed'

const SYMBOL_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js'

export default function SymbolInfo({ symbol }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !symbol) return

    let cleanup = () => {}
    let cancelled = false

    const config = {
      symbol,
      colorTheme: 'dark',
      locale: 'en',
      width: '100%',
    }

    const frameId = requestAnimationFrame(() => {
      if (cancelled) return
      cleanup = mountTradingViewWidget(container, SYMBOL_SCRIPT, config)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      cleanup()
    }
  }, [symbol])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full"
      style={{ minHeight: '200px' }}
    />
  )
}

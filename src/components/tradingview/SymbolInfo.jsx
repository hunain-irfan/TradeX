import { useEffect, useRef } from 'react'
import { mountTradingViewWidget, toTradingViewSymbol } from '../../lib/tradingviewEmbed'

const SYMBOL_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js'

export default function SymbolInfo({ symbol, height = 185 }) {
  const containerRef = useRef(null)
  const tvSymbol = toTradingViewSymbol(symbol)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !tvSymbol) return

    let cleanup = () => {}
    let cancelled = false

    const config = {
      symbol: tvSymbol,
      colorTheme: 'dark',
      isTransparent: true,
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
  }, [tvSymbol])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container tv-hide-copyright tv-symbol-info-compact w-full"
      style={{ '--symbol-info-h': `${height}px` }}
    />
  )
}

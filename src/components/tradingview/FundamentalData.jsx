import { useEffect, useRef } from 'react'
import { mountTradingViewWidget, toTradingViewSymbol } from '../../lib/tradingviewEmbed'

const FINANCIALS_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-financials.js'

export default function FundamentalData({ symbol, height = 360 }) {
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
      largeChartUrl: '',
      displayMode: 'regular',
      width: '100%',
      height: '100%',
      locale: 'en',
    }

    const frameId = requestAnimationFrame(() => {
      if (cancelled) return
      cleanup = mountTradingViewWidget(container, FINANCIALS_SCRIPT, config)
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
      className="tradingview-widget-container tv-hide-copyright w-full"
      style={{ height: `${height}px`, minHeight: `${height}px` }}
    />
  )
}

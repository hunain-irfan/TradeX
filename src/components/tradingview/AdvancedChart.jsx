import { useEffect, useRef } from 'react'
import { mountTradingViewWidget, toTradingViewSymbol } from '../../lib/tradingviewEmbed'

const CHART_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'

export default function AdvancedChart({ symbol, height = 620 }) {
  const containerRef = useRef(null)
  const tvSymbol = toTradingViewSymbol(symbol)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !tvSymbol) return

    let cleanup = () => {}
    let cancelled = false

    const config = {
      autosize: true,
      symbol: tvSymbol,
      interval: 'D',
      timezone: 'America/New_York',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      backgroundColor: '#111111',
      gridColor: 'rgba(42, 46, 57, 0.6)',
      support_host: 'https://www.tradingview.com',
    }

    const frameId = requestAnimationFrame(() => {
      if (cancelled) return
      cleanup = mountTradingViewWidget(container, CHART_SCRIPT, config)
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
      className="tradingview-widget-container tv-hide-copyright custom-chart w-full"
      style={{ height: `${height}px`, minHeight: `${height}px` }}
    />
  )
}

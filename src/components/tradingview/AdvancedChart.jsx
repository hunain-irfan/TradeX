import { useEffect, useRef } from 'react'
import { mountTradingViewWidget } from '../../lib/tradingviewEmbed'

const CHART_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'

export default function AdvancedChart({ symbol, height = 500 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !symbol) return

    let cleanup = () => {}
    let cancelled = false

    const config = {
      autosize: true,
      symbol,
      interval: 'D',
      timezone: 'America/New_York',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: false,
      hide_side_toolbar: false,
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
  }, [symbol])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container custom-chart w-full"
      style={{ height: `${height}px` }}
    />
  )
}

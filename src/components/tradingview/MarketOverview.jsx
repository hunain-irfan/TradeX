import { useEffect, useRef } from 'react'
import { mountTradingViewWidget } from '../../lib/tradingviewEmbed'

const OVERVIEW_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'

const CONFIG = {
  colorTheme: 'dark',
  dateRange: '12M',
  showChart: true,
  locale: 'en',
  width: '100%',
  height: '400',
  largeChartUrl: '',
  isTransparent: true,
  showSymbolLogo: true,
  showFloatingTooltip: true,
  gridLineColor: 'rgba(255,255,255,0.05)',
  tabs: [
    {
      title: 'Overview',
      symbols: [
        { s: 'SP:SPX', d: 'S&P 500' },
        { s: 'DJ:DJI', d: 'Dow 30' },
        { s: 'NASDAQ:COMP', d: 'Nasdaq' },
        { s: 'RUSSELL:RUT', d: 'Russell 2000' },
      ],
    },
  ],
}

export default function MarketOverview() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cleanup = () => {}
    let cancelled = false

    const frameId = requestAnimationFrame(() => {
      if (cancelled) return
      cleanup = mountTradingViewWidget(container, OVERVIEW_SCRIPT, CONFIG)
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
      className="tradingview-widget-container w-full"
      style={{ height: '400px' }}
    />
  )
}

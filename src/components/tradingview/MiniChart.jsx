import { useEffect, useRef, useState } from 'react'
import { mountTradingViewWidget, toTradingViewSymbol } from '../../lib/tradingviewEmbed'

/** TradingView "Mini Chart" — symbol, price, change %, sparkline (see widget docs). */
const MINI_CHART_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'

export default function MiniChart({ symbol, height = 220, dateRange = '1D' }) {
  const rootRef = useRef(null)
  const widgetRef = useRef(null)
  const [active, setActive] = useState(false)
  const tvSymbol = toTradingViewSymbol(symbol)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' },
    )

    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = widgetRef.current
    if (!active || !container || !tvSymbol) return

    let cleanup = () => {}
    let cancelled = false

    const config = {
      symbol: tvSymbol,
      width: '100%',
      height: '100%',
      locale: 'en',
      dateRange,
      colorTheme: 'dark',
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
      chartOnly: false,
      noTimeScale: true,
    }

    const frameId = requestAnimationFrame(() => {
      if (cancelled) return
      cleanup = mountTradingViewWidget(container, MINI_CHART_SCRIPT, config)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      cleanup()
    }
  }, [active, tvSymbol, symbol, dateRange])

  return (
    <div
      ref={rootRef}
      className="w-full"
      style={{ '--mini-chart-h': `${height}px` }}
    >
      {!active && (
        <div
          className="tv-mini-chart-skeleton rounded-md bg-[#161616]"
          style={{ height }}
          aria-hidden
        />
      )}
      <div
        ref={widgetRef}
        className={`tradingview-widget-container tv-hide-copyright tv-mini-chart w-full ${
          active ? '' : 'hidden'
        }`}
      />
    </div>
  )
}

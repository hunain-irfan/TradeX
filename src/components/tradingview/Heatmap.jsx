import { useEffect, useRef } from 'react'
import { mountTradingViewWidget } from '../../lib/tradingviewEmbed'

const HEATMAP_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js'

const CONFIG = {
  dataSource: 'SPX500',
  grouping: 'sector',
  blockSize: 'market_cap_basic',
  blockColor: 'change',
  colorTheme: 'dark',
  locale: 'en',
  symbolUrl: '',
  hasTopBar: true,
  isDataSetEnabled: false,
  isZoomEnabled: true,
  hasSymbolTooltip: true,
  width: '100%',
  height: '300',
  isTransparent: true,
  gridLineColor: 'rgba(255,255,255,0.05)',
}

export default function Heatmap() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cleanup = () => {}
    let cancelled = false

    const frameId = requestAnimationFrame(() => {
      if (cancelled) return
      cleanup = mountTradingViewWidget(container, HEATMAP_SCRIPT, CONFIG)
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
      style={{ height: '300px' }}
    />
  )
}

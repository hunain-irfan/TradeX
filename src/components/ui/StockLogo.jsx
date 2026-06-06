import { useEffect, useMemo, useState } from 'react'
import {
  getLogoCacheStatus,
  getStockLogoCandidates,
  isSvgLogoUrl,
  setLogoCacheStatus,
  stockLogoInitials,
} from '../../lib/stockLogo'

function getDisplayDpr() {
  if (typeof window === 'undefined') return 1
  return Math.min(window.devicePixelRatio || 1, 2)
}

export default function StockLogo({ symbol, size = 48, className = '' }) {
  const sym = symbol?.trim().toUpperCase() ?? ''
  const candidates = useMemo(() => getStockLogoCandidates(sym), [sym])
  const cachedOk = getLogoCacheStatus(sym) === true
  const [urlIndex, setUrlIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(cachedOk)
  const [dpr, setDpr] = useState(getDisplayDpr)

  const renderSize = useMemo(() => Math.round(size * dpr), [size, dpr])

  useEffect(() => {
    setDpr(getDisplayDpr())
  }, [])

  useEffect(() => {
    setUrlIndex(0)
    setFailed(false)
    setLoaded(getLogoCacheStatus(sym) === true)
  }, [sym])

  const url = failed ? '' : candidates[urlIndex] ?? ''
  const px = `${size}px`
  const showImg = Boolean(url && !failed)
  const isSvg = isSvgLogoUrl(url)

  const handleError = () => {
    if (urlIndex + 1 < candidates.length) {
      setUrlIndex((i) => i + 1)
      setLoaded(false)
      return
    }
    setFailed(true)
    setLoaded(false)
  }

  const handleLoad = () => {
    setLogoCacheStatus(sym, true)
    setLoaded(true)
  }

  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden bg-[#141414] border border-gray-600/80 flex items-center justify-center ${className}`}
      style={{ width: px, height: px, minWidth: px, minHeight: px }}
    >
      {showImg ? (
        <img
          src={url}
          alt=""
          width={renderSize}
          height={renderSize}
          loading="lazy"
          decoding="sync"
          className={`stock-logo-img block h-full w-full ${
            isSvg ? 'object-contain p-0.5' : 'object-cover object-center'
          } ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ maxWidth: px, maxHeight: px }}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <span
          className="w-full text-center font-mono font-bold text-gray-400 select-none leading-none"
          style={{ fontSize: Math.max(10, size * 0.34) }}
        >
          {stockLogoInitials(sym)}
        </span>
      )}
    </div>
  )
}

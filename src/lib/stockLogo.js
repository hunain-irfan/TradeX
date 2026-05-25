const FINNHUB_LOGO_BASE =
  'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo'

const CACHE_KEY = 'tradex_stock_logos_v1'

/** @type {Map<string, boolean> | null} */
let memoryCache = null

function loadCache() {
  if (memoryCache) return memoryCache
  memoryCache = new Map()
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      Object.entries(parsed).forEach(([sym, ok]) => {
        memoryCache.set(sym, Boolean(ok))
      })
    }
  } catch {
    /* ignore corrupt cache */
  }
  return memoryCache
}

function persistCache() {
  if (!memoryCache) return
  try {
    const obj = Object.fromEntries(memoryCache.entries())
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj))
  } catch {
    /* quota / private mode */
  }
}

/** Finnhub CDN — symbol in path, no API key. */
export function getStockLogoUrl(symbol, variant = 0) {
  const sym = symbol?.trim().toUpperCase()
  if (!sym) return ''

  if (variant === 0) {
    return `${FINNHUB_LOGO_BASE}/${encodeURIComponent(sym)}.png`
  }
  if (variant === 1 && sym.includes('.')) {
    return `${FINNHUB_LOGO_BASE}/${encodeURIComponent(sym.replace(/\./g, '-'))}.png`
  }
  if (variant === 2 && sym.includes('.')) {
    return `${FINNHUB_LOGO_BASE}/${encodeURIComponent(sym.replace(/\./g, ''))}.png`
  }
  return ''
}

/** @returns {boolean | undefined} true = loaded before, false = known missing */
export function getLogoCacheStatus(symbol) {
  return loadCache().get(symbol?.trim().toUpperCase())
}

export function setLogoCacheStatus(symbol, hasLogo) {
  const sym = symbol?.trim().toUpperCase()
  if (!sym) return
  loadCache().set(sym, hasLogo)
  persistCache()
}

/** Warm cache for a list (e.g. full STOCK_LIST once per session). */
export function preloadStockLogos(symbols) {
  const list = [...new Set(symbols.map((s) => s?.trim().toUpperCase()).filter(Boolean))]
  list.forEach((symbol) => {
    if (getLogoCacheStatus(symbol) !== undefined) return

    const tryVariant = (variant) => {
      const url = getStockLogoUrl(symbol, variant)
      if (!url) {
        if (variant < 2 && symbol.includes('.')) tryVariant(variant + 1)
        else setLogoCacheStatus(symbol, false)
        return
      }

      const img = new Image()
      img.onload = () => setLogoCacheStatus(symbol, true)
      img.onerror = () => {
        if (variant < 2 && symbol.includes('.')) tryVariant(variant + 1)
        else setLogoCacheStatus(symbol, false)
      }
      img.src = url
    }

    tryVariant(0)
  })
}

export function stockLogoInitials(symbol) {
  const sym = symbol?.trim().toUpperCase() ?? ''
  if (sym.length <= 2) return sym
  return sym.slice(0, 2)
}

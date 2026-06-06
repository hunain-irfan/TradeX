import { STOCK_LIST } from '../data/stocks'

const FINNHUB_LOGO_BASE =
  'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo'

const TRADINGVIEW_LOGO_BASE = 'https://s3-symbol-logo.tradingview.com'

/** v2 — only positive hits are persisted (v1 stored false negatives permanently). */
const CACHE_KEY = 'tradex_stock_logos_v2'

/** Legacy Finnhub tickers (e.g. META was FB) — circular PNG, no SVG square background. */
const FINNHUB_LOGO_ALIASES = {
  META: 'FB',
}

/** TradingView slugs when Finnhub is missing or ticker ≠ slug. */
const TRADINGVIEW_LOGO_SLUGS = {
  GOOGL: 'alphabet',
  GOOG: 'alphabet',
  'BRK.B': 'berkshire-hathaway',
  JNJ: 'johnson-and-johnson',
  PG: 'procter-and-gamble',
  LLY: 'eli-lilly',
  UNH: 'unitedhealth',
  COST: 'costco',
  HD: 'home-depot',
  MA: 'mastercard',
  AVGO: 'broadcom',
}

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
        if (ok) memoryCache.set(sym, true)
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
    const obj = Object.fromEntries([...memoryCache.entries()].filter(([, ok]) => ok))
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj))
  } catch {
    /* quota / private mode */
  }
}

function nameToSlug(name) {
  return name
    .replace(/\./g, '')
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .toLowerCase()
    .split(/[\s,/]+/)
    .filter(Boolean)
    .join('-')
}

function getTradingViewSlugs(symbol) {
  const sym = symbol?.trim().toUpperCase()
  const slugs = []

  if (TRADINGVIEW_LOGO_SLUGS[sym]) slugs.push(TRADINGVIEW_LOGO_SLUGS[sym])

  const stock = STOCK_LIST.find((s) => s.symbol === sym)
  if (stock?.name) {
    const parts = stock.name
      .replace(/\./g, '')
      .replace(/&/g, 'and')
      .replace(/'/g, '')
      .trim()
      .split(/[\s,/]+/)
      .filter(Boolean)

    if (parts[0]) slugs.push(parts[0].toLowerCase())
    if (parts.length >= 2) {
      slugs.push(`${parts[0].toLowerCase()}-${parts[1].toLowerCase()}`)
    }
    slugs.push(nameToSlug(stock.name))
  }

  return [...new Set(slugs.filter(Boolean))]
}

/** Ordered logo URLs: Finnhub PNG first, then TradingView SVG fallbacks. */
export function getStockLogoCandidates(symbol) {
  const sym = symbol?.trim().toUpperCase()
  if (!sym) return []

  const urls = [`${FINNHUB_LOGO_BASE}/${encodeURIComponent(sym)}.png`]

  const alias = FINNHUB_LOGO_ALIASES[sym]
  if (alias) {
    urls.push(`${FINNHUB_LOGO_BASE}/${encodeURIComponent(alias)}.png`)
  }

  if (sym.includes('.')) {
    urls.push(`${FINNHUB_LOGO_BASE}/${encodeURIComponent(sym.replace(/\./g, '-'))}.png`)
    urls.push(`${FINNHUB_LOGO_BASE}/${encodeURIComponent(sym.replace(/\./g, ''))}.png`)
  }

  for (const slug of getTradingViewSlugs(sym)) {
    urls.push(`${TRADINGVIEW_LOGO_BASE}/${slug}.svg`)
  }

  return [...new Set(urls)]
}

/** @param {number} variant index into getStockLogoCandidates */
export function getStockLogoUrl(symbol, variant = 0) {
  return getStockLogoCandidates(symbol)[variant] ?? ''
}

/** @returns {boolean | undefined} true when a logo loaded successfully before */
export function getLogoCacheStatus(symbol) {
  const status = loadCache().get(symbol?.trim().toUpperCase())
  return status === true ? true : undefined
}

export function setLogoCacheStatus(symbol, hasLogo) {
  const sym = symbol?.trim().toUpperCase()
  if (!sym || !hasLogo) return
  loadCache().set(sym, true)
  persistCache()
}

function loadLogoSymbol(symbol) {
  if (getLogoCacheStatus(symbol) === true) return Promise.resolve()

  const candidates = getStockLogoCandidates(symbol)

  return new Promise((resolve) => {
    const tryAt = (index) => {
      if (index >= candidates.length) {
        resolve()
        return
      }

      const img = new Image()
      img.onload = () => {
        setLogoCacheStatus(symbol, true)
        resolve()
      }
      img.onerror = () => tryAt(index + 1)
      img.src = candidates[index]
    }

    tryAt(0)
  })
}

/** Warm cache for a list (batched — avoids CDN burst failures). */
export function preloadStockLogos(symbols) {
  const list = [...new Set(symbols.map((s) => s?.trim().toUpperCase()).filter(Boolean))]
  const BATCH = 5

  ;(async () => {
    for (let i = 0; i < list.length; i += BATCH) {
      const batch = list.slice(i, i + BATCH)
      await Promise.all(batch.map((symbol) => loadLogoSymbol(symbol)))
    }
  })()
}

export function stockLogoInitials(symbol) {
  const sym = symbol?.trim().toUpperCase() ?? ''
  if (sym.length <= 2) return sym
  return sym.slice(0, 2)
}

export function isSvgLogoUrl(url) {
  return typeof url === 'string' && url.endsWith('.svg')
}

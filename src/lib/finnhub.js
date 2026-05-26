const FINNHUB_BASE = 'https://finnhub.io/api/v1'
const API_KEY = import.meta.env.VITE_FINNHUB_KEY

/** Free tier ~60 calls/min — stay under with spacing + cache */
const PRICE_TTL_MS = 60 * 1000
const QUOTE_MIN_INTERVAL_MS = 1000
const NEWS_TTL_MS = 10 * 60 * 1000

/** @type {Map<string, { data: unknown, expiresAt: number }>} */
export const priceCache = new Map()

/** @type {Map<string, { data: unknown, expiresAt: number }>} */
export const newsCache = new Map()

let quoteChain = Promise.resolve()
let lastQuoteFetchAt = 0

function getFromCache(cache, key, { allowStale = false } = {}) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() < entry.expiresAt) return entry.data
  if (allowStale) return entry.data
  cache.delete(key)
  return null
}

function setCache(cache, key, data, ttlMs) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

function getStaleQuote(symbol) {
  return getFromCache(priceCache, `quote:${symbol}`, { allowStale: true })
}

async function finnhubFetch(path, params = {}) {
  const url = new URL(`${FINNHUB_BASE}${path}`)
  url.searchParams.set('token', API_KEY)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })

  const res = await fetch(url.toString())
  if (res.status === 429) {
    const err = new Error('Finnhub rate limit (429)')
    err.status = 429
    throw err
  }
  if (!res.ok) {
    throw new Error(`Finnhub API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

function enqueueQuoteFetch(task) {
  const run = quoteChain.then(async () => {
    const wait = Math.max(0, lastQuoteFetchAt + QUOTE_MIN_INTERVAL_MS - Date.now())
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))
    lastQuoteFetchAt = Date.now()
    return task()
  })
  quoteChain = run.catch(() => {})
  return run
}

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

/** Update quote fields when a live trade tick arrives (WebSocket). */
export function applyTradeToQuote(prev = {}, tradePrice) {
  const c = Number(tradePrice)
  if (!c || Number.isNaN(c)) return prev

  const pc = Number(prev.pc ?? prev.c ?? c)
  const d = c - pc
  const dp = pc > 0 ? (d / pc) * 100 : 0

  return { ...prev, c, p: c, d, dp, pc }
}

export async function getQuote(symbol) {
  const sym = symbol?.trim().toUpperCase()
  if (!sym) throw new Error('Symbol required')

  const cacheKey = `quote:${sym}`
  const cached = getFromCache(priceCache, cacheKey)
  if (cached !== null) return cached

  return enqueueQuoteFetch(async () => {
    const fresh = getFromCache(priceCache, cacheKey)
    if (fresh !== null) return fresh

    try {
      const data = await finnhubFetch('/quote', { symbol: sym })
      setCache(priceCache, cacheKey, data, PRICE_TTL_MS)
      return data
    } catch (err) {
      const stale = getStaleQuote(sym)
      if (stale) return stale
      throw err
    }
  })
}

/**
 * Fetch quotes one-by-one (rate-limit safe).
 * Optional onSymbol — UI can update after each symbol instead of waiting for all.
 */
export async function getQuotes(symbols = [], { onSymbol } = {}) {
  const unique = [...new Set(symbols.map((s) => s?.trim().toUpperCase()).filter(Boolean))]
  const out = {}

  for (const symbol of unique) {
    let quote = null
    try {
      quote = await getQuote(symbol)
    } catch {
      quote = getStaleQuote(symbol)
    }
    if (quote) {
      out[symbol] = quote
      onSymbol?.(symbol, quote)
    }
  }

  return out
}

export async function getCandles(symbol, resolution, from, to) {
  return finnhubFetch('/stock/candle', {
    symbol,
    resolution,
    from,
    to,
  })
}

export async function getCompanyProfile(symbol) {
  return finnhubFetch('/stock/profile2', { symbol })
}

export async function getCompanyNews(symbol) {
  const cacheKey = `company-news:${symbol}`
  const cached = getFromCache(newsCache, cacheKey)
  if (cached !== null) {
    return cached
  }

  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 7)

  const data = await finnhubFetch('/company-news', {
    symbol,
    from: formatDate(from),
    to: formatDate(to),
  })
  setCache(newsCache, cacheKey, data, NEWS_TTL_MS)
  return data
}

export async function getMarketNews() {
  const cacheKey = 'market-news:general'
  const cached = getFromCache(newsCache, cacheKey)
  if (cached !== null) {
    return cached
  }

  const data = await finnhubFetch('/news', { category: 'general' })
  setCache(newsCache, cacheKey, data, NEWS_TTL_MS)
  return data
}

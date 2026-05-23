const FINNHUB_BASE = 'https://finnhub.io/api/v1'
const API_KEY = import.meta.env.VITE_FINNHUB_KEY

const PRICE_TTL_MS = 30 * 1000
const NEWS_TTL_MS = 10 * 60 * 1000

/** @type {Map<string, { data: unknown, expiresAt: number }>} */
export const priceCache = new Map()

/** @type {Map<string, { data: unknown, expiresAt: number }>} */
export const newsCache = new Map()

function getFromCache(cache, key) {
  const entry = cache.get(key)
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data
  }
  if (entry) {
    cache.delete(key)
  }
  return null
}

function setCache(cache, key, data, ttlMs) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
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
  if (!res.ok) {
    throw new Error(`Finnhub API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

export async function getQuote(symbol) {
  const cacheKey = `quote:${symbol}`
  const cached = getFromCache(priceCache, cacheKey)
  if (cached !== null) {
    return cached
  }

  const data = await finnhubFetch('/quote', { symbol })
  setCache(priceCache, cacheKey, data, PRICE_TTL_MS)
  return data
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

/** Default signup capital — must match DB wallet trigger default. */
export const DEFAULT_STARTING_CAPITAL = 10000

export function pnlToneClass(value, { zeroClass = 'text-gray-400' } = {}) {
  const n = Number(value)
  if (n > 0) return 'text-[#00C853]'
  if (n < 0) return 'text-[#FF3B30]'
  return zeroClass
}

/** Holdings table cells — beats global `td { color }` in index.css */
export function pnlTableCellClass(value) {
  const n = Number(value)
  if (n > 0) return 'td-pnl-profit'
  if (n < 0) return 'td-pnl-loss'
  return 'td-pnl-flat'
}

export function computeHoldingsMarketValue(holdings, prices = {}) {
  return holdings.reduce((sum, h) => {
    const quote = prices[h.symbol]
    const price = Number(quote?.c ?? h.currentPrice ?? h.buy_price ?? 0)
    return sum + Number(h.quantity) * price
  }, 0)
}

export function computeHoldingsCostBasis(holdings) {
  return holdings.reduce(
    (sum, h) => sum + Number(h.quantity) * Number(h.buy_price ?? 0),
    0,
  )
}

/** Cash + mark-to-market value of open positions. */
export function computeAccountValue(walletBalance, holdings, prices = {}) {
  return Number(walletBalance) + computeHoldingsMarketValue(holdings, prices)
}

export function computeUnrealizedPnl(holdings, prices = {}) {
  return computeHoldingsMarketValue(holdings, prices) - computeHoldingsCostBasis(holdings)
}

/**
 * Return % vs total capital deposited (signup + approved fund requests).
 */
export function computeTotalReturnPct(accountValue, totalDeposited) {
  const basis = Number(totalDeposited) || DEFAULT_STARTING_CAPITAL
  if (basis <= 0) return 0
  return ((Number(accountValue) - basis) / basis) * 100
}

/** Avg cost basis per share at each SELL (chronological, weighted avg). */
export function buildSellCostBasisByTxId(transactions) {
  const byId = new Map()
  const state = {}

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at),
  )

  for (const tx of sorted) {
    const sym = tx.stock_symbol
    const qty = Number(tx.quantity)
    const price = Number(tx.price)

    if (tx.action === 'BUY') {
      const s = state[sym] ?? { qty: 0, avg: 0 }
      const newQty = s.qty + qty
      s.avg = newQty > 0 ? (s.qty * s.avg + qty * price) / newQty : price
      s.qty = newQty
      state[sym] = s
    } else if (tx.action === 'SELL') {
      const avg =
        tx.buy_price != null ? Number(tx.buy_price) : (state[sym]?.avg ?? price)
      byId.set(tx.id, avg)
      const s = state[sym]
      if (s) {
        s.qty -= qty
        if (s.qty <= 0) delete state[sym]
        else state[sym] = s
      }
    }
  }

  return byId
}

export function computeRealizedPnl(tx, sellCostBasisByTxId) {
  if (tx.action !== 'SELL') return null
  const cost = sellCostBasisByTxId.get(tx.id) ?? Number(tx.price)
  return (Number(tx.price) - cost) * Number(tx.quantity)
}

/**
 * Today P&L = today's realized sells + open positions' move vs prior close (Finnhub `d`).
 */
export function computeTodayPnl(holdings, prices, transactions, now = new Date()) {
  const todayKey = now.toDateString()
  const sellCosts = buildSellCostBasisByTxId(transactions)

  const realizedToday = transactions
    .filter(
      (t) =>
        t.action === 'SELL' && new Date(t.created_at).toDateString() === todayKey,
    )
    .reduce((sum, t) => sum + (computeRealizedPnl(t, sellCosts) ?? 0), 0)

  const marketMove = holdings.reduce((sum, h) => {
    const d = Number(prices[h.symbol]?.d)
    if (Number.isNaN(d)) return sum
    return sum + Number(h.quantity) * d
  }, 0)

  return realizedToday + marketMove
}

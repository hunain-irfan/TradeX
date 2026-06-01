import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { PortfolioMap } from '../lib/dsa'
import { useAuth } from './useAuth'

function calcTotalValue(map) {
  return map.getAll().reduce((sum, h) => {
    const price = Number(h.currentPrice ?? h.buy_price ?? 0)
    const qty = Number(h.quantity ?? 0)
    return sum + price * qty
  }, 0)
}

export function usePortfolio() {
  const { user } = useAuth()
  const portfolioMapRef = useRef(new PortfolioMap())
  const [holdings, setHoldings] = useState([])
  const [totalValue, setTotalValue] = useState(0)
  const [loading, setLoading] = useState(true)

  const syncFromMap = useCallback(() => {
    const map = portfolioMapRef.current
    setHoldings(map.getAll())
    setTotalValue(calcTotalValue(map))
  }, [])

  const refresh = useCallback(async () => {
    if (!user) {
      portfolioMapRef.current = new PortfolioMap()
      setHoldings([])
      setTotalValue(0)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      const map = new PortfolioMap()
      data.forEach((row) => {
        map.set(row.stock_symbol, {
          id: row.id,
          stock_name: row.stock_name,
          quantity: row.quantity,
          buy_price: row.buy_price,
          currentPrice: row.buy_price,
          created_at: row.created_at,
        })
      })
      portfolioMapRef.current = map
      syncFromMap()
    }
    setLoading(false)
  }, [user, syncFromMap])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateLivePrices = useCallback(
    (pricesObj) => {
      const map = portfolioMapRef.current
      Object.entries(pricesObj).forEach(([symbol, quote]) => {
        const price = quote?.c ?? quote?.p ?? (typeof quote === 'number' ? quote : null)
        if (price != null) {
          map.updatePrice(symbol, price)
        }
      })
      syncFromMap()
    },
    [syncFromMap],
  )

  return {
    portfolioMap: portfolioMapRef.current,
    holdings,
    totalValue,
    loading,
    refresh,
    updateLivePrices,
  }
}

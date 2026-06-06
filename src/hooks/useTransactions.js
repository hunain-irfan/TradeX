import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { TransactionStack } from '../lib/dsa'
import { useAuth } from './useAuth'

export function useTransactions() {
  const { user } = useAuth()
  const stackRef = useRef(new TransactionStack())
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const syncFromStack = useCallback(() => {
    setTransactions([...stackRef.current.toArray()].reverse())
  }, [])

  const refresh = useCallback(async () => {
    if (!user) {
      stackRef.current = new TransactionStack()
      setTransactions([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (fetchErr) {
      setError(fetchErr.message)
    } else {
      setError(null)
      const stack = new TransactionStack()
      ;[...(data ?? [])].reverse().forEach((tx) => stack.push(tx))
      stackRef.current = stack
      syncFromStack()
    }
    setLoading(false)
  }, [user, syncFromStack])

  useEffect(() => {
    refresh()
  }, [refresh])

  const undoLast = useCallback(async () => {
    if (!user) return { error: new Error('Not authenticated') }

    const lastTx = stackRef.current.peek()
    if (!lastTx) return { error: new Error('No transactions to undo') }

    const { data: wallet, error: walletErr } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (walletErr || !wallet) {
      return { error: walletErr ?? new Error('Wallet not found') }
    }

    let newBalance = Number(wallet.balance)

    if (lastTx.action === 'BUY') {
      newBalance += Number(lastTx.total_value)

      const { data: holding, error: holdErr } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('stock_symbol', lastTx.stock_symbol)
        .maybeSingle()

      if (holdErr) return { error: holdErr }

      if (holding) {
        const txQty = Number(lastTx.quantity)
        const txPrice = Number(lastTx.price)
        const currentQty = Number(holding.quantity)
        const newQty = currentQty - txQty

        if (newQty <= 0) {
          const { error: delErr } = await supabase.from('portfolios').delete().eq('id', holding.id)
          if (delErr) return { error: delErr }
        } else {
          const restoredAvg =
            (currentQty * Number(holding.buy_price) - txQty * txPrice) / newQty
          const { error: updErr } = await supabase
            .from('portfolios')
            .update({ quantity: newQty, buy_price: restoredAvg })
            .eq('id', holding.id)
          if (updErr) return { error: updErr }
        }
      }
    } else if (lastTx.action === 'SELL') {
      newBalance -= Number(lastTx.total_value)

      const { data: holding, error: holdErr } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('stock_symbol', lastTx.stock_symbol)
        .maybeSingle()

      if (holdErr) return { error: holdErr }

      if (holding) {
        const { error: updErr } = await supabase
          .from('portfolios')
          .update({
            quantity: Number(holding.quantity) + Number(lastTx.quantity),
          })
          .eq('id', holding.id)
        if (updErr) return { error: updErr }
      } else {
        const { error: insErr } = await supabase.from('portfolios').insert({
          user_id: user.id,
          stock_symbol: lastTx.stock_symbol,
          stock_name: lastTx.stock_symbol,
          quantity: lastTx.quantity,
          buy_price: lastTx.buy_price ?? lastTx.price,
        })
        if (insErr) return { error: insErr }
      }
    }

    const { error: walletUpdateErr } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', user.id)
    if (walletUpdateErr) return { error: walletUpdateErr }

    const { error: deleteErr } = await supabase.from('transactions').delete().eq('id', lastTx.id)
    if (deleteErr) return { error: deleteErr }

    stackRef.current.pop()
    syncFromStack()

    return { error: null, undone: lastTx }
  }, [user, syncFromStack])

  return {
    stack: stackRef.current,
    transactions,
    loading,
    error,
    refresh,
    undoLast,
  }
}

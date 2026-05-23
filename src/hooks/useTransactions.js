import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { TransactionStack } from '../lib/dsa'
import { useAuth } from './useAuth'

export function useTransactions() {
  const { user } = useAuth()
  const stackRef = useRef(new TransactionStack())
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const syncFromStack = useCallback(() => {
    setTransactions([...stackRef.current.toArray()].reverse())
  }, [])

  const refresh = useCallback(async () => {
    if (!user) {
      stackRef.current = new TransactionStack()
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (!error && data) {
      const stack = new TransactionStack()
      data.forEach((tx) => stack.push(tx))
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

      const { data: holding } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('stock_symbol', lastTx.stock_symbol)
        .maybeSingle()

      if (holding) {
        const newQty = Number(holding.quantity) - Number(lastTx.quantity)
        if (newQty <= 0) {
          await supabase.from('portfolios').delete().eq('id', holding.id)
        } else {
          await supabase
            .from('portfolios')
            .update({ quantity: newQty })
            .eq('id', holding.id)
        }
      }
    } else if (lastTx.action === 'SELL') {
      newBalance -= Number(lastTx.total_value)

      const { data: holding } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('stock_symbol', lastTx.stock_symbol)
        .maybeSingle()

      if (holding) {
        await supabase
          .from('portfolios')
          .update({
            quantity: Number(holding.quantity) + Number(lastTx.quantity),
          })
          .eq('id', holding.id)
      } else {
        await supabase.from('portfolios').insert({
          user_id: user.id,
          stock_symbol: lastTx.stock_symbol,
          stock_name: lastTx.stock_symbol,
          quantity: lastTx.quantity,
          buy_price: lastTx.price,
        })
      }
    }

    await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id)
    await supabase.from('transactions').delete().eq('id', lastTx.id)

    stackRef.current.pop()
    syncFromStack()

    return { error: null, undone: lastTx }
  }, [user, syncFromStack])

  return {
    stack: stackRef.current,
    transactions,
    loading,
    refresh,
    undoLast,
  }
}

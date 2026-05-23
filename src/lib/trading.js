import { supabase } from './supabase'
import { getQuote } from './finnhub'

export async function fetchWallet(userId) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export async function executeBuy({ userId, symbol, stockName, quantity }) {
  const quote = await getQuote(symbol)
  const price = Number(quote?.c)
  if (!price || price <= 0) {
    throw new Error('Unable to fetch live price')
  }

  const qty = Number(quantity)
  if (!qty || qty <= 0) throw new Error('Invalid quantity')

  const totalValue = price * qty

  const { data: wallet, error: walletErr } = await fetchWallet(userId)
  if (walletErr || !wallet) throw new Error('Wallet not found')
  if (Number(wallet.balance) < totalValue) {
    throw new Error('Insufficient balance')
  }

  const { data: existing } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .eq('stock_symbol', symbol)
    .maybeSingle()

  if (existing) {
    const oldQty = Number(existing.quantity)
    const newQty = oldQty + qty
    const newAvg =
      (oldQty * Number(existing.buy_price) + qty * price) / newQty

    const { error: updateErr } = await supabase
      .from('portfolios')
      .update({ quantity: newQty, buy_price: newAvg, stock_name: stockName })
      .eq('id', existing.id)

    if (updateErr) throw updateErr
  } else {
    const { error: insertErr } = await supabase.from('portfolios').insert({
      user_id: userId,
      stock_symbol: symbol,
      stock_name: stockName,
      quantity: qty,
      buy_price: price,
    })
    if (insertErr) throw insertErr
  }

  const balanceAfter = Number(wallet.balance) - totalValue

  const { error: walletUpdateErr } = await supabase
    .from('wallets')
    .update({ balance: balanceAfter })
    .eq('user_id', userId)

  if (walletUpdateErr) throw walletUpdateErr

  const { error: txErr } = await supabase.from('transactions').insert({
    user_id: userId,
    stock_symbol: symbol,
    action: 'BUY',
    quantity: qty,
    price,
    total_value: totalValue,
    balance_after: balanceAfter,
  })

  if (txErr) throw txErr

  return { price, totalValue, balanceAfter }
}

export async function executeSell({ userId, symbol, stockName, quantity }) {
  const quote = await getQuote(symbol)
  const price = Number(quote?.c)
  if (!price || price <= 0) {
    throw new Error('Unable to fetch live price')
  }

  const qty = Number(quantity)
  if (!qty || qty <= 0) throw new Error('Invalid quantity')

  const { data: holding, error: holdErr } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .eq('stock_symbol', symbol)
    .maybeSingle()

  if (holdErr || !holding) throw new Error('No holdings for this symbol')
  if (Number(holding.quantity) < qty) {
    throw new Error('Insufficient shares to sell')
  }

  const totalValue = price * qty

  const { data: wallet, error: walletErr } = await fetchWallet(userId)
  if (walletErr || !wallet) throw new Error('Wallet not found')

  const newQty = Number(holding.quantity) - qty
  if (newQty <= 0) {
    await supabase.from('portfolios').delete().eq('id', holding.id)
  } else {
    await supabase
      .from('portfolios')
      .update({ quantity: newQty, stock_name: stockName || holding.stock_name })
      .eq('id', holding.id)
  }

  const balanceAfter = Number(wallet.balance) + totalValue

  await supabase.from('wallets').update({ balance: balanceAfter }).eq('user_id', userId)

  const { error: txErr } = await supabase.from('transactions').insert({
    user_id: userId,
    stock_symbol: symbol,
    action: 'SELL',
    quantity: qty,
    price,
    total_value: totalValue,
    balance_after: balanceAfter,
  })

  if (txErr) throw txErr

  return { price, totalValue, balanceAfter }
}

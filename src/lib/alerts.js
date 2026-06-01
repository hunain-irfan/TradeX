import { supabase } from './supabase'
import { buildPriceAlertEmail } from './alertEmailTemplate'

export const ALERT_CONDITIONS = [
  { value: 'ABOVE', label: 'Above' },
  { value: 'BELOW', label: 'Low' },
]

export const ALERT_FREQUENCIES = [
  { value: 'once', label: 'Once' },
  { value: 'once_per_day', label: 'Once per day' },
  { value: 'always', label: 'Every time' },
]

export async function fetchAlerts(userId) {
  return supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function createAlert({
  userId,
  alertName,
  stockSymbol,
  stockName,
  condition,
  targetPrice,
  alertType = 'price',
  frequency = 'once_per_day',
}) {
  return supabase.from('alerts').insert({
    user_id: userId,
    alert_name: alertName.trim(),
    stock_symbol: stockSymbol.toUpperCase(),
    stock_name: stockName,
    condition,
    target_price: targetPrice,
    alert_type: alertType,
    frequency,
    is_triggered: false,
  })
}

export async function deleteAlert(alertId, userId) {
  return supabase.from('alerts').delete().eq('id', alertId).eq('user_id', userId)
}

function shouldNotify(alert) {
  if (alert.frequency === 'always') return true
  if (alert.frequency === 'once' && alert.is_triggered) return false
  if (alert.frequency === 'once_per_day' && alert.last_notified_at) {
    const last = new Date(alert.last_notified_at)
    const now = new Date()
    return last.toDateString() !== now.toDateString()
  }
  return !alert.is_triggered
}

function conditionMet(condition, price, target) {
  if (condition === 'ABOVE') return price >= target
  return price <= target
}

export async function checkPriceAlerts({ userId, userEmail, prices }) {
  if (!userId || !userEmail) return

  const { data: alerts, error } = await fetchAlerts(userId)
  if (error || !alerts?.length) return

  for (const alert of alerts) {
    if (!shouldNotify(alert)) continue

    const quote = prices[alert.stock_symbol]
    const current = Number(quote?.c ?? quote?.p)
    if (!current || Number.isNaN(current)) continue

    const target = Number(alert.target_price)
    if (!conditionMet(alert.condition, current, target)) continue

    const conditionLabel = alert.condition === 'ABOVE' ? 'Above' : 'Low'
    const changePct = quote?.dp != null ? Number(quote.dp) : null
    const subject = `${alert.stock_symbol} — Price ${conditionLabel.toLowerCase()} $${target.toFixed(2)}`

    const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const html = buildPriceAlertEmail({
      alertName: alert.alert_name || `${alert.stock_symbol} alert`,
      stockSymbol: alert.stock_symbol,
      stockName: alert.stock_name || alert.stock_symbol,
      conditionLabel,
      threshold: target,
      currentPrice: current,
      changePct,
      appUrl,
    })

    try {
      await supabase.functions.invoke('send-price-alert', {
        body: {
          to: userEmail,
          subject,
          html,
          alertId: alert.id,
          userId,
        },
      })
    } catch {
      // Edge function may not be deployed — still log locally
    }

    await supabase.from('alert_email_log').insert({
      alert_id: alert.id,
      user_id: userId,
      user_email: userEmail,
      subject,
      payload: { current, target, condition: alert.condition },
    })

    const updates = {
      last_notified_at: new Date().toISOString(),
      ...(alert.frequency === 'once' ? { is_triggered: true } : {}),
    }
    await supabase.from('alerts').update(updates).eq('id', alert.id)
  }
}

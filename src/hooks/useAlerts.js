import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { AlertQueue } from '../lib/dsa'
import { useAuth } from './useAuth'

export function useAlerts() {
  const { user } = useAuth()
  const alertQueueRef = useRef(new AlertQueue())
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const syncFromQueue = useCallback(() => {
    setAlerts(alertQueueRef.current.toArray())
  }, [])

  const refresh = useCallback(async () => {
    if (!user) {
      alertQueueRef.current = new AlertQueue()
      setAlerts([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      const queue = new AlertQueue()
      data.forEach((row) => queue.enqueue(row))
      alertQueueRef.current = queue
      syncFromQueue()
    }
    setLoading(false)
  }, [user, syncFromQueue])

  useEffect(() => {
    refresh()

    if (!user) return

    const channel = supabase
      .channel(`alerts-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts', filter: `user_id=eq.${user.id}` },
        () => refresh(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, refresh])

  const unreadCount = alerts.filter((a) => !a.is_triggered).length

  const addAlert = useCallback(
    async ({ stock_symbol, target_price, condition }) => {
      if (!user) return { error: new Error('Not authenticated') }

      const { data, error } = await supabase
        .from('alerts')
        .insert({
          user_id: user.id,
          stock_symbol,
          target_price,
          condition,
        })
        .select()
        .single()

      if (!error && data) {
        alertQueueRef.current.enqueue(data)
        syncFromQueue()
      }
      return { data, error }
    },
    [user, syncFromQueue],
  )

  const removeAlert = useCallback(
    async (id) => {
      const { error } = await supabase.from('alerts').delete().eq('id', id)

      if (!error) {
        const remaining = alertQueueRef.current.toArray().filter((a) => a.id !== id)
        const queue = new AlertQueue()
        remaining.forEach((a) => queue.enqueue(a))
        alertQueueRef.current = queue
        syncFromQueue()
      }
      return { error }
    },
    [syncFromQueue],
  )

  const checkAlerts = useCallback(
    async (currentPrices) => {
      if (!user) return []

      const triggered = []

      for (const alert of alertQueueRef.current.toArray()) {
        if (alert.is_triggered) continue

        const quote = currentPrices[alert.stock_symbol]
        const price = quote?.c ?? quote?.p
        if (price == null) continue

        const hit =
          (alert.condition === 'ABOVE' && price >= alert.target_price) ||
          (alert.condition === 'BELOW' && price <= alert.target_price)

        if (hit) {
          const { error } = await supabase
            .from('alerts')
            .update({ is_triggered: true })
            .eq('id', alert.id)

          if (!error) {
            triggered.push({ ...alert, is_triggered: true })
          }
        }
      }

      if (triggered.length > 0) {
        await refresh()
      }

      return triggered
    },
    [user, refresh],
  )

  return {
    alertQueue: alertQueueRef.current,
    alerts,
    unreadCount,
    loading,
    refresh,
    addAlert,
    removeAlert,
    checkAlerts,
  }
}

import { useEffect, useRef } from 'react'
import { useAuth } from './useAuth'
import { checkPriceAlerts } from '../lib/alerts'

/** Run price alert checks when live quotes update (throttled). */
export function useAlertChecker(prices) {
  const { user } = useAuth()
  const lastRun = useRef(0)

  useEffect(() => {
    if (!user?.id || !user?.email) return
    if (user.user_metadata?.preferences?.email_alerts === false) return
    if (!prices || Object.keys(prices).length === 0) return

    const now = Date.now()
    if (now - lastRun.current < 15000) return
    lastRun.current = now

    checkPriceAlerts({
      userId: user.id,
      userEmail: user.email,
      prices,
    })
  }, [prices, user])
}

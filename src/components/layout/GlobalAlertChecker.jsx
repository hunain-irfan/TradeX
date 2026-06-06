import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { fetchAlerts } from '../../lib/alerts'
import { useFinnhubSocket } from '../../hooks/useFinnhubSocket'
import { useAlertChecker } from '../../hooks/useAlertChecker'

/** Polls alert symbols app-wide so price alerts fire on any user page. */
export default function GlobalAlertChecker() {
  const { user } = useAuth()
  const [alertSymbols, setAlertSymbols] = useState([])

  useEffect(() => {
    if (!user?.id) {
      setAlertSymbols([])
      return
    }

    let cancelled = false

    const load = async () => {
      const { data } = await fetchAlerts(user.id)
      if (cancelled) return
      const syms = [...new Set((data ?? []).map((a) => a.stock_symbol).filter(Boolean))]
      setAlertSymbols(syms)
    }

    load()
    const interval = setInterval(load, 60000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [user?.id])

  const symbols = useMemo(() => alertSymbols, [alertSymbols.join(',')])
  const { prices } = useFinnhubSocket(symbols)
  useAlertChecker(prices)

  return null
}

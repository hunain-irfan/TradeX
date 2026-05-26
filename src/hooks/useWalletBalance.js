import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { fetchWallet } from '../lib/trading'

export function useWalletBalance() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setBalance(0)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    fetchWallet(user.id)
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error) setBalance(Number(data?.balance ?? 0))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  return { balance, loading }
}

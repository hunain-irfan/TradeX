import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { fetchWallet } from '../lib/trading'

const WalletBalanceContext = createContext(null)

export function WalletBalanceProvider({ children }) {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setBalance(0)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await fetchWallet(user.id)
    if (!error) setBalance(Number(data?.balance ?? 0))
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <WalletBalanceContext.Provider value={{ balance, loading, refresh }}>
      {children}
    </WalletBalanceContext.Provider>
  )
}

export function useWalletBalance() {
  const ctx = useContext(WalletBalanceContext)
  if (!ctx) {
    throw new Error('useWalletBalance must be used within WalletBalanceProvider')
  }
  return ctx
}

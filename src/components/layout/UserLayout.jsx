import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { WalletBalanceProvider } from '../../hooks/useWalletBalance'
import Navbar from './Navbar'
import TickerTape from './TickerTape'
import FrozenBanner from './FrozenBanner'
import GlobalAlertChecker from './GlobalAlertChecker'

export default function UserLayout() {
  const { isFrozen } = useAuth()

  return (
    <WalletBalanceProvider>
      <GlobalAlertChecker />
      <Navbar />
      {isFrozen && <FrozenBanner />}
      <TickerTape />
      <main>
        <Outlet />
      </main>
    </WalletBalanceProvider>
  )
}

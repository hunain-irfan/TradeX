import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute from './components/layout/AdminRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'

import Dashboard from './pages/user/Dashboard'
import Search from './pages/user/Search'
import Portfolio from './pages/user/Portfolio'
import Watchlist from './pages/user/Watchlist'
import Alerts from './pages/user/Alerts'
import History from './pages/user/History'
import Wallet from './pages/user/Wallet'
import Leaderboard from './pages/user/Leaderboard'
import StockDetail from './pages/user/StockDetail'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminWallet from './pages/admin/AdminWallet'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminLogs from './pages/admin/AdminLogs'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* USER — ProtectedRoute → Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/history" element={<History />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
          </Route>
        </Route>

        {/* ADMIN — AdminRoute → Layout */}
        <Route element={<AdminRoute />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/wallet" element={<AdminWallet />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

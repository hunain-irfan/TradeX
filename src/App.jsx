import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'

import ProtectedRoute from './components/layout/ProtectedRoute'
import UserRoute from './components/layout/UserRoute'
import UserLayout from './components/layout/UserLayout'
import AdminRoute from './components/layout/AdminRoute'
import AdminLayout from './components/layout/AdminLayout'

import Landing from './pages/Landing'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import NotFound from './pages/NotFound'

import Dashboard from './pages/user/Dashboard'
import Search from './pages/user/Search'
import Portfolio from './pages/user/Portfolio'
import Watchlist from './pages/user/Watchlist'
import History from './pages/user/History'
import Wallet from './pages/user/Wallet'
import Leaderboard from './pages/user/Leaderboard'
import StockDetail from './pages/user/StockDetail'
import Profile from './pages/user/Profile'
import Settings from './pages/user/Settings'
import Alerts from './pages/user/Alerts'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminWallet from './pages/admin/AdminWallet'
import AdminLogs from './pages/admin/AdminLogs'

export default function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* USER — trading pages only (admins redirected to /admin) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserRoute />}>
            <Route element={<UserLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/history" element={<History />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
            </Route>
          </Route>
        </Route>

        {/* ADMIN — management only (no ticker, no trading nav) */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/wallet" element={<AdminWallet />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
          </Route>
        </Route>

        {/* 404 — must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  )
}

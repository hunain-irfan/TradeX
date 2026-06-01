import { Outlet } from 'react-router-dom'
import AdminNavbar from './AdminNavbar'

export default function AdminLayout() {
  return (
    <>
      <AdminNavbar />
      <main>
        <Outlet />
      </main>
    </>
  )
}

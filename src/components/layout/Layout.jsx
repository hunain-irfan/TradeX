import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import TickerTape from './TickerTape'

export default function Layout() {
  return (
    <>
      <Navbar />
      <TickerTape />
      <main>
        <Outlet />
      </main>
    </>
  )
}

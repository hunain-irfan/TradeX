import { useCallback, useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

import { deleteAlert, fetchAlerts } from '../../lib/alerts'

import PriceAlertModal from '../../components/alerts/PriceAlertModal'

import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

import { Bell, Plus, Trash2 } from '../../lib/navIcons'



export default function Alerts() {

  const { user } = useAuth()

  const [alerts, setAlerts] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)



  const load = useCallback(async () => {

    if (!user) return

    setLoading(true)

    setError(null)

    const { data, error: err } = await fetchAlerts(user.id)

    if (err) setError(err.message)

    else setAlerts(data ?? [])

    setLoading(false)

  }, [user])



  useEffect(() => {

    load()

  }, [load])



  const handleDelete = async (id) => {

    if (!user) return

    await deleteAlert(id, user.id)

    load()

  }



  if (loading) return <div className="container pt-6"><PageLoader /></div>

  if (error) return <div className="container pt-6"><PageError message={error} onRetry={load} /></div>



  return (

    <div className="container pt-6 pb-10 space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-white flex items-center gap-2">

            <Bell className="w-6 h-6 text-primary-400" strokeWidth={2} />

            Price Alerts

          </h1>

          <p className="text-gray-500 text-sm mt-1">Get emailed when your target price is hit.</p>

        </div>

        <button

          type="button"

          className="primary-btn gap-2"

          onClick={() => setModalOpen(true)}

        >

          <Plus className="w-4 h-4" strokeWidth={2} />

          New Alert

        </button>

      </div>

      {alerts.length === 0 ? (

        <EmptyState

          title="No alerts yet"

          message="Create a price alert to receive an email when the market hits your target."

        />

      ) : (

        <div className="watchlist-table overflow-x-auto">

          <div className="table-header-row grid grid-cols-6 gap-2 px-4 py-3 text-sm font-medium">

            <span>Name</span>

            <span>Stock</span>

            <span>Condition</span>

            <span>Target</span>

            <span>Frequency</span>

            <span className="text-right">Action</span>

          </div>

          {alerts.map((a) => (

            <div key={a.id} className="data-row grid grid-cols-6 gap-2 px-4 py-3 text-sm items-center">

              <span className="truncate font-medium text-white">{a.alert_name}</span>

              <Link to={`/stock/${a.stock_symbol}`} className="text-primary-400 hover:underline font-mono">

                {a.stock_symbol}

              </Link>

              <span>{a.condition === 'ABOVE' ? 'Above' : 'Low'}</span>

              <span className="font-mono">${Number(a.target_price).toFixed(2)}</span>

              <span className="text-gray-400 text-xs capitalize">

                {(a.frequency || 'once_per_day').replace(/_/g, ' ')}

              </span>

              <button

                type="button"

                className="justify-self-end text-red-500 hover:text-red-400 inline-flex items-center gap-1"

                onClick={() => handleDelete(a.id)}

              >

                <Trash2 className="w-3.5 h-3.5" />

                Remove

              </button>

            </div>

          ))}

        </div>

      )}



      <PriceAlertModal

        open={modalOpen}

        onClose={() => setModalOpen(false)}

        userId={user?.id}

        onCreated={load}

      />

    </div>

  )

}


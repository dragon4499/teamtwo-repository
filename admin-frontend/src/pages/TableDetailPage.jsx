import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { adminApi } from '../services/api'
import OrderCard from '../components/OrderCard'

export default function TableDetailPage() {
  const { tableNum } = useParams()
  const { auth } = useAdminAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const loadOrders = () => {
    adminApi.getTableOrders(auth.storeId, tableNum)
      .then(setOrders).catch(e => setError(e.message)).finally(() => setLoading(false))
  }

  useEffect(() => { if (auth?.storeId) loadOrders() }, [auth?.storeId, tableNum])

  const handleStatusChange = async (orderId, status) => {
    try { await adminApi.updateOrderStatus(auth.storeId, orderId, status); loadOrders() }
    catch (e) { setError(e.message) }
  }

  const handleDelete = async (orderId) => {
    if (!confirm('주문을 삭제하시겠습니까?')) return
    try { await adminApi.deleteOrder(auth.storeId, orderId); loadOrders() }
    catch (e) { setError(e.message) }
  }

  const totalAmount = orders.reduce((s, o) => s + (o.total_amount || 0), 0)

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-slate-600 transition" aria-label="뒤로가기">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">테이블 {tableNum}</h1>
          <p className="text-xs text-slate-400">{orders.length}건 · {totalAmount.toLocaleString()}원</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl mb-4 text-sm">{error}</div>}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse-soft" />)}
        </div>
      )}

      <div className="space-y-3">
        {orders.map(order => (
          <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onDelete={handleDelete} />
        ))}
      </div>

      {!loading && orders.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-400 text-sm">주문이 없습니다</p>
        </div>
      )}
    </div>
  )
}

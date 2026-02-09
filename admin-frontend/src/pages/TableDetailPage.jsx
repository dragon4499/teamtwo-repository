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

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">테이블 {tableNum} 주문</h1>
        <button onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium border border-gray-200 shadow-sm transition">
          돌아가기
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
      {loading && <p className="text-center py-8 text-gray-400">로딩 중...</p>}

      <div className="space-y-3">
        {orders.map(order => (
          <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onDelete={handleDelete} />
        ))}
      </div>

      {!loading && orders.length === 0 && (
        <p className="text-center py-16 text-gray-400">주문이 없습니다</p>
      )}
    </div>
  )
}

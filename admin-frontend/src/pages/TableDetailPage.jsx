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
      .then(setOrders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (auth?.storeId) loadOrders()
  }, [auth?.storeId, tableNum])

  const handleStatusChange = async (orderId, status) => {
    try {
      await adminApi.updateOrderStatus(auth.storeId, orderId, status)
      loadOrders()
    } catch (e) { setError(e.message) }
  }

  const handleDelete = async (orderId) => {
    if (!confirm('주문을 삭제하시겠습니까?')) return
    try {
      await adminApi.deleteOrder(auth.storeId, orderId)
      loadOrders()
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>테이블 {tableNum} 주문</h1>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>돌아가기</button>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {loading && <p>로딩 중...</p>}

      {orders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      ))}

      {!loading && orders.length === 0 && (
        <p style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>주문이 없습니다</p>
      )}
    </div>
  )
}

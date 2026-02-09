import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

const STATUS_LABEL = { pending: '대기중', preparing: '준비중', completed: '완료' }
const STATUS_COLOR = { pending: '#f59e0b', preparing: '#3b82f6', completed: '#10b981' }

export default function OrderHistoryPage() {
  const { auth } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth) return
    api.getSessionOrders(auth.storeId, auth.session_id)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [auth])

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>주문 내역</h1>
        <button className="btn-secondary" onClick={() => navigate('/menu')} style={{ fontSize: 13 }}>
          메뉴로
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', padding: 20 }}>로딩 중...</p>}

      {!loading && orders.length === 0 && (
        <p style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>주문 내역이 없습니다</p>
      )}

      {orders.map(order => (
        <div key={order.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>#{order.order_number}</span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
              background: STATUS_COLOR[order.status] + '20',
              color: STATUS_COLOR[order.status],
            }}>
              {STATUS_LABEL[order.status] || order.status}
            </span>
          </div>
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b7280' }}>
              <span>{item.menu_name} × {item.quantity}</span>
              <span>{item.subtotal?.toLocaleString()}원</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 700 }}>
            <span>합계</span>
            <span>{order.total_amount?.toLocaleString()}원</span>
          </div>
        </div>
      ))}
    </div>
  )
}

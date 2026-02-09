import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

const STATUS_LABEL = { pending: '대기중', preparing: '준비중', completed: '완료' }
const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700',
  preparing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export default function OrderHistoryPage() {
  const { auth } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth) return
    api.getSessionOrders(auth.storeId, auth.session_id)
      .then(setOrders).catch(() => {}).finally(() => setLoading(false))
  }, [auth])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">📜 주문 내역</h1>
          <button onClick={() => navigate('/menu')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition">
            메뉴로
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading && <p className="text-center py-8 text-gray-400">로딩 중...</p>}
        {!loading && orders.length === 0 && (
          <p className="text-center py-16 text-gray-400">주문 내역이 없습니다</p>
        )}

        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl p-5 mb-3 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-800">#{order.order_number}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-500'}`}>
                {STATUS_LABEL[order.status] || order.status}
              </span>
            </div>
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-500">
                <span>{item.menu_name} × {item.quantity}</span>
                <span>{item.subtotal?.toLocaleString()}원</span>
              </div>
            ))}
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 font-bold text-gray-800">
              <span>합계</span>
              <span>{order.total_amount?.toLocaleString()}원</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

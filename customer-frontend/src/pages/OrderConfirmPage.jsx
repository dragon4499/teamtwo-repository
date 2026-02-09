import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { api } from '../services/api'

export default function OrderConfirmPage() {
  const { auth } = useAuth()
  const { items, totalAmount, clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleConfirm = async () => {
    try {
      setSubmitting(true)
      setError('')
      const orderItems = items.map(i => ({ menu_id: i.menu_id, quantity: i.quantity }))
      const order = await api.createOrder(auth.storeId, auth.tableNumber, auth.session_id, orderItems)
      clearCart()
      navigate('/success', { state: { order } })
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) { navigate('/cart'); return null }

  return (
    <div className="max-w-lg mx-auto px-4 py-4 min-h-screen bg-gray-50">
      <h1 className="text-xl font-bold text-gray-800 mb-4">주문 확인</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-3 text-sm">{error}</div>}

      {items.map(item => (
        <div key={item.menu_id} className="bg-white rounded-xl p-4 mb-2 shadow-sm flex justify-between">
          <span className="text-gray-700">{item.menu_name} × {item.quantity}</span>
          <span className="font-semibold">{(item.price * item.quantity).toLocaleString()}원</span>
        </div>
      ))}

      <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between font-bold text-lg mt-1">
        <span>총 금액</span>
        <span className="text-blue-600">{totalAmount.toLocaleString()}원</span>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => navigate('/cart')}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-semibold transition">
          돌아가기
        </button>
        <button onClick={handleConfirm} disabled={submitting}
          className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
          {submitting ? '주문 중...' : '주문 확정'}
        </button>
      </div>
    </div>
  )
}

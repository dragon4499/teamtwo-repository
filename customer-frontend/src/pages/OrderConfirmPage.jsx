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
      const order = await api.createOrder(
        auth.storeId, auth.tableNumber, auth.session_id, orderItems
      )
      clearCart()
      navigate('/success', { state: { order } })
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="container">
      <h1>주문 확인</h1>
      {error && <div className="error-msg">{error}</div>}

      {items.map(item => (
        <div key={item.menu_id} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{item.menu_name} × {item.quantity}</span>
          <span style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString()}원</span>
        </div>
      ))}

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
        <span>총 금액</span>
        <span style={{ color: '#2563eb' }}>{totalAmount.toLocaleString()}원</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn-secondary" onClick={() => navigate('/cart')} style={{ flex: 1 }}>
          돌아가기
        </button>
        <button className="btn-primary" onClick={handleConfirm} disabled={submitting} style={{ flex: 2 }}>
          {submitting ? '주문 중...' : '주문 확정'}
        </button>
      </div>
    </div>
  )
}

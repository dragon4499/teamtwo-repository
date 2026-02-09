import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { api } from '../services/api'

export default function OrderConfirmPage() {
  const { auth } = useAuth()
  const { items, totalAmount, totalCount, clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleConfirm = async () => {
    try {
      setSubmitting(true); setError('')
      const orderItems = items.map(i => ({ menu_id: i.menu_id, quantity: i.quantity }))
      const order = await api.createOrder(auth.storeId, auth.tableNumber, auth.session_id, orderItems)
      clearCart()
      navigate('/success', { state: { order } })
    } catch (e) { setError(e.message) } finally { setSubmitting(false) }
  }

  if (items.length === 0) { navigate('/cart'); return null }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex items-center h-14">
          <button onClick={() => navigate('/cart')} className="mr-3 text-slate-400 hover:text-slate-600 transition" aria-label="뒤로가기">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-base font-bold text-slate-800">주문 확인</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 animate-fade-in">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl mb-4 text-sm text-center">{error}</div>
        )}

        {/* 주문 요약 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>📍 테이블 {auth?.tableNumber}</span>
              <span className="text-slate-200">·</span>
              <span>{totalCount}개 메뉴</span>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {items.map(item => (
              <div key={item.menu_id} className="px-5 py-3.5 flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-slate-700">{item.menu_name}</span>
                  <span className="text-xs text-slate-400 ml-2">× {item.quantity}</span>
                </div>
                <span className="text-sm font-semibold text-slate-800">{(item.price * item.quantity).toLocaleString()}원</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-slate-50/50 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">결제 금액</span>
            <span className="text-xl font-bold text-slate-900">{totalAmount.toLocaleString()}<span className="text-sm font-normal text-slate-400">원</span></span>
          </div>
        </div>

        {/* 안내 */}
        <div className="bg-amber-50 rounded-2xl px-4 py-3 mb-5 flex items-start gap-2">
          <span className="text-amber-500 text-sm mt-0.5">💡</span>
          <p className="text-xs text-amber-700 leading-relaxed">주문 확정 후에는 취소가 어려울 수 있습니다. 메뉴와 수량을 다시 한번 확인해주세요.</p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button onClick={() => navigate('/cart')}
            className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-medium text-sm hover:bg-slate-50 transition">
            수정하기
          </button>
          <button onClick={handleConfirm} disabled={submitting}
            className="flex-[2] py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-slate-900/15 transition-all active:scale-[0.98]">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                주문 처리 중...
              </span>
            ) : '주문 확정'}
          </button>
        </div>
      </div>
    </div>
  )
}

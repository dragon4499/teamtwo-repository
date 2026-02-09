import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import CartItem from '../components/CartItem'

export default function CartPage() {
  const { auth } = useAuth()
  const { items, updateQuantity, removeItem, clearCart, totalAmount, totalCount } = useCart()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex items-center h-14">
          <button onClick={() => navigate('/menu')} className="mr-3 text-slate-400 hover:text-slate-600 transition" aria-label="뒤로가기">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-base font-bold text-slate-800">장바구니</h1>
          {items.length > 0 && (
            <span className="ml-2 bg-slate-100 text-slate-500 text-xs font-medium px-2 py-0.5 rounded-full">{totalCount}</span>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
        {items.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-slate-400 text-sm mb-6">장바구니가 비어있습니다</p>
            <button onClick={() => navigate('/menu')}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition active:scale-95">
              메뉴 보기
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* 테이블 정보 */}
            <div className="bg-blue-50 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
              <span className="text-blue-500 text-sm">📍</span>
              <span className="text-sm text-blue-700 font-medium">테이블 {auth?.tableNumber}</span>
            </div>

            {/* 아이템 목록 */}
            <div className="space-y-0">
              {items.map(item => (
                <CartItem key={item.menu_id} item={item} onUpdateQty={updateQuantity} onRemove={removeItem} />
              ))}
            </div>

            {/* 전체 비우기 */}
            <button onClick={clearCart}
              className="w-full text-center text-xs text-slate-400 hover:text-red-400 py-3 transition">
              전체 비우기
            </button>

            {/* 합계 + 주문 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mt-2">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-500">총 {totalCount}개</span>
                <span className="text-xl font-bold text-slate-900">{totalAmount.toLocaleString()}<span className="text-sm font-normal text-slate-400">원</span></span>
              </div>
              <button onClick={() => navigate('/confirm')}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-slate-900/15 active:scale-[0.98] text-sm">
                주문하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import CartItem from '../components/CartItem'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart()
  const navigate = useNavigate()

  return (
    <div className="max-w-lg mx-auto px-4 py-4 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">장바구니</h1>
        <button onClick={() => navigate('/menu')}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition">
          메뉴로
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center py-16 text-gray-400">장바구니가 비어있습니다</p>
      ) : (
        <>
          {items.map(item => (
            <CartItem key={item.menu_id} item={item} onUpdateQty={updateQuantity} onRemove={removeItem} />
          ))}

          <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center font-bold text-lg">
            <span>총 금액</span>
            <span className="text-blue-600">{totalAmount.toLocaleString()}원</span>
          </div>

          <div className="flex gap-2 mt-3">
            <button onClick={clearCart}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-semibold transition">
              전체 비우기
            </button>
            <button onClick={() => navigate('/confirm')}
              className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
              주문하기
            </button>
          </div>
        </>
      )}
    </div>
  )
}

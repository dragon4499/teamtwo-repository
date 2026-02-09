import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import CartItem from '../components/CartItem'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart()
  const navigate = useNavigate()

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>장바구니</h1>
        <button className="btn-secondary" onClick={() => navigate('/menu')} style={{ fontSize: 13 }}>
          메뉴로
        </button>
      </div>

      {items.length === 0 ? (
        <p style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>장바구니가 비어있습니다</p>
      ) : (
        <>
          {items.map(item => (
            <CartItem
              key={item.menu_id}
              item={item}
              onUpdateQty={updateQuantity}
              onRemove={removeItem}
            />
          ))}

          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
            <span>총 금액</span>
            <span style={{ color: '#2563eb' }}>{totalAmount.toLocaleString()}원</span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn-secondary" onClick={clearCart} style={{ flex: 1 }}>
              전체 비우기
            </button>
            <button className="btn-primary" onClick={() => navigate('/confirm')} style={{ flex: 2 }}>
              주문하기
            </button>
          </div>
        </>
      )}
    </div>
  )
}

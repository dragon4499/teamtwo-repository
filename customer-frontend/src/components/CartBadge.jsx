/** 장바구니 배지 */
import { useCart } from '../contexts/CartContext'

export default function CartBadge({ onClick }) {
  const { totalCount } = useCart()
  return (
    <button
      onClick={onClick}
      className="btn-primary"
      style={{ position: 'relative', padding: '10px 16px' }}
      aria-label={`장바구니 ${totalCount}개`}
    >
      🛒 장바구니
      {totalCount > 0 && (
        <span style={{
          position: 'absolute', top: -6, right: -6,
          background: '#ef4444', color: 'white', borderRadius: '50%',
          width: 22, height: 22, fontSize: 12, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {totalCount}
        </span>
      )}
    </button>
  )
}

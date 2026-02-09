/** 장바구니 항목 */
export default function CartItem({ item, onUpdateQty, onRemove }) {
  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 600 }}>{item.menu_name}</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          {item.price.toLocaleString()}원
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="btn-secondary"
          onClick={() => item.quantity <= 1 ? onRemove(item.menu_id) : onUpdateQty(item.menu_id, item.quantity - 1)}
          style={{ width: 32, height: 32, padding: 0, fontSize: 16 }}
          aria-label="수량 감소"
        >
          −
        </button>
        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
        <button
          className="btn-secondary"
          onClick={() => onUpdateQty(item.menu_id, item.quantity + 1)}
          disabled={item.quantity >= 99}
          style={{ width: 32, height: 32, padding: 0, fontSize: 16 }}
          aria-label="수량 증가"
        >
          +
        </button>
        <span style={{ minWidth: 70, textAlign: 'right', fontWeight: 700 }}>
          {(item.price * item.quantity).toLocaleString()}원
        </span>
      </div>
    </div>
  )
}

import OrderStatusBadge from './OrderStatusBadge'

export default function OrderCard({ order, onStatusChange, onDelete }) {
  const nextStatus = order.status === 'pending' ? 'preparing'
    : order.status === 'preparing' ? 'completed' : null

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>#{order.order_number}</span>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.items?.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b7280' }}>
          <span>{item.menu_name} x {item.quantity}</span>
          <span>{item.subtotal?.toLocaleString()}원</span>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 700 }}>
        <span>합계</span>
        <span>{order.total_amount?.toLocaleString()}원</span>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {nextStatus && (
          <button
            className={nextStatus === 'preparing' ? 'btn-warning' : 'btn-success'}
            onClick={() => onStatusChange(order.id, nextStatus)}
            style={{ flex: 1, fontSize: 13 }}
          >
            {nextStatus === 'preparing' ? '준비 시작' : '완료 처리'}
          </button>
        )}
        <button
          className="btn-danger"
          onClick={() => onDelete(order.id)}
          style={{ fontSize: 13 }}
        >
          삭제
        </button>
      </div>
    </div>
  )
}

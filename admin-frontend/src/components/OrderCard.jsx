import OrderStatusBadge from './OrderStatusBadge'

export default function OrderCard({ order, onStatusChange, onDelete }) {
  const nextStatus = order.status === 'pending' ? 'preparing'
    : order.status === 'preparing' ? 'completed' : null

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-800">#{order.order_number}</span>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-1">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-gray-500">
            <span>{item.menu_name} × {item.quantity}</span>
            <span>{item.subtotal?.toLocaleString()}원</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 font-bold text-gray-800">
        <span>합계</span>
        <span>{order.total_amount?.toLocaleString()}원</span>
      </div>

      <div className="flex gap-2 mt-4">
        {nextStatus && (
          <button
            onClick={() => onStatusChange(order.id, nextStatus)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition active:scale-95 ${
              nextStatus === 'preparing'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {nextStatus === 'preparing' ? '준비 시작' : '완료 처리'}
          </button>
        )}
        <button onClick={() => onDelete(order.id)}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition">
          삭제
        </button>
      </div>
    </div>
  )
}

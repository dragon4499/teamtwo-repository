import OrderStatusBadge from './OrderStatusBadge'

export default function OrderCard({ order, onStatusChange, onDelete }) {
  const nextStatus = order.status === 'pending' ? 'preparing'
    : order.status === 'preparing' ? 'completed' : null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-sm transition animate-fade-in">
      <div className="px-5 py-3.5 flex justify-between items-center border-b border-slate-50">
        <span className="text-xs font-mono text-slate-400">#{order.order_number}</span>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="px-5 py-3 space-y-1.5">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-slate-600">{item.menu_name} <span className="text-slate-300">×{item.quantity}</span></span>
            <span className="text-slate-500">{item.subtotal?.toLocaleString()}원</span>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-slate-50/50 flex justify-between items-center">
        <span className="text-xs text-slate-400">합계</span>
        <span className="font-bold text-slate-800 text-sm">{order.total_amount?.toLocaleString()}원</span>
      </div>

      <div className="px-5 py-3 flex gap-2 border-t border-slate-50">
        {nextStatus && (
          <button
            onClick={() => onStatusChange(order.id, nextStatus)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
              nextStatus === 'preparing'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}>
            {nextStatus === 'preparing' ? '조리 시작' : '완료 처리'}
          </button>
        )}
        <button onClick={() => onDelete(order.id)}
          className="px-4 py-2 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
          삭제
        </button>
      </div>
    </div>
  )
}

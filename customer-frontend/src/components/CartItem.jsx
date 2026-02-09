export default function CartItem({ item, onUpdateQty, onRemove }) {
  const subtotal = item.price * item.quantity

  return (
    <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex items-center gap-4 animate-fade-in">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-800 text-sm truncate">{item.menu_name}</div>
        <div className="text-xs text-slate-400 mt-0.5">{item.price.toLocaleString()}원</div>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl p-1">
        <button
          onClick={() => item.quantity <= 1 ? onRemove(item.menu_id) : onUpdateQty(item.menu_id, item.quantity - 1)}
          aria-label="수량 감소"
          className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-500 font-bold flex items-center justify-center transition text-sm shadow-sm">
          {item.quantity <= 1 ? '✕' : '−'}
        </button>
        <span className="w-8 text-center font-bold text-sm text-slate-800">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(item.menu_id, item.quantity + 1)}
          disabled={item.quantity >= 99}
          aria-label="수량 증가"
          className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-500 font-bold flex items-center justify-center transition text-sm shadow-sm disabled:opacity-30">
          +
        </button>
      </div>

      <div className="min-w-[72px] text-right font-bold text-slate-900 text-sm">
        {subtotal.toLocaleString()}원
      </div>
    </div>
  )
}

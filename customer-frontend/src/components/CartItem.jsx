export default function CartItem({ item, onUpdateQty, onRemove }) {
  return (
    <div className="bg-white rounded-xl p-4 mb-3 shadow-sm flex justify-between items-center">
      <div>
        <div className="font-semibold text-gray-800">{item.menu_name}</div>
        <div className="text-sm text-gray-500">{item.price.toLocaleString()}원</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => item.quantity <= 1 ? onRemove(item.menu_id) : onUpdateQty(item.menu_id, item.quantity - 1)}
          aria-label="수량 감소"
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center transition"
        >
          −
        </button>
        <span className="w-6 text-center font-semibold">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(item.menu_id, item.quantity + 1)}
          disabled={item.quantity >= 99}
          aria-label="수량 증가"
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center transition disabled:opacity-40"
        >
          +
        </button>
        <span className="min-w-[70px] text-right font-bold text-gray-800">
          {(item.price * item.quantity).toLocaleString()}원
        </span>
      </div>
    </div>
  )
}

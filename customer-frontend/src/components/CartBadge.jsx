import { useCart } from '../contexts/CartContext'

export default function CartBadge({ onClick }) {
  const { totalCount, totalAmount } = useCart()
  if (totalCount === 0) return null

  return (
    <button onClick={onClick} aria-label={`장바구니 ${totalCount}개`}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 hover:bg-slate-800 text-white pl-5 pr-4 py-3.5 rounded-2xl shadow-2xl shadow-slate-900/30 flex items-center gap-4 transition-all duration-200 active:scale-[0.97] animate-slide-up min-w-[280px]">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-lg">🛒</span>
        <span className="font-bold text-sm">{totalCount}개</span>
        <span className="text-slate-400 text-sm">·</span>
        <span className="font-bold text-sm">{totalAmount.toLocaleString()}원</span>
      </div>
      <span className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg">주문하기</span>
    </button>
  )
}

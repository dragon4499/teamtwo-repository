import { useCart } from '../contexts/CartContext'

export default function CartBadge({ onClick }) {
  const { totalCount } = useCart()
  return (
    <button
      onClick={onClick}
      aria-label={`장바구니 ${totalCount}개`}
      className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow"
    >
      🛒 장바구니
      {totalCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center animate-bounce">
          {totalCount}
        </span>
      )}
    </button>
  )
}

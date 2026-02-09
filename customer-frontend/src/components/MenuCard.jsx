export default function MenuCard({ menu, onAdd }) {
  return (
    <div className="bg-white rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition-shadow duration-200 flex justify-between items-center">
      <div className="flex-1 mr-3">
        <div className="font-semibold text-gray-800">{menu.name}</div>
        {menu.description && (
          <div className="text-sm text-gray-500 mt-0.5 line-clamp-1">{menu.description}</div>
        )}
        <div className="font-bold text-blue-600 mt-1">{menu.price.toLocaleString()}원</div>
      </div>
      <button
        onClick={() => onAdd(menu)}
        disabled={!menu.is_available}
        aria-label={`${menu.name} 장바구니 추가`}
        className={`min-w-[64px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          menu.is_available
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-95'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {menu.is_available ? '담기' : '품절'}
      </button>
    </div>
  )
}

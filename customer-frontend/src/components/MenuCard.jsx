export default function MenuCard({ menu, onAdd }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
      {menu.image_url ? (
        <img src={menu.image_url} alt={menu.name}
          className="w-full h-44 object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-4xl">🍽️</div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="font-semibold text-gray-800 text-base">{menu.name}</div>
        {menu.description && (
          <div className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">{menu.description}</div>
        )}
        <div className="flex justify-between items-center mt-3">
          <span className="font-bold text-blue-600 text-lg">{menu.price.toLocaleString()}원</span>
          <button
            onClick={() => onAdd(menu)}
            disabled={!menu.is_available}
            aria-label={`${menu.name} 장바구니 추가`}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              menu.is_available
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {menu.is_available ? '담기' : '품절'}
          </button>
        </div>
      </div>
    </div>
  )
}

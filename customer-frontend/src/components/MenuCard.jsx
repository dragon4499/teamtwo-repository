import { useState } from 'react'

export default function MenuCard({ menu, onAdd }) {
  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    onAdd(menu)
    setAdded(true)
    setTimeout(() => setAdded(false), 600)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group">
      {/* 이미지 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {menu.image_url && !imgError ? (
          <img src={menu.image_url} alt={menu.name} loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-50 to-slate-100">🍽️</div>
        )}
        {!menu.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white/90 text-slate-700 text-sm font-bold px-4 py-1.5 rounded-full">품절</span>
          </div>
        )}
        {menu.category && (
          <span className="absolute top-2.5 left-2.5 bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
            {menu.category}
          </span>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 text-[15px] leading-snug">{menu.name}</h3>
        {menu.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 flex-1 leading-relaxed">{menu.description}</p>
        )}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
          <span className="font-bold text-slate-900 text-lg">{menu.price.toLocaleString()}<span className="text-sm font-normal text-slate-400">원</span></span>
          <button
            onClick={handleAdd}
            disabled={!menu.is_available}
            aria-label={`${menu.name} 장바구니 추가`}
            className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              menu.is_available
                ? added
                  ? 'bg-emerald-500 text-white scale-95'
                  : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            {!menu.is_available ? '품절' : added ? '✓' : '담기'}
          </button>
        </div>
      </div>
    </div>
  )
}

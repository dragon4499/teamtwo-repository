import { useRef, useEffect } from 'react'

const CAT_ICONS = {
  '전체': '🍴', '메인': '🍚', '세트메뉴': '🎁', '사이드': '🥘',
  '계절메뉴': '🌸', '음료': '🥤',
}

export default function CategoryNav({ categories, selected, onSelect }) {
  const ref = useRef(null)
  const activeRef = useRef(null)

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [selected])

  const all = [null, ...categories]

  return (
    <nav ref={ref} className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
      {all.map(cat => {
        const isActive = cat === selected
        const label = cat || '전체'
        const icon = CAT_ICONS[label] || '🍴'
        return (
          <button
            key={label}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(cat)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0 ${
              isActive
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span className="text-base">{icon}</span>
            {label}
          </button>
        )
      })}
    </nav>
  )
}

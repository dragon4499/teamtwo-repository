import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMenu } from '../contexts/MenuContext'
import { useCart } from '../contexts/CartContext'
import CategoryNav from '../components/CategoryNav'
import MenuCard from '../components/MenuCard'
import CartBadge from '../components/CartBadge'

export default function MenuPage() {
  const { auth, logout } = useAuth()
  const { menus, categories, loading, error, loadMenus } = useMenu()
  const { addItem, totalCount } = useCart()
  const [selectedCat, setSelectedCat] = useState(null)
  const [search, setSearch] = useState('')
  const [showCallModal, setShowCallModal] = useState(false)
  const [callSent, setCallSent] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (auth?.storeId) loadMenus(auth.storeId)
  }, [auth?.storeId, loadMenus])

  const filtered = useMemo(() => {
    let list = menus
    if (selectedCat) list = list.filter(m => m.category === selectedCat)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q))
    }
    return list
  }, [menus, selectedCat, search])

  const handleCallStaff = () => {
    setCallSent(true)
    setTimeout(() => { setCallSent(false); setShowCallModal(false) }, 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <span className="text-xl">🍽️</span>
              <div>
                <h1 className="text-sm font-bold text-slate-800 leading-none">Table Order</h1>
                <span className="text-[11px] text-slate-400">테이블 {auth?.tableNumber}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setShowCallModal(true)}
                className="px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition flex items-center gap-1">
                🔔 직원호출
              </button>
              <button onClick={() => navigate('/orders')}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                주문내역
              </button>
              <button onClick={logout}
                className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                나가기
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 검색 + 카테고리 */}
      <div className="sticky top-14 z-30 bg-slate-50/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div className="relative mb-3">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="메뉴 검색..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 outline-none transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-sm">✕</button>
            )}
          </div>
          <CategoryNav categories={categories} selected={selectedCat} onSelect={c => { setSelectedCat(c); setSearch('') }} />
        </div>
      </div>

      {/* 메뉴 그리드 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl mb-4 text-sm text-center">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse-soft">
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-50 rounded w-full" />
                  <div className="h-5 bg-slate-100 rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {(selectedCat || search) && (
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800">{search ? `"${search}" 검색 결과` : selectedCat}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{filtered.length}개 메뉴</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(menu => (
                <MenuCard key={menu.id} menu={menu} onAdd={addItem} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">{search ? '🔍' : '🍽️'}</p>
                <p className="text-slate-400 text-sm">{search ? '검색 결과가 없습니다' : '메뉴가 없습니다'}</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* 하단 플로팅 장바구니 */}
      <CartBadge onClick={() => navigate('/cart')} />

      {/* 직원 호출 모달 */}
      {showCallModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => !callSent && setShowCallModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-[320px] shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            {callSent ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-800">직원을 호출했습니다</p>
                <p className="text-xs text-slate-400 mt-1">잠시만 기다려주세요</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-5">
                  <div className="text-4xl mb-3">🔔</div>
                  <h3 className="font-bold text-slate-800 text-lg">직원 호출</h3>
                  <p className="text-xs text-slate-400 mt-1">테이블 {auth?.tableNumber}번에서 직원을 호출합니다</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowCallModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition">
                    취소
                  </button>
                  <button onClick={handleCallStaff}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition active:scale-95">
                    호출하기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

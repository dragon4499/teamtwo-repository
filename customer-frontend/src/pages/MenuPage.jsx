import { useEffect, useState } from 'react'
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
  const navigate = useNavigate()

  useEffect(() => {
    if (auth?.storeId) loadMenus(auth.storeId)
  }, [auth?.storeId, loadMenus])

  const filtered = selectedCat ? menus.filter(m => m.category === selectedCat) : menus

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
            <div className="flex items-center gap-2">
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

      {/* 카테고리 */}
      <div className="sticky top-14 z-30 bg-slate-50/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <CategoryNav categories={categories} selected={selectedCat} onSelect={setSelectedCat} />
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
            {selectedCat && (
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800">{selectedCat}</h2>
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
                <p className="text-4xl mb-3">🍽️</p>
                <p className="text-slate-400 text-sm">메뉴가 없습니다</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* 하단 플로팅 장바구니 */}
      <CartBadge onClick={() => navigate('/cart')} />
    </div>
  )
}

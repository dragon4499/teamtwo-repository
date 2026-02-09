import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMenu } from '../contexts/MenuContext'
import { useCart } from '../contexts/CartContext'
import CategoryNav from '../components/CategoryNav'
import MenuCard from '../components/MenuCard'
import CartBadge from '../components/CartBadge'

export default function MenuPage() {
  const { auth } = useAuth()
  const { menus, categories, loading, error, loadMenus } = useMenu()
  const { addItem } = useCart()
  const [selectedCat, setSelectedCat] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (auth?.storeId) loadMenus(auth.storeId)
  }, [auth?.storeId, loadMenus])

  const filtered = selectedCat ? menus.filter(m => m.category === selectedCat) : menus

  return (
    <div className="max-w-lg mx-auto px-4 py-4 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-bold text-gray-800">메뉴</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/orders')}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition">
            주문내역
          </button>
          <CartBadge onClick={() => navigate('/cart')} />
        </div>
      </div>

      <CategoryNav categories={categories} selected={selectedCat} onSelect={setSelectedCat} />

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-3 text-sm">{error}</div>}
      {loading && <p className="text-center py-8 text-gray-400">로딩 중...</p>}

      {filtered.map(menu => (
        <MenuCard key={menu.id} menu={menu} onAdd={addItem} />
      ))}

      {!loading && filtered.length === 0 && (
        <p className="text-center py-16 text-gray-400">메뉴가 없습니다</p>
      )}
    </div>
  )
}

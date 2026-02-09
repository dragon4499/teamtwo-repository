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

  const filtered = selectedCat
    ? menus.filter(m => m.category === selectedCat)
    : menus

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1>메뉴</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => navigate('/orders')} style={{ fontSize: 13 }}>
            주문내역
          </button>
          <CartBadge onClick={() => navigate('/cart')} />
        </div>
      </div>

      <CategoryNav categories={categories} selected={selectedCat} onSelect={setSelectedCat} />

      {error && <div className="error-msg">{error}</div>}
      {loading && <p style={{ textAlign: 'center', padding: 20 }}>로딩 중...</p>}

      {filtered.map(menu => (
        <MenuCard key={menu.id} menu={menu} onAdd={addItem} />
      ))}

      {!loading && filtered.length === 0 && (
        <p style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>메뉴가 없습니다</p>
      )}
    </div>
  )
}

import { useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import CartBadge from './CartBadge'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { totalCount, totalAmount } = useCart()
  const navigate = useNavigate()

  const handleCartClick = useCallback(() => {
    navigate('/cart')
  }, [navigate])

  if (!isAuthenticated) {
    return <Outlet />
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav} role="navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.activeTab : ''}`}
          >
            {t('nav.menu')}
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.activeTab : ''}`}
          >
            {t('nav.orders')}
          </NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <CartBadge itemCount={totalCount} totalAmount={totalAmount} onClick={handleCartClick} />
    </div>
  )
}

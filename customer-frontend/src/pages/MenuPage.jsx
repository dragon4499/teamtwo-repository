import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useMenu } from '../contexts/MenuContext'
import { useCart } from '../contexts/CartContext'
import CategoryNav from '../components/CategoryNav'
import MenuCard from '../components/MenuCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'
import { useTranslation } from 'react-i18next'
import styles from './MenuPage.module.css'

export default function MenuPage() {
  const { t } = useTranslation()
  const { storeId } = useAuth()
  const { menus, categories, isLoading, error, fetchMenus, getFilteredMenus } = useMenu()
  const { getItemQuantity, addItem, updateQuantity, removeItem } = useCart()
  const { showToast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    if (storeId) fetchMenus(storeId)
  }, [storeId, fetchMenus])

  useEffect(() => {
    if (error) showToast(error, 'error')
  }, [error, showToast])

  const filteredMenus = useMemo(
    () => getFilteredMenus(selectedCategory),
    [getFilteredMenus, selectedCategory]
  )

  const handleQuantityChange = useCallback(
    (menuId, quantity) => {
      if (quantity <= 0) {
        removeItem(menuId)
      } else {
        const menu = menus.find((m) => m.id === menuId)
        if (!menu) return
        const currentQty = getItemQuantity(menuId)
        if (currentQty === 0) {
          addItem(menuId, menu.name, menu.price, quantity)
        } else {
          if (quantity > 99) {
            showToast(t('cart.maxQuantity'), 'warning')
            return
          }
          updateQuantity(menuId, quantity)
        }
      }
    },
    [menus, getItemQuantity, addItem, updateQuantity, removeItem, showToast, t]
  )

  if (isLoading && menus.length === 0) return <LoadingSpinner />

  return (
    <div className={styles.container}>
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <div className={styles.content}>
        {filteredMenus.length === 0 ? (
          <div className={styles.empty}>
            <p>{t('menu.empty')}</p>
            {error && (
              <button className={styles.retryBtn} onClick={() => fetchMenus(storeId)}>
                {t('common.retry')}
              </button>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                quantity={getItemQuantity(menu.id)}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

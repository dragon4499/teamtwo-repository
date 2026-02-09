import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../contexts/CartContext'
import CartItem from '../components/CartItem'
import Modal from '../components/Modal'
import { formatCurrency } from '../utils/format'
import styles from './CartPage.module.css'

export default function CartPage() {
  const { t } = useTranslation()
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleClear = useCallback(() => {
    clearCart()
    setShowClearConfirm(false)
  }, [clearCart])

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{t('cart.empty')}</p>
        <button className={styles.goMenuBtn} onClick={() => navigate('/')}>
          {t('cart.goToMenu')}
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('cart.title')}</h2>
        <button className={styles.clearBtn} onClick={() => setShowClearConfirm(true)}>
          {t('cart.clearAll')}
        </button>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <CartItem
            key={item.menuId}
            item={item}
            onQuantityChange={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>
      <div className={styles.summary}>
        <span className={styles.totalLabel}>{t('cart.total', { amount: '' })}</span>
        <span className={styles.totalAmount}>{formatCurrency(totalAmount)}</span>
      </div>
      <button className={styles.orderBtn} onClick={() => navigate('/order/confirm')}>
        {t('cart.order')}
      </button>
      <Modal
        isOpen={showClearConfirm}
        title={t('cart.clearAll')}
        message={t('cart.clearConfirm')}
        onClose={() => setShowClearConfirm(false)}
        onRetry={handleClear}
        retryable
      />
    </div>
  )
}

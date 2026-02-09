import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { createOrder } from '../services/api'
import CartItem from '../components/CartItem'
import Modal from '../components/Modal'
import { formatCurrency } from '../utils/format'
import styles from './OrderConfirmPage.module.css'

export default function OrderConfirmPage() {
  const { t } = useTranslation()
  const { storeId, tableNumber, sessionId } = useAuth()
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (items.length === 0) navigate('/', { replace: true })
  }, [items.length, navigate])

  const handlePlaceOrder = useCallback(async () => {
    setIsSubmitting(true)
    setError(null)

    const orderItems = items.map((item) => ({
      menu_id: item.menuId,
      quantity: item.quantity,
    }))

    const { data, error: apiError } = await createOrder(storeId, tableNumber, sessionId, orderItems)

    if (data) {
      clearCart()
      navigate('/order/success', {
        state: { orderNumber: data.order_number, totalAmount: data.total_amount },
        replace: true,
      })
    } else {
      setRetryCount((prev) => prev + 1)
      setError(apiError)
      setIsSubmitting(false)
    }
  }, [items, storeId, tableNumber, sessionId, clearCart, navigate])

  const handleRetry = useCallback(() => {
    setError(null)
    handlePlaceOrder()
  }, [handlePlaceOrder])

  if (items.length === 0) return null

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('order.confirmTitle')}</h2>
      <p className={styles.tableInfo}>{t('order.tableInfo', { number: tableNumber })}</p>
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
        <span className={styles.totalLabel}>{t('order.totalAmount')}</span>
        <span className={styles.totalAmount}>{formatCurrency(totalAmount)}</span>
      </div>
      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} disabled={isSubmitting}>
          {t('common.back')}
        </button>
        <button className={styles.confirmBtn} onClick={handlePlaceOrder} disabled={isSubmitting}>
          {isSubmitting ? t('order.placing') : t('order.placeOrder')}
        </button>
      </div>
      <Modal
        isOpen={!!error}
        title={t('error.server')}
        message={retryCount >= 3 ? t('order.failRetry') : error?.message || ''}
        retryable={error?.retryable && retryCount < 3}
        onRetry={handleRetry}
        onClose={() => setError(null)}
      />
    </div>
  )
}

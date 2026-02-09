import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { getOrdersBySession } from '../services/api'
import { formatCurrency, formatDateTime } from '../utils/format'
import LoadingSpinner from '../components/LoadingSpinner'
import styles from './OrderHistoryPage.module.css'

const STATUS_COLORS = {
  pending: 'statusPending',
  preparing: 'statusPreparing',
  completed: 'statusCompleted',
}

export default function OrderHistoryPage() {
  const { t } = useTranslation()
  const { storeId, sessionId } = useAuth()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchOrders() {
      if (!storeId || !sessionId) return
      setIsLoading(true)
      const { data, error: apiError } = await getOrdersBySession(storeId, sessionId)
      if (data) {
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
        setOrders(sorted)
      } else {
        setError(apiError?.message || t('error.server'))
      }
      setIsLoading(false)
    }
    fetchOrders()
  }, [storeId, sessionId, t])

  if (isLoading) return <LoadingSpinner />

  if (selectedOrder) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => setSelectedOrder(null)}>
          ← {t('common.back')}
        </button>
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <h3>{t('history.orderNumber')}: {selectedOrder.order_number}</h3>
            <span className={`${styles.status} ${styles[STATUS_COLORS[selectedOrder.status]]}`}>
              {t(`history.status.${selectedOrder.status}`)}
            </span>
          </div>
          <p className={styles.detailTime}>{formatDateTime(selectedOrder.created_at)}</p>
          <div className={styles.detailItems}>
            {selectedOrder.items.map((item) => (
              <div key={item.menu_id} className={styles.detailItem}>
                <span>{item.menu_name}</span>
                <span>{item.quantity}개</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className={styles.detailTotal}>
            <span>{t('order.totalAmount')}</span>
            <span>{formatCurrency(selectedOrder.total_amount)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('history.title')}</h2>
      {error && <p className={styles.error}>{error}</p>}
      {orders.length === 0 ? (
        <p className={styles.empty}>{t('history.empty')}</p>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => (
            <button
              key={order.id}
              className={styles.orderCard}
              onClick={() => setSelectedOrder(order)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.orderNumber}>{order.order_number}</span>
                <span className={`${styles.status} ${styles[STATUS_COLORS[order.status]]}`}>
                  {t(`history.status.${order.status}`)}
                </span>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.time}>{formatDateTime(order.created_at)}</span>
                <span className={styles.amount}>{formatCurrency(order.total_amount)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

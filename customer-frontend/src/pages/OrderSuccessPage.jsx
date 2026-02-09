import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../utils/format'
import styles from './OrderSuccessPage.module.css'

export default function OrderSuccessPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [countdown, setCountdown] = useState(5)

  const { orderNumber, totalAmount } = location.state || {}

  useEffect(() => {
    if (!orderNumber) {
      navigate('/', { replace: true })
    }
  }, [orderNumber, navigate])

  useEffect(() => {
    if (!orderNumber) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/', { replace: true })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [orderNumber, navigate])

  if (!orderNumber) return null

  return (
    <div className={styles.container}>
      <div className={styles.icon}>✓</div>
      <h2 className={styles.title}>{t('order.successTitle')}</h2>
      <div className={styles.details}>
        <div className={styles.row}>
          <span className={styles.label}>{t('order.orderNumber')}</span>
          <span className={styles.value}>{orderNumber}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>{t('order.totalAmount')}</span>
          <span className={styles.value}>{formatCurrency(totalAmount)}</span>
        </div>
      </div>
      <p className={styles.countdown}>{t('order.countdown', { seconds: countdown })}</p>
      <Link to="/orders" className={styles.historyLink}>
        {t('order.viewHistory')}
      </Link>
    </div>
  )
}

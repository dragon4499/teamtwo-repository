import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../utils/format'
import styles from './CartBadge.module.css'

function CartBadge({ itemCount, totalAmount, onClick }) {
  const { t } = useTranslation()

  if (itemCount === 0) return null

  return (
    <footer className={styles.bar} aria-live="polite">
      <div className={styles.info}>
        <span className={styles.count}>{t('cart.items', { count: itemCount })}</span>
        <span className={styles.total}>{formatCurrency(totalAmount)}</span>
      </div>
      <button className={styles.button} onClick={onClick}>
        {t('cart.viewCart')}
      </button>
    </footer>
  )
}

export default memo(CartBadge)

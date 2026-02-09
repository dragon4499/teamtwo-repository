import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../utils/format'
import styles from './MenuCard.module.css'

function MenuCard({ menu, quantity, onQuantityChange, disabled = false }) {
  const { t } = useTranslation()
  const isSoldOut = !menu.is_available || disabled

  const handleIncrease = useCallback(() => {
    if (quantity >= 99) return
    onQuantityChange(menu.id, quantity + 1)
  }, [menu.id, quantity, onQuantityChange])

  const handleDecrease = useCallback(() => {
    onQuantityChange(menu.id, quantity - 1)
  }, [menu.id, quantity, onQuantityChange])

  return (
    <article className={`${styles.card} ${isSoldOut ? styles.soldOut : ''}`}>
      <div className={styles.imagePlaceholder} />
      <div className={styles.info}>
        <h3 className={styles.name}>{menu.name}</h3>
        <p className={styles.description}>{menu.description}</p>
        <p className={styles.price}>{formatCurrency(menu.price)}</p>
      </div>
      {isSoldOut ? (
        <div className={styles.soldOutBadge}>{t('menu.soldOut')}</div>
      ) : (
        <div className={styles.quantityControl} aria-label={`${menu.name} 수량 조절`}>
          {quantity > 0 && (
            <>
              <button
                className={styles.quantityBtn}
                onClick={handleDecrease}
                aria-label="수량 감소"
              >
                −
              </button>
              <span className={styles.quantity}>{quantity}</span>
            </>
          )}
          <button
            className={styles.quantityBtn}
            onClick={handleIncrease}
            aria-label="수량 증가"
          >
            +
          </button>
        </div>
      )}
    </article>
  )
}

export default memo(MenuCard)

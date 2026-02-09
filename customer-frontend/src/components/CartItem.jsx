import { memo, useCallback } from 'react'
import { formatCurrency } from '../utils/format'
import styles from './CartItem.module.css'

function CartItem({ item, onQuantityChange, onRemove, editable = true }) {
  const handleIncrease = useCallback(() => {
    if (item.quantity >= 99) return
    onQuantityChange(item.menuId, item.quantity + 1)
  }, [item.menuId, item.quantity, onQuantityChange])

  const handleDecrease = useCallback(() => {
    onQuantityChange(item.menuId, item.quantity - 1)
  }, [item.menuId, item.quantity, onQuantityChange])

  const handleRemove = useCallback(() => {
    onRemove(item.menuId)
  }, [item.menuId, onRemove])

  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <span className={styles.name}>{item.menuName}</span>
        <span className={styles.price}>{formatCurrency(item.price)}</span>
      </div>
      {editable ? (
        <div className={styles.controls}>
          <div className={styles.quantityControl}>
            <button className={styles.qtyBtn} onClick={handleDecrease} aria-label="수량 감소">
              −
            </button>
            <span className={styles.quantity}>{item.quantity}</span>
            <button className={styles.qtyBtn} onClick={handleIncrease} aria-label="수량 증가">
              +
            </button>
          </div>
          <span className={styles.subtotal}>{formatCurrency(item.subtotal)}</span>
          <button className={styles.removeBtn} onClick={handleRemove} aria-label="항목 삭제">
            ✕
          </button>
        </div>
      ) : (
        <div className={styles.controls}>
          <span className={styles.quantity}>{item.quantity}개</span>
          <span className={styles.subtotal}>{formatCurrency(item.subtotal)}</span>
        </div>
      )}
    </div>
  )
}

export default memo(CartItem)

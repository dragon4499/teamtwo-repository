import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Modal.module.css'

function Modal({ isOpen, title, message, onClose, onRetry, retryable = false }) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className={styles.overlay} role="presentation">
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {title && (
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
        )}
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          {retryable && onRetry && (
            <button className={styles.retryButton} onClick={onRetry}>
              {t('common.retry')}
            </button>
          )}
          <button className={styles.closeButton} onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(Modal)

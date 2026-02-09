import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import styles from './TableSetupPage.module.css'

export default function TableSetupPage() {
  const { t } = useTranslation()
  const { setupTable, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [storeId, setStoreId] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState(null)

  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  function validate() {
    const newErrors = {}
    if (!storeId.trim()) newErrors.storeId = t('auth.errorStoreId')
    const num = parseInt(tableNumber, 10)
    if (!tableNumber || isNaN(num) || num < 1) newErrors.tableNumber = t('auth.errorTableNumber')
    if (!password) newErrors.password = t('auth.errorPassword')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    const result = await setupTable(storeId.trim(), parseInt(tableNumber, 10), password)
    if (result.success) {
      navigate('/', { replace: true })
    } else {
      setModalError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('auth.title')}</h1>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="storeId">{t('auth.storeId')}</label>
          <input
            id="storeId"
            className={`${styles.input} ${errors.storeId ? styles.inputError : ''}`}
            type="text"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            placeholder={t('auth.storeIdPlaceholder')}
            disabled={isSubmitting}
          />
          {errors.storeId && <span className={styles.error}>{errors.storeId}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tableNumber">{t('auth.tableNumber')}</label>
          <input
            id="tableNumber"
            className={`${styles.input} ${errors.tableNumber ? styles.inputError : ''}`}
            type="number"
            min="1"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder={t('auth.tableNumberPlaceholder')}
            disabled={isSubmitting}
          />
          {errors.tableNumber && <span className={styles.error}>{errors.tableNumber}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">{t('auth.password')}</label>
          <input
            id="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
            disabled={isSubmitting}
          />
          {errors.password && <span className={styles.error}>{errors.password}</span>}
        </div>
        <button className={styles.submitBtn} type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('auth.submitting') : t('auth.submit')}
        </button>
      </form>
      <Modal
        isOpen={!!modalError}
        title={t('error.server')}
        message={modalError?.message || ''}
        retryable={modalError?.retryable}
        onRetry={() => { setModalError(null); handleSubmit(new Event('submit')) }}
        onClose={() => setModalError(null)}
      />
    </div>
  )
}

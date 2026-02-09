import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import styles from './Toast.module.css'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'error', duration = 3000) => {
    setToasts((prev) => {
      if (prev.some((t) => t.message === message)) return prev
      const id = Date.now()
      return [...prev, { id, message, type, duration }]
    })
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.container}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} role="alert" aria-live="assertive">
      <span>{toast.message}</span>
      <button className={styles.closeBtn} onClick={() => onRemove(toast.id)} aria-label="닫기">
        ✕
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

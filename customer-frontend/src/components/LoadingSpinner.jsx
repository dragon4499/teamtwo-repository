import styles from './LoadingSpinner.module.css'

export default function LoadingSpinner() {
  return (
    <div className={styles.container} aria-label="로딩 중">
      <div className={styles.spinner} />
    </div>
  )
}

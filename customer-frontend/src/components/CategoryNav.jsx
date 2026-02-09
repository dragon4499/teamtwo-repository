import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './CategoryNav.module.css'

function CategoryNav({ categories, selectedCategory, onSelect }) {
  const { t } = useTranslation()

  return (
    <nav className={styles.nav} aria-label="카테고리 네비게이션">
      <ul className={styles.list}>
        <li>
          <button
            className={`${styles.item} ${selectedCategory === null ? styles.active : ''}`}
            onClick={() => onSelect(null)}
            aria-current={selectedCategory === null ? 'true' : undefined}
          >
            {t('menu.allCategories')}
          </button>
        </li>
        {categories.map((category) => (
          <li key={category}>
            <button
              className={`${styles.item} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => onSelect(category)}
              aria-current={selectedCategory === category ? 'true' : undefined}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default memo(CategoryNav)

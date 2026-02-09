/** 카테고리 네비게이션 */
export default function CategoryNav({ categories, selected, onSelect }) {
  return (
    <nav style={{
      display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0', marginBottom: 12
    }}>
      <button
        className={!selected ? 'btn-primary' : 'btn-secondary'}
        onClick={() => onSelect(null)}
        style={{ whiteSpace: 'nowrap', fontSize: 13 }}
      >
        전체
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          className={selected === cat ? 'btn-primary' : 'btn-secondary'}
          onClick={() => onSelect(cat)}
          style={{ whiteSpace: 'nowrap', fontSize: 13 }}
        >
          {cat}
        </button>
      ))}
    </nav>
  )
}

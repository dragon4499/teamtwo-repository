/** 메뉴 카드 */
export default function MenuCard({ menu, onAdd }) {
  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{menu.name}</div>
        {menu.description && (
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{menu.description}</div>
        )}
        <div style={{ fontWeight: 700, color: '#2563eb' }}>
          {menu.price.toLocaleString()}원
        </div>
      </div>
      <button
        className="btn-primary"
        onClick={() => onAdd(menu)}
        disabled={!menu.is_available}
        style={{ minWidth: 60 }}
        aria-label={`${menu.name} 장바구니 추가`}
      >
        {menu.is_available ? '담기' : '품절'}
      </button>
    </div>
  )
}

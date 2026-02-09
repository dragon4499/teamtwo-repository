/** 대시보드 테이블 카드 */
export default function TableCard({ table, onClick }) {
  const hasSession = !!table.current_session
  return (
    <div
      className="card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{ cursor: 'pointer', borderLeft: `4px solid ${hasSession ? '#10b981' : '#d1d5db'}` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>테이블 {table.table_number}</span>
        <span className={`badge ${hasSession ? 'badge-preparing' : ''}`}
          style={!hasSession ? { background: '#f3f4f6', color: '#9ca3af' } : {}}>
          {hasSession ? '사용중' : '비어있음'}
        </span>
      </div>
      {hasSession && (
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
          세션: {table.current_session.session_id}
        </div>
      )}
    </div>
  )
}

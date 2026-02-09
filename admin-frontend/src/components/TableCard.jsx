export default function TableCard({ table, onClick }) {
  const hasSession = !!table.current_session
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`bg-white rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 ${
        hasSession ? 'border-l-emerald-500' : 'border-l-gray-200'
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg text-gray-800">테이블 {table.table_number}</span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          hasSession ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
        }`}>
          {hasSession ? '사용중' : '비어있음'}
        </span>
      </div>
      {hasSession && (
        <div className="text-xs text-gray-500 mt-2 truncate">세션: {table.current_session.session_id}</div>
      )}
    </div>
  )
}

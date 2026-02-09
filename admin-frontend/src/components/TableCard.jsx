export default function TableCard({ table, onClick }) {
  const hasSession = !!table.current_session
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`rounded-xl p-4 cursor-pointer transition-all duration-200 border ${
        hasSession
          ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 hover:shadow-sm'
          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="text-lg font-bold text-slate-800">{table.table_number}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          hasSession ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
        }`}>
          {hasSession ? '사용중' : '빈 테이블'}
        </span>
      </div>
      {hasSession && (
        <div className="text-[11px] text-emerald-600/70 mt-2 truncate font-mono">
          {table.current_session.session_id}
        </div>
      )}
    </div>
  )
}

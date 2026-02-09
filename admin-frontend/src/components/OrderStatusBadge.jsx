const CONFIG = {
  pending: { label: '대기', color: 'bg-amber-100 text-amber-700' },
  preparing: { label: '조리중', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '완료', color: 'bg-emerald-100 text-emerald-700' },
}

export default function OrderStatusBadge({ status }) {
  const cfg = CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-500' }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

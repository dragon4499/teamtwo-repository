const LABELS = { pending: '대기중', preparing: '준비중', completed: '완료' }
const STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  preparing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STYLES[status] || 'bg-gray-100 text-gray-500'}`}>
      {LABELS[status] || status}
    </span>
  )
}

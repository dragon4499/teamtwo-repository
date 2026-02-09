const LABELS = { pending: '대기중', preparing: '준비중', completed: '완료' }
const CLASSES = { pending: 'badge-pending', preparing: 'badge-preparing', completed: 'badge-completed' }

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`badge ${CLASSES[status] || ''}`}>
      {LABELS[status] || status}
    </span>
  )
}

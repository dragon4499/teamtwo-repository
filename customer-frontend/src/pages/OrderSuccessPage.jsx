import { useLocation, useNavigate } from 'react-router-dom'

export default function OrderSuccessPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const order = state?.order

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <h1>주문 완료</h1>
      {order && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 14, color: '#6b7280' }}>주문번호</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{order.order_number}</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>금액</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#2563eb' }}>
            {order.total_amount?.toLocaleString()}원
          </div>
        </div>
      )}
      <button className="btn-primary" onClick={() => navigate('/menu')} style={{ width: '100%', marginTop: 16 }}>
        메뉴로 돌아가기
      </button>
    </div>
  )
}

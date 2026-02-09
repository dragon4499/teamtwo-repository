import { useLocation, useNavigate } from 'react-router-dom'

export default function OrderSuccessPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const order = state?.order

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">주문 완료</h1>

        {order && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-4">
            <div className="text-sm text-gray-500">주문번호</div>
            <div className="text-xl font-bold text-gray-800 mt-1">{order.order_number}</div>
            <div className="text-sm text-gray-500 mt-4">금액</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {order.total_amount?.toLocaleString()}원
            </div>
          </div>
        )}

        <button onClick={() => navigate('/menu')}
          className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
          메뉴로 돌아가기
        </button>
      </div>
    </div>
  )
}

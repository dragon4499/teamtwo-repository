import { useLocation, useNavigate } from 'react-router-dom'

export default function OrderSuccessPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const order = state?.order

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center animate-scale-in">
        {/* 성공 아이콘 */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-slate-800 mb-1">주문이 접수되었습니다</h1>
        <p className="text-sm text-slate-400">조리가 시작되면 알려드릴게요</p>

        {order && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mt-6 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-50">
              <span className="text-xs text-slate-400">주문번호</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{order.order_number}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-xs text-slate-400">결제 금액</span>
              <span className="text-lg font-bold text-slate-900">{order.total_amount?.toLocaleString()}<span className="text-sm font-normal text-slate-400">원</span></span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate('/orders')}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-medium hover:bg-slate-50 transition">
            주문 내역
          </button>
          <button onClick={() => navigate('/menu')}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-slate-900/15 transition-all active:scale-[0.98]">
            추가 주문
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

const STATUS_CONFIG = {
  pending: { label: '접수됨', color: 'bg-amber-100 text-amber-700', icon: '⏳', waitMin: 15 },
  preparing: { label: '조리중', color: 'bg-blue-100 text-blue-700', icon: '👨‍🍳', waitMin: 8 },
  completed: { label: '완료', color: 'bg-emerald-100 text-emerald-700', icon: '✅', waitMin: 0 },
}

export default function OrderHistoryPage() {
  const { auth } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    if (!auth) return
    setLoading(true)
    api.getSessionOrders(auth.storeId, auth.session_id)
      .then(setOrders).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [auth])

  // 30초마다 자동 새로고침
  useEffect(() => {
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [auth])

  const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0)
  const activeOrders = orders.filter(o => o.status !== 'completed')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center">
            <button onClick={() => navigate('/menu')} className="mr-3 text-slate-400 hover:text-slate-600 transition" aria-label="뒤로가기">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-base font-bold text-slate-800">주문 내역</h1>
          </div>
          <button onClick={load} className="text-xs text-slate-400 hover:text-slate-600 transition">새로고침</button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
        {/* 요약 */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-400">이번 방문 총 주문</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{totalSpent.toLocaleString()}<span className="text-sm font-normal text-slate-400">원</span></div>
            </div>
            <span className="text-xs text-slate-400">{orders.length}건</span>
          </div>
        )}

        {/* 진행중 주문 예상 대기시간 */}
        {activeOrders.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 mb-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">⏱️</span>
              <span className="text-sm font-semibold text-blue-800">예상 대기시간</span>
            </div>
            <div className="flex gap-3">
              {activeOrders.map(o => {
                const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending
                return (
                  <div key={o.id} className="bg-white/70 rounded-xl px-3 py-2 flex-1">
                    <div className="text-[11px] text-slate-400 font-mono">#{o.order_number?.split('-')[1]}</div>
                    <div className="text-sm font-bold text-blue-700 mt-0.5">약 {cfg.waitMin}분</div>
                    <div className="text-[11px] text-slate-500">{cfg.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse-soft">
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-slate-50 rounded w-full mb-2" />
                <div className="h-3 bg-slate-50 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-slate-400 text-sm mb-6">아직 주문 내역이 없습니다</p>
            <button onClick={() => navigate('/menu')}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition active:scale-95">
              메뉴 보기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                  <div className="px-5 py-3.5 flex justify-between items-center border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{cfg.icon}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">#{order.order_number?.split('-')[1]}</span>
                  </div>
                  <div className="px-5 py-3 space-y-1.5">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.menu_name} <span className="text-slate-300">×{item.quantity}</span></span>
                        <span className="text-slate-500">{item.subtotal?.toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 bg-slate-50/50 flex justify-between items-center">
                    <span className="text-xs text-slate-400">합계</span>
                    <span className="font-bold text-slate-800 text-sm">{order.total_amount?.toLocaleString()}원</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

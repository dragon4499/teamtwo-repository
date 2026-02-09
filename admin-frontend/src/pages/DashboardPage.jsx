import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { useOrders } from '../contexts/OrderContext'
import { adminApi } from '../services/api'
import TableCard from '../components/TableCard'
import OrderStatusBadge from '../components/OrderStatusBadge'

export default function DashboardPage() {
  const { auth } = useAdminAuth()
  const { orders: realtimeOrders } = useOrders()
  const [tables, setTables] = useState([])
  const [settlement, setSettlement] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    if (!auth?.storeId) return
    Promise.all([
      adminApi.getTables(auth.storeId),
      adminApi.getSettlement(auth.storeId).catch(() => null),
    ]).then(([t, s]) => {
      setTables(t)
      setSettlement(s)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [auth?.storeId])

  const activeTables = tables.filter(t => t.current_session)
  const pendingOrders = realtimeOrders.filter(o => o.status === 'pending')
  const preparingOrders = realtimeOrders.filter(o => o.status === 'preparing')

  const stats = [
    { label: '오늘 매출', value: settlement ? `${(settlement.total_revenue || 0).toLocaleString()}원` : '-', icon: '💰', bg: 'bg-blue-50 text-blue-700' },
    { label: '총 주문', value: settlement ? `${settlement.total_orders || 0}건` : '-', icon: '📋', bg: 'bg-emerald-50 text-emerald-700' },
    { label: '대기 주문', value: `${pendingOrders.length}건`, icon: '⏳', bg: pendingOrders.length > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500' },
    { label: '사용중 테이블', value: `${activeTables.length}/${tables.length}`, icon: '🪑', bg: 'bg-purple-50 text-purple-700' },
  ]

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">대시보드</h1>
          <p className="text-xs text-slate-400 mt-0.5">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
        </div>
        <button onClick={load}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-medium border border-slate-200 transition">
          🔄 새로고침
        </button>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.bg} animate-scale-in`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{s.icon}</span>
              <span className="text-xs font-medium opacity-70">{s.label}</span>
            </div>
            <div className="text-xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 실시간 주문 피드 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800">실시간 주문</h2>
              <span className="text-xs text-slate-400">{realtimeOrders.length}건</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {realtimeOrders.length === 0 ? (
                <div className="px-5 py-10 text-center text-slate-300 text-sm">대기중인 주문 없음</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {realtimeOrders.slice(0, 20).map(order => (
                    <div key={order.id} className="px-5 py-3 hover:bg-slate-50/50 transition animate-fade-in">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-mono text-slate-400">#{order.order_number?.split('-')[1]}</span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">T{order.table_number} · {order.items?.length}개 메뉴</span>
                        <span className="text-xs font-semibold text-slate-700">{order.total_amount?.toLocaleString()}원</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 테이블 현황 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800">테이블 현황</h2>
              <span className="text-xs text-slate-400">{activeTables.length}개 사용중</span>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse-soft" />
                  ))}
                </div>
              ) : tables.length === 0 ? (
                <div className="py-10 text-center text-slate-300 text-sm">등록된 테이블이 없습니다</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tables.map(t => (
                    <TableCard key={t.id} table={t} onClick={() => navigate(`/tables/${t.table_number}`)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

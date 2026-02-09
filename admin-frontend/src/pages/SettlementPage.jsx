import { useEffect, useState } from 'react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { adminApi } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

function formatWon(v) { return v != null ? v.toLocaleString() + '원' : '0원' }

export default function SettlementPage() {
  const { auth } = useAdminAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = () => {
    setLoading(true)
    adminApi.getSettlement(auth.storeId, dateFrom || undefined, dateTo || undefined)
      .then(setData).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { if (auth?.storeId) load() }, [auth?.storeId])

  if (loading) return <div className="flex justify-center items-center min-h-screen"><p className="text-gray-400">로딩 중...</p></div>

  const stats = [
    { label: '총 매출', value: formatWon(data?.total_revenue), icon: '💰', color: 'bg-blue-50 text-blue-700' },
    { label: '총 주문', value: `${data?.total_orders || 0}건`, icon: '📋', color: 'bg-emerald-50 text-emerald-700' },
    { label: '평균 주문액', value: formatWon(data?.avg_order_amount), icon: '📊', color: 'bg-amber-50 text-amber-700' },
    { label: '완료 매출', value: formatWon(data?.completed_revenue), icon: '✅', color: 'bg-green-50 text-green-700' },
  ]

  const statusStats = [
    { label: '대기', count: data?.pending_orders || 0, color: 'text-amber-600' },
    { label: '준비중', count: data?.preparing_orders || 0, color: 'text-blue-600' },
    { label: '완료', count: data?.completed_orders || 0, color: 'text-green-600' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">💳 정산</h1>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label htmlFor="df" className="block text-xs font-medium text-gray-500 mb-1">시작일</label>
            <input id="df" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label htmlFor="dt" className="block text-xs font-medium text-gray-500 mb-1">종료일</label>
            <input id="dt" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={load}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition active:scale-95">
            조회
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-sm font-medium opacity-80">{s.label}</div>
            <div className="text-xl font-bold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">주문 상태 현황</h2>
          <div className="flex gap-6 mt-4">
            {statusStats.map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">테이블별 매출</h2>
          {data?.table_revenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.table_revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="table_number" tick={{ fontSize: 12 }} tickFormatter={v => `T${v}`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => formatWon(v)} labelFormatter={v => `테이블 ${v}`} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {data.table_revenue.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">데이터 없음</p>
          )}
        </div>
      </div>
    </div>
  )
}

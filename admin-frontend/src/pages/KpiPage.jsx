import { useEffect, useState } from 'react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { adminApi } from '../services/api'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const PERIODS = [
  { value: 'hourly', label: '시간대별' },
  { value: 'daily', label: '일별' },
  { value: 'weekly', label: '주별' },
  { value: 'monthly', label: '월별' },
]

function formatWon(v) { return v != null ? v.toLocaleString() + '원' : '0원' }

export default function KpiPage() {
  const { auth } = useAdminAuth()
  const [period, setPeriod] = useState('daily')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth?.storeId) return
    setLoading(true)
    adminApi.getKpi(auth.storeId, period)
      .then(res => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [auth?.storeId, period])

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = data.reduce((s, d) => s + d.orders, 0)
  const totalItems = data.reduce((s, d) => s + d.items, 0)
  const avgRevenue = data.length ? Math.round(totalRevenue / data.length) : 0

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-800">📈 KPI 대시보드</h1>
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === p.value ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="text-sm opacity-80">총 매출</div>
          <div className="text-xl font-bold mt-1">{formatWon(totalRevenue)}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="text-sm opacity-80">총 주문</div>
          <div className="text-xl font-bold mt-1">{totalOrders}건</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
          <div className="text-sm opacity-80">총 판매 수량</div>
          <div className="text-xl font-bold mt-1">{totalItems}개</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="text-sm opacity-80">기간 평균 매출</div>
          <div className="text-xl font-bold mt-1">{formatWon(avgRevenue)}</div>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12 text-gray-400">로딩 중...</p>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>해당 기간에 주문 데이터가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">매출 추이</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => formatWon(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRev)" name="매출" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">주문 건수</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} name="주문 수" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">판매 수량</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="items" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="수량" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

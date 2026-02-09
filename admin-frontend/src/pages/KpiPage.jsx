import { useEffect, useState, useMemo } from 'react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { adminApi } from '../services/api'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const PERIODS = [
  { value: 'hourly', label: '시간대별', maxTicks: 12 },
  { value: 'daily', label: '일별', maxTicks: 15 },
  { value: 'weekly', label: '주별', maxTicks: 12 },
  { value: 'monthly', label: '월별', maxTicks: 12 },
]

function formatWon(v) { return v != null ? v.toLocaleString() + '원' : '0원' }
function formatK(v) { return v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl text-xs">
      <p className="text-slate-300 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold">{p.name}: {p.name === '매출' ? formatWon(p.value) : p.value.toLocaleString()}</p>
      ))}
    </div>
  )
}

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

  const periodCfg = PERIODS.find(p => p.value === period)

  // 데이터가 너무 많으면 간격을 두고 tick 표시
  const tickInterval = useMemo(() => {
    if (!data.length || !periodCfg) return 0
    return Math.max(0, Math.ceil(data.length / periodCfg.maxTicks) - 1)
  }, [data.length, periodCfg])

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = data.reduce((s, d) => s + d.orders, 0)
  const totalItems = data.reduce((s, d) => s + d.items, 0)
  const avgRevenue = data.length ? Math.round(totalRevenue / data.length) : 0

  const kpiCards = [
    { label: '총 매출', value: formatWon(totalRevenue), gradient: 'from-blue-500 to-blue-600' },
    { label: '총 주문', value: `${totalOrders.toLocaleString()}건`, gradient: 'from-emerald-500 to-emerald-600' },
    { label: '총 판매 수량', value: `${totalItems.toLocaleString()}개`, gradient: 'from-amber-500 to-amber-600' },
    { label: '기간 평균 매출', value: formatWon(avgRevenue), gradient: 'from-purple-500 to-purple-600' },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-800">📈 KPI 대시보드</h1>
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === p.value ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.gradient} rounded-2xl p-5 text-white`}>
            <div className="text-sm opacity-80">{c.label}</div>
            <div className="text-xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-5 h-[340px] animate-pulse-soft" />
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-5 h-[290px] animate-pulse-soft" />
            <div className="bg-white rounded-2xl shadow-sm p-5 h-[290px] animate-pulse-soft" />
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-slate-400">
          <p className="text-4xl mb-3">📭</p>
          <p>해당 기간에 주문 데이터가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 매출 추이 - Area Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-5">매출 추이</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={tickInterval} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={formatK} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorRev)" name="매출" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 주문 건수 - Bar Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5">주문 건수</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={tickInterval} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="주문 수" maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 판매 수량 - Bar Chart (Line 대신 Bar로 통일, 가독성 향상) */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5">판매 수량</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={tickInterval} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="items" fill="#f59e0b" radius={[4, 4, 0, 0]} name="수량" maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

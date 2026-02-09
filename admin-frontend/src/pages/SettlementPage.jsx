import { useEffect, useState } from 'react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { adminApi } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

function formatWon(v) { return v != null ? v.toLocaleString() + '원' : '0원' }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl text-xs">
      <p className="text-slate-300 mb-1">{label ? `테이블 ${label}` : ''}</p>
      <p className="font-semibold">{formatWon(payload[0]?.value)}</p>
    </div>
  )
}

export default function SettlementPage() {
  const { auth } = useAdminAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [dailyTarget, setDailyTarget] = useState(() => {
    try { return Number(localStorage.getItem('daily_target')) || 0 } catch { return 0 }
  })
  const [editTarget, setEditTarget] = useState(false)
  const [targetInput, setTargetInput] = useState('')

  const load = () => {
    setLoading(true)
    adminApi.getSettlement(auth.storeId, dateFrom || undefined, dateTo || undefined)
      .then(setData).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { if (auth?.storeId) load() }, [auth?.storeId])

  const saveTarget = () => {
    const val = Number(targetInput) || 0
    setDailyTarget(val)
    try { localStorage.setItem('daily_target', String(val)) } catch {}
    setEditTarget(false)
  }

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><p className="text-slate-400">로딩 중...</p></div>

  const revenue = data?.total_revenue || 0
  const targetPct = dailyTarget > 0 ? Math.min(100, Math.round((revenue / dailyTarget) * 100)) : null

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
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-800 mb-6">💳 정산</h1>

      {/* 기간 필터 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label htmlFor="df" className="block text-xs font-medium text-slate-500 mb-1">시작일</label>
            <input id="df" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label htmlFor="dt" className="block text-xs font-medium text-slate-500 mb-1">종료일</label>
            <input id="dt" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={load}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition active:scale-95">
            조회
          </button>
        </div>
      </div>

      {/* 매출 목표 달성률 */}
      {dailyTarget > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-indigo-800">🎯 일일 매출 목표</span>
            <span className="text-xs text-indigo-500">{formatWon(revenue)} / {formatWon(dailyTarget)}</span>
          </div>
          <div className="w-full bg-white/60 rounded-full h-4 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${targetPct >= 100 ? 'bg-emerald-500' : targetPct >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
              style={{ width: `${targetPct}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-sm font-bold ${targetPct >= 100 ? 'text-emerald-600' : 'text-indigo-700'}`}>
              {targetPct}% {targetPct >= 100 ? '🎉 달성!' : ''}
            </span>
            <button onClick={() => { setTargetInput(String(dailyTarget)); setEditTarget(true) }}
              className="text-xs text-indigo-400 hover:text-indigo-600 transition">수정</button>
          </div>
        </div>
      )}

      {/* 목표 설정 (미설정 또는 편집 모드) */}
      {(dailyTarget === 0 || editTarget) && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">🎯 일일 매출 목표 설정</h3>
          <div className="flex gap-2">
            <input type="number" value={targetInput} onChange={e => setTargetInput(e.target.value)}
              placeholder="예: 500000" min="0" step="10000"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={saveTarget}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition">저장</button>
            {editTarget && (
              <button onClick={() => setEditTarget(false)}
                className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium transition">취소</button>
            )}
          </div>
        </div>
      )}

      {/* KPI 카드 */}
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
          <h2 className="text-base font-semibold text-slate-800 mb-1">주문 상태 현황</h2>
          <div className="flex gap-6 mt-4">
            {statusStats.map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-3">테이블별 매출</h2>
          {data?.table_revenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.table_revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="table_number" tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `T${v}`} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {data.table_revenue.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm py-8 text-center">데이터 없음</p>
          )}
        </div>
      </div>
    </div>
  )
}

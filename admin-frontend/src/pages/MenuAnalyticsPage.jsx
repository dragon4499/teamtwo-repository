import { useEffect, useState } from 'react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { adminApi } from '../services/api'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
const STRATEGY_ICONS = { upsell: '🚀', optimize: '🔧', balance: '⚖️', warning: '⚠️', pricing: '💲', info: 'ℹ️' }
const STRATEGY_COLORS = {
  upsell: 'border-blue-200 bg-blue-50',
  optimize: 'border-amber-200 bg-amber-50',
  balance: 'border-purple-200 bg-purple-50',
  warning: 'border-red-200 bg-red-50',
  pricing: 'border-emerald-200 bg-emerald-50',
  info: 'border-gray-200 bg-gray-50',
}

function formatWon(v) { return v != null ? v.toLocaleString() + '원' : '0원' }

export default function MenuAnalyticsPage() {
  const { auth } = useAdminAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth?.storeId) return
    adminApi.getMenuAnalytics(auth.storeId)
      .then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [auth?.storeId])

  if (loading) return <div className="flex justify-center items-center min-h-screen"><p className="text-gray-400">로딩 중...</p></div>

  const hasData = data?.rankings?.length > 0

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🍽️ 메뉴 분석 &amp; 판매 전략</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-sm text-gray-500">전체 메뉴</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{data?.total_menu_count || 0}개</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-sm text-gray-500">판매된 메뉴</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{data?.sold_menu_count || 0}개</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-sm text-gray-500">미판매 메뉴</div>
          <div className="text-2xl font-bold text-red-500 mt-1">{(data?.total_menu_count || 0) - (data?.sold_menu_count || 0)}개</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-sm text-gray-500">카테고리 수</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{data?.category_sales?.length || 0}개</div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>주문 데이터가 쌓이면 분석 결과가 표시됩니다</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">🏆 인기 메뉴 TOP 5</h2>
              <div className="space-y-2 mt-3">
                {data.popular.map((m, i) => (
                  <div key={m.menu_id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{m.menu_name}</div>
                      <div className="text-xs text-gray-500">{m.category} · {m.quantity}개 판매</div>
                    </div>
                    <div className="text-sm font-bold text-blue-600">{formatWon(m.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">📉 저성과 메뉴</h2>
              <div className="space-y-2 mt-3">
                {data.unpopular.map((m, i) => (
                  <div key={m.menu_id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50/50">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-red-100 text-red-600">
                      {data.rankings.length - data.unpopular.length + i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{m.menu_name}</div>
                      <div className="text-xs text-gray-500">{m.category} · {m.quantity}개 판매</div>
                    </div>
                    <div className="text-sm font-bold text-red-500">{formatWon(m.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">카테고리별 매출</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data.category_sales} dataKey="revenue" nameKey="category"
                    cx="50%" cy="50%" outerRadius={100} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ strokeWidth: 1 }}>
                    {data.category_sales.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatWon(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">메뉴별 매출 순위</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.rankings.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="menu_name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip formatter={v => formatWon(v)} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]} name="매출">
                    {data.rankings.slice(0, 10).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">🎯 판매 전략 추천</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.strategies?.map((s, i) => (
                <div key={i} className={`border rounded-xl p-4 ${STRATEGY_COLORS[s.type] || STRATEGY_COLORS.info}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{STRATEGY_ICONS[s.type] || 'ℹ️'}</span>
                    <span className="font-semibold text-gray-800">{s.title}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{s.description}</p>
                  <p className="text-xs text-gray-500 bg-white/60 rounded-lg px-3 py-2">📊 {s.evidence}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

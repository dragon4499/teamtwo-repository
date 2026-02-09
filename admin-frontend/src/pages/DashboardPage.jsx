import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { adminApi } from '../services/api'
import TableCard from '../components/TableCard'

export default function DashboardPage() {
  const { auth } = useAdminAuth()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth?.storeId) return
    adminApi.getTables(auth.storeId).then(setTables).catch(() => {}).finally(() => setLoading(false))
  }, [auth?.storeId])

  const refresh = () => { adminApi.getTables(auth.storeId).then(setTables).catch(() => {}) }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">주문 대시보드</h1>
        <button onClick={refresh}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium border border-gray-200 shadow-sm transition">
          🔄 새로고침
        </button>
      </div>

      {loading && <p className="text-center py-8 text-gray-400">로딩 중...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map(t => (
          <TableCard key={t.id} table={t} onClick={() => navigate(`/tables/${t.table_number}`)} />
        ))}
      </div>

      {!loading && tables.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🪑</div>
          <p className="text-gray-400">등록된 테이블이 없습니다. 테이블 관리에서 추가해주세요.</p>
        </div>
      )}
    </div>
  )
}

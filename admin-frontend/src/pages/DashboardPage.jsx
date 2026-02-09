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
    adminApi.getTables(auth.storeId)
      .then(setTables)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [auth?.storeId])

  const refresh = () => {
    adminApi.getTables(auth.storeId).then(setTables).catch(() => {})
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>주문 대시보드</h1>
        <button className="btn-secondary" onClick={refresh}>새로고침</button>
      </div>

      {loading && <p>로딩 중...</p>}

      <div className="grid">
        {tables.map(t => (
          <TableCard
            key={t.id}
            table={t}
            onClick={() => navigate(`/tables/${t.table_number}`)}
          />
        ))}
      </div>

      {!loading && tables.length === 0 && (
        <p style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          등록된 테이블이 없습니다. 테이블 관리에서 추가해주세요.
        </p>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { adminApi } from '../services/api'

export default function TableManagementPage() {
  const { auth } = useAdminAuth()
  const [tables, setTables] = useState([])
  const [newNum, setNewNum] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const load = () => {
    adminApi.getTables(auth.storeId).then(setTables).catch(e => setError(e.message))
  }

  useEffect(() => { if (auth?.storeId) load() }, [auth?.storeId])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      setError(''); setMsg('')
      await adminApi.createTable(auth.storeId, Number(newNum), newPwd)
      setNewNum(''); setNewPwd('')
      setMsg('테이블이 생성되었습니다')
      load()
    } catch (e) { setError(e.message) }
  }

  const handleStartSession = async (tableNum) => {
    try {
      setError(''); setMsg('')
      await adminApi.startSession(auth.storeId, tableNum)
      setMsg(`테이블 ${tableNum} 세션이 시작되었습니다`)
      load()
    } catch (e) { setError(e.message) }
  }

  const handleEndSession = async (tableNum) => {
    if (!confirm(`테이블 ${tableNum} 세션을 종료하시겠습니까?`)) return
    try {
      setError(''); setMsg('')
      await adminApi.endSession(auth.storeId, tableNum)
      setMsg(`테이블 ${tableNum} 세션이 종료되었습니다`)
      load()
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="container">
      <h1>테이블 관리</h1>

      {error && <div className="error-msg">{error}</div>}
      {msg && <div className="card" style={{ background: '#f0fdf4', color: '#16a34a' }}>{msg}</div>}

      <div className="card">
        <h2>새 테이블 추가</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="tNum">번호</label>
            <input id="tNum" type="number" min="1" value={newNum} onChange={e => setNewNum(e.target.value)} required />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="tPwd">비밀번호</label>
            <input id="tPwd" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ marginBottom: 10 }}>추가</button>
        </form>
      </div>

      {tables.map(t => (
        <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 600 }}>테이블 {t.table_number}</span>
            {t.current_session && (
              <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>
                세션: {t.current_session.session_id}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {!t.current_session ? (
              <button className="btn-success" onClick={() => handleStartSession(t.table_number)} style={{ fontSize: 13 }}>
                세션 시작
              </button>
            ) : (
              <button className="btn-danger" onClick={() => handleEndSession(t.table_number)} style={{ fontSize: 13 }}>
                세션 종료
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

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

  const load = () => { adminApi.getTables(auth.storeId).then(setTables).catch(e => setError(e.message)) }
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
    <div className="max-w-4xl mx-auto px-6 py-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">테이블 관리</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
      {msg && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm">{msg}</div>}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">새 테이블 추가</h2>
        <form onSubmit={handleCreate} className="flex gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="tNum" className="block text-sm font-medium text-gray-700 mb-1">번호</label>
            <input id="tNum" type="number" min="1" value={newNum} onChange={e => setNewNum(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <div className="flex-1">
            <label htmlFor="tPwd" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input id="tPwd" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <button type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all active:scale-95">
            추가
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {tables.map(t => (
          <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <span className="font-semibold text-gray-800">테이블 {t.table_number}</span>
              {t.current_session && (
                <span className="text-xs text-gray-500 ml-2">세션: {t.current_session.session_id}</span>
              )}
            </div>
            <div className="flex gap-2">
              {!t.current_session ? (
                <button onClick={() => handleStartSession(t.table_number)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition active:scale-95">
                  세션 시작
                </button>
              ) : (
                <button onClick={() => handleEndSession(t.table_number)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition active:scale-95">
                  세션 종료
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

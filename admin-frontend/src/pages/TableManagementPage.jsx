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
    try { setError(''); await adminApi.startSession(auth.storeId, tableNum); setMsg(`테이블 ${tableNum} 세션 시작`); load() }
    catch (e) { setError(e.message) }
  }

  const handleEndSession = async (tableNum) => {
    if (!confirm(`테이블 ${tableNum} 세션을 종료하시겠습니까?`)) return
    try { setError(''); await adminApi.endSession(auth.storeId, tableNum); setMsg(`테이블 ${tableNum} 세션 종료`); load() }
    catch (e) { setError(e.message) }
  }

  const inputClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition"

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-slate-800 mb-6">테이블 관리</h1>

      {error && <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl mb-4 text-sm animate-scale-in">{error}</div>}
      {msg && <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-2xl mb-4 text-sm animate-scale-in">{msg}</div>}

      {/* 새 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
        <h2 className="text-sm font-bold text-slate-800 mb-4">새 테이블 추가</h2>
        <form onSubmit={handleCreate} className="flex gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="tNum" className="block text-xs font-medium text-slate-500 mb-1">번호</label>
            <input id="tNum" type="number" min="1" value={newNum} onChange={e => setNewNum(e.target.value)} required className={inputClass} />
          </div>
          <div className="flex-1">
            <label htmlFor="tPwd" className="block text-xs font-medium text-slate-500 mb-1">비밀번호</label>
            <input id="tPwd" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required className={inputClass} />
          </div>
          <button type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition active:scale-95">
            추가
          </button>
        </form>
      </div>

      {/* 테이블 목록 */}
      <div className="space-y-2">
        {tables.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-slate-100 p-4 flex justify-between items-center hover:border-slate-200 transition">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                t.current_session ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
              }`}>{t.table_number}</div>
              <div>
                <span className="text-sm font-medium text-slate-800">테이블 {t.table_number}</span>
                {t.current_session && (
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{t.current_session.session_id}</div>
                )}
              </div>
            </div>
            <div>
              {!t.current_session ? (
                <button onClick={() => handleStartSession(t.table_number)}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-semibold transition">
                  세션 시작
                </button>
              ) : (
                <button onClick={() => handleEndSession(t.table_number)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-semibold transition">
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

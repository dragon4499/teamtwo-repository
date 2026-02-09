import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'

export default function LoginPage() {
  const [storeId, setStoreId] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, error } = useAdminAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(storeId, username, password)
    setLoading(false)
    if (ok) navigate('/dashboard')
  }

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition"

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 좌측 브랜딩 */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-8">🏪</div>
          <h2 className="text-3xl font-bold text-white leading-tight">Table Order<br />관리 시스템</h2>
          <p className="text-slate-400 mt-4 leading-relaxed text-sm">실시간 주문 관리, 매출 분석, KPI 대시보드를 통해 매장을 효율적으로 운영하세요.</p>
          <div className="flex gap-6 mt-10">
            <div><div className="text-2xl font-bold text-white">실시간</div><div className="text-xs text-slate-500 mt-1">주문 모니터링</div></div>
            <div><div className="text-2xl font-bold text-white">KPI</div><div className="text-xs text-slate-500 mt-1">매출 분석</div></div>
            <div><div className="text-2xl font-bold text-white">AI</div><div className="text-xs text-slate-500 mt-1">전략 추천</div></div>
          </div>
        </div>
      </div>

      {/* 우측 로그인 폼 */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🏪</div>
            <h1 className="text-xl font-bold text-slate-800">관리자 로그인</h1>
          </div>
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-slate-800">로그인</h1>
            <p className="text-sm text-slate-400 mt-1">관리자 계정으로 접속하세요</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="storeId" className="block text-xs font-medium text-slate-500 mb-1.5">매장 코드</label>
              <input id="storeId" value={storeId} onChange={e => setStoreId(e.target.value)} placeholder="store001" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="user" className="block text-xs font-medium text-slate-500 mb-1.5">사용자명</label>
              <input id="user" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="pwd" className="block text-xs font-medium text-slate-500 mb-1.5">비밀번호</label>
              <input id="pwd" type="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-slate-900/10 active:scale-[0.98]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  접속 중...
                </span>
              ) : '로그인'}
            </button>
          </form>
          <p className="text-center text-xs text-slate-300 mt-8">Powered by Table Order System</p>
        </div>
      </div>
    </div>
  )
}

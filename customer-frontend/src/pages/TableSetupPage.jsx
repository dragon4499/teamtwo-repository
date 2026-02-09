import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function TableSetupPage() {
  const [storeId, setStoreId] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(storeId, Number(tableNumber), password)
    setLoading(false)
    if (ok) navigate('/menu')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4">
      {/* 브랜딩 */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl">
          <span className="text-4xl">🍽️</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Table Order</h1>
        <p className="text-slate-400 mt-2 text-sm">테이블에서 바로 주문하세요</p>
      </div>

      {error && (
        <div className="w-full max-w-sm mb-4 animate-scale-in">
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-2xl text-sm text-center">
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-sm animate-slide-up">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div>
            <label htmlFor="storeId" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">매장 코드</label>
            <input id="storeId" value={storeId} onChange={e => setStoreId(e.target.value)}
              placeholder="store001" required autoComplete="off"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition text-sm" />
          </div>
          <div>
            <label htmlFor="tableNum" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">테이블 번호</label>
            <input id="tableNum" type="number" min="1" value={tableNumber} onChange={e => setTableNumber(e.target.value)}
              placeholder="1" required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition text-sm" />
          </div>
          <div>
            <label htmlFor="pwd" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">비밀번호</label>
            <input id="pwd" type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition text-sm" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30 active:scale-[0.98] text-sm">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              접속 중...
            </span>
          ) : '주문 시작하기'}
        </button>
      </form>

      <p className="text-slate-600 text-xs mt-8">Powered by Table Order System</p>
    </div>
  )
}

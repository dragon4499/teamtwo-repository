import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'

export default function LoginPage() {
  const [storeId, setStoreId] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, error } = useAdminAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(storeId, username, password)
    if (ok) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800">관리자 로그인</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1">매장 ID</label>
            <input id="storeId" value={storeId} onChange={e => setStoreId(e.target.value)} placeholder="store001" required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">사용자명</label>
            <input id="user" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label htmlFor="pwd" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input id="pwd" type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <button type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]">
            로그인
          </button>
        </form>
      </div>
    </div>
  )
}

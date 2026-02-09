import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function TableSetupPage() {
  const [storeId, setStoreId] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [password, setPassword] = useState('')
  const { login, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(storeId, Number(tableNumber), password)
    if (ok) navigate('/menu')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-800">테이블오더</h1>
          <p className="text-gray-500 mt-1">테이블 정보를 입력해주세요</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1">매장 ID</label>
            <input id="storeId" value={storeId} onChange={e => setStoreId(e.target.value)}
              placeholder="store001" required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label htmlFor="tableNum" className="block text-sm font-medium text-gray-700 mb-1">테이블 번호</label>
            <input id="tableNum" type="number" min="1" value={tableNumber} onChange={e => setTableNumber(e.target.value)}
              placeholder="1" required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label htmlFor="pwd" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input id="pwd" type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <button type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]">
            시작하기
          </button>
        </form>
      </div>
    </div>
  )
}

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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: 360 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>🔐 관리자 로그인</h1>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="storeId">매장 ID</label>
          <input id="storeId" value={storeId} onChange={e => setStoreId(e.target.value)} placeholder="store001" required />
          <label htmlFor="user">사용자명</label>
          <input id="user" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" required />
          <label htmlFor="pwd">비밀번호</label>
          <input id="pwd" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
            로그인
          </button>
        </form>
      </div>
    </div>
  )
}

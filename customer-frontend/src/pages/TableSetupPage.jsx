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
    <div className="container" style={{ paddingTop: 60 }}>
      <h1 style={{ textAlign: 'center' }}>🍽️ 테이블오더</h1>
      <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 24 }}>
        테이블 정보를 입력해주세요
      </p>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="storeId">매장 ID</label>
        <input id="storeId" value={storeId} onChange={e => setStoreId(e.target.value)} placeholder="store001" required />
        <label htmlFor="tableNum">테이블 번호</label>
        <input id="tableNum" type="number" min="1" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="1" required />
        <label htmlFor="pwd">비밀번호</label>
        <input id="pwd" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
          시작하기
        </button>
      </form>
    </div>
  )
}

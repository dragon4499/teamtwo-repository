import { useEffect, useState } from 'react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { adminApi } from '../services/api'
import MenuForm from '../components/MenuForm'

export default function MenuManagementPage() {
  const { auth } = useAdminAuth()
  const [menus, setMenus] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editMenu, setEditMenu] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    adminApi.getMenus(auth.storeId).then(setMenus).catch(e => setError(e.message))
  }

  useEffect(() => { if (auth?.storeId) load() }, [auth?.storeId])

  const handleCreate = async (data) => {
    try {
      setError('')
      await adminApi.createMenu(auth.storeId, data)
      setShowForm(false)
      load()
    } catch (e) { setError(e.message) }
  }

  const handleUpdate = async (data) => {
    try {
      setError('')
      await adminApi.updateMenu(auth.storeId, editMenu.id, data)
      setEditMenu(null)
      load()
    } catch (e) { setError(e.message) }
  }

  const handleDelete = async (menuId) => {
    if (!confirm('메뉴를 삭제하시겠습니까?')) return
    try {
      await adminApi.deleteMenu(auth.storeId, menuId)
      load()
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>메뉴 관리</h1>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditMenu(null) }}>
          + 메뉴 추가
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showForm && !editMenu && (
        <MenuForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editMenu && (
        <MenuForm
          initial={editMenu}
          onSubmit={handleUpdate}
          onCancel={() => setEditMenu(null)}
        />
      )}

      {menus.map(m => (
        <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>
              {m.name}
              {!m.is_available && <span style={{ color: '#ef4444', fontSize: 12, marginLeft: 6 }}>(품절)</span>}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              {m.category} · {m.price?.toLocaleString()}원
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-secondary" onClick={() => { setEditMenu(m); setShowForm(false) }} style={{ fontSize: 13 }}>
              수정
            </button>
            <button className="btn-danger" onClick={() => handleDelete(m.id)} style={{ fontSize: 13 }}>
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

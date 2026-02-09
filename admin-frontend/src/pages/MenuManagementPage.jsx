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

  const load = () => { adminApi.getMenus(auth.storeId).then(setMenus).catch(e => setError(e.message)) }
  useEffect(() => { if (auth?.storeId) load() }, [auth?.storeId])

  const handleCreate = async (data) => {
    try { setError(''); await adminApi.createMenu(auth.storeId, data); setShowForm(false); load() }
    catch (e) { setError(e.message) }
  }

  const handleUpdate = async (data) => {
    try { setError(''); await adminApi.updateMenu(auth.storeId, editMenu.id, data); setEditMenu(null); load() }
    catch (e) { setError(e.message) }
  }

  const handleDelete = async (menuId) => {
    if (!confirm('메뉴를 삭제하시겠습니까?')) return
    try { await adminApi.deleteMenu(auth.storeId, menuId); load() }
    catch (e) { setError(e.message) }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">메뉴 관리</h1>
        <button onClick={() => { setShowForm(true); setEditMenu(null) }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all active:scale-95">
          + 메뉴 추가
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

      {showForm && !editMenu && <MenuForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
      {editMenu && <MenuForm initial={editMenu} onSubmit={handleUpdate} onCancel={() => setEditMenu(null)} />}

      <div className="space-y-3">
        {menus.map(m => (
          <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <div className="font-semibold text-gray-800">
                {m.name}
                {!m.is_available && <span className="text-red-500 text-xs ml-2">(품절)</span>}
              </div>
              <div className="text-sm text-gray-500">{m.category} · {m.price?.toLocaleString()}원</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditMenu(m); setShowForm(false) }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition">
                수정
              </button>
              <button onClick={() => handleDelete(m.id)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

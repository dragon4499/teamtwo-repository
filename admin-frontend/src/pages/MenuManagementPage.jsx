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
  const [filter, setFilter] = useState('')

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

  const categories = [...new Set(menus.map(m => m.category))]
  const filtered = filter ? menus.filter(m => m.category === filter) : menus

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">메뉴 관리</h1>
          <p className="text-xs text-slate-400 mt-0.5">{menus.length}개 메뉴</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditMenu(null) }}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition active:scale-95">
          + 메뉴 추가
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl mb-4 text-sm">{error}</div>}

      {showForm && !editMenu && <MenuForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
      {editMenu && <MenuForm initial={editMenu} onSubmit={handleUpdate} onCancel={() => setEditMenu(null)} />}

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        <button onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${!filter ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
          전체
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${filter === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* 메뉴 목록 */}
      <div className="space-y-2">
        {filtered.map(m => (
          <div key={m.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4 hover:border-slate-200 transition">
            {m.image_url ? (
              <img src={m.image_url} alt={m.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0">🍽️</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 truncate">{m.name}</span>
                {!m.is_available && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-500">품절</span>}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{m.category} · {m.price?.toLocaleString()}원</div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => { setEditMenu(m); setShowForm(false) }}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-medium transition">
                수정
              </button>
              <button onClick={() => handleDelete(m.id)}
                className="px-3 py-1.5 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg text-xs font-medium transition">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'

export default function MenuForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: '', price: '', description: '', category: '',
    image_url: '', is_available: true, sort_order: 0,
  })

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, price: Number(form.price), sort_order: Number(form.sort_order) })
  }

  const inputClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition"

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-5 mb-5 animate-scale-in">
      <h3 className="text-sm font-bold text-slate-800 mb-4">{initial ? '메뉴 수정' : '새 메뉴 추가'}</h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="menuName" className="block text-xs font-medium text-slate-500 mb-1">메뉴명</label>
          <input id="menuName" value={form.name} onChange={e => handleChange('name', e.target.value)} required className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="menuPrice" className="block text-xs font-medium text-slate-500 mb-1">가격 (원)</label>
            <input id="menuPrice" type="number" min="0" max="1000000" value={form.price} onChange={e => handleChange('price', e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="menuCat" className="block text-xs font-medium text-slate-500 mb-1">카테고리</label>
            <input id="menuCat" value={form.category} onChange={e => handleChange('category', e.target.value)} required className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="menuDesc" className="block text-xs font-medium text-slate-500 mb-1">설명</label>
          <input id="menuDesc" value={form.description} onChange={e => handleChange('description', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="menuImg" className="block text-xs font-medium text-slate-500 mb-1">이미지 URL</label>
          <input id="menuImg" value={form.image_url} onChange={e => handleChange('image_url', e.target.value)} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.is_available} onChange={e => handleChange('is_available', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          판매 가능
        </label>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit"
          className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition active:scale-95">
          저장
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-sm font-medium transition">
            취소
          </button>
        )}
      </div>
    </form>
  )
}

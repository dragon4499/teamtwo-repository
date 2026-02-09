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

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
      <div>
        <label htmlFor="menuName" className="block text-sm font-medium text-gray-700 mb-1">메뉴명</label>
        <input id="menuName" value={form.name} onChange={e => handleChange('name', e.target.value)} required className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="menuPrice" className="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
          <input id="menuPrice" type="number" min="0" max="1000000" value={form.price} onChange={e => handleChange('price', e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="menuCat" className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <input id="menuCat" value={form.category} onChange={e => handleChange('category', e.target.value)} required className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="menuDesc" className="block text-sm font-medium text-gray-700 mb-1">설명</label>
        <input id="menuDesc" value={form.description} onChange={e => handleChange('description', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="menuImg" className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
        <input id="menuImg" value={form.image_url} onChange={e => handleChange('image_url', e.target.value)} className={inputClass} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.is_available} onChange={e => handleChange('is_available', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        판매 가능
      </label>
      <div className="flex gap-3">
        <button type="submit"
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all active:scale-95">
          저장
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-medium transition">
            취소
          </button>
        )}
      </div>
    </form>
  )
}

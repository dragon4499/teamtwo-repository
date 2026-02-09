import { useState } from 'react'

export default function MenuForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: '', price: '', description: '', category: '',
    image_url: '', is_available: true, sort_order: 0,
  })

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      price: Number(form.price),
      sort_order: Number(form.sort_order),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <label htmlFor="menuName">메뉴명</label>
      <input id="menuName" value={form.name} onChange={e => handleChange('name', e.target.value)} required />

      <label htmlFor="menuPrice">가격 (원)</label>
      <input id="menuPrice" type="number" min="0" max="1000000" value={form.price} onChange={e => handleChange('price', e.target.value)} required />

      <label htmlFor="menuCat">카테고리</label>
      <input id="menuCat" value={form.category} onChange={e => handleChange('category', e.target.value)} required />

      <label htmlFor="menuDesc">설명</label>
      <input id="menuDesc" value={form.description} onChange={e => handleChange('description', e.target.value)} />

      <label htmlFor="menuImg">이미지 URL</label>
      <input id="menuImg" value={form.image_url} onChange={e => handleChange('image_url', e.target.value)} />

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <input type="checkbox" checked={form.is_available} onChange={e => handleChange('is_available', e.target.checked)} />
        판매 가능
      </label>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }}>저장</button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>취소</button>}
      </div>
    </form>
  )
}

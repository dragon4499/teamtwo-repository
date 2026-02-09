import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ storeId: 'store1', isAuthenticated: true }),
}))

vi.mock('../../src/contexts/MenuContext', () => ({
  useMenu: () => ({
    menus: [
      { id: 'm1', name: '김치찌개', price: 9000, description: '매콤', category: '찌개', image_url: '', is_available: true },
      { id: 'm2', name: '불고기', price: 12000, description: '달콤', category: '구이', image_url: '', is_available: true },
    ],
    categories: ['찌개', '구이'],
    isLoading: false,
    error: null,
    fetchMenus: vi.fn(),
    getFilteredMenus: (cat) => {
      const menus = [
        { id: 'm1', name: '김치찌개', price: 9000, description: '매콤', category: '찌개', image_url: '', is_available: true },
        { id: 'm2', name: '불고기', price: 12000, description: '달콤', category: '구이', image_url: '', is_available: true },
      ]
      return cat ? menus.filter((m) => m.category === cat) : menus
    },
  }),
}))

vi.mock('../../src/contexts/CartContext', () => ({
  useCart: () => ({
    getItemQuantity: () => 0,
    addItem: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
  }),
}))

vi.mock('../../src/components/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const map = { 'menu.allCategories': '전체', 'menu.empty': '등록된 메뉴가 없습니다' }
      return map[key] || key
    },
  }),
}))

import MenuPage from '../../src/pages/MenuPage'

describe('MenuPage', () => {
  it('메뉴 카드들을 렌더링한다', () => {
    render(
      <MemoryRouter>
        <MenuPage />
      </MemoryRouter>
    )
    expect(screen.getByText('김치찌개')).toBeInTheDocument()
    expect(screen.getByText('불고기')).toBeInTheDocument()
  })

  it('카테고리 네비게이션을 표시한다', () => {
    render(
      <MemoryRouter>
        <MenuPage />
      </MemoryRouter>
    )
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('찌개')).toBeInTheDocument()
    expect(screen.getByText('구이')).toBeInTheDocument()
  })
})

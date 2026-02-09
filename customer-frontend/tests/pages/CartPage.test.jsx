import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const map = {
        'cart.title': '장바구니',
        'cart.empty': '장바구니가 비어있습니다',
        'cart.goToMenu': '메뉴 보기',
        'cart.clearAll': '장바구니 비우기',
        'cart.order': '주문하기',
        'cart.total': '총',
        'cart.clearConfirm': '장바구니를 비우시겠습니까?',
        'common.close': '닫기',
      }
      return map[key] || key
    },
  }),
}))

const mockItems = [
  { menuId: 'm1', menuName: '김치찌개', price: 9000, quantity: 2, subtotal: 18000 },
]

let cartState = { items: [], totalAmount: 0 }

vi.mock('../../src/contexts/CartContext', () => ({
  useCart: () => ({
    ...cartState,
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  }),
}))

import CartPage from '../../src/pages/CartPage'

describe('CartPage', () => {
  it('빈 장바구니일 때 안내 메시지를 표시한다', () => {
    cartState = { items: [], totalAmount: 0 }
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    )
    expect(screen.getByText('장바구니가 비어있습니다')).toBeInTheDocument()
    expect(screen.getByText('메뉴 보기')).toBeInTheDocument()
  })

  it('항목이 있을 때 장바구니 목록을 표시한다', () => {
    cartState = { items: mockItems, totalAmount: 18000 }
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    )
    expect(screen.getByText('장바구니')).toBeInTheDocument()
    expect(screen.getByText('김치찌개')).toBeInTheDocument()
    expect(screen.getByText('주문하기')).toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      const map = {
        'order.confirmTitle': '주문 확인',
        'order.placeOrder': '주문 확정',
        'order.placing': '주문 중...',
        'order.totalAmount': '총 금액',
        'common.back': '돌아가기',
        'error.server': '서버 오류',
        'order.failRetry': '매장 직원에게 문의해주세요',
      }
      if (key === 'order.tableInfo') return `테이블 ${opts?.number}번`
      return map[key] || key
    },
  }),
}))

const mockItems = [
  { menuId: 'm1', menuName: '김치찌개', price: 9000, quantity: 2, subtotal: 18000 },
]

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ storeId: 'store1', tableNumber: 3, sessionId: 'sess1' }),
}))

vi.mock('../../src/contexts/CartContext', () => ({
  useCart: () => ({
    items: mockItems,
    totalAmount: 18000,
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  }),
}))

vi.mock('../../src/services/api', () => ({
  createOrder: vi.fn().mockResolvedValue({ data: null, error: null }),
}))

import OrderConfirmPage from '../../src/pages/OrderConfirmPage'

describe('OrderConfirmPage', () => {
  it('주문 확인 정보를 표시한다', () => {
    render(
      <MemoryRouter>
        <OrderConfirmPage />
      </MemoryRouter>
    )
    expect(screen.getByText('주문 확인')).toBeInTheDocument()
    expect(screen.getByText('테이블 3번')).toBeInTheDocument()
    expect(screen.getByText('김치찌개')).toBeInTheDocument()
    expect(screen.getByText('주문 확정')).toBeInTheDocument()
    expect(screen.getByText('돌아가기')).toBeInTheDocument()
  })
})

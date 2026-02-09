import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '../../src/contexts/CartContext'
import { AuthProvider } from '../../src/contexts/AuthContext'
import * as api from '../../src/services/api'
import { vi } from 'vitest'

vi.mock('../../src/services/api', () => ({
  authenticateTable: vi.fn().mockResolvedValue({ data: null, error: null }),
  setupInterceptors: vi.fn(),
}))

function wrapper({ children }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('초기 상태는 빈 장바구니이다', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toEqual([])
    expect(result.current.totalAmount).toBe(0)
    expect(result.current.totalCount).toBe(0)
  })

  it('addItem으로 항목을 추가한다', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem('m1', '김치찌개', 9000, 1)
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].menuId).toBe('m1')
    expect(result.current.items[0].quantity).toBe(1)
    expect(result.current.items[0].subtotal).toBe(9000)
    expect(result.current.totalAmount).toBe(9000)
    expect(result.current.totalCount).toBe(1)
  })

  it('동일 메뉴 추가 시 수량이 증가한다', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem('m1', '김치찌개', 9000, 1)
    })
    act(() => {
      result.current.addItem('m1', '김치찌개', 9000, 2)
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.items[0].subtotal).toBe(27000)
    expect(result.current.totalAmount).toBe(27000)
  })

  it('updateQuantity로 수량을 변경한다', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem('m1', '김치찌개', 9000, 1)
    })
    act(() => {
      result.current.updateQuantity('m1', 5)
    })
    expect(result.current.items[0].quantity).toBe(5)
    expect(result.current.items[0].subtotal).toBe(45000)
  })

  it('updateQuantity 0이면 항목이 제거된다', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem('m1', '김치찌개', 9000, 1)
    })
    act(() => {
      result.current.updateQuantity('m1', 0)
    })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.totalAmount).toBe(0)
  })

  it('removeItem으로 항목을 삭제한다', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem('m1', '김치찌개', 9000, 1)
      result.current.addItem('m2', '된장찌개', 8000, 2)
    })
    act(() => {
      result.current.removeItem('m1')
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].menuId).toBe('m2')
    expect(result.current.totalAmount).toBe(16000)
  })

  it('clearCart로 전체를 비운다', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem('m1', '김치찌개', 9000, 1)
      result.current.addItem('m2', '된장찌개', 8000, 2)
    })
    act(() => {
      result.current.clearCart()
    })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.totalAmount).toBe(0)
    expect(result.current.totalCount).toBe(0)
  })

  it('getItemQuantity로 특정 메뉴 수량을 조회한다', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem('m1', '김치찌개', 9000, 3)
    })
    expect(result.current.getItemQuantity('m1')).toBe(3)
    expect(result.current.getItemQuantity('m999')).toBe(0)
  })
})

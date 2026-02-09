import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MenuProvider, useMenu } from '../../src/contexts/MenuContext'
import * as api from '../../src/services/api'

vi.mock('../../src/services/api', () => ({
  getMenus: vi.fn(),
  default: {},
}))

function wrapper({ children }) {
  return <MenuProvider>{children}</MenuProvider>
}

const mockMenus = [
  { id: 'm1', name: '김치찌개', price: 9000, description: '매콤한 김치찌개', category: '찌개', image_url: '', is_available: true },
  { id: 'm2', name: '된장찌개', price: 8000, description: '구수한 된장찌개', category: '찌개', image_url: '', is_available: true },
  { id: 'm3', name: '불고기', price: 12000, description: '달콤한 불고기', category: '구이', image_url: '', is_available: true },
]

describe('MenuContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('초기 상태는 빈 메뉴 목록이다', () => {
    const { result } = renderHook(() => useMenu(), { wrapper })
    expect(result.current.menus).toEqual([])
    expect(result.current.categories).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('fetchMenus 성공 시 메뉴와 카테고리가 설정된다', async () => {
    api.getMenus.mockResolvedValue({ data: mockMenus, error: null })
    const { result } = renderHook(() => useMenu(), { wrapper })

    await act(async () => {
      await result.current.fetchMenus('store1')
    })

    expect(result.current.menus).toHaveLength(3)
    expect(result.current.categories).toEqual(['찌개', '구이'])
    expect(result.current.isLoading).toBe(false)
  })

  it('fetchMenus 실패 시 에러가 설정된다', async () => {
    api.getMenus.mockResolvedValue({ data: null, error: { message: '서버 오류' } })
    const { result } = renderHook(() => useMenu(), { wrapper })

    await act(async () => {
      await result.current.fetchMenus('store1')
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.menus).toEqual([])
  })

  it('getFilteredMenus로 카테고리 필터링한다', async () => {
    api.getMenus.mockResolvedValue({ data: mockMenus, error: null })
    const { result } = renderHook(() => useMenu(), { wrapper })

    await act(async () => {
      await result.current.fetchMenus('store1')
    })

    const filtered = result.current.getFilteredMenus('찌개')
    expect(filtered).toHaveLength(2)

    const all = result.current.getFilteredMenus(null)
    expect(all).toHaveLength(3)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext'
import * as api from '../../src/services/api'

vi.mock('../../src/services/api', () => ({
  authenticateTable: vi.fn(),
  setupInterceptors: vi.fn(),
}))

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('초기 상태는 미인증이다', async () => {
    api.authenticateTable.mockResolvedValue({ data: null, error: null })
    const { result } = renderHook(() => useAuth(), { wrapper })
    // 자동 로그인 시도 후 isLoading이 false가 됨
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('setupTable 성공 시 인증 상태가 된다', async () => {
    api.authenticateTable.mockResolvedValue({
      data: { session_id: 'sess1', expires_at: '2026-12-31T00:00:00Z' },
      error: null,
    })
    const { result } = renderHook(() => useAuth(), { wrapper })
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.setupTable('store1', 1, 'pass')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.storeId).toBe('store1')
    expect(result.current.tableNumber).toBe(1)
    expect(result.current.sessionId).toBe('sess1')
  })

  it('setupTable 실패 시 에러가 설정된다', async () => {
    api.authenticateTable
      .mockResolvedValueOnce({ data: null, error: null }) // 자동 로그인
      .mockResolvedValueOnce({
        data: null,
        error: { type: 'server', message: '인증 실패', retryable: false },
      })
    const { result } = renderHook(() => useAuth(), { wrapper })
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false))

    let setupResult
    await act(async () => {
      setupResult = await result.current.setupTable('store1', 1, 'wrong')
    })

    expect(setupResult.success).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logout 호출 시 상태가 초기화된다', async () => {
    api.authenticateTable.mockResolvedValue({
      data: { session_id: 'sess1', expires_at: '2026-12-31T00:00:00Z' },
      error: null,
    })
    const { result } = renderHook(() => useAuth(), { wrapper })
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.setupTable('store1', 1, 'pass')
    })
    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.storeId).toBeNull()
  })
})

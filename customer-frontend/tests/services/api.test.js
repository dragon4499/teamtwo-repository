import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    post: vi.fn(),
    get: vi.fn(),
    defaults: { headers: { common: {} } },
  }
  return { default: mockAxios }
})

// api.js를 import하기 전에 axios mock이 설정되어야 함
let apiModule

describe('API Service', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // 동적 import로 매 테스트마다 새로 로드
    vi.resetModules()
    apiModule = await import('../../src/services/api')
  })

  it('authenticateTable이 올바른 엔드포인트를 호출한다', async () => {
    const mockResponse = {
      data: { session_id: 'sess1', table_number: 1, store_id: 'store1', expires_at: '2026-12-31' },
    }
    axios.post.mockResolvedValue(mockResponse)

    const result = await apiModule.authenticateTable('store1', 1, 'pass')
    expect(result.error).toBeNull()
  })

  it('getMenus가 올바른 엔드포인트를 호출한다', async () => {
    const mockResponse = { data: [{ id: 'm1', name: '김치찌개' }] }
    axios.get.mockResolvedValue(mockResponse)

    const result = await apiModule.getMenus('store1')
    expect(result.error).toBeNull()
  })

  it('네트워크 오류 시 적절한 ErrorInfo를 반환한다', async () => {
    axios.post.mockRejectedValue(new TypeError('Network Error'))

    const result = await apiModule.authenticateTable('store1', 1, 'pass')
    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
    expect(result.error.type).toBe('network')
    expect(result.error.retryable).toBe(true)
  })

  it('서버 500 오류 시 적절한 ErrorInfo를 반환한다', async () => {
    const error = new Error('Server Error')
    error.response = { status: 500, data: {} }
    axios.get.mockRejectedValue(error)

    const result = await apiModule.getMenus('store1')
    expect(result.data).toBeNull()
    expect(result.error.type).toBe('server')
    expect(result.error.retryable).toBe(true)
  })
})

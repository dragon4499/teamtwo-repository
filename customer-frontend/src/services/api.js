import axios from 'axios'
import { safeGetItem } from '../utils/storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let failedQueue = []
let authCallbacks = null

function processQueue(error) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
  })
  failedQueue = []
}

export function setupInterceptors(callbacks) {
  authCallbacks = callbacks
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry && authCallbacks) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => apiClient(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const credentials = authCallbacks.getCredentials()
        if (!credentials) throw new Error('No credentials')

        const response = await axios.post(
          `${API_BASE_URL}/api/stores/${credentials.storeId}/tables/auth`,
          { table_number: credentials.tableNumber, password: credentials.password },
          { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        )

        authCallbacks.updateSession(response.data.session_id, response.data.expires_at)
        processQueue(null)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        authCallbacks.triggerLogout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

function mapHttpError(error) {
  if (!error.response) {
    return { type: 'network', message: '네트워크 연결을 확인해주세요', retryable: true }
  }
  const { status, data } = error.response
  switch (status) {
    case 401:
      return { type: 'session', message: '세션이 만료되었습니다', retryable: false }
    case 404:
      return { type: 'server', message: '요청한 리소스를 찾을 수 없습니다', retryable: false }
    case 422:
      return {
        type: 'validation',
        message: data?.detail || '입력 데이터가 올바르지 않습니다',
        retryable: false,
      }
    case 500:
      return {
        type: 'server',
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
        retryable: true,
      }
    default:
      return { type: 'server', message: '오류가 발생했습니다', retryable: true }
  }
}

export async function authenticateTable(storeId, tableNumber, password) {
  try {
    const response = await apiClient.post(`/api/stores/${storeId}/tables/auth`, {
      table_number: tableNumber,
      password,
    })
    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: mapHttpError(error) }
  }
}

export async function getMenus(storeId) {
  try {
    const response = await apiClient.get(`/api/stores/${storeId}/menus`)
    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: mapHttpError(error) }
  }
}

export async function createOrder(storeId, tableNumber, sessionId, items) {
  try {
    const response = await apiClient.post(
      `/api/stores/${storeId}/tables/${tableNumber}/orders`,
      { session_id: sessionId, items }
    )
    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: mapHttpError(error) }
  }
}

export async function getOrdersBySession(storeId, sessionId) {
  try {
    const response = await apiClient.get(`/api/stores/${storeId}/sessions/${sessionId}/orders`)
    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: mapHttpError(error) }
  }
}

export async function getOrder(storeId, orderId) {
  try {
    const response = await apiClient.get(`/api/stores/${storeId}/orders/${orderId}`)
    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: mapHttpError(error) }
  }
}

export default apiClient

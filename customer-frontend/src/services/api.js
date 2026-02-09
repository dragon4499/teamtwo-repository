/** API 호출 서비스 */

const BASE = '/api/stores'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // 테이블 인증
  authenticateTable(storeId, tableNumber, password) {
    return request(`${BASE}/${storeId}/tables/auth`, {
      method: 'POST',
      body: JSON.stringify({ table_number: tableNumber, password }),
    })
  },

  // 메뉴
  getMenus(storeId, category) {
    const q = category ? `?category=${encodeURIComponent(category)}` : ''
    return request(`${BASE}/${storeId}/menus${q}`)
  },

  // 주문
  createOrder(storeId, tableNum, sessionId, items) {
    return request(`${BASE}/${storeId}/tables/${tableNum}/orders`, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, items }),
    })
  },

  getSessionOrders(storeId, sessionId) {
    return request(`${BASE}/${storeId}/sessions/${sessionId}/orders`)
  },

  getOrder(storeId, orderId) {
    return request(`${BASE}/${storeId}/orders/${orderId}`)
  },
}

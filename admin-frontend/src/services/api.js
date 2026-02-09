/** Admin API 호출 서비스 */

const BASE = '/api/stores'

function getToken() {
  try {
    const auth = JSON.parse(localStorage.getItem('admin_auth'))
    return auth?.token
  } catch { return null }
}

async function request(url, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const adminApi = {
  // Auth
  login(storeId, username, password) {
    return request(`${BASE}/${storeId}/admin/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },
  logout(storeId) {
    return request(`${BASE}/${storeId}/admin/logout`, { method: 'POST' })
  },

  // Tables
  getTables(storeId) {
    return request(`${BASE}/${storeId}/admin/tables`)
  },
  createTable(storeId, tableNumber, password) {
    return request(`${BASE}/${storeId}/admin/tables`, {
      method: 'POST',
      body: JSON.stringify({ table_number: tableNumber, password }),
    })
  },
  startSession(storeId, tableNum) {
    return request(`${BASE}/${storeId}/admin/tables/${tableNum}/session/start`, { method: 'POST' })
  },
  endSession(storeId, tableNum) {
    return request(`${BASE}/${storeId}/admin/tables/${tableNum}/session/end`, { method: 'POST' })
  },

  // Orders
  getTableOrders(storeId, tableNum) {
    return request(`${BASE}/${storeId}/admin/tables/${tableNum}/orders`)
  },
  getTableHistory(storeId, tableNum) {
    return request(`${BASE}/${storeId}/admin/tables/${tableNum}/history`)
  },
  updateOrderStatus(storeId, orderId, status) {
    return request(`${BASE}/${storeId}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
  deleteOrder(storeId, orderId) {
    return request(`${BASE}/${storeId}/admin/orders/${orderId}`, { method: 'DELETE' })
  },

  // Menus
  getMenus(storeId) {
    return request(`${BASE}/${storeId}/admin/menus`)
  },
  createMenu(storeId, data) {
    return request(`${BASE}/${storeId}/admin/menus`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  updateMenu(storeId, menuId, data) {
    return request(`${BASE}/${storeId}/admin/menus/${menuId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  deleteMenu(storeId, menuId) {
    return request(`${BASE}/${storeId}/admin/menus/${menuId}`, { method: 'DELETE' })
  },
}

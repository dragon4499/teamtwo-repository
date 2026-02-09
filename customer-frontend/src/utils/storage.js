/** localStorage 유틸리티 */

const CART_KEY = 'table_order_cart'
const AUTH_KEY = 'table_order_auth'

export const storage = {
  // 장바구니
  getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || []
    } catch { return [] }
  },
  setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  },
  clearCart() {
    localStorage.removeItem(CART_KEY)
  },

  // 인증 정보
  getAuth() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY))
    } catch { return null }
  },
  setAuth(data) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data))
  },
  clearAuth() {
    localStorage.removeItem(AUTH_KEY)
  },
}

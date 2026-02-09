/** Admin auth localStorage 유틸리티 */

const KEY = 'admin_auth'

export const adminAuth = {
  get() {
    try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
  },
  set(data) {
    localStorage.setItem(KEY, JSON.stringify(data))
  },
  clear() {
    localStorage.removeItem(KEY)
  },
}

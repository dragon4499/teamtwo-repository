import { createContext, useContext, useState, useCallback } from 'react'
import { adminAuth } from '../utils/auth'
import { adminApi } from '../services/api'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [auth, setAuth] = useState(() => adminAuth.get())
  const [error, setError] = useState('')

  const login = useCallback(async (storeId, username, password) => {
    try {
      setError('')
      const data = await adminApi.login(storeId, username, password)
      const authData = { storeId, ...data }
      adminAuth.set(authData)
      setAuth(authData)
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    if (auth?.storeId) {
      try { await adminApi.logout(auth.storeId) } catch {}
    }
    adminAuth.clear()
    setAuth(null)
  }, [auth])

  return (
    <AdminAuthContext.Provider value={{ auth, error, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)

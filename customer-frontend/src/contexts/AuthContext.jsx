import { createContext, useContext, useState, useCallback } from 'react'
import { storage } from '../utils/storage'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => storage.getAuth())
  const [error, setError] = useState('')

  const login = useCallback(async (storeId, tableNumber, password) => {
    try {
      setError('')
      const data = await api.authenticateTable(storeId, tableNumber, password)
      const authData = { storeId, tableNumber, ...data }
      storage.setAuth(authData)
      setAuth(authData)
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    storage.clearAuth()
    storage.clearCart()
    setAuth(null)
  }, [])

  return (
    <AuthContext.Provider value={{ auth, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../services/api'

const MenuContext = createContext(null)

export function MenuProvider({ children }) {
  const [menus, setMenus] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadMenus = useCallback(async (storeId) => {
    try {
      setLoading(true)
      setError('')
      const data = await api.getMenus(storeId)
      setMenus(data)
      const cats = [...new Set(data.map(m => m.category))]
      setCategories(cats)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <MenuContext.Provider value={{ menus, categories, loading, error, loadMenus }}>
      {children}
    </MenuContext.Provider>
  )
}

export const useMenu = () => useContext(MenuContext)

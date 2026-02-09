import { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { getMenus as apiGetMenus } from '../services/api'

const MenuContext = createContext(null)

const CACHE_DURATION = 5 * 60 * 1000

const initialState = {
  menus: [],
  categories: [],
  isLoading: false,
  error: null,
  lastFetched: null,
}

function menuReducer(state, action) {
  switch (action.type) {
    case 'FETCH_MENUS_START':
      return { ...state, isLoading: true, error: null }
    case 'FETCH_MENUS_SUCCESS': {
      const menus = action.payload.menus
      const categories = [...new Set(menus.map((m) => m.category))]
      return { ...state, menus, categories, isLoading: false, lastFetched: Date.now() }
    }
    case 'FETCH_MENUS_FAILURE':
      return { ...state, isLoading: false, error: action.payload.error }
    default:
      return state
  }
}

export function MenuProvider({ children }) {
  const [state, dispatch] = useReducer(menuReducer, initialState)

  const fetchMenus = useCallback(
    async (storeId) => {
      if (state.lastFetched && Date.now() - state.lastFetched < CACHE_DURATION) {
        return
      }
      dispatch({ type: 'FETCH_MENUS_START' })
      const { data, error } = await apiGetMenus(storeId)
      if (data) {
        dispatch({ type: 'FETCH_MENUS_SUCCESS', payload: { menus: data } })
      } else {
        dispatch({ type: 'FETCH_MENUS_FAILURE', payload: { error: error?.message || '메뉴를 불러오지 못했습니다' } })
      }
    },
    [state.lastFetched]
  )

  const getFilteredMenus = useCallback(
    (selectedCategory) => {
      if (!selectedCategory) return state.menus
      return state.menus.filter((m) => m.category === selectedCategory)
    },
    [state.menus]
  )

  const value = useMemo(
    () => ({ ...state, fetchMenus, getFilteredMenus }),
    [state, fetchMenus, getFilteredMenus]
  )

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) throw new Error('useMenu must be used within MenuProvider')
  return context
}

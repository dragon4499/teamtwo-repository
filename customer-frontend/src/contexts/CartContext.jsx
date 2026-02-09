import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const initialState = {
  items: [],
  totalAmount: 0,
  totalCount: 0,
}

function recalcTotals(items) {
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  return { items, totalAmount, totalCount }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuId, menuName, price, quantity } = action.payload
      const existing = state.items.find((item) => item.menuId === menuId)
      let newItems
      if (existing) {
        newItems = state.items.map((item) =>
          item.menuId === menuId
            ? { ...item, quantity: item.quantity + quantity, subtotal: item.price * (item.quantity + quantity) }
            : item
        )
      } else {
        newItems = [...state.items, { menuId, menuName, price, quantity, subtotal: price * quantity }]
      }
      return recalcTotals(newItems)
    }
    case 'UPDATE_QUANTITY': {
      const { menuId, quantity } = action.payload
      if (quantity <= 0) {
        const newItems = state.items.filter((item) => item.menuId !== menuId)
        return recalcTotals(newItems)
      }
      const newItems = state.items.map((item) =>
        item.menuId === menuId
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item
      )
      return recalcTotals(newItems)
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.menuId !== action.payload.menuId)
      return recalcTotals(newItems)
    }
    case 'CLEAR_CART':
      return { ...initialState }
    case 'RESTORE_CART': {
      const items = action.payload.items.map((item) => ({
        ...item,
        subtotal: item.price * item.quantity,
      }))
      return recalcTotals(items)
    }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { storeId, tableNumber, isAuthenticated } = useAuth()

  const cartKey = storeId && tableNumber ? `cart_${storeId}_${tableNumber}` : null

  // localStorage에서 복원
  useEffect(() => {
    if (!cartKey || !isAuthenticated) return
    const saved = safeGetItem(cartKey)
    if (saved && Array.isArray(saved) && saved.length > 0) {
      dispatch({ type: 'RESTORE_CART', payload: { items: saved } })
    }
  }, [cartKey, isAuthenticated])

  // localStorage에 저장
  useEffect(() => {
    if (!cartKey || !isAuthenticated) return
    if (state.items.length === 0) {
      safeRemoveItem(cartKey)
    } else {
      const success = safeSetItem(cartKey, state.items)
      if (!success) {
        // 토스트 경고는 컴포넌트 레벨에서 처리
      }
    }
  }, [state.items, cartKey, isAuthenticated])

  const addItem = useCallback((menuId, menuName, price, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { menuId, menuName, price, quantity } })
  }, [])

  const updateQuantity = useCallback((menuId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menuId, quantity } })
  }, [])

  const removeItem = useCallback((menuId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { menuId } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
    if (cartKey) safeRemoveItem(cartKey)
  }, [cartKey])

  const getItemQuantity = useCallback(
    (menuId) => {
      const item = state.items.find((i) => i.menuId === menuId)
      return item ? item.quantity : 0
    },
    [state.items]
  )

  const value = {
    ...state,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

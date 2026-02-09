import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { storage } from '../utils/storage'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => storage.getCart())

  const updateItems = useCallback((newItems) => {
    setItems(newItems)
    storage.setCart(newItems)
  }, [])

  const addItem = useCallback((menu) => {
    setItems(prev => {
      const existing = prev.find(i => i.menu_id === menu.id)
      let next
      if (existing) {
        next = prev.map(i =>
          i.menu_id === menu.id ? { ...i, quantity: Math.min(i.quantity + 1, 99) } : i
        )
      } else {
        next = [...prev, {
          menu_id: menu.id,
          menu_name: menu.name,
          price: menu.price,
          quantity: 1,
        }]
      }
      storage.setCart(next)
      return next
    })
  }, [])

  const removeItem = useCallback((menuId) => {
    setItems(prev => {
      const next = prev.filter(i => i.menu_id !== menuId)
      storage.setCart(next)
      return next
    })
  }, [])

  const updateQuantity = useCallback((menuId, quantity) => {
    if (quantity < 1 || quantity > 99) return
    setItems(prev => {
      const next = prev.map(i =>
        i.menu_id === menuId ? { ...i, quantity } : i
      )
      storage.setCart(next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    storage.clearCart()
  }, [])

  const totalAmount = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  )

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  )

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart, totalAmount, totalCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

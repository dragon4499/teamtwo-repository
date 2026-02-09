import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAdminAuth } from './AdminAuthContext'
import { createSSEClient } from '../services/sseClient'

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const { auth } = useAdminAuth()
  const [orders, setOrders] = useState({})
  const sseRef = useRef(null)

  const handleSSEEvent = useCallback((eventType, data) => {
    if (eventType === 'order_created' || eventType === 'order_status_changed') {
      setOrders(prev => ({ ...prev, [data.id]: data }))
    } else if (eventType === 'order_deleted') {
      setOrders(prev => {
        const next = { ...prev }
        delete next[data.order_id]
        return next
      })
    }
  }, [])

  useEffect(() => {
    if (!auth?.storeId) return
    sseRef.current = createSSEClient(auth.storeId, handleSSEEvent)
    return () => sseRef.current?.close()
  }, [auth?.storeId, handleSSEEvent])

  const setTableOrders = useCallback((orderList) => {
    const map = {}
    orderList.forEach(o => { map[o.id] = o })
    setOrders(prev => ({ ...prev, ...map }))
  }, [])

  const orderList = Object.values(orders)

  return (
    <OrderContext.Provider value={{ orders: orderList, setTableOrders }}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrders = () => useContext(OrderContext)

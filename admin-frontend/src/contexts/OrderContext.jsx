import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAdminAuth } from './AdminAuthContext'
import { createSSEClient } from '../services/sseClient'

const OrderContext = createContext(null)

// 웹 오디오 API로 알림음 생성 (외부 파일 불필요)
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  } catch { /* 사운드 재생 실패 무시 */ }
}

export function OrderProvider({ children }) {
  const { auth } = useAdminAuth()
  const [orders, setOrders] = useState({})
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem('order_sound') !== 'off' } catch { return true }
  })
  const [newOrderFlash, setNewOrderFlash] = useState(null)
  const sseRef = useRef(null)

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev
      try { localStorage.setItem('order_sound', next ? 'on' : 'off') } catch {}
      return next
    })
  }, [])

  const handleSSEEvent = useCallback((eventType, data) => {
    if (eventType === 'order_created' || eventType === 'order_status_changed') {
      setOrders(prev => ({ ...prev, [data.id]: data }))
      if (eventType === 'order_created') {
        if (soundEnabled) playNotificationSound()
        setNewOrderFlash(data)
        setTimeout(() => setNewOrderFlash(null), 3000)
      }
    } else if (eventType === 'order_deleted') {
      setOrders(prev => {
        const next = { ...prev }
        delete next[data.order_id]
        return next
      })
    }
  }, [soundEnabled])

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
    <OrderContext.Provider value={{ orders: orderList, setTableOrders, soundEnabled, toggleSound, newOrderFlash }}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrders = () => useContext(OrderContext)

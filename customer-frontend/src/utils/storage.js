export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.warn('localStorage 저장 실패:', e.message)
    return false
  }
}

export function safeGetItem(key) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (e) {
    console.warn('localStorage 읽기 실패:', e.message)
    return null
  }
}

export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.warn('localStorage 삭제 실패:', e.message)
  }
}

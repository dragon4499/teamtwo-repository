import { describe, it, expect, beforeEach, vi } from 'vitest'
import { safeSetItem, safeGetItem, safeRemoveItem } from '../../src/utils/storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('safeSetItem', () => {
    it('값을 JSON으로 직렬화하여 저장한다', () => {
      const result = safeSetItem('key', { a: 1 })
      expect(result).toBe(true)
      expect(localStorage.getItem('key')).toBe('{"a":1}')
    })

    it('저장 실패 시 false를 반환한다', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded')
      })
      const result = safeSetItem('key', 'value')
      expect(result).toBe(false)
      vi.restoreAllMocks()
    })
  })

  describe('safeGetItem', () => {
    it('저장된 값을 파싱하여 반환한다', () => {
      localStorage.setItem('key', '{"a":1}')
      const result = safeGetItem('key')
      expect(result).toEqual({ a: 1 })
    })

    it('존재하지 않는 키는 null을 반환한다', () => {
      const result = safeGetItem('nonexistent')
      expect(result).toBeNull()
    })

    it('파싱 실패 시 null을 반환한다', () => {
      localStorage.setItem('key', 'invalid-json')
      const result = safeGetItem('key')
      expect(result).toBeNull()
    })
  })

  describe('safeRemoveItem', () => {
    it('키를 삭제한다', () => {
      localStorage.setItem('key', '"value"')
      safeRemoveItem('key')
      expect(localStorage.getItem('key')).toBeNull()
    })
  })
})

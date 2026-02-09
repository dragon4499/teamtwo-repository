import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDateTime, formatCountdown } from '../../src/utils/format'

describe('formatCurrency', () => {
  it('정수 금액을 원화 형식으로 포맷한다', () => {
    const result = formatCurrency(9000)
    expect(result).toContain('9,000')
  })

  it('0원을 포맷한다', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('큰 금액을 천 단위 콤마로 포맷한다', () => {
    const result = formatCurrency(1500000)
    expect(result).toContain('1,500,000')
  })
})

describe('formatDateTime', () => {
  it('ISO 문자열을 한국어 날짜/시간으로 포맷한다', () => {
    const result = formatDateTime('2026-02-09T14:30:00Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatCountdown', () => {
  it('카운트다운 메시지를 생성한다', () => {
    const result = formatCountdown(5)
    expect(result).toBe('5초 후 메뉴 화면으로 이동합니다')
  })

  it('1초 카운트다운 메시지를 생성한다', () => {
    const result = formatCountdown(1)
    expect(result).toBe('1초 후 메뉴 화면으로 이동합니다')
  })
})

import { describe, it, expect } from 'vitest'
import {
  validateStoreId,
  validateTableNumber,
  validatePassword,
  validateQuantity,
} from '../../src/utils/validation'

describe('validateStoreId', () => {
  it('비어있지 않은 문자열은 true', () => {
    expect(validateStoreId('store1')).toBe(true)
  })
  it('빈 문자열은 false', () => {
    expect(validateStoreId('')).toBe(false)
  })
  it('공백만 있는 문자열은 false', () => {
    expect(validateStoreId('   ')).toBe(false)
  })
  it('숫자 타입은 false', () => {
    expect(validateStoreId(123)).toBe(false)
  })
})

describe('validateTableNumber', () => {
  it('양의 정수는 true', () => {
    expect(validateTableNumber(1)).toBe(true)
    expect(validateTableNumber(10)).toBe(true)
  })
  it('0은 false', () => {
    expect(validateTableNumber(0)).toBe(false)
  })
  it('음수는 false', () => {
    expect(validateTableNumber(-1)).toBe(false)
  })
  it('소수는 false', () => {
    expect(validateTableNumber(1.5)).toBe(false)
  })
})

describe('validatePassword', () => {
  it('비어있지 않은 문자열은 true', () => {
    expect(validatePassword('pass')).toBe(true)
  })
  it('빈 문자열은 false', () => {
    expect(validatePassword('')).toBe(false)
  })
})

describe('validateQuantity', () => {
  it('1~99 범위 정수는 true', () => {
    expect(validateQuantity(1)).toBe(true)
    expect(validateQuantity(99)).toBe(true)
  })
  it('0은 false', () => {
    expect(validateQuantity(0)).toBe(false)
  })
  it('100은 false', () => {
    expect(validateQuantity(100)).toBe(false)
  })
})

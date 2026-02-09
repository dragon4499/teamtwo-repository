export function validateStoreId(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function validateTableNumber(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1
}

export function validatePassword(value) {
  return typeof value === 'string' && value.length > 0
}

export function validateQuantity(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 99
}

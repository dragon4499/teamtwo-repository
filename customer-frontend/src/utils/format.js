const currencyFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
})

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatCurrency(amount) {
  return currencyFormatter.format(amount)
}

export function formatDateTime(isoString) {
  return dateTimeFormatter.format(new Date(isoString))
}

export function formatCountdown(seconds) {
  return `${seconds}초 후 메뉴 화면으로 이동합니다`
}

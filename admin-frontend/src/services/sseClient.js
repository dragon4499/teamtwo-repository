/** SSE 클라이언트 */

export function createSSEClient(storeId, onEvent) {
  const url = `/api/stores/${storeId}/events/orders`
  const source = new EventSource(url)

  source.addEventListener('order_created', (e) => {
    onEvent('order_created', JSON.parse(e.data))
  })

  source.addEventListener('order_status_changed', (e) => {
    onEvent('order_status_changed', JSON.parse(e.data))
  })

  source.addEventListener('order_deleted', (e) => {
    onEvent('order_deleted', JSON.parse(e.data))
  })

  source.onerror = () => {
    // EventSource auto-reconnects
  }

  return {
    close() { source.close() },
  }
}

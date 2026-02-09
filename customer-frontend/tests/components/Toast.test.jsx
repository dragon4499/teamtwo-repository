import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ToastProvider, useToast } from '../../src/components/Toast'

function TestComponent() {
  const { showToast } = useToast()
  return (
    <button onClick={() => showToast('테스트 메시지', 'error', 3000)}>
      토스트 표시
    </button>
  )
}

describe('Toast', () => {
  it('showToast 호출 시 토스트가 표시된다', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    await act(async () => {
      screen.getByText('토스트 표시').click()
    })
    expect(screen.getByText('테스트 메시지')).toBeInTheDocument()
  })

  it('동일 메시지 중복 토스트를 방지한다', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    await act(async () => {
      screen.getByText('토스트 표시').click()
      screen.getByText('토스트 표시').click()
    })
    const toasts = screen.getAllByText('테스트 메시지')
    expect(toasts).toHaveLength(1)
  })
})

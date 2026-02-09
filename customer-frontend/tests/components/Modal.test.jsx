import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../../src/components/Modal'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const map = { 'common.retry': '재시도', 'common.close': '닫기' }
      return map[key] || key
    },
  }),
}))

describe('Modal', () => {
  it('isOpen=false일 때 렌더링하지 않는다', () => {
    render(<Modal isOpen={false} message="test" onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('isOpen=true일 때 메시지를 표시한다', () => {
    render(<Modal isOpen={true} title="오류" message="서버 오류" onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('오류')).toBeInTheDocument()
    expect(screen.getByText('서버 오류')).toBeInTheDocument()
  })

  it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Modal isOpen={true} message="test" onClose={onClose} />)
    await user.click(screen.getByText('닫기'))
    expect(onClose).toHaveBeenCalled()
  })

  it('retryable=true일 때 재시도 버튼이 표시된다', () => {
    render(
      <Modal isOpen={true} message="test" onClose={vi.fn()} onRetry={vi.fn()} retryable />
    )
    expect(screen.getByText('재시도')).toBeInTheDocument()
  })

  it('retryable=false일 때 재시도 버튼이 없다', () => {
    render(<Modal isOpen={true} message="test" onClose={vi.fn()} />)
    expect(screen.queryByText('재시도')).not.toBeInTheDocument()
  })
})

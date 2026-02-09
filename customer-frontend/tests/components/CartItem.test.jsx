import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartItem from '../../src/components/CartItem'

const mockItem = {
  menuId: 'm1',
  menuName: '김치찌개',
  price: 9000,
  quantity: 2,
  subtotal: 18000,
}

describe('CartItem', () => {
  it('항목 정보를 표시한다', () => {
    render(
      <CartItem item={mockItem} onQuantityChange={vi.fn()} onRemove={vi.fn()} />
    )
    expect(screen.getByText('김치찌개')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('+ 버튼 클릭 시 수량 증가를 호출한다', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <CartItem item={mockItem} onQuantityChange={onChange} onRemove={vi.fn()} />
    )
    await user.click(screen.getByLabelText('수량 증가'))
    expect(onChange).toHaveBeenCalledWith('m1', 3)
  })

  it('- 버튼 클릭 시 수량 감소를 호출한다', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <CartItem item={mockItem} onQuantityChange={onChange} onRemove={vi.fn()} />
    )
    await user.click(screen.getByLabelText('수량 감소'))
    expect(onChange).toHaveBeenCalledWith('m1', 1)
  })

  it('삭제 버튼 클릭 시 onRemove가 호출된다', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(
      <CartItem item={mockItem} onQuantityChange={vi.fn()} onRemove={onRemove} />
    )
    await user.click(screen.getByLabelText('항목 삭제'))
    expect(onRemove).toHaveBeenCalledWith('m1')
  })

  it('editable=false일 때 수정 버튼이 없다', () => {
    render(
      <CartItem item={mockItem} onQuantityChange={vi.fn()} onRemove={vi.fn()} editable={false} />
    )
    expect(screen.queryByLabelText('수량 증가')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('항목 삭제')).not.toBeInTheDocument()
  })
})

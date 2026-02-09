import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MenuCard from '../../src/components/MenuCard'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

const mockMenu = {
  id: 'm1',
  name: '김치찌개',
  price: 9000,
  description: '매콤한 김치찌개',
  category: '찌개',
  image_url: '',
  is_available: true,
}

describe('MenuCard', () => {
  it('메뉴 정보를 표시한다', () => {
    render(<MenuCard menu={mockMenu} quantity={0} onQuantityChange={vi.fn()} />)
    expect(screen.getByText('김치찌개')).toBeInTheDocument()
    expect(screen.getByText('매콤한 김치찌개')).toBeInTheDocument()
  })

  it('+ 버튼 클릭 시 onQuantityChange가 호출된다', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MenuCard menu={mockMenu} quantity={0} onQuantityChange={onChange} />)
    await user.click(screen.getByLabelText('수량 증가'))
    expect(onChange).toHaveBeenCalledWith('m1', 1)
  })

  it('수량이 있을 때 - 버튼이 표시된다', () => {
    render(<MenuCard menu={mockMenu} quantity={2} onQuantityChange={vi.fn()} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByLabelText('수량 감소')).toBeInTheDocument()
  })

  it('품절 메뉴는 품절 배지를 표시한다', () => {
    const soldOutMenu = { ...mockMenu, is_available: false }
    render(<MenuCard menu={soldOutMenu} quantity={0} onQuantityChange={vi.fn()} />)
    expect(screen.getByText('menu.soldOut')).toBeInTheDocument()
  })
})

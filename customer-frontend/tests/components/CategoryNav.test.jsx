import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategoryNav from '../../src/components/CategoryNav'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => (key === 'menu.allCategories' ? '전체' : key) }),
}))

describe('CategoryNav', () => {
  const categories = ['찌개', '구이', '음료']

  it('전체와 카테고리 목록을 표시한다', () => {
    render(
      <CategoryNav categories={categories} selectedCategory={null} onSelect={vi.fn()} />
    )
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('찌개')).toBeInTheDocument()
    expect(screen.getByText('구이')).toBeInTheDocument()
    expect(screen.getByText('음료')).toBeInTheDocument()
  })

  it('카테고리 클릭 시 onSelect가 호출된다', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <CategoryNav categories={categories} selectedCategory={null} onSelect={onSelect} />
    )
    await user.click(screen.getByText('구이'))
    expect(onSelect).toHaveBeenCalledWith('구이')
  })

  it('전체 클릭 시 null로 onSelect가 호출된다', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <CategoryNav categories={categories} selectedCategory="찌개" onSelect={onSelect} />
    )
    await user.click(screen.getByText('전체'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('선택된 카테고리에 aria-current가 설정된다', () => {
    render(
      <CategoryNav categories={categories} selectedCategory="찌개" onSelect={vi.fn()} />
    )
    expect(screen.getByText('찌개')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('구이')).not.toHaveAttribute('aria-current')
  })
})

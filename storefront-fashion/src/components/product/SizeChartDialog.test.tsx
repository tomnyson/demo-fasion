import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SizeChartDialog } from './SizeChartDialog'

const proto = HTMLDialogElement.prototype
const original = { showModal: proto.showModal, close: proto.close }

describe('SizeChartDialog', () => {
  beforeEach(() => {
    proto.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
    proto.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open')
    }
  })
  afterEach(() => {
    proto.showModal = original.showModal
    proto.close = original.close
  })

  it('opens, switches tabs and closes', async () => {
    render(<SizeChartDialog />)
    await userEvent.click(screen.getByRole('button', { name: 'Mở bảng size' }))
    expect(screen.getByRole('dialog').hasAttribute('open')).toBe(true)
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Size nữ', 'Cách đo'])
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Size', 'Ngực (cm)', 'Eo (cm)', 'Mông (cm)'])
    expect(screen.getAllByRole('row')).toHaveLength(6)
    await userEvent.click(screen.getByRole('tab', { name: 'Cách đo' }))
    expect(screen.getByRole('tab', { name: 'Cách đo' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
    expect(screen.getByRole('dialog', { hidden: true }).hasAttribute('open')).toBe(false)
  })

  it('shows the title and the in-between-sizes note', async () => {
    render(<SizeChartDialog />)
    await userEvent.click(screen.getByRole('button', { name: 'Mở bảng size' }))
    expect(screen.getByRole('heading', { name: 'Bảng size' })).toBeTruthy()
    expect(screen.getByText('Nếu số đo nằm giữa hai size, hãy chọn size lớn hơn.')).toBeTruthy()
  })
})

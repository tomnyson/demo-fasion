import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Address } from '@/lib/addresses/schema'
import { sendJson } from '@/lib/http/client'
import { AddressBook } from './AddressBook'

vi.mock('@/lib/http/client', () => ({ sendJson: vi.fn() }))

const send = vi.mocked(sendJson)

const make = (id: string, isDefault: boolean, recipient = `Người ${id}`): Address => ({
  id,
  userId: 'u1',
  recipient,
  phone: '0901234567',
  province: 'Hà Nội',
  address: `${id} Phố Huế`,
  isDefault,
  createdAt: '2026-11-19T00:00:00.000Z',
})
const book = (addresses: readonly Address[], address?: Address) => ({ success: true, data: { addresses, ...(address ? { address } : {}) }, error: null }) as const
const a = make('a', true)
const b = make('b', false)

beforeEach(() => send.mockReset())

describe('AddressBook', () => {
  it('shows an empty state and adds the first address', async () => {
    const added = make('n', true, 'Lan Anh')
    send.mockResolvedValue(book([added], added))
    const user = userEvent.setup()
    render(<AddressBook initial={[]} />)
    expect(screen.getByText('Bạn chưa lưu địa chỉ nào.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '+ Thêm địa chỉ' }))
    const form = screen.getByRole('form', { name: 'Thêm địa chỉ' })
    await user.type(within(form).getByLabelText('Tên người nhận'), 'Lan Anh')
    await user.type(within(form).getByLabelText('Số điện thoại'), '0901234567')
    await user.selectOptions(within(form).getByLabelText('Tỉnh/Thành phố'), 'Hà Nội')
    await user.type(within(form).getByLabelText('Địa chỉ'), 'n Phố Huế')
    await user.click(within(form).getByRole('button', { name: 'LƯU ĐỊA CHỈ' }))
    expect(send).toHaveBeenCalledWith('POST', '/api/account/addresses', { recipient: 'Lan Anh', phone: '0901234567', province: 'Hà Nội', address: 'n Phố Huế' })
    const card = await screen.findByRole('article', { name: 'Lan Anh' })
    expect(within(card).getByText('Mặc định')).toBeTruthy()
    expect(screen.queryByRole('form')).toBeNull()
  })

  it('lists the default first with a badge and only offers "Đặt làm mặc định" on others', () => {
    render(<AddressBook initial={[a, b]} />)
    const cards = screen.getAllByRole('article')
    expect(cards.map((card) => card.getAttribute('aria-label'))).toEqual(['Người a', 'Người b'])
    expect(within(cards[0]).getByText('Mặc định')).toBeTruthy()
    expect(within(cards[0]).queryByRole('button', { name: 'Đặt làm mặc định' })).toBeNull()
    expect(within(cards[1]).queryByText('Mặc định')).toBeNull()
  })

  it('sets a default and re-renders from the server list', async () => {
    send.mockResolvedValue(book([{ ...b, isDefault: true }, { ...a, isDefault: false }]))
    render(<AddressBook initial={[a, b]} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Đặt làm mặc định' }))
    expect(send).toHaveBeenCalledWith('PATCH', '/api/account/addresses/b', { isDefault: true })
    expect((await screen.findAllByRole('article'))[0].getAttribute('aria-label')).toBe('Người b')
  })

  it('edits inline with prefilled values and shows field errors', async () => {
    send.mockResolvedValueOnce({ success: false, data: null, error: { code: 'VALIDATION', message: 'x', fields: { address: 'Vui lòng nhập địa chỉ (5–200 ký tự).' } } })
    send.mockResolvedValueOnce(book([{ ...b, recipient: 'Chị Hoa' }, a]))
    const user = userEvent.setup()
    render(<AddressBook initial={[a, b]} />)
    await user.click(within(screen.getByRole('article', { name: 'Người b' })).getByRole('button', { name: 'Sửa' }))
    const form = screen.getByRole('form', { name: 'Sửa địa chỉ' })
    expect(within(form).getByLabelText('Tỉnh/Thành phố')).toHaveProperty('value', 'Hà Nội')
    await user.click(within(form).getByRole('button', { name: 'LƯU ĐỊA CHỈ' }))
    expect(send).toHaveBeenCalledWith('PATCH', '/api/account/addresses/b', { recipient: 'Người b', phone: '0901234567', province: 'Hà Nội', address: 'b Phố Huế' })
    expect(await within(form).findByText('Vui lòng nhập địa chỉ (5–200 ký tự).')).toBeTruthy()
    await user.click(within(form).getByRole('button', { name: 'LƯU ĐỊA CHỈ' }))
    expect(await screen.findByRole('article', { name: 'Chị Hoa' })).toBeTruthy()
  })

  it('asks before deleting, can back out, then deletes', async () => {
    send.mockResolvedValue(book([a]))
    const user = userEvent.setup()
    render(<AddressBook initial={[a, b]} />)
    const card = screen.getByRole('article', { name: 'Người b' })
    await user.click(within(card).getByRole('button', { name: 'Xoá' }))
    await user.click(within(card).getByRole('button', { name: 'Không' }))
    expect(send).not.toHaveBeenCalled()
    await user.click(within(card).getByRole('button', { name: 'Xoá' }))
    expect(within(card).getByText('Xoá địa chỉ này?')).toBeTruthy()
    await user.click(within(within(card).getByRole('group', { name: 'Xác nhận xoá' })).getByRole('button', { name: 'Xoá' }))
    expect(send).toHaveBeenCalledWith('DELETE', '/api/account/addresses/b')
    await vi.waitFor(() => expect(screen.queryByRole('article', { name: 'Người b' })).toBeNull())
  })

  it('shows a server error for an action and the cap message from the form', async () => {
    send.mockResolvedValueOnce({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Không tìm thấy địa chỉ.' } })
    send.mockResolvedValueOnce({ success: false, data: null, error: { code: 'VALIDATION', message: 'Tối đa 10 địa chỉ.', fields: { form: 'Tối đa 10 địa chỉ.' } } })
    const user = userEvent.setup()
    render(<AddressBook initial={[a, b]} />)
    await user.click(screen.getByRole('button', { name: 'Đặt làm mặc định' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Không tìm thấy địa chỉ.')
    await user.click(screen.getByRole('button', { name: '+ Thêm địa chỉ' }))
    const form = screen.getByRole('form', { name: 'Thêm địa chỉ' })
    await user.click(within(form).getByRole('button', { name: 'LƯU ĐỊA CHỈ' }))
    expect((await within(form).findByRole('alert')).textContent).toBe('Tối đa 10 địa chỉ.')
    await user.click(within(form).getByRole('button', { name: 'Huỷ' }))
    expect(screen.queryByRole('form')).toBeNull()
  })

  it('hides the add button when the book is full', () => {
    render(<AddressBook initial={Array.from({ length: 10 }, (_, i) => make(`x${i}`, i === 0))} />)
    expect(screen.queryByRole('button', { name: '+ Thêm địa chỉ' })).toBeNull()
    expect(screen.getByText(/Sổ địa chỉ đã đủ 10 địa chỉ/)).toBeTruthy()
  })
})

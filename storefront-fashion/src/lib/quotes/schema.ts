import { z } from 'zod'
import { MAX_QUOTE_QTY, MIN_QUOTE_QTY } from '@/config/commerce'
import { getProduct } from '@/lib/catalog/repository'
import { emptyToUndefined, nameField, phoneField } from '@/lib/validation/contact'
import { getSportOptions } from './sports'

export interface QuoteInput {
  name: string
  phone: string
  sport: string
  quantity: number
  message?: string
  productSlug?: string
}

export const QUOTE_MESSAGES = {
  sport: 'Vui lòng chọn môn thể thao.',
  quantityMin: `Số lượng tối thiểu là ${MIN_QUOTE_QTY} bộ.`,
  quantityInvalid: 'Số lượng không hợp lệ.',
  message: 'Nội dung tối đa 1000 ký tự.',
} as const

const sport = z
  .string({ error: QUOTE_MESSAGES.sport })
  .refine((slug) => getSportOptions().some((option) => option.slug === slug), { error: QUOTE_MESSAGES.sport })

const toNumber = (value: unknown) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value)

const quantity = z.preprocess(
  toNumber,
  z
    .number({ error: QUOTE_MESSAGES.quantityInvalid })
    .int({ error: QUOTE_MESSAGES.quantityInvalid })
    .min(MIN_QUOTE_QTY, { error: QUOTE_MESSAGES.quantityMin })
    .max(MAX_QUOTE_QTY, { error: QUOTE_MESSAGES.quantityInvalid }),
)

const message = z
  .string({ error: QUOTE_MESSAGES.message })
  .trim()
  .max(1000, { error: QUOTE_MESSAGES.message })
  .transform(emptyToUndefined)
  .optional()

/** An unknown product is dropped rather than rejected. */
const productSlug = z
  .unknown()
  .transform((value) => (typeof value === 'string' && getProduct(value) !== null ? value : undefined))
  .optional()

export const quoteInputSchema = z.object(
  { name: nameField, phone: phoneField, sport, quantity, message, productSlug },
  { error: 'Dữ liệu không hợp lệ.' },
) as unknown as z.ZodType<QuoteInput>

import type { Metadata } from 'next'
import { AuthPage, type SearchParams } from '@/components/account/AuthPage'

export const metadata: Metadata = { title: 'Đăng ký', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default function RegisterPage({ searchParams }: { readonly searchParams: SearchParams }) {
  return <AuthPage mode="register" searchParams={searchParams} />
}

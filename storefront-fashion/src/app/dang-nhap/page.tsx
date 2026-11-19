import type { Metadata } from 'next'
import { AuthPage, type SearchParams } from '@/components/account/AuthPage'

export const metadata: Metadata = { title: 'Đăng nhập', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default function LoginPage({ searchParams }: { readonly searchParams: SearchParams }) {
  return <AuthPage mode="login" searchParams={searchParams} />
}

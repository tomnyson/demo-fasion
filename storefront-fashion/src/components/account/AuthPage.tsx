import { redirect } from 'next/navigation'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { getCurrentUser } from '@/lib/auth/current-user'
import { safeNext } from '@/lib/auth/safe-next'
import { AuthForm, type AuthMode } from './AuthForm'

const TITLES: Readonly<Record<AuthMode, { readonly title: string; readonly intro: string }>> = {
  login: { title: 'Đăng nhập', intro: 'Đăng nhập để xem đơn hàng, lưu địa chỉ và dùng mã ưu đãi thành viên.' },
  register: { title: 'Đăng ký', intro: 'Tạo tài khoản Lá Studio để theo dõi đơn hàng và thanh toán nhanh hơn.' },
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>

/** Server shell for /dang-nhap and /dang-ky: sanitises `next`, skips the form for signed-in visitors. */
export async function AuthPage({ mode, searchParams }: { readonly mode: AuthMode; readonly searchParams: SearchParams }) {
  const next = safeNext((await searchParams).next)
  if ((await getCurrentUser()) !== null) redirect(next)
  const { title, intro } = TITLES[mode]
  return (
    <div className="container-site py-8">
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: title }]} />
      <div className="mx-auto mt-6 max-w-md">
        <h1 className="text-[28px] font-black uppercase leading-tight text-ink">{title}</h1>
        <p className="mb-6 mt-2 text-sm text-muted">{intro}</p>
        <AuthForm mode={mode} next={next} />
      </div>
    </div>
  )
}

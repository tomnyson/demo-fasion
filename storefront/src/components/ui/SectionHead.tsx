export interface SectionHeadProps {
  readonly kicker?: string
  readonly title: string
  readonly subtitle?: string
  readonly align?: 'left' | 'center'
}

export function SectionHead({ kicker, title, subtitle, align = 'center' }: SectionHeadProps) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      {kicker ? <p className="text-sm font-bold uppercase text-brand">{kicker}</p> : null}
      <h2 className="mt-1 text-[30px] font-bold leading-tight text-ink">{title}</h2>
      {subtitle ? <p className="mt-2 text-muted">{subtitle}</p> : null}
    </div>
  )
}

'use client'

import { useRef, useState } from 'react'
import { MEASURE_STEPS } from '@/config/size-chart'
import { SizeTable } from './SizeTable'

const TABS = [
  { id: 'nu', label: 'Size nữ' },
  { id: 'cach-do', label: 'Cách đo' },
] as const

type TabId = (typeof TABS)[number]['id']

function MeasureSteps() {
  return (
    <div role="tabpanel" id="size-panel" aria-labelledby="size-tab-cach-do" className="mt-4">
      <ul className="list-disc space-y-2 pl-5 text-sm text-ink">
        {MEASURE_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
    </div>
  )
}

export function SizeChartDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [activeId, setActiveId] = useState<TabId>('nu')

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="text-sm font-semibold text-brand-strong underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
      >
        Mở bảng size
      </button>
      <dialog ref={dialogRef} aria-labelledby="size-chart-title" className="m-auto w-[min(92vw,560px)] rounded-card p-6 backdrop:bg-ink/60">
        <h2 id="size-chart-title" className="text-xl font-black uppercase text-ink">
          Bảng size
        </h2>
        <div role="tablist" aria-label="Loại bảng" className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`size-tab-${t.id}`}
              aria-selected={t.id === activeId}
              aria-controls="size-panel"
              onClick={() => setActiveId(t.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${t.id === activeId ? 'border-brand-strong bg-brand-strong text-white' : 'border-line text-ink'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {activeId === 'nu' ? <SizeTable /> : <MeasureSteps />}
        <p className="mt-4 text-sm text-muted">Nếu số đo nằm giữa hai size, hãy chọn size lớn hơn.</p>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="mt-4 h-11 rounded-full bg-brand-strong px-6 text-sm font-semibold uppercase text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
        >
          Đóng
        </button>
      </dialog>
    </>
  )
}

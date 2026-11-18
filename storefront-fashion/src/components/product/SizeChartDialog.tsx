'use client'

import { useRef, useState } from 'react'
import { SIZE_TABLES } from '@/config/size-chart'
import { SizeTable } from './SizeTable'

export function SizeChartDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [activeId, setActiveId] = useState<string>(SIZE_TABLES[0].id)
  const table = SIZE_TABLES.find((t) => t.id === activeId) ?? SIZE_TABLES[0]

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
          Bảng size thể thao
        </h2>
        <div role="tablist" aria-label="Loại size" className="mt-4 flex flex-wrap gap-2">
          {SIZE_TABLES.map((t) => (
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
        <SizeTable table={table} />
        <p className="mt-4 text-sm text-muted">Nếu chiều cao hoặc cân nặng ở giữa hai size, hãy chọn size lớn hơn.</p>
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

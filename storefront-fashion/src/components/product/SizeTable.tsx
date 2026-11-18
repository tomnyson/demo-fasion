import type { SIZE_TABLES } from '@/config/size-chart'

export function SizeTable({ table }: { readonly table: (typeof SIZE_TABLES)[number] }) {
  return (
    <div role="tabpanel" id="size-panel" aria-labelledby={`size-tab-${table.id}`} className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-muted">
            {table.columns.map((column) => (
              <th key={column} scope="col" className="py-2 pr-4 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.size} className="border-b border-line">
              <th scope="row" className="py-2 pr-4 font-bold text-ink">
                {row.size}
              </th>
              <td className="py-2 pr-4">{row.a}</td>
              <td className="py-2">{row.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

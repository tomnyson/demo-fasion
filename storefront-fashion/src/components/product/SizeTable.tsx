import { SIZE_COLUMNS, SIZE_ROWS } from '@/config/size-chart'

export function SizeTable() {
  return (
    <div role="tabpanel" id="size-panel" aria-labelledby="size-tab-nu" className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-muted">
            {SIZE_COLUMNS.map((column) => (
              <th key={column} scope="col" className="py-2 pr-4 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SIZE_ROWS.map((row) => (
            <tr key={row.size} className="border-b border-line">
              <th scope="row" className="py-2 pr-4 font-bold text-ink">
                {row.size}
              </th>
              <td className="py-2 pr-4">{row.bust}</td>
              <td className="py-2 pr-4">{row.waist}</td>
              <td className="py-2">{row.hip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

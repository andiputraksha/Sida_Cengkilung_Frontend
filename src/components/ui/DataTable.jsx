export default function DataTable({ columns, data, actions }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left border rounded-xl overflow-hidden">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3 font-semibold">
                {col.header}
              </th>
            ))}
            {actions && <th className="px-4 py-3">Aksi</th>}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t hover:bg-slate-50 transition"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    {row[col.accessor]}
                  </td>
                ))}

                {actions && (
                  <td className="px-4 py-3 flex gap-2">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center py-6 text-slate-400"
              >
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
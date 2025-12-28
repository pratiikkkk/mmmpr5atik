import { Edit } from 'lucide-react';
import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onEdit?: (item: T) => void;
}

function DataTable<T>({ columns, data, keyField, onEdit }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card/40 shadow-2xl">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.header}
              </th>
            ))}
            {onEdit && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onEdit ? 1 : 0)} className="text-center py-12">
                <span className="text-muted-foreground text-sm">No records found</span>
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={String(item[keyField])}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render ? col.render(item) : String((item as any)[col.key] ?? '')}
                  </td>
                ))}
                {onEdit && (
                  <td className="text-right">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 bg-secondary rounded-lg border border-border text-muted-foreground hover:text-primary transition-all"
                    >
                      <Edit size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;

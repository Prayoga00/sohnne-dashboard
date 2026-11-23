import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export interface TableColumn<T> {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface SortableTableProps<T> {
  rows: T[];
  columns: TableColumn<T>[];
  getRowKey: (row: T) => string;
  ariaLabel: string;
  initialSortKey?: string;
  initialSortDir?: 'asc' | 'desc';
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function SortableTable<T>({
  rows,
  columns,
  getRowKey,
  ariaLabel,
  initialSortKey,
  initialSortDir = 'desc',
  onRowClick,
  emptyTitle = 'No matching records found',
  emptyDescription = 'Try adjusting your search query or status filters.',
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(initialSortKey ?? null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialSortDir);
  const [statusAnnouncement, setStatusAnnouncement] = useState('');

  const handleSort = (col: TableColumn<T>) => {
    if (!col.sortValue) return;
    let nextDir: 'asc' | 'desc' = 'asc';
    if (sortKey === col.key) {
      nextDir = sortDir === 'asc' ? 'desc' : 'asc';
    }
    setSortKey(col.key);
    setSortDir(nextDir);
    setStatusAnnouncement(`Sorted by ${col.label}, ${nextDir === 'asc' ? 'ascending' : 'descending'}.`);
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const getter = col.sortValue;
    return [...rows].sort((a, b) => {
      const av = getter(a);
      const bv = getter(b);
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, columns, sortKey, sortDir]);

  return (
    <div className="relative">
      <div role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </div>

      <div
        role="region"
        tabIndex={0}
        aria-label={ariaLabel}
        className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF]"
      >
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="border-b border-[#E5E7EB] bg-[#F3F4F6] text-[11px] font-semibold uppercase tracking-wide text-[#4B5563]">
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={`whitespace-nowrap px-2.5 py-2.5 first:pl-4 last:pr-4 ${alignClass} ${col.headerClassName ?? ''}`}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col)}
                        className={`inline-flex items-center gap-1.5 rounded px-1 py-0.5 font-semibold uppercase tracking-wide transition-colors hover:text-[#131313] ${
                          col.align === 'right' ? 'flex-row-reverse' : ''
                        } ${isSorted ? 'text-[#0057FF]' : 'text-[#4B5563]'}`}
                      >
                        <span>{col.label}</span>
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-55" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <p className="text-sm font-semibold text-[#131313]">{emptyTitle}</p>
                  <p className="mt-1 text-xs text-[#555555]">{emptyDescription}</p>
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`sortable-row transition-colors duration-150 hover:bg-[#F9FAFB] ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';
                    return (
                      <td key={col.key} className={`px-2.5 py-3 align-middle first:pl-4 last:pr-4 ${alignClass} ${col.cellClassName ?? ''}`}>
                        {col.render(row)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

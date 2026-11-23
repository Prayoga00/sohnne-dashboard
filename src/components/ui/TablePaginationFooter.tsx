import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface FooterSummaryStat {
  label?: string;
  value: string;
}

interface TablePaginationFooterProps {
  totalItems: number;
  page: number;
  totalPages: number;
  pageSize: number;
  summaryStats: FooterSummaryStat[];
  onPageChange: (nextPage: number) => void;
  ariaLabel?: string;
}

function getVisiblePages(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('ellipsis');
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export function TablePaginationFooter({
  totalItems,
  page,
  totalPages,
  pageSize,
  summaryStats,
  onPageChange,
  ariaLabel = 'Table pagination',
}: TablePaginationFooterProps) {
  const [pageDraft, setPageDraft] = useState(String(page));

  useEffect(() => {
    setPageDraft(String(page));
  }, [page]);

  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(totalItems, page * pageSize);

  const commitPageDraft = () => {
    const parsed = parseInt(pageDraft, 10);
    if (!Number.isFinite(parsed)) {
      setPageDraft(String(page));
      return;
    }
    const clamped = Math.min(Math.max(1, parsed), totalPages);
    setPageDraft(String(clamped));
    if (clamped !== page) {
      onPageChange(clamped);
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commitPageDraft();
  };

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F5F6F8] px-5 py-4 text-xs text-[#4B5563]">
      {/* Summary Counters */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 tabular-nums">
        <span className="text-[#555555]">
          Showing <strong className="text-[#131313]">{startIndex}–{endIndex}</strong> of{' '}
          <strong className="text-[#131313]">{totalItems}</strong>
        </span>
        {summaryStats.map((stat, idx) => (
          <span key={idx}>
            {stat.label && <span className="text-[#555555]">{stat.label}: </span>}
            <strong className="text-[#131313]">{stat.value}</strong>
          </span>
        ))}
      </div>

      {/* Pagination Buttons + Direct Page Input */}
      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label={ariaLabel} className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            aria-label="Previous page"
            className="btn-tactile inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#131313] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          {visiblePages.map((item, idx) =>
            item === 'ellipsis' ? (
              <span key={`el-${idx}`} className="px-1 text-xs font-medium text-[#6B7280]">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={page === item ? 'page' : undefined}
                className={`btn-tactile h-[34px] min-w-[34px] rounded-lg px-2.5 text-xs font-semibold tabular-nums transition-colors ${
                  page === item
                    ? 'bg-[#0057FF] text-white shadow-2xs'
                    : 'border border-[#E5E7EB] bg-white text-[#131313] hover:bg-[#F3F4F6]'
                }`}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            aria-label="Next page"
            className="btn-tactile inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#131313] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </nav>

        {/* Direct Page Input */}
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 border-l border-[#E5E7EB] pl-3">
          <label htmlFor={`page-input-${ariaLabel.replace(/\s+/g, '-')}`} className="font-medium text-[#555555]">
            Page
          </label>
          <input
            id={`page-input-${ariaLabel.replace(/\s+/g, '-')}`}
            name="pageNumber"
            type="number"
            min={1}
            max={totalPages}
            value={pageDraft}
            onChange={(e) => setPageDraft(e.target.value)}
            onBlur={commitPageDraft}
            aria-label="Jump to page number"
            className="h-[34px] w-14 rounded-lg border border-[#D1D5DB] bg-white px-2 text-center text-xs font-semibold tabular-nums text-[#131313] focus:border-[#0057FF] focus:outline-none"
          />
          <span className="tabular-nums text-[#555555]">of {totalPages}</span>
          <button
            type="submit"
            className="btn-tactile h-[34px] rounded-lg border border-[#E5E7EB] bg-white px-2.5 text-xs font-semibold text-[#0057FF] hover:border-[#0057FF]/40 hover:bg-[#EEF4FF]"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
}

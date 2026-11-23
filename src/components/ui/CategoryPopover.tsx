import { useEffect, useRef, useState } from 'react';

interface CategoryPopoverProps {
  categories: string[];
}

export function CategoryPopover({ categories }: CategoryPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const visible = categories.slice(0, 2);
  const hidden = categories.slice(2);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex flex-wrap items-center gap-1.5">
      {visible.map((cat) => (
        <span
          key={cat}
          className="inline-flex items-center whitespace-nowrap rounded-md bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#374151]"
        >
          {cat}
        </span>
      ))}
      {hidden.length > 0 && (
        <div className="relative inline-flex">
          <button
            type="button"
            aria-expanded={open}
            aria-label={`Show ${hidden.length} more categories`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className="btn-tactile inline-flex min-h-[24px] min-w-[24px] items-center justify-center whitespace-nowrap rounded-md border border-[#E5E7EB] bg-white px-1.5 text-xs font-semibold text-[#0057FF] hover:border-[#0057FF]/40 hover:bg-[#EEF4FF]"
          >
            +{hidden.length}
          </button>
          {open && (
            <div
              role="dialog"
              aria-label="Additional categories"
              className="sohnne-popover absolute left-0 top-full z-30 mt-1.5 min-w-[170px] rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-lg"
            >
              <p className="mb-1.5 px-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#555555]">
                All Categories
              </p>
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-md bg-[#F5F6F8] px-2 py-1 text-xs font-medium text-[#131313]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

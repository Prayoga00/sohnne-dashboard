import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface BrandSelectOption {
  value: string;
  label: string;
}

interface BrandSelectProps {
  id?: string;
  name?: string;
  ariaLabel?: string;
  value: string;
  options: BrandSelectOption[];
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  className?: string;
}

export function BrandSelect({
  id,
  name,
  ariaLabel,
  value,
  options,
  onChange,
  size = 'md',
  align = 'left',
  className = '',
}: BrandSelectProps) {
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const listboxId = `${buttonId}-listbox`;

  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value)),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  const updatePlacementAndToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const estimatedMenuHeight = Math.min(260, options.length * 38 + 16);
      setOpenUpward(rect.bottom + estimatedMenuHeight > window.innerHeight - 16);
      const currentIdx = Math.max(0, options.findIndex((o) => o.value === value));
      setHighlightedIndex(currentIdx);
    }
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      if (!open) {
        e.preventDefault();
        updatePlacementAndToggle();
        return;
      }
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setHighlightedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setHighlightedIndex(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = options[highlightedIndex];
      if (target) onChange(target.value);
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  const sizeClass =
    size === 'sm'
      ? 'h-9 px-3 text-xs font-semibold rounded-xl'
      : 'min-h-[42px] px-3.5 py-2 text-sm font-medium rounded-xl';

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}

      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={updatePlacementAndToggle}
        onKeyDown={handleTriggerKeyDown}
        className={`btn-tactile flex w-full items-center justify-between gap-2.5 border bg-white text-left text-[#131313] transition-colors ${sizeClass} ${
          open
            ? 'border-[#0057FF] ring-2 ring-[#0057FF]/15'
            : 'border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
        }`}
      >
        <span className="truncate">{selectedOption?.label ?? value}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#555555] transition-transform duration-150 ${
            open ? 'rotate-180 text-[#0057FF]' : 'rotate-0'
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          className={`sohnne-select-menu absolute z-40 max-h-60 min-w-full overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
          style={{ minWidth: 'max(100%, 172px)', overscrollBehavior: 'contain' }}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                className={`flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                  isSelected
                    ? 'bg-[#EEF4FF] font-semibold text-[#0057FF]'
                    : isHighlighted
                      ? 'bg-[#F5F6F8] font-medium text-[#131313]'
                      : 'font-medium text-[#374151]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#0057FF]" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

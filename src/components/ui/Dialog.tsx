import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: 'modal' | 'drawer' | 'drawer-left' | 'command';
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function ModalDialog({
  open,
  onClose,
  title,
  description,
  variant = 'modal',
  children,
  maxWidthClass = 'w-full max-w-lg',
}: ModalDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = React.useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.returnValue = '';
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onClose();
  };

  // Fallback light-dismiss for Safari (which may not support closedby="any")
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) {
      onClose();
    }
  };

  const variantClass =
    variant === 'drawer'
      ? 'sohnne-drawer'
      : variant === 'drawer-left'
        ? 'sohnne-drawer-left'
        : variant === 'command'
          ? 'sohnne-command'
          : `sohnne-dialog ${maxWidthClass}`;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onClose={() => {
        if (ref.current) ref.current.returnValue = '';
      }}
      {...({ closedby: 'any' } as Record<string, string>)}
      className={variantClass}
    >
      {variant === 'command' ? (
        <div>
          <h2 id={titleId} className="sr-only">
            {title}
          </h2>
          {children}
        </div>
      ) : (
        <div className="flex h-full flex-col bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-4">
            <div>
              <h2 id={titleId} className="font-serif-display text-xl font-bold text-[#131313]">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-[#555555]">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title}`}
              className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#131313]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}

'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Native <dialog>: focus trap, Esc to close and aria-modal come from the browser. */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const t = useTranslations('common');

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={id}
      className="m-auto w-[min(34rem,94vw)] rounded-2xl border border-line bg-card p-5 text-fg backdrop:bg-black/60"
    >
      {open && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <h2 id={id} className="text-lg font-semibold">{title}</h2>
            <button type="button" onClick={onClose} aria-label={t('close')} className="rounded-lg p-1 hover:bg-elev">
              <X size={18} />
            </button>
          </div>
          {children}
        </>
      )}
    </dialog>
  );
}

'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type Kind = 'success' | 'error';
interface ToastCtx { toast: (message: string, kind?: Kind) => void }
const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<{ message: string; kind: Kind } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toast = useCallback((message: string, kind: Kind = 'success') => {
    setItem({ message, kind });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setItem(null), 2500);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50">
        {item && (
          <div className={`rounded-xl border bg-elev px-4 py-2 text-sm shadow-lg ${item.kind === 'error' ? 'border-red-400' : 'border-sec'}`}>
            {item.message}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);

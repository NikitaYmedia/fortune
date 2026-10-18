import type { ReactNode } from 'react';

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card text-center text-sm text-mute">{children}</div>;
}

export function PageLoading() {
  return <div role="status" className="p-6 text-sm text-mute">…</div>;
}

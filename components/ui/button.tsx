import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'default' | 'primary' | 'danger' | 'ghost';
const variants: Record<Variant, string> = {
  default: 'border border-line bg-elev hover:border-sec',
  primary: 'bg-gradient-to-br from-[#5B21F0] to-[#B24BFF] text-white shadow-[0_8px_24px_-8px_rgba(122,43,255,.9)] hover:opacity-90',
  danger: 'border border-red-400/40 bg-elev text-red-400 hover:border-red-400',
  ghost: 'hover:bg-elev',
};

export function Button({
  variant = 'default', className, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-sm transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-yel disabled:opacity-50',
        variants[variant], className,
      )}
      {...props}
    />
  );
}

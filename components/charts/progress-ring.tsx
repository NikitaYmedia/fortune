export function ProgressRing({ value, label }: { value: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 130 130" width={140} role="img" aria-label={`${label}: ${value}%`}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="var(--line)" strokeWidth="12" />
      <circle
        cx="65" cy="65" r={r} fill="none" stroke="var(--yel)" strokeWidth="12" strokeLinecap="round"
        strokeDasharray={`${(c * value) / 100} ${c}`} transform="rotate(-90 65 65)"
      />
      <text x="65" y="72" textAnchor="middle" fill="var(--fg)" fontSize="26">{value}%</text>
    </svg>
  );
}

'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function ActivityChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey="label" stroke="var(--mute)" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis allowDecimals={false} stroke="var(--mute)" tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip
          cursor={{ fill: 'var(--line)' }}
          contentStyle={{ background: 'var(--elev)', border: '1px solid var(--line)', borderRadius: 12, color: 'var(--fg)' }}
        />
        <Bar dataKey="count" fill="var(--pri)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

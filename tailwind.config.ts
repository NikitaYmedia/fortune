import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', side: 'var(--side)', card: 'var(--card)', elev: 'var(--elev)',
        pri: 'var(--pri)', sec: 'var(--sec)', yel: 'var(--yel)', ok: 'var(--ok)',
        fg: 'var(--fg)', mute: 'var(--mute)', line: 'var(--line)',
      },
    },
  },
  plugins: [],
};
export default config;

export type Theme = 'dark' | 'light';
const KEY = 'neemo.theme';

export function getTheme(): Theme {
  try {
    return window.localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function setTheme(theme: Theme) {
  try { window.localStorage.setItem(KEY, theme); } catch { /* ignore */ }
  document.documentElement.dataset.theme = theme;
}

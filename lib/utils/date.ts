import { format, parseISO } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';

export const dfLocale = (locale: string) => (locale === 'uk' ? uk : enUS);
export const toISODate = (d: Date) => format(d, 'yyyy-MM-dd');
export const fmtDate = (iso: string, locale: string, pattern = 'd MMM') =>
  format(parseISO(iso), pattern, { locale: dfLocale(locale) });

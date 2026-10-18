import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Also stores the chosen language in the NEXT_LOCALE cookie (persists between sessions).
export default createMiddleware(routing);

export const config = { matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)' };

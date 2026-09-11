import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(es|fr|de|pt|hi|ar|zh|bn|ru|ja|ko|it|nl|tr)/:path*', '/((?!api|_next|_vercel|.*\\.(?:ico|png|jpg|jpeg|svg|css|js|mjs|woff|woff2|json|txt|xml)).*)']
};

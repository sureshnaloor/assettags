import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Page access for guests is enforced in the frontend AuthGate so they see a
 * dedicated "logged-in users only" screen instead of a silent sign-in redirect.
 * Public QR pages: /asset/[id] and /fixedasset/[id].
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

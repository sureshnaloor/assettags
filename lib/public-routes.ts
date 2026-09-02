import { isMarketingRoute } from '@/lib/design-tokens';

/** App list/master routes under /fixedasset — not QR asset-detail pages. */
export const FIXED_ASSET_APP_SEGMENTS = new Set([
  'category',
  'subcategory',
  'manufacturer',
  'without-custodian',
  'search-by-location',
  'transport-assets',
  'facility-assets',
  'portable-assets',
  'software-assets',
]);

/**
 * Pages anyone can view without a session.
 * Operational app pages are gated in AuthGate; marketing and auth stay public
 * so visitors can still reach the site and sign in.
 */
export function isPublicRoute(pathname: string | null): boolean {
  if (!pathname) return false;

  if (pathname.startsWith('/auth/change-password')) return false;
  if (pathname.startsWith('/auth')) return true;
  if (isMarketingRoute(pathname)) return true;

  const assetMatch = pathname.match(/^\/asset\/([^/]+)$/);
  if (assetMatch && assetMatch[1] !== 'preview') return true;

  const fixedMatch = pathname.match(/^\/fixedasset\/([^/]+)$/);
  if (fixedMatch && !FIXED_ASSET_APP_SEGMENTS.has(fixedMatch[1])) return true;

  return false;
}

/** Prevent open redirects after sign-in. */
export function safeInternalPath(value: string | null | undefined): string {
  if (!value) return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

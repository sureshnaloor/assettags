export type IncompleteHeaderAssetType = 'mme' | 'fixedasset';

export function isMmeAssetNumber(assetnumber: unknown): boolean {
  const first = String(assetnumber ?? '').trim().charAt(0);
  return first === '5' || first === '9';
}

export function isBlankString(value: unknown): boolean {
  return value == null || String(value).trim() === '';
}

export function isMissingDate(value: unknown): boolean {
  if (value == null || value === '') return true;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime());
}

export function isMissingValue(value: unknown): boolean {
  if (value == null || value === '') return true;
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(numeric);
}

export function isIncompleteHeader(header: Record<string, unknown> | null | undefined): boolean {
  if (!header) return true;
  return (
    isBlankString(header.assetdescription) ||
    isMissingDate(header.acquireddate) ||
    isMissingValue(header.acquiredvalue)
  );
}

export function dateToInputValue(value: unknown): string {
  if (isMissingDate(value)) return '';
  const date = value instanceof Date ? value : new Date(String(value));
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: unknown): Date | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T00:00:00.000Z`)
    : new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseAcquiredValue(value: unknown): number | null {
  if (value == null || String(value).trim() === '') return null;
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(numeric) ? null : numeric;
}

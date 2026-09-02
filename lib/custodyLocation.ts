/** Custody location type stored on equipmentcustody documents */
export type CustodyLocationType = 'warehouse' | 'camp/office' | 'project_site';

/** Legacy DB value */
export function normalizeCustodyLocationType(t?: string | null): CustodyLocationType {
  if (t === 'warehouse') return 'warehouse';
  if (t === 'camp/office') return 'camp/office';
  if (t === 'department' || t === 'project_site') return 'project_site';
  return 'warehouse';
}

export function displayCustodyLocationType(t?: string | null): string {
  const n = normalizeCustodyLocationType(t);
  if (n === 'warehouse') return 'Warehouse';
  if (n === 'project_site') return 'Project site';
  return 'Camp / offices';
}

export function firstNonEmpty(
  ...values: Array<string | null | undefined>
): string {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return '';
}

/** Fields used to resolve a display location / department from a custody record */
export type CustodyLocationFields = {
  locationType?: string | null;
  premisesLabel?: string | null;
  location?: string | null;
  warehouseLocation?: string | null;
  campOfficeLocation?: string | null;
  custodyCity?: string | null;
  warehouseCity?: string | null;
  departmentLocation?: string | null;
  floorRoom?: string | null;
  project?: string | null;
  projectname?: string | null;
  /** Legacy field on some older custody documents */
  department?: string | null;
  employeeDepartment?: string | null;
  projectDepartment?: string | null;
};

export function custodyPremisesLabel(c?: CustodyLocationFields | null): string {
  if (!c) return '';
  const type = String(c.locationType || '');
  return firstNonEmpty(
    c.premisesLabel,
    c.location,
    type === 'warehouse' ? c.warehouseLocation : ''
  );
}

export function custodyCityLabel(c?: CustodyLocationFields | null): string {
  if (!c) return '';
  const type = String(c.locationType || '');
  const city = firstNonEmpty(c.custodyCity);
  if (city) return city;
  if (type === 'warehouse') return firstNonEmpty(c.warehouseCity);
  return firstNonEmpty(c.departmentLocation);
}

/** Best available location line from a custody record (premises, then city / project). */
export function locationFromCustody(c?: CustodyLocationFields | null): string {
  if (!c) return '';
  const type = normalizeCustodyLocationType(c.locationType);
  if (type === 'project_site') {
    return firstNonEmpty(c.projectname, c.project, custodyCityLabel(c));
  }
  const premises = custodyPremisesLabel(c);
  const city = custodyCityLabel(c);
  if (premises && city && !premises.toLowerCase().includes(city.toLowerCase())) {
    return `${premises}, ${city}`;
  }
  return firstNonEmpty(premises, city, c.campOfficeLocation, c.warehouseLocation);
}

export function departmentFromCustody(c?: CustodyLocationFields | null): string {
  if (!c) return '';
  return firstNonEmpty(c.department, c.employeeDepartment, c.projectDepartment);
}

export function resolveAssetLocation(
  assetLocation?: string | null,
  custody?: CustodyLocationFields | null
): string {
  return firstNonEmpty(assetLocation, locationFromCustody(custody));
}

export function resolveAssetDepartment(
  assetDepartment?: string | null,
  custody?: CustodyLocationFields | null
): string {
  return firstNonEmpty(assetDepartment, departmentFromCustody(custody));
}

export function displayAssetLocation(
  assetLocation?: string | null,
  custody?: CustodyLocationFields | null
): string {
  return resolveAssetLocation(assetLocation, custody) || '—';
}

export function displayAssetDepartment(
  assetDepartment?: string | null,
  custody?: CustodyLocationFields | null
): string {
  return resolveAssetDepartment(assetDepartment, custody) || '—';
}

/** Open custody has no To date. Any filled To date means the record belongs in history. */
export function isOpenCustody(record?: { custodyto?: unknown } | null): boolean {
  if (!record) return false;
  const to = record.custodyto as unknown;
  if (to == null) return true;
  if (typeof to === 'string' && !to.trim()) return true;
  if (to instanceof Date) return Number.isNaN(to.getTime());
  const parsed = new Date(String(to));
  return Number.isNaN(parsed.getTime());
}

export function splitCustodyRecords<T extends { _id?: string; custodyto?: unknown }>(
  records: T[] | null | undefined
): { current: T | null; history: T[] } {
  const list = Array.isArray(records) ? records : [];
  const currentIndex = list.findIndex((record) => isOpenCustody(record));
  if (currentIndex < 0) {
    return { current: null, history: list };
  }
  return {
    current: list[currentIndex],
    history: list.filter((_, index) => index !== currentIndex),
  };
}

/** premises collection uses warehouse | department */
export function premisesMongoKindForCustody(loc: CustodyLocationType): 'warehouse' | 'department' {
  return loc === 'warehouse' ? 'warehouse' : 'department';
}

export type PremisesOption = { id: string; label: string };

export async function loadPremisesForCity(
  mongoKind: 'warehouse' | 'department',
  city: string
): Promise<PremisesOption[]> {
  const c = city.trim();
  if (!c) return [];
  const res = await fetch(
    `/api/locations?premisesKind=${mongoKind === 'warehouse' ? 'warehouse' : 'department'}`
  );
  if (!res.ok) return [];
  const rows = (await res.json()) as Array<{
    _id: unknown;
    locationName?: string;
    buildingTower?: string;
    townCity?: string;
  }>;
  return rows
    .filter((r) => (r.townCity || '').trim() === c)
    .map((r) => ({
      id: String(r._id),
      label: [r.locationName, r.buildingTower].filter(Boolean).join(' — ') || 'Premises',
    }));
}

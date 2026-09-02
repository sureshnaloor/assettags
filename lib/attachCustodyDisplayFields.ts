import type { Db } from 'mongodb';
import {
  resolveAssetDepartment,
  resolveAssetLocation,
  type CustodyLocationFields,
} from '@/lib/custodyLocation';

function projectWbsKey(project?: unknown): string {
  const s = String(project ?? '').trim();
  if (!s) return '';
  const idx = s.indexOf(' - ');
  return idx === -1 ? s : s.slice(0, idx).trim();
}

function indexEmployeeDepartments(
  employees: Array<{ empno?: unknown; department?: unknown }>
): Map<string, string> {
  const byEmp = new Map<string, string>();
  for (const employee of employees) {
    const empno = String(employee.empno ?? '').trim();
    const department = String(employee.department ?? '').trim();
    if (!empno || !department) continue;
    byEmp.set(empno, department);
    const numeric = Number(empno);
    if (!Number.isNaN(numeric)) byEmp.set(String(numeric), department);
  }
  return byEmp;
}

function lookupDepartment(map: Map<string, string>, key: unknown): string {
  const raw = String(key ?? '').trim();
  if (!raw) return '';
  return map.get(raw) || map.get(String(Number(raw))) || '';
}

function assetNumberKey(value: unknown): string {
  return String(value ?? '').trim();
}

function custodyTimestamp(value: unknown): number {
  if (!value) return 0;
  const time = new Date(value as string | Date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function isCurrentCustody(record: Record<string, unknown>): boolean {
  const to = record.custodyto;
  return to == null || to === '';
}

function pickCurrentCustody(
  records: Array<Record<string, unknown>>
): Record<string, unknown> | null {
  if (!records.length) return null;
  const current = records.filter(isCurrentCustody);
  const pool = current.length ? current : records;
  pool.sort((a, b) => custodyTimestamp(b.custodyfrom) - custodyTimestamp(a.custodyfrom));
  return pool[0];
}

export async function attachRelatedDepartments(
  db: Db,
  custodyRecords: Array<Record<string, unknown>>
): Promise<Array<Record<string, unknown>>> {
  const empNos = Array.from(
    new Set(
      custodyRecords
        .map((record) => String(record.employeenumber ?? '').trim())
        .filter(Boolean)
    )
  );
  const wbsKeys = Array.from(
    new Set(custodyRecords.map((record) => projectWbsKey(record.project)).filter(Boolean))
  );

  const [employees, projects] = await Promise.all([
    empNos.length
      ? db
          .collection('employees')
          .find(
            {
              $expr: {
                $in: [{ $toString: '$empno' }, empNos],
              },
            },
            { projection: { empno: 1, department: 1 } }
          )
          .toArray()
      : Promise.resolve([]),
    wbsKeys.length
      ? db
          .collection('projects')
          .find({ wbs: { $in: wbsKeys } }, { projection: { wbs: 1, department: 1 } })
          .toArray()
      : Promise.resolve([]),
  ]);

  const deptByEmp = indexEmployeeDepartments(
    employees as Array<{ empno?: unknown; department?: unknown }>
  );
  const deptByWbs = new Map<string, string>();
  for (const project of projects) {
    const wbs = String(project.wbs ?? '').trim();
    const department = String(project.department ?? '').trim();
    if (wbs && department) deptByWbs.set(wbs, department);
  }

  return custodyRecords.map((record) => ({
    ...record,
    employeeDepartment: lookupDepartment(deptByEmp, record.employeenumber),
    projectDepartment: deptByWbs.get(projectWbsKey(record.project)) || '',
  }));
}

export async function attachAssetLocationDepartmentFromCustody<T extends Record<string, unknown>>(
  db: Db,
  assets: T[]
): Promise<T[]> {
  if (!assets.length) return assets;

  const assetNumbers = Array.from(
    new Set(assets.map((asset) => assetNumberKey(asset.assetnumber)).filter(Boolean))
  );
  if (!assetNumbers.length) return assets;

  const custodyDocs = await db
    .collection('equipmentcustody')
    .find({
      $expr: {
        $in: [{ $toString: '$assetnumber' }, assetNumbers],
      },
    })
    .toArray();

  const enrichedCustody = await attachRelatedDepartments(
    db,
    custodyDocs as Array<Record<string, unknown>>
  );

  const byAsset = new Map<string, Record<string, unknown>>();
  for (const record of enrichedCustody) {
    const key = assetNumberKey(record.assetnumber);
    if (!key) continue;
    const existing = byAsset.get(key);
    if (!existing) {
      byAsset.set(key, record);
      continue;
    }
    const picked = pickCurrentCustody([existing, record]);
    if (picked) byAsset.set(key, picked);
  }

  return assets.map((asset) => {
    const custody = byAsset.get(assetNumberKey(asset.assetnumber)) as
      | CustodyLocationFields
      | undefined;
    const storedLocation =
      typeof asset.location === 'string' ? asset.location : String(asset.location ?? '');
    const storedDepartment =
      typeof asset.department === 'string' ? asset.department : String(asset.department ?? '');

    return {
      ...asset,
      location: resolveAssetLocation(storedLocation, custody),
      department: resolveAssetDepartment(storedDepartment, custody),
    };
  });
}

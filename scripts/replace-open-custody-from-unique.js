/**
 * Keep the open (custodyto: null) equipmentcustody rows listed on the Excel
 * "unique" sheet. Delete extra open duplicates. Closed history is left intact.
 * A unique-sheet row that is already closed in MongoDB is kept closed.
 *
 * Dry-run:  node scripts/replace-open-custody-from-unique.js
 * Apply:    node scripts/replace-open-custody-from-unique.js --apply
 *
 * Optional: pass a path to the workbook as another argument.
 */
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const XLSX = require('xlsx');

const EXPECTED_UNIQUE_ROWS = 3001;
const EXPECTED_EXTRA_OPEN = 630;
const EXPECTED_CLOSED = 635;
// Unique sheet listed this row as open, but live MongoDB already closed it
// on 2026-09-01. Do not reopen it; after cleanup there will be 3000 open rows.
const EXPECTED_OPEN_KEEPERS = 3000;
const EXPECTED_ALREADY_CLOSED_KEEPERS = 1;
const KNOWN_CLOSED_KEEPER_ID = '69ec50da6b8802f86b7380a2';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function loadKeeperIds(xlsxPath) {
  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`Workbook not found: ${xlsxPath}`);
  }

  const workbook = XLSX.readFile(xlsxPath);
  const sheet = workbook.Sheets.unique;
  if (!sheet) {
    throw new Error(`Sheet "unique" not found. Sheets: ${workbook.SheetNames.join(', ')}`);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });
  const ids = [];
  const seen = new Set();

  for (let i = 0; i < rows.length; i++) {
    const rawId = String(rows[i]._id ?? '').trim();
    if (!ObjectId.isValid(rawId) || rawId.length !== 24) {
      throw new Error(`Row ${i + 2}: invalid _id "${rawId}"`);
    }
    if (seen.has(rawId)) {
      throw new Error(`Row ${i + 2}: duplicate _id ${rawId}`);
    }
    seen.add(rawId);
    ids.push(new ObjectId(rawId));
  }

  return ids;
}

async function summarize(col, extraOpenFilter, keeperIds) {
  const duplicateOpenPipeline = [
    { $match: { custodyto: null } },
    { $group: { _id: '$assetnumber', n: { $sum: 1 } } },
    { $match: { n: { $gt: 1 } } },
    { $count: 'n' },
  ];

  const [
    total,
    extraOpen,
    openKeepers,
    missingKeepers,
    closed,
    openTotal,
    duplicateOpen,
  ] = await Promise.all([
    col.countDocuments({}),
    col.countDocuments(extraOpenFilter),
    col.countDocuments({ _id: { $in: keeperIds }, custodyto: null }),
    col.countDocuments({ _id: { $in: keeperIds }, custodyto: { $ne: null } }),
    col.countDocuments({ custodyto: { $ne: null } }),
    col.countDocuments({ custodyto: null }),
    col.aggregate(duplicateOpenPipeline).toArray(),
  ]);

  return {
    total,
    extraOpen,
    openKeepers,
    missingKeepers,
    closed,
    openTotal,
    assetsWithMultipleOpen: duplicateOpen[0]?.n ?? 0,
  };
}

async function main() {
  loadEnvFile(path.join(process.cwd(), '.env.local'));

  const apply = process.argv.includes('--apply');
  const xlsxPath =
    process.argv.find((arg) => arg.endsWith('.xlsx')) ||
    String.raw`c:\Users\IN1003199\Downloads\Asset_Custody_Log.xlsx`;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri || !dbName) {
    throw new Error('Missing MONGODB_URI or MONGODB_DB. Set env vars or .env.local values.');
  }

  const keeperIds = loadKeeperIds(xlsxPath);
  if (keeperIds.length !== EXPECTED_UNIQUE_ROWS) {
    throw new Error(`Expected ${EXPECTED_UNIQUE_ROWS} unique rows, got ${keeperIds.length}`);
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const col = client.db(dbName).collection('equipmentcustody');
    const extraOpenFilter = {
      custodyto: null,
      _id: { $nin: keeperIds },
    };

    const before = await summarize(col, extraOpenFilter, keeperIds);
    console.log(apply ? 'Mode: APPLY' : 'Mode: DRY-RUN');
    console.log('Workbook:', xlsxPath);
    console.log('Before:', before);

    if (
      before.extraOpen !== EXPECTED_EXTRA_OPEN ||
      before.openKeepers !== EXPECTED_OPEN_KEEPERS ||
      before.closed !== EXPECTED_CLOSED ||
      before.missingKeepers !== EXPECTED_ALREADY_CLOSED_KEEPERS
    ) {
      const present = await col
        .find({ _id: { $in: keeperIds } }, { projection: { _id: 1, assetnumber: 1, employeename: 1, custodyto: 1 } })
        .toArray();
      const presentIds = new Set(present.map((doc) => String(doc._id)));
      const absent = keeperIds.filter((id) => !presentIds.has(String(id)));
      const notOpen = present.filter((doc) => doc.custodyto !== null);
      console.log('Keepers absent from MongoDB:', absent.map(String));
      console.log(
        'Keepers present but not open:',
        notOpen.map((doc) => ({
          _id: String(doc._id),
          assetnumber: doc.assetnumber,
          employeename: doc.employeename,
          custodyto: doc.custodyto,
        }))
      );
    }

    if (before.extraOpen !== EXPECTED_EXTRA_OPEN) {
      throw new Error(
        `Refusing to continue: extra open count is ${before.extraOpen}, expected ${EXPECTED_EXTRA_OPEN}`
      );
    }
    if (before.openKeepers !== EXPECTED_OPEN_KEEPERS) {
      throw new Error(
        `Refusing to continue: open keepers is ${before.openKeepers}, expected ${EXPECTED_OPEN_KEEPERS}`
      );
    }
    if (before.closed !== EXPECTED_CLOSED) {
      throw new Error(
        `Refusing to continue: closed count is ${before.closed}, expected ${EXPECTED_CLOSED}`
      );
    }
    if (before.missingKeepers !== EXPECTED_ALREADY_CLOSED_KEEPERS) {
      throw new Error(
        `Refusing to continue: ${before.missingKeepers} unique-sheet _id(s) are not currently open, expected ${EXPECTED_ALREADY_CLOSED_KEEPERS}`
      );
    }

    if (!apply) {
      console.log(`Dry-run OK. Would delete ${before.extraOpen} extra open records.`);
      console.log('Re-run with --apply to delete.');
      return;
    }

    const result = await col.deleteMany(extraOpenFilter);
    console.log('deleted', result.deletedCount);

    if (result.deletedCount !== EXPECTED_EXTRA_OPEN) {
      throw new Error(
        `Delete count ${result.deletedCount} did not match expected ${EXPECTED_EXTRA_OPEN}`
      );
    }

    const after = await summarize(col, extraOpenFilter, keeperIds);
    console.log('After:', after);

    if (after.extraOpen !== 0) {
      throw new Error(`Cleanup incomplete: ${after.extraOpen} extra open records remain`);
    }
    if (after.openTotal !== EXPECTED_OPEN_KEEPERS) {
      throw new Error(`Open total after cleanup is ${after.openTotal}, expected ${EXPECTED_OPEN_KEEPERS}`);
    }
    if (after.closed !== EXPECTED_CLOSED) {
      throw new Error(`Closed total after cleanup is ${after.closed}, expected ${EXPECTED_CLOSED}`);
    }
    if (after.assetsWithMultipleOpen !== 0) {
      throw new Error(
        `${after.assetsWithMultipleOpen} asset(s) still have more than one open custody record`
      );
    }
    if (after.missingKeepers !== EXPECTED_ALREADY_CLOSED_KEEPERS) {
      throw new Error(
        `Expected keeper ${KNOWN_CLOSED_KEEPER_ID} to remain closed; missingKeepers=${after.missingKeepers}`
      );
    }

    console.log('Apply complete and verified.');
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('replace-open-custody-from-unique failed:', error.message);
  process.exit(1);
});

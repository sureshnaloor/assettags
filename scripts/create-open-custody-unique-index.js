/**
 * Unique partial index: at most one open custody row (custodyto: null) per asset.
 *
 *   node scripts/create-open-custody-unique-index.js
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const INDEX_NAME = 'uniq_open_custody_per_asset';

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

async function main() {
  loadEnvFile(path.join(process.cwd(), '.env.local'));

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri || !dbName) {
    throw new Error('Missing MONGODB_URI or MONGODB_DB. Set env vars or .env.local values.');
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const col = client.db(dbName).collection('equipmentcustody');

    const duplicates = await col
      .aggregate([
        { $match: { custodyto: null } },
        { $group: { _id: '$assetnumber', n: { $sum: 1 } } },
        { $match: { n: { $gt: 1 } } },
        { $limit: 5 },
      ])
      .toArray();

    if (duplicates.length > 0) {
      throw new Error(
        `Cannot create unique index: ${duplicates.length} asset(s) still have multiple open rows, e.g. ${duplicates[0]._id}`
      );
    }

    const name = await col.createIndex(
      { assetnumber: 1 },
      {
        unique: true,
        name: INDEX_NAME,
        partialFilterExpression: { custodyto: null },
      }
    );

    const indexes = await col.indexes();
    const created = indexes.find((idx) => idx.name === INDEX_NAME);
    console.log('created', name);
    console.log('index', created);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('create-open-custody-unique-index failed:', error.message);
  process.exit(1);
});

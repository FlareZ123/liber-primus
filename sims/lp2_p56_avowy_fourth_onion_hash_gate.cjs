'use strict';

const { createHash } = require('node:crypto');
const { gunzipSync } = require('node:zlib');

const SOURCE_COMMIT = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const BASE = `https://raw.githubusercontent.com/neuroretransmit/cicada/${SOURCE_COMMIT}/2014/006-fourth-onion/`;
const TARGET = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';

const FILES = [
  { name: 'original-html', path: 'avowyfg151kzfj3n.html', blob: 'c386f1d4f43158af0a8e671d34f6248875068a7a' },
  { name: 'original-256-hex', path: 'avowyfg151kzfj3n_256.hex', blob: '5fd99c0f6c0fe9f86c013f19880ba8179ccf9f0c' },
  { name: 'post-downtime-html', path: 'avowyfg151kzfj3n_update_after_downtime.html', blob: 'f8b6e108b8dab4fa095356f73a4f53e41918cb55' },
  { name: 'decoded-gzip', path: 'decoded.gz', blob: '7e273e715c4138a178c3f36bf17ac05955fe4c1d' },
  { name: 'decoded-payload', path: 'decoded', blob: '7b640ff8b74e51b1c767f5270a5eec9cdc677448' },
];

async function fetchExact(file) {
  const response = await fetch(BASE + file.path, { redirect: 'follow' });
  if (!response.ok) throw new Error(`GET ${file.path}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const gitBlob = createHash('sha1')
    .update(Buffer.from(`blob ${bytes.length}\0`))
    .update(bytes)
    .digest('hex');
  if (gitBlob !== file.blob) {
    throw new Error(`${file.path}: Git blob mismatch: expected ${file.blob}, got ${gitBlob}`);
  }
  return bytes;
}

function digestRow(name, bytes) {
  const row = { name, bytes: bytes.length, git_blob_verified: true };
  for (const algorithm of ['sha512', 'sha3-512', 'blake2b512']) {
    try {
      const digest = createHash(algorithm).update(bytes).digest('hex');
      row[algorithm] = digest;
      row[`${algorithm}_matches_target`] = digest === TARGET;
    } catch (error) {
      row[`${algorithm}_unavailable`] = String(error.message || error);
    }
  }
  return row;
}

async function main() {
  const files = new Map();
  const rows = [];
  for (const file of FILES) {
    const bytes = await fetchExact(file);
    files.set(file.name, bytes);
    rows.push(digestRow(file.name, bytes));
  }

  const originalHex = files.get('original-256-hex').toString('ascii').trim();
  if (!/^(?:[0-9a-f]{2})+$/i.test(originalHex)) {
    throw new Error('Original 256-byte page payload is not clean hexadecimal.');
  }
  rows.push(digestRow('original-256-hex-decoded', Buffer.from(originalHex, 'hex')));

  const updateText = files.get('post-downtime-html').toString('latin1');
  const longHex = [...updateText.matchAll(/[0-9a-f]{512,}/gi)]
    .map(match => match[0])
    .sort((a, b) => b.length - a.length)[0];
  if (longHex) {
    rows.push(digestRow('post-downtime-largest-embedded-hex-text', Buffer.from(longHex, 'ascii')));
    rows.push(digestRow('post-downtime-largest-embedded-hex-decoded', Buffer.from(longHex, 'hex')));
  } else {
    rows.push({ name: 'post-downtime-largest-embedded-hex', found: false });
  }

  let gunzipComparison;
  try {
    const inflated = gunzipSync(files.get('decoded-gzip'));
    rows.push(digestRow('gunzip-decoded-gzip', inflated));
    gunzipComparison = {
      inflated_bytes: inflated.length,
      equals_archived_decoded: inflated.equals(files.get('decoded-payload')),
    };
  } catch (error) {
    gunzipComparison = { error: String(error.message || error) };
  }

  const matches = rows.filter(row =>
    row.sha512_matches_target || row['sha3-512_matches_target'] || row.blake2b512_matches_target
  );
  console.log(JSON.stringify({
    source_repository: 'neuroretransmit/cicada',
    source_commit: SOURCE_COMMIT,
    target_digest: TARGET,
    scope: 'Exact archived fourth-onion page bodies and directly embedded/decompressed payloads only; no normalization or arbitrary substring search.',
    gunzip_comparison: gunzipComparison,
    matches,
    results: rows,
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

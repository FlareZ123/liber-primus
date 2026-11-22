'use strict';

/**
 * Bounded archive lookup for the conjectural A194954-derived host 173.148.8.28.
 * Scope: Arquivo.pt + Internet Archive CDX, 2014-2016, exact host only.
 * No live Tor probing, host enumeration, URL/path permutations, or port scan.
 * Replays only indexed 200 captures; checks archive SHA-1 payload digests and
 * the printed p56 512-bit target against raw and two conventional text variants.
 * Node.js 22+, read-only.
 */
const fs = require('node:fs');
const crypto = require('node:crypto');

const HOST = '173.148.8.28';
const FROM = '2014';
const TO = '2016';
const LIMIT = '10000';
const MAX_REPLAYS = 50;
const TIMEOUT_MS = 30000;
const manifest = JSON.parse(fs.readFileSync(
  'resources/cicada2014-archive-hash-manifest.json', 'utf8'
));
const TARGET = manifest.targetHex.toLowerCase();
if (!/^[0-9a-f]{128}$/.test(TARGET)) throw new Error('Bad p56 target');

const supported = new Set(crypto.getHashes().map(x => x.toLowerCase()));
const algorithms = ['sha512', 'sha3-512', 'blake2b512', 'whirlpool']
  .filter(name => supported.has(name));

function sha1Base32(bytes) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const digest = crypto.createHash('sha1').update(bytes).digest();
  let bits = 0, acc = 0, out = '';
  for (const byte of digest) {
    acc = (acc << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += alphabet[(acc >>> bits) & 31];
    }
  }
  if (bits) out += alphabet[(acc << (5 - bits)) & 31];
  return out;
}

async function get(url) {
  try {
    const response = await fetch(url, {signal: AbortSignal.timeout(TIMEOUT_MS)});
    const bytes = new Uint8Array(await response.arrayBuffer());
    return {status: response.status, bytes, url: response.url};
  } catch (error) {
    return {error: String(error), url};
  }
}

function parseNdjson(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/).filter(Boolean)) {
    try { rows.push(JSON.parse(line)); } catch {}
  }
  return rows;
}

function parseWaybackJson(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data) || data.length < 1) return [];
  const header = data[0];
  if (!Array.isArray(header)) return [];
  return data.slice(1).filter(Array.isArray).map(row =>
    Object.fromEntries(header.map((key, index) => [key, row[index]]))
  );
}

function digestTests(bytes, textLike) {
  const variants = [{name: 'raw', bytes}];
  if (textLike) {
    const text = Buffer.from(bytes).toString('utf8');
    if (text.includes('\r\n')) {
      variants.push({name: 'CRLF-to-LF', bytes: Buffer.from(text.replace(/\r\n/g, '\n'), 'utf8')});
    }
    if (bytes.length && bytes[bytes.length - 1] === 10) {
      variants.push({name: 'drop-final-LF', bytes: bytes.slice(0, -1)});
    }
  }
  const tests = [];
  for (const variant of variants) {
    for (const algorithm of algorithms) {
      const hex = crypto.createHash(algorithm).update(variant.bytes).digest('hex');
      tests.push({variant: variant.name, algorithm, match: hex === TARGET});
    }
  }
  return {tests, hits: tests.filter(x => x.match)};
}

async function arquivoQuery(url, matchType, positiveControl = false) {
  const endpoint = new URL('https://arquivo.pt/wayback/cdx');
  for (const [key, value] of Object.entries({
    url, matchType, from: FROM, to: TO, output: 'json', limit: LIMIT,
    fields: 'url,timestamp,status,mime,digest,length,filename,collection,source'
  })) endpoint.searchParams.set(key, value);
  const response = await get(endpoint.href);
  if (response.error || response.status !== 200) {
    return {provider: 'arquivo', query: url, matchType, error: response.error || ('HTTP ' + response.status)};
  }
  const rows = parseNdjson(Buffer.from(response.bytes).toString('utf8'));
  const selected = rows.filter(row => String(row.status) === '200');
  return {
    provider: 'arquivo', query: url, matchType, totalRows: rows.length,
    status200: selected.length,
    rows: selected.map(row => ({
      url: row.url, timestamp: row.timestamp, mime: row.mime,
      digest: row.digest, length: row.length, filename: row.filename,
      collection: row.collection, source: row.source
    })),
    positiveControl
  };
}

async function waybackQuery(url, matchType, positiveControl = false) {
  const endpoint = new URL('https://web.archive.org/cdx/search/cdx');
  for (const [key, value] of Object.entries({
    url, matchType, from: FROM, to: TO, output: 'json',
    fl: 'timestamp,original,mimetype,statuscode,digest,length',
    filter: 'statuscode:200', collapse: 'urlkey', limit: LIMIT
  })) endpoint.searchParams.set(key, value);
  const response = await get(endpoint.href);
  if (response.error || response.status !== 200) {
    return {provider: 'wayback', query: url, matchType, error: response.error || ('HTTP ' + response.status)};
  }
  const rows = parseWaybackJson(Buffer.from(response.bytes).toString('utf8'));
  return {
    provider: 'wayback', query: url, matchType, totalRows: rows.length,
    rows: rows.map(row => ({
      url: row.original, timestamp: row.timestamp, mime: row.mimetype,
      status: row.statuscode, digest: row.digest, length: row.length
    })),
    positiveControl
  };
}

async function replay(provider, row) {
  const timestamp = row.timestamp;
  const original = provider === 'arquivo' ? row.url : row.original;
  const expectedSha1 = row.digest;
  const replayUrl = provider === 'arquivo'
    ? 'https://arquivo.pt/noFrame/replay/' + timestamp + 'id_/' + original
    : 'https://web.archive.org/web/' + timestamp + 'id_/' + original;
  const response = await get(replayUrl);
  if (response.error || response.status !== 200) {
    return {provider, original, timestamp, replayUrl, error: response.error || ('HTTP ' + response.status)};
  }
  const bytes = Buffer.from(response.bytes);
  const actualSha1 = sha1Base32(bytes);
  const textLike = /^text\//i.test(row.mime || row.mimetype || '');
  const hashes = digestTests(bytes, textLike);
  return {
    provider, original, timestamp, mime: row.mime || row.mimetype,
    bytes: bytes.length, replayUrl,
    cdxSha1: expectedSha1 || null, replaySha1: actualSha1,
    cdxSha1Match: expectedSha1 ? actualSha1 === expectedSha1 : null,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    digestAlgorithms: algorithms, hashTests: hashes.tests, targetHits: hashes.hits
  };
}

async function probeProvider(provider, query) {
  const result = provider === 'arquivo'
    ? await arquivoQuery(query.url, query.matchType, query.control)
    : await waybackQuery(query.url, query.matchType, query.control);
  if (result.error || !result.rows) return result;
  if (query.control) {
    const rows = result.rows;
    const capture = provider === 'arquivo'
      ? rows.find(row => /^text\//i.test(row.mime || ''))
      : rows.find(row => /^text\//i.test(row.mime || ''));
    result.controlReplay = capture ? await replay(provider, capture) : {error: 'No text/200 control capture'};
    return result;
  }
  const rows = result.rows;
  const seen = new Set();
  const unique = [];
  for (const row of rows) {
    const key = [row.digest || '', row.url || row.original || '', row.length || ''].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  result.uniqueCaptures = unique.length;
  result.replays = [];
  for (const row of unique.slice(0, MAX_REPLAYS)) {
    result.replays.push(await replay(provider, row));
  }
  result.replayLimit = MAX_REPLAYS;
  result.truncatedReplays = Math.max(0, unique.length - MAX_REPLAYS);
  return result;
}

(async () => {
  console.log('A194954-IP-ARCHIVE-PROBE', JSON.stringify({
    started: new Date().toISOString(), host: HOST, period: FROM + '-' + TO,
    targetLocation: 'physical p56 printed 128-hex target; hash family not source-authenticated',
    targetHex: TARGET, algorithms, maxReplays: MAX_REPLAYS
  }));

  const queries = [
    {provider: 'arquivo', url: 'http://www.publico.pt/', matchType: 'host', control: true},
    {provider: 'wayback', url: 'http://example.com/', matchType: 'host', control: true},
    {provider: 'arquivo', url: HOST, matchType: 'host'},
    {provider: 'wayback', url: HOST, matchType: 'host'}
  ];
  const results = [];
  for (const query of queries) {
    const result = await probeProvider(query.provider, query);
    results.push(result);
    console.log('ARCHIVE-RESULT', JSON.stringify(result));
  }

  const candidateResults = results.filter(result => !result.positiveControl);
  const candidateRows = candidateResults.reduce((n, result) => n + (result.status200 || result.rows?.length || 0), 0);
  const replayCount = candidateResults.reduce((n, result) => n + (result.replays?.length || 0), 0);
  const targetHits = candidateResults.flatMap(result => result.replays || [])
    .flatMap(replayResult => replayResult.targetHits || []);
  console.log('A194954-IP-ARCHIVE-SUMMARY', JSON.stringify({
    completed: new Date().toISOString(),
    host: HOST, candidateStatus200Rows: candidateRows,
    candidateReplays: replayCount, targetHits,
    controls: results.filter(result => result.positiveControl).map(result => ({
      provider: result.provider, rows: result.status200 ?? result.totalRows,
      replayStatus: result.controlReplay?.error || result.controlReplay?.cdxSha1Match
    })),
    errors: results.filter(result => result.error).map(result => ({
      provider: result.provider, error: result.error
    }))
  }));
})().catch(error => {
  console.error('A194954-IP-ARCHIVE-FATAL', error.stack || error);
  process.exitCode = 1;
});

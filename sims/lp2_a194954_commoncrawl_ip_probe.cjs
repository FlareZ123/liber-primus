'use strict';

/**
 * Bounded Common Crawl host lookup for the conjectural A194954-derived IP.
 * Queries the eight pinned 2014 Common Crawl indexes using matchType=host.
 * Each index must pass at least one independent domain positive control before
 * a zero-result target query is counted. Replays indexed WARC records only.
 *
 * This is an archive lookup, not a live IP probe, port scan, or host search.
 * The p56 128-hex digest family is not authenticated; test common 512-bit
 * families on recovered response bodies, without claiming an algorithm match.
 * Node.js 22+, read-only.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {gunzipSync} = require('node:zlib');

const ENDPOINT = 'https://index.commoncrawl.org';
const DATA = 'https://data.commoncrawl.org/';
const HOST = '173.148.8.28';
const TARGET_HASH = JSON.parse(fs.readFileSync(
  'resources/cicada2014-archive-hash-manifest.json', 'utf8'
)).targetHex.toLowerCase();
const INDEXES = [
  'CC-MAIN-2014-10', 'CC-MAIN-2014-15', 'CC-MAIN-2014-23',
  'CC-MAIN-2014-35', 'CC-MAIN-2014-41', 'CC-MAIN-2014-42',
  'CC-MAIN-2014-49', 'CC-MAIN-2014-52'
];
const CONTROLS = ['example.com', 'google.com', 'wikipedia.org'];
const MAX_ATTEMPTS = 3;
const CONCURRENCY = 3;
const DELAY_MS = 500;
const MAX_WARC_RECORDS = 50;
const TIMEOUT_MS = 45000;
const OUTPUT_DIR = path.join(process.cwd(), 'probe-output');

if (!/^[0-9a-f]{128}$/.test(TARGET_HASH)) throw new Error('Invalid p56 target hash');
const supported = new Set(crypto.getHashes().map(x => x.toLowerCase()));
const HASHES = ['sha512', 'sha3-512', 'blake2b512', 'whirlpool']
  .filter(name => supported.has(name));

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function parseNdjson(body) {
  return body.trim()
    ? body.trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line))
    : [];
}

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

async function query(index, host, role, matchType = 'host', limit = 5000) {
  const url = new URL(ENDPOINT + '/' + index + '-index');
  url.searchParams.set('url', host);
  url.searchParams.set('matchType', matchType);
  url.searchParams.set('output', 'json');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('fl', 'timestamp,url,status,mime,filename,offset,length,digest');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: 'application/x-ndjson, application/json;q=0.9, text/plain;q=0.8',
          'user-agent': 'LiberPrimus-A194954-IP-CommonCrawl/1.0 (bounded archive lookup)'
        },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      const body = await response.text();
      if (response.status === 404 && /no captures found/i.test(body)) {
        return {index, host, role, match_type: matchType, http_status: 404,
          record_count: 0, records: [], no_captures: true, attempts: attempt};
      }
      if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS) {
        await sleep(1500 * attempt);
        continue;
      }
      if (!response.ok) {
        return {index, host, role, match_type: matchType, http_status: response.status,
          error: body.slice(0, 1000), record_count: 0, records: [], attempts: attempt};
      }
      let records;
      try { records = parseNdjson(body); }
      catch (error) {
        return {index, host, role, match_type: matchType, http_status: response.status,
          error: 'Invalid NDJSON: ' + String(error), excerpt: body.slice(0, 1000),
          record_count: 0, records: [], attempts: attempt};
      }
      return {index, host, role, match_type: matchType, http_status: response.status,
        record_count: records.length, records, attempts: attempt};
    } catch (error) {
      if (attempt < MAX_ATTEMPTS) {
        await sleep(1500 * attempt);
        continue;
      }
      return {index, host, role, match_type: matchType, error: String(error),
        record_count: 0, records: [], attempts: attempt};
    }
  }
}

function hashVariants(bytes, mime) {
  const variants = [{name: 'raw-body', bytes}];
  if (/^(text\/|application\/(?:json|xhtml\+xml|xml))/i.test(mime || '')) {
    const text = bytes.toString('utf8');
    if (text.includes('\r\n')) {
      variants.push({name: 'CRLF-to-LF', bytes: Buffer.from(text.replace(/\r\n/g, '\n'), 'utf8')});
    }
    if (bytes.length && bytes[bytes.length - 1] === 10) {
      variants.push({name: 'drop-final-LF', bytes: bytes.subarray(0, -1)});
    }
  }
  const tests = [];
  for (const variant of variants) {
    for (const algorithm of HASHES) {
      const hex = crypto.createHash(algorithm).update(variant.bytes).digest('hex');
      tests.push({variant: variant.name, algorithm, match: hex === TARGET_HASH});
    }
  }
  return {tests, hits: tests.filter(x => x.match)};
}

function parseWarc(compressed, record) {
  const raw = gunzipSync(compressed);
  const boundary = Buffer.from('\r\n\r\n');
  const first = raw.indexOf(boundary);
  if (first < 0) throw new Error('WARC header delimiter missing');
  const warcHeaders = raw.subarray(0, first).toString('latin1');
  const payload = raw.subarray(first + boundary.length);
  const second = payload.indexOf(boundary);
  if (second < 0) throw new Error('HTTP header delimiter missing');
  const httpHeaders = payload.subarray(0, second).toString('latin1');
  const bodyStart = second + boundary.length;
  const lengthMatch = httpHeaders.match(/\bcontent-length:\s*(\d+)/i);
  const bodyLength = lengthMatch ? Number(lengthMatch[1]) : payload.length - bodyStart;
  const body = payload.subarray(bodyStart, bodyStart + bodyLength);
  const statusMatch = httpHeaders.match(/^HTTP\/[^\s]+\s+(\d+)/i);
  return {
    raw, warcHeaders, httpHeaders, payload, body,
    httpStatus: statusMatch ? Number(statusMatch[1]) : null,
    declaredBodyLength: lengthMatch ? Number(lengthMatch[1]) : null,
    bodyLength: body.length,
    recordDigest: record.digest,
    bodySha1Base32: sha1Base32(body),
    payloadSha1Base32: sha1Base32(payload.subarray(0, bodyStart + body.length)),
    bodySha1MatchesCdx: record.digest
      ? sha1Base32(body).toLowerCase() === String(record.digest).replace(/^sha1:/i, '').toLowerCase()
      : null
  };
}

async function fetchWarc(record) {
  const offset = Number(record.offset);
  const length = Number(record.length);
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || length <= 0 || length > 20_000_000) {
    return {error: 'Invalid or oversized WARC range', record};
  }
  const end = offset + length - 1;
  const response = await fetch(DATA + record.filename, {
    headers: {Range: 'bytes=' + offset + '-' + end},
    signal: AbortSignal.timeout(60000)
  });
  if (response.status !== 206) {
    const excerpt = (await response.text()).slice(0, 300);
    return {error: 'Expected HTTP 206 for WARC range; got ' + response.status,
      excerpt, record};
  }
  const compressed = Buffer.from(await response.arrayBuffer());
  const parsed = parseWarc(compressed, record);
  const hashes = hashVariants(parsed.body, record.mime);
  return {
    url: record.url, timestamp: record.timestamp, mime: record.mime,
    status: record.status, length: record.length, offset: record.offset,
    filename: record.filename, cdxDigest: record.digest,
    compressedLength: compressed.length, compressedSha256: crypto.createHash('sha256').update(compressed).digest('hex'),
    warcHeaders: parsed.warcHeaders, httpHeaders: parsed.httpHeaders,
    httpStatus: parsed.httpStatus, bodyLength: parsed.bodyLength,
    bodySha1Base32: parsed.bodySha1Base32,
    bodySha1MatchesCdx: parsed.bodySha1MatchesCdx,
    payloadSha1Base32: parsed.payloadSha1Base32,
    bodySha256: crypto.createHash('sha256').update(parsed.body).digest('hex'),
    hashAlgorithms: HASHES, hashTests: hashes.tests, targetHits: hashes.hits,
    bodyExcerpt: /^text\//i.test(record.mime || '')
      ? parsed.body.toString('utf8').slice(0, 2000) : undefined
  };
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, {recursive: true});
  const started = new Date().toISOString();
  const controls = [];
  const targetResults = [];
  const controlPassedByIndex = {};
  const skippedIndexes = [];

  for (const index of INDEXES) {
    const controlResults = await Promise.all(CONTROLS.map(host =>
      query(index, host, 'positive-control', 'domain', 1)
    ));
    controls.push(...controlResults);
    const passed = controlResults.some(result =>
      result.http_status === 200 && (result.record_count || 0) > 0
    );
    controlPassedByIndex[index] = passed;

    if (!passed) {
      skippedIndexes.push(index);
      console.log('SKIP-INDEX', JSON.stringify({index, reason: 'No positive control passed'}));
      continue;
    }

    const result = await query(index, HOST, 'A194954-derived-IP-host', 'host', 5000);
    targetResults.push(result);
    console.log('HOST-QUERY', JSON.stringify({
      index, http_status: result.http_status, error: result.error,
      record_count: result.record_count, records: result.records
    }));
    await sleep(DELAY_MS);
  }

  const errors = [...controls, ...targetResults].filter(result =>
    result.error || (result.http_status && result.http_status !== 200 && result.http_status !== 404)
  );
  const records = targetResults.flatMap(result => result.records || [])
    .filter(record => String(record.status) === '200');
  const unique = [];
  const seen = new Set();
  for (const record of records) {
    const key = [record.digest || '', record.url || '', record.timestamp || ''].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(record);
  }

  const payloads = [];
  for (const record of unique.slice(0, MAX_WARC_RECORDS)) {
    try { payloads.push(await fetchWarc(record)); }
    catch (error) { payloads.push({error: String(error), record}); }
  }

  const allControlsPassed = INDEXES.every(index => controlPassedByIndex[index]);
  const complete = targetResults.length === INDEXES.length && errors.length === 0;
  const hits = payloads.flatMap(payload => payload.targetHits || []);
  const summary = {
    schema: 1, source: 'Common Crawl 2014 indexes; A194954-derived candidate host',
    started, finished: new Date().toISOString(), host: HOST, target_hash: TARGET_HASH,
    target_hash_location: 'physical p56; algorithm not source-authenticated',
    indexes: INDEXES, controls: CONTROLS, control_passed_by_index: controlPassedByIndex,
    all_controls_passed: allControlsPassed, skipped_indexes: skippedIndexes,
    completed_target_queries: targetResults.length, expected_target_queries: INDEXES.length,
    status200_records: records.length, unique_replays: unique.length,
    replayed_records: payloads.length, truncated_replays: Math.max(0, unique.length - MAX_WARC_RECORDS),
    hash_algorithms: HASHES, target_hits: hits, errors,
    target_results: targetResults, payloads,
    interpretation: !allControlsPassed
      ? 'Inconclusive: at least one Common Crawl index lacked a positive control.'
      : !complete
        ? 'Partial/inconclusive: one or more index queries failed or were skipped.'
        : hits.length
          ? 'An archived response body matches the p56 512-bit target under a tested hash variant; independently authenticate algorithm and byte serialization.'
          : records.length
            ? 'Archived host records exist, but no tested body matched the p56 target. Inspect any content candidates and broaden hash-family tests only if source-selected.'
            : 'All 2014 index controls passed; no status-200 captures were indexed for the candidate host in these eight collections.'
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'a194954-commoncrawl-ip.json'),
    JSON.stringify(summary, null, 2) + '\n');
  console.log('A194954-COMMONCRAWL-SUMMARY', JSON.stringify({
    allControlsPassed, complete, host: HOST, targetRows: records.length,
    uniqueReplays: unique.length, replayed: payloads.length, targetHits: hits,
    skippedIndexes, errors: errors.length, output: 'probe-output/a194954-commoncrawl-ip.json',
    interpretation: summary.interpretation
  }));
  if (!allControlsPassed || !complete) process.exitCode = 1;
}

run().catch(error => {
  console.error('A194954-COMMONCRAWL-FATAL', error.stack || error);
  process.exitCode = 1;
});

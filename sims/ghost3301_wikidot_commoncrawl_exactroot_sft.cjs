/**
 * Exact-host historical Common Crawl recovery for Director #1886.
 * Designed for the existing Windows-latest Node 22 manual read-only SFT runner.
 * Only source-named Wikidot root URL is queried. No broad crawling.
 */
'use strict';

const { createHash } = require('node:crypto');
const { gunzipSync } = require('node:zlib');

const vintages = [
  'CC-MAIN-2014-52', 'CC-MAIN-2015-11',
  'CC-MAIN-2019-35', 'CC-MAIN-2019-39',
  'CC-MAIN-2019-43', 'CC-MAIN-2020-05',
];
const host = 'howwillyoutelltheworld.wikidot.com';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

/** @param {string} url @param {Record<string,string>} [headers] */
async function get(url, headers = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LP2-targeted-public-archive-recovery/1.0', ...headers },
    signal: AbortSignal.timeout(27000),
  });
  const bytes = Buffer.from(await res.arrayBuffer());
  return { status: res.status, headers: res.headers, bytes };
}

/** @param {Record<string,any>} item */
async function record(item) {
  if (!item.filename || !item.offset || !item.length) return;
  const offset = Number(item.offset), length = Number(item.length);
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) ||
      length <= 0 || length > 2500000) return;
  const path = 'https://data.commoncrawl.org/' + item.filename;
  const res = await get(path, { Range: 'bytes=' + offset + '-' + (offset + length - 1) });
  console.log('WARC_TRANSPORT', JSON.stringify({
    original: item.url, timestamp: item.timestamp, indexDigest: item.digest,
    filename: item.filename, offset, length, status: res.status,
    range: res.headers.get('content-range'), actualLength: res.bytes.length,
    rawSha256: digest(res.bytes),
  }));
  if (res.status !== 206 && (res.status !== 200 || res.bytes.length !== length)) return;
  const clear = res.bytes[0] === 31 && res.bytes[1] === 139 ?
    gunzipSync(res.bytes) : res.bytes;
  const txt = clear.toString('utf8');
  const refs = [...txt.matchAll(/\b(?:href|src)\s*=\s*["']([^"']{1,400})["']/ig)]
    .map(x => x[1])
    .filter(x => /\.pdf\b|\.zip\b|\.rune\b|wdfiles\.com/i.test(x));
  console.log('WARC_ORIGINAL_SOURCE', JSON.stringify({
    original: item.url, decodedSha256: digest(clear),
    decodedLength: clear.length, links: [...new Set(refs)].slice(0, 100),
    prefix: txt.slice(0, 1800),
  }));
}

/** @param {string} vintage */
async function scan(vintage) {
  const url = new URL('https://index.commoncrawl.org/' + vintage + '-index');
  url.searchParams.set('url', host + '/');
  url.searchParams.set('output', 'json');
  url.searchParams.set('filter', 'status:200');
  try {
    const res = await get(url.toString());
    const body = res.bytes.toString('utf8');
    const rows = body.split(/\r?\n/).filter(Boolean);
    const parsed = [];
    for (const line of rows) {
      try {
        const item = JSON.parse(line);
        if (item && typeof item.url === 'string' &&
            /^https?:\/\/howwillyoutelltheworld\.wikidot\.com(?::(?:80|443))?\/?(?:\?.*)?$/i.test(item.url))
          parsed.push(item);
      } catch { /* Error text is not a JSON capture record. */ }
    }
    console.log('CC_INDEX_RESULT', JSON.stringify({
      vintage, query: url.toString(), httpStatus: res.status,
      bodyLength: res.bytes.length, bodySha256: digest(res.bytes),
      indexLines: rows.length, exactRootMatches: parsed.length,
      statusBodyPrefix: res.status === 200 ? null : body.slice(0, 350),
    }));
    for (const item of parsed.slice(0, 4)) {
      console.log('CC_INDEX_CAPTURE', JSON.stringify({ vintage, ...item }));
      try { await record(item); }
      catch (err) { console.log('CC_WARC_ERROR', String(err)); }
    }
  } catch (err) {
    console.log('CC_INDEX_UNREACHABLE', JSON.stringify({ vintage, error: String(err) }));
  }
}

(async () => {
  console.log('ARCHIVE_SCOPE', JSON.stringify({ host, vintages, runtime: process.version }));
  await Promise.all(vintages.map(scan));
  console.log('INTERPRETATION: A missing or inaccessible exact-root capture does not establish historical absence of a source PDF.');
})().catch(err => { console.error('FATAL', err); process.exitCode = 1; });

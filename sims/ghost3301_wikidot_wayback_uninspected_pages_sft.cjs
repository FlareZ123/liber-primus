/**
 * Director #1886: public Wayback inventory of the exact gHOST3301 Wikidot ARG.
 * Read-only: only the named Wikidot host, its directly linked WDFiles host,
 * and Internet Archive replay/CDX endpoints. No generic file hunt.
 * Windows Node.js 22 single runnable test file.
 */
'use strict';

const { createHash } = require('node:crypto');
const root = 'howwillyoutelltheworld.wikidot.com';
const filesHost = 'howwillyoutelltheworld.wdfiles.com';
const sourceHosts = [root, filesHost];

/** @param {Buffer} data @returns {string} */
const hash = data => createHash('sha256').update(data).digest('hex');

/** @param {string} url @returns {boolean} */
function namedSource(url) {
  try { return sourceHosts.includes(new URL(url).hostname.toLowerCase()); }
  catch { return false; }
}

/** @param {string} url @returns {Promise<{status: number, bytes: Buffer, finalUrl: string, type: string}>} */
async function get(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'LP2-public-archive-source-inventory/1.0' },
    signal: AbortSignal.timeout(22000),
  });
  const bytes = Buffer.from(await res.arrayBuffer());
  return { status: res.status, bytes, finalUrl: res.url,
    type: res.headers.get('content-type') || '' };
}

/** @param {string} host @returns {Promise<object[]>} */
async function index(host) {
  const u = new URL('https://web.archive.org/cdx/search/cdx');
  u.searchParams.set('url', host + '/*');
  u.searchParams.set('output', 'json');
  u.searchParams.set('filter', 'statuscode:200');
  u.searchParams.set('collapse', 'urlkey');
  let res;
  try { res = await get(u.toString()); }
  catch (err) {
    console.log('CDX_UNAVAILABLE', JSON.stringify({ host, endpoint: u.toString(), error: String(err) }));
    return [];
  }
  console.log('CDX_HTTP', JSON.stringify({ host, status: res.status,
    length: res.bytes.length, sha256: hash(res.bytes), contentType: res.type,
    prefix: res.status === 200 ? undefined : res.bytes.toString('utf8').slice(0, 240) }));
  if (res.status !== 200) return [];
  let data;
  try { data = JSON.parse(res.bytes.toString('utf8')); }
  catch (err) {
    console.log('CDX_BAD_JSON', JSON.stringify({ host, error: String(err) }));
    return [];
  }
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    console.log('CDX_UNEXPECTED', JSON.stringify({ host, kind: typeof data }));
    return [];
  }
  const fields = data[0];
  const records = data.slice(1).filter(Array.isArray).map(values =>
    Object.fromEntries(fields.map((k, i) => [k, values[i]])))
    .filter(item => item.original && namedSource(item.original) &&
      new URL(item.original).hostname.toLowerCase() === host);
  console.log('CDX_ROWS', JSON.stringify({ host, count: records.length,
    rows: records.map(r => ({
      timestamp: r.timestamp, url: r.original, mimetype: r.mimetype,
      length: r.length, digest: r.digest,
    })) }));
  return records;
}

/** @param {string} html @param {string} sourceUrl @returns {string[]} */
function sourceLinks(html, sourceUrl) {
  const found = new Set();
  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']{1,600})["']/ig)) {
    const raw = match[1].replace(/&amp;/g, '&');
    try {
      const resolved = new URL(raw, sourceUrl);
      if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
        if (/\.(?:pdf|zip|rar|7z|docx?|txt|asc|rune)(?:[?#]|$)/i.test(resolved.pathname) ||
            resolved.hostname.toLowerCase() === filesHost) found.add(resolved.href);
      }
    } catch { /* A malformed link is not a source record. */ }
  }
  return [...found].sort();
}

/** @param {object} row @returns {Promise<void>} */
async function replay(row) {
  const sourceUrl = row.original;
  if (!namedSource(sourceUrl)) return;
  const replayUrl = 'https://web.archive.org/web/' + row.timestamp + 'id_/' + sourceUrl;
  try {
    const res = await get(replayUrl);
    const meta = { sourceUrl, timestamp: row.timestamp, originalDigest: row.digest,
      replayStatus: res.status, bytes: res.bytes.length,
      sha256: hash(res.bytes), contentType: res.type, finalUrl: res.finalUrl };
    if (res.status !== 200) {
      console.log('CAPTURE', JSON.stringify({ ...meta,
        prefix: res.bytes.toString('utf8').slice(0, 150) }));
      return;
    }
    const looksText = /html|text|xml/i.test(res.type) ||
      /(?:\.html?|\/|printer--friendly\/)/i.test(new URL(sourceUrl).pathname);
    if (!looksText || res.bytes.length > 2000000) {
      console.log('CAPTURE_BINARY', JSON.stringify(meta));
      return;
    }
    const body = res.bytes.toString('utf8');
    const title = body.match(/<title[^>]*>([^<]{0,200})<\/title>/i)?.[1] || '';
    console.log('CAPTURE_TEXT', JSON.stringify({ ...meta, title,
      sourceFileLinks: sourceLinks(body, sourceUrl).slice(0, 75),
      visiblyMentionsRuneDraft: /liber\s*primus|pre.?encrypt|runic|rune\s*pdf/i.test(body) }));
  } catch (err) {
    console.log('CAPTURE_UNAVAILABLE', JSON.stringify({
      sourceUrl, timestamp: row.timestamp, error: String(err) }));
  }
}

(async () => {
  console.log('ARCHIVE_SCOPE', JSON.stringify({
    exactHosts: sourceHosts, date: new Date().toISOString(), node: process.version,
    purpose: 'all collapsed root-host URL keys, no unspecified crawling',
  }));
  const rows = await index(root);
  // A bounded replay of each distinct indexed original page, not multiple
  // changed-date variants selected after viewing content.
  for (const row of rows.slice(0, 40)) await replay(row);
  const assets = await index(filesHost);
  const candidate = assets.filter(r =>
    /(?:pdf|zip|rar|7z|rune|primus)/i.test(r.original) ||
    /application\/(?:pdf|zip|octet-stream)/i.test(r.mimetype || ''));
  console.log('FILE_HOST_ASSESSMENT', JSON.stringify({
    indexedKeys: assets.length, sourceSpecificBinaryCandidates: candidate.length,
    candidates: candidate.map(r => ({
      original: r.original, timestamp: r.timestamp,
      mime: r.mimetype, digest: r.digest, length: r.length,
    })),
  }));
  for (const row of candidate.slice(0, 10)) await replay(row);
  console.log('BOUNDARY: URL-key collapse is not complete capture-date coverage; service errors are access failures, not no-file evidence.');
})().catch(err => { console.error('FATAL', String(err)); process.exitCode = 1; });

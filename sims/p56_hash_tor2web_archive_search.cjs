'use strict';
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const TARGET = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
if (TARGET.length !== 128) throw new Error('P56 digest transcription must be exactly 128 hex characters');
const PROXIES = [
  'onion.to', 'tor2web.org', 'onion.link', 'onion.cab',
  'onion.ws', 'onion.city', 'onion.sh', 'onion.nu', 'onion.so'
];
const HASHES = ['sha512', 'sha3-512', 'blake2b512'].filter(x => crypto.getHashes().includes(x));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function fetchText(url, timeout = 30000) {
  const r = await fetch(url, {
    headers: { 'user-agent': 'Liber-Primus-research/1.0 (archival verification)' },
    signal: AbortSignal.timeout(timeout)
  });
  const body = await r.text();
  return { status: r.status, body, headers: Object.fromEntries(r.headers.entries()) };
}
async function fetchBytes(url, timeout = 30000) {
  const r = await fetch(url, {
    headers: { 'user-agent': 'Liber-Primus-research/1.0 (archival verification)' },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout)
  });
  return { status: r.status, bytes: Buffer.from(await r.arrayBuffer()), url: r.url, headers: Object.fromEntries(r.headers.entries()) };
}
function parseCdx(text) {
  const rows = JSON.parse(text);
  if (!Array.isArray(rows) || rows.length < 1) return [];
  const header = rows[0];
  if (!Array.isArray(header)) return [];
  return rows.slice(1).map(row => Object.fromEntries(header.map((k, i) => [k, row[i]])));
}
function hashMatch(buf) {
  const matches = [];
  for (const alg of HASHES) {
    const h = crypto.createHash(alg).update(buf).digest('hex');
    if (h === TARGET) matches.push({ algorithm: alg, representation: 'raw-bytes' });
  }
  return matches;
}
function candidateStrings(url) {
  const out = new Set([url]);
  try {
    const u = new URL(url);
    out.add(u.hostname);
    out.add(u.host);
    out.add(u.pathname);
    out.add(u.origin + u.pathname);
    const onionHost = u.hostname.replace(/\.(onion\.)?(to|tor2web\.org|link|cab|ws|city|sh|nu|so)$/i, '.onion');
    out.add(onionHost);
    out.add('http://' + onionHost + u.pathname);
    out.add('https://' + onionHost + u.pathname);
  } catch {}
  return [...out];
}
function hashUrlCandidates(url) {
  const matches = [];
  for (const value of candidateStrings(url)) {
    const b = Buffer.from(value, 'utf8');
    for (const alg of HASHES) {
      if (crypto.createHash(alg).update(b).digest('hex') === TARGET) matches.push({ algorithm: alg, representation: 'url-string', value });
    }
  }
  return matches;
}
function stripHtml(buf) {
  return Buffer.from(buf.toString('utf8').replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim(), 'utf8');
}
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      try { out[i] = await fn(items[i], i); }
      catch (e) { out[i] = { error: String(e) }; }
    }
  });
  await Promise.all(workers);
  return out;
}
async function waybackSearch() {
  const queries = PROXIES.map(domain => ({ domain, pattern: '*.' + domain + '/*' }));
  const results = [];
  for (const q of queries) {
    const params = new URLSearchParams({
      url: q.pattern,
      output: 'json',
      fl: 'original,timestamp,statuscode,mimetype,digest,length',
      filter: 'statuscode:200',
      collapse: 'urlkey',
      limit: '10000'
    });
    params.append('filter', 'timestamp:2014');
    const url = 'https://web.archive.org/cdx/search/cdx?' + params.toString();
    try {
      const r = await fetchText(url, 45000);
      if (r.status !== 200) {
        results.push({ domain: q.domain, pattern: q.pattern, status: r.status, errorBody: r.body.slice(0, 500) });
      } else {
        const records = parseCdx(r.body);
        results.push({ domain: q.domain, pattern: q.pattern, status: 200, count: records.length, records });
      }
    } catch (e) {
      results.push({ domain: q.domain, pattern: q.pattern, error: String(e) });
    }
    await sleep(250);
  }
  return results;
}
function extractWarcBody(compressed) {
  const raw = zlib.gunzipSync(compressed);
  const first = raw.indexOf(Buffer.from('\r\n\r\n'));
  if (first < 0) return raw;
  const httpStart = first + 4;
  const second = raw.indexOf(Buffer.from('\r\n\r\n'), httpStart);
  if (second < 0) return raw.subarray(httpStart);
  const httpHeaders = raw.subarray(httpStart, second).toString('latin1');
  const bodyStart = second + 4;
  const m = httpHeaders.match(/content-length:\s*(\d+)/i);
  if (m) return raw.subarray(bodyStart, bodyStart + Number(m[1]));
  const end = raw.lastIndexOf(Buffer.from('\r\n\r\nWARC/'));
  return raw.subarray(bodyStart, end > bodyStart ? end : raw.length);
}
async function commonCrawlSearch() {
  let collinfo;
  try {
    const r = await fetchText('https://index.commoncrawl.org/collinfo.json', 45000);
    if (r.status !== 200) return { error: 'collinfo HTTP ' + r.status, body: r.body.slice(0, 500) };
    collinfo = JSON.parse(r.body);
  } catch (e) { return { error: 'collinfo fetch failed: ' + String(e) }; }
  const indexes = collinfo.filter(x => /CC-MAIN-2014/.test(x.id)).sort((a, b) => a.id.localeCompare(b.id));
  const jobs = [];
  for (const index of indexes) for (const domain of PROXIES) jobs.push({ index, domain });
  const queried = await mapLimit(jobs, 4, async job => {
    const params = new URLSearchParams({ url: job.domain, matchType: 'domain', output: 'json', filter: 'status:200' });
    const url = job.index['cdx-api'] + '?' + params.toString();
    const r = await fetchText(url, 45000);
    if (r.status !== 200) return { index: job.index.id, domain: job.domain, status: r.status, error: r.body.slice(0, 300) };
    const records = r.body.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
    return { index: job.index.id, domain: job.domain, status: 200, count: records.length, records: records.slice(0, 1000) };
  });
  return { indexes: indexes.map(x => x.id), queried };
}
async function fetchWaybackBodies(wayback) {
  const records = wayback.flatMap(x => (x.records || []).map(r => ({ domain: x.domain, ...r })));
  const unique = [...new Map(records.map(r => [r.original + '|' + r.timestamp, r])).values()];
  const selected = unique.slice(0, 1500);
  const matches = [];
  const errors = [];
  const fetched = await mapLimit(selected, 3, async r => {
    const url = 'https://web.archive.org/web/' + r.timestamp + 'id_/' + r.original;
    const page = await fetchBytes(url, 45000);
    if (page.status !== 200) return { status: page.status, original: r.original, timestamp: r.timestamp };
    const candidates = [
      { representation: 'raw-body', bytes: page.bytes },
      { representation: 'html-text-normalized', bytes: stripHtml(page.bytes) }
    ];
    const found = [];
    for (const c of candidates) for (const m of hashMatch(c.bytes)) found.push({ ...m, representation: c.representation });
    found.push(...hashUrlCandidates(r.original));
    if (found.length) matches.push({ source: 'wayback', original: r.original, timestamp: r.timestamp, matches: found });
    return { status: page.status, original: r.original, timestamp: r.timestamp, bytes: page.bytes.length, matches: found.length };
  });
  for (const x of fetched) if (x && x.error) errors.push(x);
  return { captureCount: unique.length, fetchedCount: selected.length, truncated: unique.length > selected.length, matches, errors, fetchSummary: fetched };
}
async function fetchCommonCrawlBodies(cc) {
  if (!cc || !cc.queried) return { matches: [], errors: [], fetchedCount: 0 };
  const records = cc.queried.flatMap(x => (x.records || []).map(r => ({ index: x.index, domain: x.domain, ...r })));
  const unique = [...new Map(records.map(r => [r.filename + ':' + r.offset, r])).values()];
  const selected = unique.slice(0, 1500);
  const matches = [];
  const fetched = await mapLimit(selected, 3, async r => {
    const start = Number(r.offset), end = start + Number(r.length) - 1;
    const url = 'https://data.commoncrawl.org/' + r.filename;
    const res = await fetch(url, {
      headers: { range: 'bytes=' + start + '-' + end, 'user-agent': 'Liber-Primus-research/1.0' },
      signal: AbortSignal.timeout(45000)
    });
    const compressed = Buffer.from(await res.arrayBuffer());
    if (res.status !== 206 && res.status !== 200) return { status: res.status, url: r.url, index: r.index };
    let body;
    try { body = extractWarcBody(compressed); }
    catch (e) { return { status: res.status, url: r.url, index: r.index, error: String(e) }; }
    const found = [];
    for (const m of hashMatch(body)) found.push({ ...m, representation: 'warc-body' });
    for (const m of hashMatch(stripHtml(body))) found.push({ ...m, representation: 'warc-html-text-normalized' });
    found.push(...hashUrlCandidates(r.url));
    if (found.length) matches.push({ source: 'commoncrawl', url: r.url, timestamp: r.timestamp, index: r.index, matches: found });
    return { status: res.status, url: r.url, timestamp: r.timestamp, index: r.index, bytes: body.length, matches: found.length };
  });
  return { recordCount: unique.length, fetchedCount: selected.length, truncated: unique.length > selected.length, matches, fetchSummary: fetched };
}
(async () => {
  const wayback = await waybackSearch();
  const waybackSummary = {
    proxyDomains: wayback.map(x => ({ domain: x.domain, status: x.status, count: x.count, error: x.error || x.errorBody || null }))
  };
  const waybackBodies = await fetchWaybackBodies(wayback);
  const commonCrawl = await commonCrawlSearch();
  const commonCrawlBodies = await fetchCommonCrawlBodies(commonCrawl);
  const output = {
    target: TARGET,
    targetLength: TARGET.length,
    algorithms: HASHES,
    scope: '2014 Wayback CDX captures for Tor2web-style proxy domains plus 2014 Common Crawl indexes for the same domains; compare raw bodies, normalized HTML text, and URL/onion-host strings',
    waybackSummary,
    waybackBodySummary: {
      captureCount: waybackBodies.captureCount,
      fetchedCount: waybackBodies.fetchedCount,
      truncated: waybackBodies.truncated,
      matchCount: waybackBodies.matches.length,
      matches: waybackBodies.matches,
      fetchErrors: waybackBodies.errors.length
    },
    commonCrawlSummary: commonCrawl && commonCrawl.queried ? {
      indexes: commonCrawl.indexes,
      queryCount: commonCrawl.queried.length,
      domains: commonCrawl.queried.map(x => ({ index: x.index, domain: x.domain, status: x.status, count: x.count, error: x.error || null })),
      recordCount: commonCrawlBodies.recordCount,
      fetchedCount: commonCrawlBodies.fetchedCount,
      truncated: commonCrawlBodies.truncated,
      matchCount: commonCrawlBodies.matches.length,
      matches: commonCrawlBodies.matches
    } : commonCrawl,
    conclusion: (waybackBodies.matches.length + commonCrawlBodies.matches.length) > 0
      ? 'EXACT MATCH FOUND; inspect the matched archived representation and provenance'
      : (wayback.some(x => x.status !== 200 || x.error) || (commonCrawl && commonCrawl.queried && commonCrawl.queried.some(x => x.status !== 200 || x.error)) || waybackBodies.truncated || commonCrawlBodies.truncated)
        ? 'NO EXACT MATCH IN THE SUCCESSFULLY FETCHED SUBSET; one or more proxy/index queries failed or were truncated, so coverage is incomplete'
        : 'NO EXACT MATCH IN THE QUERIED 2014 PROXY ARCHIVES; this does not exclude unindexed services, other years, other proxies, or a different hash serialization'
  };
  console.log(JSON.stringify(output, null, 2));
})().catch(e => { console.error(e && e.stack || String(e)); process.exitCode = 1; });

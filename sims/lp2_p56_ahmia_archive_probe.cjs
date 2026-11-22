'use strict';

/**
 * Bounded public-archive probe for Ahmia/Tor2web surfaces relevant to the LP2 p56 deep-web hash.
 * The goal is URL/content custody, not hash-family guessing.
 */

const queries = [
  { label: 'control-publico', url: 'http://www.publico.pt/', from: '2014', to: '2014' },

  { label: 'ahmia-stats-http', url: 'http://ahmia.fi/stats/', from: '2014', to: '2015', matchType: 'prefix' },
  { label: 'ahmia-stats-https', url: 'https://ahmia.fi/stats/', from: '2014', to: '2015', matchType: 'prefix' },
  { label: 'ahmia-viewer-http', url: 'http://ahmia.fi/stats/viewer', from: '2014', to: '2015', matchType: 'prefix' },
  { label: 'ahmia-viewer-https', url: 'https://ahmia.fi/stats/viewer', from: '2014', to: '2015', matchType: 'prefix' },
  { label: 'ahmia-address-http', url: 'http://ahmia.fi/address/', from: '2014', to: '2015', matchType: 'prefix' },
  { label: 'ahmia-address-https', url: 'https://ahmia.fi/address/', from: '2014', to: '2015', matchType: 'prefix' },
  { label: 'ahmia-static-history-http', url: 'http://ahmia.fi/static/log/onion_site_history/', from: '2014', to: '2016', matchType: 'prefix' },
  { label: 'ahmia-static-history-https', url: 'https://ahmia.fi/static/log/onion_site_history/', from: '2014', to: '2016', matchType: 'prefix' },
  { label: 'ahmia-oniondomains-http', url: 'http://ahmia.fi/oniondomains.txt', from: '2014', to: '2015', matchType: 'prefix' },
  { label: 'ahmia-oniondomains-https', url: 'https://ahmia.fi/oniondomains.txt', from: '2014', to: '2015', matchType: 'prefix' },

  { label: 'deepweblinks-http', url: 'http://deepweblinks.org/', from: '2014', to: '2014', matchType: 'prefix' },
  { label: 'deepweblinks-https', url: 'https://deepweblinks.org/', from: '2014', to: '2014', matchType: 'prefix' },

  { label: 'tor2web-antani-org', url: 'https://antani.tor2web.org/antanistaticmap/stats/yesterday', from: '2014', to: '2014' },
  { label: 'tor2web-antani-onion-to', url: 'https://antani.onion.to/antanistaticmap/stats/yesterday', from: '2014', to: '2014' },
  { label: 'tor2web-eqt5-org', url: 'https://eqt5g4fuenphqinx.tor2web.org/antanistaticmap/stats/yesterday', from: '2014', to: '2014' },
  { label: 'tor2web-abcd-fi', url: 'https://abcd.tor2web.fi/antanistaticmap/stats/yesterday', from: '2014', to: '2014' },
  { label: 'tor2web-abcd-org', url: 'https://abcd.tor2web.org/antanistaticmap/stats/yesterday', from: '2014', to: '2014' },
  { label: 'tor2web-abcd-onion-to', url: 'https://abcd.onion.to/antanistaticmap/stats/yesterday', from: '2014', to: '2014' },
  { label: 'tor2web-abcd-blutmagie', url: 'https://abcd.tor2web.blutmagie.de/antanistaticmap/stats/yesterday', from: '2014', to: '2014' },
  // Source-fixed node recommended by Tor2web operator Giovanni Pellerano on 5 Jul 2014.
  { label: 'tor2web-specific-ip-65-112-221-20', url: 'https://65.112.221.20/antanistaticmap/stats/yesterday', from: '2014', to: '2014' }
];

/**
 * @param {string} address
 * @returns {Promise<{status?: number, body?: string, error?: string}>}
 */
async function fetchText(address) {
  try {
    const response = await fetch(address, { signal: AbortSignal.timeout(25000) });
    return { status: response.status, body: await response.text() };
  } catch (error) {
    return { error: String(error) };
  }
}

/**
 * Arquivo.pt has historically returned JSON objects, arrays, or newline-delimited JSON.
 * @param {string} body
 * @returns {Array<Record<string, unknown>>}
 */
function parseArquivo(body) {
  const trimmed = body.trim();
  if (!trimmed) return [];

  try {
    const value = JSON.parse(trimmed);
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return [value];
  } catch {
    // Fall through to newline-delimited parsing.
  }

  return trimmed.split(/\r?\n/).flatMap(line => {
    try {
      const value = JSON.parse(line);
      if (Array.isArray(value)) return value;
      return value && typeof value === 'object' ? [value] : [];
    } catch {
      return [];
    }
  });
}

/**
 * Parse Internet Archive CDX JSON rows into record objects.
 * @param {string} body
 * @returns {Array<Record<string, unknown>>}
 */
function parseWayback(body) {
  const trimmed = body.trim();
  if (!trimmed) return [];
  try {
    const rows = JSON.parse(trimmed);
    if (!Array.isArray(rows) || rows.length < 2 || !Array.isArray(rows[0])) return [];
    const header = rows[0];
    return rows.slice(1).filter(Array.isArray).map(row =>
      Object.fromEntries(header.map((key, index) => [key, row[index]]))
    );
  } catch {
    return [];
  }
}

/**
 * @param {Record<string, unknown>} record
 * @returns {Record<string, unknown>}
 */
function compactRecord(record) {
  return {
    timestamp: record.timestamp,
    url: record.url,
    status: record.status,
    mime: record.mime,
    digest: record.digest,
    collection: record.collection,
    filename: record.filename
  };
}

/**
 * @param {{label:string,url:string,from:string,to:string,matchType?:string}} item
 */
async function runArquivoQuery(item) {
  const endpoint = new URL('https://arquivo.pt/wayback/cdx');
  endpoint.searchParams.set('url', item.url);
  endpoint.searchParams.set('from', item.from);
  endpoint.searchParams.set('to', item.to);
  endpoint.searchParams.set('output', 'json');
  endpoint.searchParams.set('limit', '1000');
  if (item.matchType) endpoint.searchParams.set('matchType', item.matchType);

  const response = await fetchText(endpoint.href);
  const records = response.body ? parseArquivo(response.body) : [];
  const timestamps = records
    .map(record => String(record.timestamp ?? ''))
    .filter(Boolean)
    .sort();

  console.log(JSON.stringify({
    label: item.label,
    query: item,
    httpStatus: response.status,
    error: response.error,
    recordCount: records.length,
    firstTimestamp: timestamps[0] ?? null,
    lastTimestamp: timestamps[timestamps.length - 1] ?? null,
    sample: records.slice(0, 25).map(compactRecord)
  }));
}

/**
 * @param {{label:string,url:string,from:string,to:string,matchType?:string}} item
 */
async function runWaybackQuery(item) {
  const endpoint = new URL('https://web.archive.org/cdx/search/cdx');
  endpoint.searchParams.set('url', item.url);
  endpoint.searchParams.set('from', item.from);
  endpoint.searchParams.set('to', item.to);
  endpoint.searchParams.set('output', 'json');
  endpoint.searchParams.set('fl', 'timestamp,original,statuscode,mimetype,digest');
  endpoint.searchParams.set('filter', 'statuscode:200');
  endpoint.searchParams.set('collapse', 'digest');
  endpoint.searchParams.set('limit', '1000');
  if (item.matchType) endpoint.searchParams.set('matchType', item.matchType);

  const response = await fetchText(endpoint.href);
  const rows = response.body ? parseWayback(response.body) : [];
  const records = rows.map(row => ({
    timestamp: row.timestamp,
    url: row.original,
    status: row.statuscode,
    mime: row.mimetype,
    digest: row.digest
  }));
  const timestamps = records.map(record => String(record.timestamp ?? '')).filter(Boolean).sort();

  console.log(JSON.stringify({
    provider: 'wayback',
    label: item.label,
    query: item,
    httpStatus: response.status,
    error: response.error,
    bodyPrefix: response.status === 200 ? undefined : response.body?.slice(0, 160),
    recordCount: records.length,
    firstTimestamp: timestamps[0] ?? null,
    lastTimestamp: timestamps[timestamps.length - 1] ?? null,
    sample: records.slice(0, 25).map(compactRecord)
  }));
}

const replayQueries = [
  {
    label: 'wayback-ahmia-history-20141005',
    url: 'https://web.archive.org/web/20141005085720id_/https://ahmia.fi/stats/history'
  },
  {
    label: 'wayback-ahmia-viewer-20140720',
    url: 'https://web.archive.org/web/20140720114001id_/https://ahmia.fi/stats/viewer'
  }
];

const cicadaHosts = [
  'auqgnxjtvdbll3pv', 'cu343l33nqaekrnw', 'fv7lyucmeozzd5j4',
  'avowyfgl5lkzfj3n', 'q4utgdi2n4m4uim5', 'ut3qtzbrvs7dtvzp',
  'ky2khlqdf7qdznac'
];

/**
 * Fetch a fixed Wayback replay and summarize onion references.
 * @param {{label:string,url:string}} item
 */
async function runReplay(item) {
  const response = await fetchText(item.url);
  const body = response.body ?? '';
  const onions = [...new Set(
    [...body.matchAll(/([a-z2-7]{16})\.onion/ig)].map(match => match[1].toLowerCase())
  )].sort();
  console.log(JSON.stringify({
    provider: 'wayback-replay',
    label: item.label,
    httpStatus: response.status,
    error: response.error,
    bodyLength: body.length,
    onionCount: onions.length,
    cicadaHits: cicadaHosts.filter(host => onions.includes(host)),
    firstOnions: onions.slice(0, 25)
  }));
}

function selfTest() {
  if (queries.length !== 21) throw new Error('Unexpected query count');
  if (!queries.some(item => item.label === 'control-publico')) throw new Error('Positive control missing');
  if (parseArquivo('{"status":"200"}').length !== 1) throw new Error('Object parse failed');
  if (parseArquivo('[{"status":"200"}]').length !== 1) throw new Error('Array parse failed');
  if (parseArquivo('{"status":"200"}\n{"status":"404"}').length !== 2) throw new Error('NDJSON parse failed');
  const wayback = parseWayback('[["timestamp","original"],["20140101000000","http://example.com/"]]');
  if (wayback.length !== 1 || wayback[0].original !== 'http://example.com/') throw new Error('Wayback parse failed');
  console.log('PASS Ahmia/Tor2web archive probe self-test');
}

(async () => {
  if (process.argv.includes('--selftest')) {
    selfTest();
    return;
  }

  console.log('ahmia-2014-archive-probe ' + new Date().toISOString());
  for (const item of queries) await runArquivoQuery(item);
  for (const item of queries) await runWaybackQuery(item);
  for (const item of replayQueries) await runReplay(item);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

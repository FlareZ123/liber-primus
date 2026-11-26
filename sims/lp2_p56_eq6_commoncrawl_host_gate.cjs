'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const TARGET = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const EQ6 = 'eq6emgv2ehsrix6t';
const SOURCE_REPO = 'https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2012/006-two-book-codes/README.md';
const HOSTS = [
  EQ6 + '.onion',
  EQ6 + '.onion.to',
  EQ6 + '.tor2web.org',
  EQ6 + '.onion.link',
  EQ6 + '.tor2web.fi',
  EQ6 + '.tor2web.blutmagie.de',
  EQ6 + '.onion.cab',
  EQ6 + '.onion.ws',
  EQ6 + '.onion.city',
  EQ6 + '.onion.sh',
  EQ6 + '.onion.nu',
  EQ6 + '.onion.so'
];
const S3_COVERED_INDEXES = new Set(['CC-MAIN-2014-23', 'CC-MAIN-2014-35']);
const S3_COVERED_HOSTS = new Set([
  EQ6 + '.onion.to',
  EQ6 + '.tor2web.org',
  EQ6 + '.onion.link',
  EQ6 + '.tor2web.fi',
  EQ6 + '.tor2web.blutmagie.de',
  EQ6 + '.onion.sh'
]);
const CONTROL_HOSTS = ['example.com', 'www.wikipedia.org', 'www.google.com'];
const HASHES = ['sha512', 'sha3-512', 'blake2b512', 'whirlpool'].filter(x => crypto.getHashes().includes(x));
const MAX_ATTEMPTS = 2;
const TIMEOUT_MS = 12000;
const MAX_WARC_BYTES = 5000000;
const MAX_WARC_RECORDS = 250;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function textFetch(url, timeout = TIMEOUT_MS) {
  let last = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'Liber-Primus-research/1.0' },
        signal: AbortSignal.timeout(timeout)
      });
      const body = await response.text();
      const result = { status: response.status, body, finalUrl: response.url };
      if ([429, 500, 502, 503, 504].includes(response.status) && attempt < MAX_ATTEMPTS) {
        last = result;
        await sleep(500 * attempt);
        continue;
      }
      return result;
    } catch (error) {
      last = { status: null, error: String(error) };
      if (attempt < MAX_ATTEMPTS) await sleep(500 * attempt);
    }
  }
  return last || { status: null, error: 'request failed without response' };
}

async function binaryFetch(url, rangeHeader) {
  let last = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { range: rangeHeader, 'user-agent': 'Liber-Primus-research/1.0' },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if ([429, 500, 502, 503, 504].includes(response.status) && attempt < MAX_ATTEMPTS) {
        try { await response.body.cancel(); } catch {}
        last = { status: response.status };
        await sleep(500 * attempt);
        continue;
      }
      if (response.status !== 206) {
        try { await response.body.cancel(); } catch {}
        return { status: response.status, bytes: Buffer.alloc(0) };
      }
      return { status: response.status, bytes: Buffer.from(await response.arrayBuffer()) };
    } catch (error) {
      last = { status: null, error: String(error) };
      if (attempt < MAX_ATTEMPTS) await sleep(500 * attempt);
    }
  }
  return last || { status: null, error: 'binary request failed' };
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      try { out[i] = await fn(items[i], i); }
      catch (error) { out[i] = { error: String(error) }; }
    }
  }));
  return out;
}

function parseNdjson(body) {
  const records = [];
  const errors = [];
  for (const line of body.split(/\r?\n/).filter(Boolean)) {
    try { records.push(JSON.parse(line)); }
    catch (error) { errors.push({ line: line.slice(0, 200), error: String(error) }); }
  }
  return { records, errors };
}

function cdxUrl(index, host, matchType, limit) {
  const url = new URL(index['cdx-api'] || ('https://index.commoncrawl.org/' + index.id + '-index'));
  url.searchParams.set('url', host);
  url.searchParams.set('matchType', matchType);
  url.searchParams.set('output', 'json');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('fl', 'timestamp,url,status,mime,filename,offset,length,digest,redirect');
  return url.toString();
}

async function queryCdx(index, host, matchType, limit) {
  const requestUrl = cdxUrl(index, host, matchType, limit);
  const response = await textFetch(requestUrl);
  const parsed = response.status === 200 ? parseNdjson(response.body) : { records: [], errors: [] };
  return {
    index: index.id,
    host,
    matchType,
    requestUrl,
    status: response.status,
    records: parsed.records,
    parseErrors: parsed.errors,
    error: response.error || null,
    bodyExcerpt: response.status !== 200 ? (response.body || '').slice(0, 250) : undefined
  };
}

function splitAtHeader(buf, start) {
  const sep = Buffer.from('\r\n\r\n');
  const at = buf.indexOf(sep, start);
  if (at < 0) return null;
  return { header: buf.subarray(start, at), bodyStart: at + sep.length };
}

function parseHeaderMap(text) {
  const lines = text.split(/\r?\n/);
  const headers = {};
  for (const line of lines.slice(1)) {
    const i = line.indexOf(':');
    if (i > 0) headers[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  return { statusLine: lines[0] || '', headers };
}

function parseWarc(compressed) {
  const raw = zlib.gunzipSync(compressed);
  const first = splitAtHeader(raw, 0);
  if (!first) throw new Error('WARC header separator not found');
  const warcHeader = first.header.toString('latin1');
  const second = splitAtHeader(raw, first.bodyStart);
  if (!second) throw new Error('HTTP header separator not found');
  const http = parseHeaderMap(second.header.toString('latin1'));
  const contentLengthMatch = /^Content-Length:\s*(\d+)/im.exec(warcHeader);
  const available = raw.subarray(second.bodyStart);
  const httpBlockLength = second.header.length + 4;
  let bodyLength = available.length;
  if (contentLengthMatch) bodyLength = Math.max(0, Number(contentLengthMatch[1]) - httpBlockLength);
  else {
    const trailer = raw.lastIndexOf(Buffer.from('\r\n\r\nWARC/'));
    if (trailer > second.bodyStart) bodyLength = trailer - second.bodyStart;
  }
  const body = available.subarray(0, Math.min(bodyLength, available.length));
  const target = /^WARC-Target-URI:\s*(.+)$/im.exec(warcHeader);
  const date = /^WARC-Date:\s*(.+)$/im.exec(warcHeader);
  return {
    body,
    statusLine: http.statusLine,
    httpHeaders: http.headers,
    warcTarget: target ? target[1].trim() : null,
    warcDate: date ? date[1].trim() : null
  };
}

function decodeHttpBody(body, encoding) {
  const value = String(encoding || '').toLowerCase().trim();
  if (value === 'gzip') return zlib.gunzipSync(body);
  if (value === 'deflate') return zlib.inflateSync(body);
  if (value === 'br') return zlib.brotliDecompressSync(body);
  return body;
}

function stripHtml(buf) {
  return Buffer.from(buf.toString('utf8')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim(), 'utf8');
}

function digestHex(algorithm, bytes) {
  try { return crypto.createHash(algorithm).update(bytes).digest('hex'); }
  catch { return null; }
}

function bodyMatches(rawBody, decodedBody) {
  const forms = [
    ['raw-body', rawBody],
    ['decoded-body', decodedBody],
    ['normalized-html-text', stripHtml(decodedBody)]
  ];
  const found = [];
  const hashes = [];
  for (const [representation, bytes] of forms) {
    for (const algorithm of HASHES) {
      const digest = digestHex(algorithm, bytes);
      if (!digest) continue;
      hashes.push({ algorithm, representation, digest, bytes: bytes.length });
      if (digest.toLowerCase() === TARGET.toLowerCase()) found.push({ algorithm, representation, digest });
    }
  }
  return { hashes, found };
}

function urlMatches(url) {
  const candidates = new Set([url]);
  try {
    const u = new URL(url);
    candidates.add(u.hostname);
    candidates.add(u.host);
    candidates.add(u.pathname);
    candidates.add(u.origin);
    candidates.add(u.origin + u.pathname);
  } catch {}
  for (const host of HOSTS) {
    candidates.add(host);
    candidates.add('http://' + host + '/');
    candidates.add('https://' + host + '/');
  }
  const found = [];
  for (const value of candidates) {
    for (const algorithm of HASHES) {
      const digest = digestHex(algorithm, Buffer.from(value, 'utf8'));
      if (digest && digest.toLowerCase() === TARGET.toLowerCase()) {
        found.push({ algorithm, representation: 'url-string', value, digest });
      }
    }
  }
  return found;
}

async function fetchWarc(record, role) {
  const offset = Number(record.offset);
  const length = Number(record.length);
  if (!record.filename || !Number.isFinite(offset) || !Number.isFinite(length) || length <= 0) {
    return { role, url: record.url, ok: false, skipped: 'missing WARC locator fields' };
  }
  if (length > MAX_WARC_BYTES) {
    return { role, url: record.url, ok: false, skipped: 'WARC record exceeds size cap', length };
  }
  const url = 'https://data.commoncrawl.org/' + String(record.filename).replace(/^\/+/, '');
  const range = 'bytes=' + offset + '-' + (offset + length - 1);
  const response = await binaryFetch(url, range);
  if (response.status !== 206) {
    return { role, url: record.url, ok: false, status: response.status, error: response.error || 'expected HTTP 206 for WARC range' };
  }
  try {
    const parsed = parseWarc(response.bytes);
    const decoded = decodeHttpBody(parsed.body, parsed.httpHeaders['content-encoding']);
    const body = bodyMatches(parsed.body, decoded);
    const urlFound = urlMatches(record.url);
    const decodedText = decoded.toString('utf8');
    const text = stripHtml(decoded).toString('utf8');
    const titleMatch = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(decodedText);
    const onionHosts = [...new Set(decodedText.match(/[a-z2-7]{16,56}\.onion\b/gi) || [])];
    const keywords = ['cicada', '3301', 'liber primus', 'hash', 'found', 'seek', 'puzzle'];
    return {
      role,
      ok: true,
      url: record.url,
      timestamp: record.timestamp,
      mime: record.mime,
      statusLine: parsed.statusLine,
      warcTarget: parsed.warcTarget,
      warcDate: parsed.warcDate,
      httpHeaders: parsed.httpHeaders,
      rawBodyBytes: parsed.body.length,
      decodedBodyBytes: decoded.length,
      title: titleMatch ? stripHtml(Buffer.from(titleMatch[1], 'utf8')).toString('utf8') : null,
      textSnippet: text.slice(0, 1200),
      onionHosts,
      keywordHits: keywords.filter(k => text.toLowerCase().includes(k)),
      bodyHashes: body.hashes,
      matches: body.found.concat(urlFound)
    };
  } catch (error) {
    return { role, url: record.url, ok: false, error: String(error) };
  }
}

async function main() {
  const started = new Date().toISOString();
  const info = await textFetch('https://index.commoncrawl.org/collinfo.json', 30000);
  if (info.status !== 200) throw new Error('collinfo HTTP ' + info.status + ': ' + (info.error || info.body));
  const collections = JSON.parse(info.body);
  const indexes = collections
    .filter(x => /^CC-MAIN-(2012|2013|2014)(?:-|$)/.test(x.id) && x['cdx-api'])
    .sort((a, b) => a.id.localeCompare(b.id));

  const controls = await mapLimit(indexes, 4, async index => {
    const checks = await mapLimit(CONTROL_HOSTS, 3, host => queryCdx(index, host, 'domain', 2));
    return {
      index: index.id,
      from: index.from || null,
      to: index.to || null,
      passed: checks.some(x => x.status === 200 && x.records.length > 0),
      checks
    };
  });
  const controlledIndexes = new Set(controls.filter(x => x.passed).map(x => x.index));

  const tasks = [];
  for (const index of indexes) {
    if (!controlledIndexes.has(index.id)) continue;
    for (const host of HOSTS) {
      if (S3_COVERED_INDEXES.has(index.id) && S3_COVERED_HOSTS.has(host)) continue;
      tasks.push({ index, host });
    }
  }

  const queries = await mapLimit(tasks, 8, async task => {
    const result = await queryCdx(task.index, task.host, 'host', 1000);
    return {
      index: task.index.id,
      host: task.host,
      status: result.status,
      requestUrl: result.requestUrl,
      count: result.records.length,
      parseErrors: result.parseErrors,
      error: result.error,
      bodyExcerpt: result.bodyExcerpt,
      records: result.records
    };
  });

  const allRecords = [];
  for (const query of queries) {
    for (const record of query.records || []) allRecords.push({ index: query.index, host: query.host, record });
  }
  const uniqueRecords = [...new Map(allRecords.map(x => {
    const r = x.record;
    return [[r.filename, r.offset, r.length].join(':'), x];
  })).values()];
  const targetWarc = await mapLimit(uniqueRecords.slice(0, MAX_WARC_RECORDS), 8, item =>
    fetchWarc(item.record, { index: item.index, host: item.host })
  );

  const controlWarcTasks = [];
  for (const control of controls) {
    if (!control.passed) continue;
    const record = control.checks.flatMap(x => x.records).find(r =>
      String(r.status) === '200' && Number(r.length) > 0 && Number(r.length) <= MAX_WARC_BYTES
    );
    if (record) controlWarcTasks.push({ index: control.index, record });
  }
  const controlWarc = await mapLimit(controlWarcTasks, 6, item =>
    fetchWarc(item.record, { index: item.index, host: 'positive-control' })
  );

  const hashMatches = targetWarc
    .map((item, i) => item && item.ok && item.matches && item.matches.length
      ? { item, record: uniqueRecords[i] }
      : null)
    .filter(Boolean);

  const expectedQueries = tasks.length;
  const completedQueries = queries.filter(x => x.status === 200 || x.status === 404).length;
  const queryErrors = queries.filter(x => x.status !== 200 && x.status !== 404).length;
  const result = {
    schema: 'lp2-p56-eq6-commoncrawl-host-gate-v1',
    started,
    finished: new Date().toISOString(),
    target: {
      sha512: TARGET,
      candidateHost: EQ6 + '.onion',
      sourceReference: SOURCE_REPO,
      interpretation: 'historical candidate only; no established link to p56 without a matching page or access record'
    },
    coverage: {
      indexes: indexes.map(x => ({ id: x.id, from: x.from || null, to: x.to || null })),
      controlledIndexes: [...controlledIndexes],
      hostVariants: HOSTS,
      skippedPriorRawS3Pairs: [...S3_COVERED_INDEXES].flatMap(index =>
        [...S3_COVERED_HOSTS].map(host => ({
          index, host,
          reason: 'full-domain raw S3 ZipNum prefix already scanned in lp2-cc2014-tor2web-archive-index-gate.md'
        }))
      ),
      priorBroadApiAttempt: 'The broad 2014 proxy-domain CDX sweep was inconclusive after 503/504 responses; this run uses exact host matching and includes 2012/2013 indexes.'
    },
    controls,
    targetQueries: queries,
    targetWarc,
    controlWarc,
    summary: {
      indexCount: indexes.length,
      controlledIndexCount: controlledIndexes.size,
      hostVariantCount: HOSTS.length,
      expectedTargetQueries: expectedQueries,
      completedTargetQueries: completedQueries,
      targetQueryErrors: queryErrors,
      targetRecordsFound: allRecords.length,
      uniqueTargetRecords: uniqueRecords.length,
      targetWarcAttempted: Math.min(uniqueRecords.length, MAX_WARC_RECORDS),
      targetWarcOk: targetWarc.filter(x => x && x.ok).length,
      targetWarcErrors: targetWarc.filter(x => x && !x.ok && !x.skipped).length,
      controlWarcAttempted: controlWarcTasks.length,
      controlWarcOk: controlWarc.filter(x => x && x.ok).length,
      targetHashMatches: hashMatches.length,
      apiComplete: indexes.length > 0 && controlledIndexes.size === indexes.length && completedQueries === expectedQueries
    },
    hashMatches,
    limitations: [
      'This tests the source-grounded eq6 host and gateway forms already represented in local historical proxy research; it cannot exclude an unrecorded gateway or a different destination.',
      'Common Crawl is not a complete archive of the Tor network.',
      'A capture that does not match the p56 digest may still be historically relevant, but it is not a verified p56 preimage.',
      'The target digest algorithm and exact byte serialization remain unestablished.'
    ]
  };

  const outDir = process.env.RUNNER_TEMP || os.tmpdir();
  const outPath = path.join(outDir, 'source-test-output.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result.summary, null, 2));
  console.log('artifact=' + outPath);
}

main().catch(error => {
  const outDir = process.env.RUNNER_TEMP || os.tmpdir();
  const outPath = path.join(outDir, 'source-test-output.json');
  const failure = {
    schema: 'lp2-p56-eq6-commoncrawl-host-gate-v1',
    error: String(error),
    finished: new Date().toISOString(),
    target: { sha512: TARGET, candidateHost: EQ6 + '.onion', sourceReference: SOURCE_REPO }
  };
  try { fs.writeFileSync(outPath, JSON.stringify(failure, null, 2)); } catch {}
  console.error(error && error.stack ? error.stack : String(error));
  console.log('artifact=' + outPath);
});

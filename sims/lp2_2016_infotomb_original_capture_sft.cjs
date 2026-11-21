'use strict';
/**
 * Source-bounded audit of the exact January 2016 InfoTomb carrier URL.
 * Checks the cited 2016-01-16 Wayback capture, exact HTTP/HTTPS CDX keys,
 * and every published 2016 Common Crawl collection using raw CDXJ indexes.
 * Any successful response is saved with metadata and byte hashes.
 * Node 22; --selftest is offline.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const OUT = 'infotomb-2016-original-recovery';
const BASE = 'https://data.commoncrawl.org/cc-index/collections/';
const URLS = [
  'https://infotomb.com/4gq25.jpg',
  'http://infotomb.com/4gq25.jpg'
];
const SURT = 'com,infotomb)/4gq25.jpg';
const WAYBACK_CITED_TIMESTAMP = '20160116224659';
const COLLECTIONS = [
  'CC-MAIN-2016-07',
  'CC-MAIN-2016-18',
  'CC-MAIN-2016-22',
  'CC-MAIN-2016-26',
  'CC-MAIN-2016-30',
  'CC-MAIN-2016-36',
  'CC-MAIN-2016-40',
  'CC-MAIN-2016-44',
  'CC-MAIN-2016-50'
];
const EXPECTED = {
  bytes: 26342,
  git_blob_sha1: '22027296dcd7df53c5127e6aadbabeaf3223f72d'
};

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}
function gitBlobSha1(buf) {
  return crypto.createHash('sha1')
    .update(Buffer.from('blob ' + buf.length + '\0'))
    .update(buf).digest('hex');
}
function save(rel, buf) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
  return file;
}
function saveJson(rel, value) {
  return save(rel, Buffer.from(JSON.stringify(value, null, 2) + '\n'));
}
async function request(url, options = {}) {
  let last = null;
  for (let trial = 0; trial < 4; trial++) {
    try {
      const headers = Object.assign({
        'user-agent': 'Liber-Primus-2016-InfoTomb-source-audit/1.0'
      }, options.headers || {});
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(30000)
      });
      const body = options.method === 'HEAD'
        ? Buffer.alloc(0) : Buffer.from(await response.arrayBuffer());
      if ([429, 500, 502, 503, 504].includes(response.status) && trial < 3) {
        await new Promise(resolve => setTimeout(resolve, 500 * (trial + 1)));
        continue;
      }
      return {
        status: response.status,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        body
      };
    } catch (error) {
      last = String(error);
      if (trial < 3) await new Promise(resolve => setTimeout(resolve, 500 * (trial + 1)));
    }
  }
  return { error: last };
}
async function ranged(url, start, end) {
  const result = await request(url, {
    headers: { range: 'bytes=' + start + '-' + end }
  });
  if (result.error) return result;
  if (result.status !== 206) {
    return {
      error: 'Expected HTTP 206 for byte range; received ' + result.status,
      status: result.status,
      headers: result.headers,
      url: result.url
    };
  }
  return result;
}
function clusterRow(line) {
  const cols = line.split('\t');
  if (cols.length < 4) throw new Error('Malformed cluster row: ' + line.slice(0, 120));
  return {
    key: cols[0].split(' ')[0],
    object: cols[1],
    offset: Number(cols[2]),
    length: Number(cols[3])
  };
}
function cdxRecord(line) {
  const pos = line.indexOf('{');
  if (pos < 0) return null;
  const meta = line.slice(0, pos).trim().split(/\s+/);
  const record = JSON.parse(line.slice(pos));
  if (!record.urlkey) record.urlkey = meta[0];
  if (!record.timestamp) record.timestamp = meta[1];
  return record;
}
function fullLines(buf, start) {
  const lines = buf.toString('utf8').split('\n');
  if (start !== 0) lines.shift();
  lines.pop();
  return lines.filter(Boolean);
}
async function locateCluster(indexUrl, size, target) {
  let lo = 0;
  let hi = size - 1;
  let rounds = 0;
  const probes = [];
  while (hi - lo > 100000 && rounds < 32) {
    const mid = Math.floor((lo + hi) / 2);
    const end = Math.min(size - 1, mid + 12000);
    const response = await ranged(indexUrl, mid, end);
    if (response.error) return { error: response.error, probes, rounds };
    const lines = fullLines(response.body, mid);
    if (!lines.length) return { error: 'No complete cluster rows in range', probes, rounds };
    const point = clusterRow(lines[0]);
    probes.push({ mid, key: point.key });
    if (point.key <= target) lo = mid;
    else hi = mid;
    rounds++;
  }
  const begin = Math.max(0, lo - 120000);
  const end = Math.min(size - 1, hi + 120000);
  const rows = [];
  for (let offset = begin; offset <= end; offset += 240000) {
    const stop = Math.min(end, offset + 239999);
    const response = await ranged(indexUrl, offset, stop);
    if (response.error) return { error: response.error, probes, rounds };
    rows.push(...fullLines(response.body, offset).map(clusterRow));
  }
  rows.sort((a, b) => a.offset - b.offset);
  const eligible = rows.filter(row => row.key <= target);
  const floor = eligible.length ? eligible[eligible.length - 1] : null;
  const next = rows.find(row => row.key > target);
  return {
    floor,
    next_key: next ? next.key : null,
    certified: !!next && (floor === null || floor.key <= target),
    rounds,
    probes: probes.slice(-5),
    scanned_range: [begin, end],
    candidate_rows: rows.length,
    first_key: rows[0] && rows[0].key,
    last_key: rows.length && rows[rows.length - 1].key
  };
}
async function readCdxBlock(collection, indexRow) {
  if (indexRow.length < 10 || indexRow.length > 400000) {
    return { error: 'Unexpected CDX block length ' + indexRow.length };
  }
  const url = BASE + collection + '/indexes/' + indexRow.object;
  const response = await ranged(url, indexRow.offset, indexRow.offset + indexRow.length - 1);
  if (response.error) return { error: response.error };
  try {
    const text = zlib.gunzipSync(response.body).toString('utf8');
    const records = text.split(/\r?\n/).filter(Boolean).map(cdxRecord).filter(Boolean);
    return { records, count: records.length };
  } catch (error) {
    return { error: 'CDX gzip/parse failed: ' + String(error) };
  }
}
function parseWarc(buf) {
  const separator = Buffer.from('\r\n\r\n');
  const warcEnd = buf.indexOf(separator);
  if (warcEnd < 0) throw new Error('WARC header separator absent');
  const warcHeaders = buf.subarray(0, warcEnd).toString('latin1');
  const remainder = buf.subarray(warcEnd + 4);
  const httpEnd = remainder.indexOf(separator);
  if (httpEnd < 0) throw new Error('HTTP header separator absent');
  const httpHeaders = remainder.subarray(0, httpEnd).toString('latin1');
  let body = remainder.subarray(httpEnd + 4);
  const lengthMatch = httpHeaders.match(/(?:^|\r\n)content-length:\s*(\d+)/i);
  if (lengthMatch) body = body.subarray(0, Number(lengthMatch[1]));
  return { warcHeaders, httpHeaders, body };
}
async function preserveWarc(collection, record) {
  const name = collection + '-' + record.timestamp + '-' + String(record.status);
  const relative = 'commoncrawl/' + name;
  const url = 'https://data.commoncrawl.org/' + record.filename;
  const response = await ranged(url, Number(record.offset),
    Number(record.offset) + Number(record.length) - 1);
  if (response.error) return { error: response.error, url, status: response.status };
  save(relative + '.warc.gz', response.body);
  let warc;
  try {
    warc = zlib.gunzipSync(response.body);
  } catch (error) {
    return { error: 'WARC gzip failed: ' + String(error), compressed_bytes: response.body.length };
  }
  save(relative + '.warc', warc);
  let parsed;
  try {
    parsed = parseWarc(warc);
  } catch (error) {
    return { error: String(error), warc_bytes: warc.length };
  }
  save(relative + '.body', parsed.body);
  const blobSha = gitBlobSha1(parsed.body);
  return {
    url,
    status: response.status,
    warc_bytes: warc.length,
    payload_bytes: parsed.body.length,
    payload_sha256: sha256(parsed.body),
    payload_git_blob_sha1: blobSha,
    expected_length_match: parsed.body.length === EXPECTED.bytes,
    expected_git_blob_match: blobSha === EXPECTED.git_blob_sha1,
    warc_headers: parsed.warcHeaders,
    http_headers: parsed.httpHeaders,
    saved: relative
  };
}
async function commonCrawlAudit() {
  const findings = [];
  for (const collection of COLLECTIONS) {
    const indexUrl = BASE + collection + '/indexes/cluster.idx';
    const head = await request(indexUrl, { method: 'HEAD' });
    const size = Number(head.headers && head.headers['content-length'] || 0);
    const item = {
      collection,
      cluster_head: { status: head.status, bytes: size, error: head.error },
      searches: []
    };
    findings.push(item);
    if (head.status !== 200 || !size) {
      item.error = 'Index metadata unavailable; no absence claim.';
      continue;
    }
    const located = await locateCluster(indexUrl, size, SURT);
    const search = { surt: SURT, locate: located };
    item.searches.push(search);
    if (located.error || !located.floor || !located.certified) {
      search.error = 'Cluster lookup not certified; no absence claim.';
      continue;
    }
    const block = await readCdxBlock(collection, located.floor);
    search.block = {
      object: located.floor.object,
      offset: located.floor.offset,
      length: located.floor.length,
      count: block.count,
      error: block.error,
      first_key: block.records && block.records[0] && block.records[0].urlkey,
      last_key: block.records && block.records[block.records.length - 1] &&
        block.records[block.records.length - 1].urlkey
    };
    if (block.error) continue;
    const validRange = search.block.first_key <= SURT && search.block.last_key >= SURT;
    search.block.valid_key_range = validRange;
    const matches = block.records.filter(record =>
      record.urlkey === SURT && URLS.includes(record.url));
    search.matches = matches.map(record => ({
      timestamp: record.timestamp,
      url: record.url,
      status: record.status,
      mime: record.mime,
      digest: record.digest,
      length: record.length,
      filename: record.filename,
      offset: record.offset
    }));
    search.certified_no_match = matches.length === 0 && validRange;
    search.warc = [];
    for (const record of matches) {
      if (String(record.status) === '200') {
        search.warc.push(await preserveWarc(collection, record));
      }
    }
  }
  return findings;
}
async function waybackAudit() {
  const findings = [];
  const citedUrl = 'https://web.archive.org/web/' + WAYBACK_CITED_TIMESTAMP +
    'id_/https://infotomb.com/4gq25.jpg';
  const cited = await request(citedUrl);
  const citedItem = {
    type: 'cited_direct_capture',
    timestamp: WAYBACK_CITED_TIMESTAMP,
    requested_url: citedUrl,
    status: cited.status,
    final_url: cited.url,
    headers: cited.headers,
    error: cited.error
  };
  if (cited.body && cited.body.length) {
    citedItem.bytes = cited.body.length;
    citedItem.sha256 = sha256(cited.body);
    citedItem.git_blob_sha1 = gitBlobSha1(cited.body);
    citedItem.expected_length_match = cited.body.length === EXPECTED.bytes;
    citedItem.expected_git_blob_match = citedItem.git_blob_sha1 === EXPECTED.git_blob_sha1;
    const isJpeg = cited.body.length >= 3 && cited.body[0] === 0xff &&
      cited.body[1] === 0xd8 && cited.body[2] === 0xff;
    citedItem.jpeg_magic = isJpeg;
    if (isJpeg) save('wayback/cited-20160116224659.jpg', cited.body);
    else save('wayback/cited-response.bin', cited.body);
  }
  findings.push(citedItem);

  for (const original of URLS) {
    const params = new URLSearchParams({
      url: original,
      output: 'json',
      matchType: 'exact',
      fl: 'timestamp,original,mimetype,statuscode,digest,length'
    });
    const queryUrl = 'https://web.archive.org/cdx/search/cdx?' + params.toString();
    const response = await request(queryUrl);
    const item = {
      type: 'cdx_exact_query',
      original,
      query_url: queryUrl,
      status: response.status,
      final_url: response.url,
      error: response.error
    };
    if (response.body && response.body.length) {
      item.response_text = response.body.toString('utf8').slice(0, 20000);
      if (response.status === 200) {
        try {
          const rows = JSON.parse(response.body.toString('utf8'));
          item.records = rows.map(row => ({
            timestamp: row[0], original: row[1], mimetype: row[2],
            statuscode: row[3], digest: row[4], length: row[5]
          }));
        } catch (error) {
          item.parse_error = String(error);
        }
      }
    }
    findings.push(item);
  }
  return findings;
}
function selftest() {
  assert.equal(SURT, 'com,infotomb)/4gq25.jpg');
  assert.deepEqual(clusterRow('com,infotomb)/4gq25.jpg 20160116224659\tcdx-00001.gz\t123\t456'),
    { key: SURT, object: 'cdx-00001.gz', offset: 123, length: 456 });
  const parsed = cdxRecord(SURT + ' 20160116224659 {"url":"https://infotomb.com/4gq25.jpg","status":"200"}');
  assert.equal(parsed.urlkey, SURT);
  assert.equal(parsed.timestamp, WAYBACK_CITED_TIMESTAMP);
  assert.equal(parsed.status, '200');
  const payload = Buffer.from('JPEG-CONTROL');
  const http = Buffer.concat([
    Buffer.from('HTTP/1.1 200 OK\r\nContent-Type: image/jpeg\r\nContent-Length: ' +
      payload.length + '\r\n\r\n'), payload
  ]);
  const warc = Buffer.concat([
    Buffer.from('WARC/1.0\r\nWARC-Type: response\r\nContent-Length: ' +
      http.length + '\r\n\r\n'), http
  ]);
  const extracted = parseWarc(warc);
  assert.deepEqual(extracted.body, payload);
  assert.equal(gitBlobSha1(Buffer.from('test')).length, 40);
  console.log('InfoTomb source-capture parser SFT: PASS');
}
async function main() {
  if (process.argv.includes('--selftest')) return selftest();
  const started = new Date().toISOString();
  const output = {
    schema: 1,
    task: 'Exact original-host capture audit for January 2016 InfoTomb carrier',
    started,
    urls: URLS,
    surt: SURT,
    cited_wayback_capture: WAYBACK_CITED_TIMESTAMP,
    expected_archived_mirror: EXPECTED,
    commoncrawl_collections: COLLECTIONS,
    wayback: await waybackAudit(),
    commoncrawl: await commonCrawlAudit()
  };
  output.finished = new Date().toISOString();
  saveJson('summary.json', output);
  console.log(JSON.stringify({
    started: output.started,
    finished: output.finished,
    wayback: output.wayback.map(x => ({
      type: x.type, original: x.original, timestamp: x.timestamp,
      status: x.status, bytes: x.bytes, git_blob_sha1: x.git_blob_sha1,
      records: x.records, error: x.error
    })),
    commoncrawl: output.commoncrawl.map(x => ({
      collection: x.collection,
      cluster_status: x.cluster_head.status,
      certified_no_match: x.searches[0] && x.searches[0].certified_no_match,
      matches: x.searches[0] && x.searches[0].matches,
      error: x.error || (x.searches[0] && x.searches[0].error)
    }))
  }, null, 2));
  console.log('Saved ' + path.join(OUT, 'summary.json'));
}
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

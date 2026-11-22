'use strict';

// Source-fixed Common Crawl lookup for the July 2014 Tor2web static-map node.
// The 5 Jul 2014 tor-dev reply says three tor2web.org nodes did not share stats
// and explicitly recommends https://65.112.221.20/antanistaticmap/stats/yesterday.
// A Mar 2014 Veracode report lists 194.150.168.70, 38.229.70.4 and 65.112.221.20
// as the three hiddenservice.tor2web.org server addresses.
// Sources:
// https://lists.torproject.org/mailman3/hyperkitty/list/tor-dev%40lists.torproject.org/message/RRUMNNSX3TP2B6PPTDA62GOTUC7DLBUL/
// https://www.studocu.com/en-au/document/monash-university/abnormal-psychology/veracode-application-security-report-for-globaleaks-radio-free-asia-mar-2014/154769891
//
// This is an archive-index lookup only. It does not contact Tor or live onion services.

const fs = require('node:fs');
const path = require('node:path');
const { gunzipSync } = require('node:zlib');
const { createHash } = require('node:crypto');

const INDEXES = [
  'CC-MAIN-2014-10',
  'CC-MAIN-2014-15',
  'CC-MAIN-2014-23',
  'CC-MAIN-2014-35',
  'CC-MAIN-2014-41',
  'CC-MAIN-2014-42',
  'CC-MAIN-2014-49',
  'CC-MAIN-2014-52'
];

const TARGETS = [
  { label: 'ip-65-112-221-20', url: 'https://65.112.221.20/antanistaticmap/stats/yesterday' },
  { label: 'ip-194-150-168-70', url: 'https://194.150.168.70/antanistaticmap/stats/yesterday' },
  { label: 'ip-38-229-70-4', url: 'https://38.229.70.4/antanistaticmap/stats/yesterday' },
  { label: 'hiddenservice-host', url: 'https://hiddenservice.tor2web.org/antanistaticmap/stats/yesterday' }
];

const CONTROL = { label: 'publico-control', url: 'https://www.publico.pt/' };
const OUTPUT_DIR = path.join(process.cwd(), 'probe-output');

function parseJsonLines(body) {
  return body.trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
}

function summarizeRecord(record) {
  return {
    url: record.url,
    timestamp: record.timestamp,
    status: record.status,
    mime: record.mime,
    digest: record.digest,
    length: Number(record.length),
    offset: Number(record.offset),
    filename: record.filename
  };
}

async function fetchIndex(index, target) {
  const endpoint = new URL('https://index.commoncrawl.org/' + index + '-index');
  endpoint.searchParams.set('url', target.url);
  endpoint.searchParams.set('output', 'json');
  endpoint.searchParams.set('limit', '100');

  try {
    const response = await fetch(endpoint.href, { signal: AbortSignal.timeout(20000) });
    const body = await response.text();
    const records = response.ok ? parseJsonLines(body) : [];
    return {
      index,
      label: target.label,
      targetUrl: target.url,
      httpStatus: response.status,
      recordCount: records.length,
      records: records.map(summarizeRecord)
    };
  } catch (error) {
    return {
      index,
      label: target.label,
      targetUrl: target.url,
      error: String(error),
      recordCount: 0,
      records: []
    };
  }
}

async function fetchWarc(record) {
  const end = Number(record.offset) + Number(record.length) - 1;
  const response = await fetch('https://data.commoncrawl.org/' + record.filename, {
    headers: { Range: 'bytes=' + record.offset + '-' + end },
    signal: AbortSignal.timeout(30000)
  });
  const compressed = Buffer.from(await response.arrayBuffer());
  const raw = gunzipSync(compressed);
  const text = raw.toString('utf8');
  const firstBoundary = text.indexOf('\r\n\r\n');
  const secondBoundary = text.indexOf('\r\n\r\n', firstBoundary + 4);
  const warcHeaders = firstBoundary >= 0 ? text.slice(0, firstBoundary) : '';
  const httpHeaders = secondBoundary >= 0 ? text.slice(firstBoundary + 4, secondBoundary) : '';
  const body = secondBoundary >= 0 ? text.slice(secondBoundary + 4).replace(/\r\n\r\n$/, '') : '';
  const onionIds = [...new Set([...body.matchAll(/([a-z2-7]{16})\.onion/ig)].map(m => m[1].toLowerCase()))].sort();
  let json = null;
  try { json = JSON.parse(body); } catch {}
  return {
    rangeStatus: response.status,
    compressedLength: compressed.length,
    rawLength: raw.length,
    compressedSha256: createHash('sha256').update(compressed).digest('hex'),
    warcHeaders,
    httpHeaders,
    bodyLength: body.length,
    onionIdCount: onionIds.length,
    onionIds: onionIds.slice(0, 100),
    json,
    body
  };
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const tasks = [];
  for (const index of INDEXES) {
    for (const target of TARGETS) tasks.push({ index, target });
  }
  tasks.push({ index: 'CC-MAIN-2014-23', target: CONTROL });

  const results = [];
  const concurrency = 4;
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(x => fetchIndex(x.index, x.target)));
    results.push(...batchResults);
    for (const result of batchResults) {
      console.log(JSON.stringify({
        index: result.index,
        label: result.label,
        httpStatus: result.httpStatus,
        error: result.error,
        recordCount: result.recordCount,
        records: result.records
      }));
    }
  }

  const captures = results.filter(r => r.recordCount > 0 && TARGETS.some(t => t.label === r.label));
  for (const capture of captures) {
    const target = TARGETS.find(t => t.label === capture.label);
    const warcResults = [];
    for (const record of capture.records) {
      try {
        warcResults.push({ record, payload: await fetchWarc(record) });
      } catch (error) {
        warcResults.push({ record, error: String(error) });
      }
    }
    const filename = capture.index + '-' + capture.label + '.json';
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify({
      target,
      index: capture.index,
      records: warcResults
    }, null, 2) + '\n');
    console.log(JSON.stringify({
      artifact: filename,
      captureCount: warcResults.length,
      payloads: warcResults.map(x => ({
        timestamp: x.record.timestamp,
        status: x.payload && x.payload.rangeStatus,
        bodyLength: x.payload && x.payload.bodyLength,
        onionIdCount: x.payload && x.payload.onionIdCount,
        onionIds: x.payload && x.payload.onionIds,
        error: x.error
      }))
    }));
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index-results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify({
    summary: {
      queries: results.length,
      targetQueries: results.filter(r => TARGETS.some(t => t.label === r.label)).length,
      captures: captures.length,
      controlRecords: results.find(r => r.label === CONTROL.label)?.recordCount ?? 0
    }
  }));
}

function selfTest() {
  const row = parseJsonLines('{"url":"https://example.com/","timestamp":"20140101000000","status":"200","mime":"text/html","digest":"x","length":"12","offset":"34","filename":"x.warc.gz"}')[0];
  if (row.url !== 'https://example.com/' || summarizeRecord(row).offset !== 34) {
    throw new Error('Index parser self-test failed');
  }
  if (TARGETS.length !== 4 || INDEXES.length !== 8) throw new Error('Source-frozen query set changed');
  console.log('PASS Common Crawl Tor2web source-frozen self-test');
}

if (process.argv.includes('--selftest')) selfTest();
else run().catch(error => { console.error(error); process.exitCode = 1; });

#!/usr/bin/env node
'use strict';

// Passive Common Crawl check for the LP2-derived IPv4 candidate.
// Row-major 2x2 read: 31.184.172.36. Column-major control: 31.172.184.36.
// Also queries the known 2012 domain/IP as controls. No host is contacted directly.

const fs = require('node:fs');
const path = require('node:path');

const targets = [
  { name: 'row-major-LP2-candidate', url: '31.184.172.36', matchType: 'host' },
  { name: 'column-major-control', url: '31.172.184.36', matchType: 'host' },
  { name: '2012-domain-control', url: '845145127.com', matchType: 'domain' },
  { name: '2012-known-IP-control', url: '75.119.203.244', matchType: 'host' },
  { name: 'positive-control-example-domain', url: 'example.com', matchType: 'domain' }
];

const wantedYears = new Set(['2014', '2015']);
const maxIndexes = 24;
const concurrency = 3;

async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  const body = await response.text();
  if (!response.ok) throw new Error('HTTP ' + response.status + ' for ' + url + ': ' + body.slice(0, 300));
  return JSON.parse(body);
}

async function queryIndex(index, target) {
  const endpoint = new URL(index['cdx-api']);
  endpoint.searchParams.set('url', target.url);
  endpoint.searchParams.set('matchType', target.matchType);
  endpoint.searchParams.set('output', 'json');
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(25000) });
  const body = await response.text();
  if (response.status === 404) return { index: index.id, target: target.name, status: 404, records: [] };
  if (!response.ok) return { index: index.id, target: target.name, status: response.status, error: body.slice(0, 500), records: [] };
  const records = body.split(/\r?\n/).filter(Boolean).map(line => {
    try {
      const x = JSON.parse(line);
      return {
        timestamp: x.timestamp, url: x.url, status: x.status, mime: x.mime,
        filename: x.filename, offset: x.offset, length: x.length, digest: x.digest
      };
    } catch {
      return { parseError: line.slice(0, 200) };
    }
  });
  return { index: index.id, target: target.name, status: response.status, records };
}

async function worker(queue, out) {
  while (queue.length) {
    const item = queue.shift();
    try {
      out.push(await queryIndex(item.index, item.target));
    } catch (e) {
      out.push({ index: item.index.id, target: item.target.name, error: String(e), records: [] });
    }
  }
}

(async () => {
  const collections = await getJson('https://index.commoncrawl.org/collinfo.json');
  const indexes = collections
    .filter(x => {
      const match = /^CC-MAIN-(\d{4})-/.exec(x.id || '');
      return match && wantedYears.has(match[1]);
    })
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(-maxIndexes);
  const queue = [];
  for (const index of indexes) for (const target of targets) queue.push({ index, target });
  const results = [];
  await Promise.all(Array.from({ length: concurrency }, () => worker(queue, results)));
  results.sort((a, b) => a.index.localeCompare(b.index) || a.target.localeCompare(b.target));

  const summary = {
    method: 'Common Crawl CDX index only; no direct requests to either candidate IP',
    indexesQueried: indexes.map(x => x.id),
    targetDefinitions: targets,
    requestCount: results.length,
    totalRecords: results.reduce((n, r) => n + (r.records || []).length, 0),
    candidateRecords: results.filter(r => r.target === 'row-major-LP2-candidate').flatMap(r => (r.records || []).map(x => ({ index: r.index, ...x }))),
    alternateRecords: results.filter(r => r.target === 'column-major-control').flatMap(r => (r.records || []).map(x => ({ index: r.index, ...x }))),
    controlRecords: results.filter(r => r.target.includes('control')).flatMap(r => (r.records || []).map(x => ({ index: r.index, target: r.target, ...x }))),
    errors: results.filter(r => r.error || (r.status && r.status >= 400)),
    results
  };
  const outDir = path.join(process.cwd(), 'im-results', 'cicada2014-ip-commoncrawl-gate');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(summary, null, 2) + '\n');
  const lines = [
    '# Common Crawl passive archive gate',
    '',
    '- Method: Common Crawl CDX index queries only; no direct requests to either candidate IP.',
    '- Indexes queried: ' + indexes.map(x => x.id).join(', '),
    '- Requests: ' + results.length,
    '- Candidate IP captures: ' + summary.candidateRecords.length,
    '- Column-major control captures: ' + summary.alternateRecords.length,
    '- 2012 controls: ' + summary.controlRecords.length,
    '',
    '## Candidate records',
    '',
    ...(summary.candidateRecords.length ? summary.candidateRecords.map(x => '- ' + x.index + ' ' + x.timestamp + ' ' + x.status + ' ' + x.mime + ' ' + x.url + ' (' + x.filename + ' @ ' + x.offset + ', ' + x.length + ' bytes)') : ['None returned by the queried indexes.']),
    '',
    '## Alternate orientation',
    '',
    ...(summary.alternateRecords.length ? summary.alternateRecords.map(x => '- ' + x.index + ' ' + x.timestamp + ' ' + x.status + ' ' + x.mime + ' ' + x.url) : ['None returned by the queried indexes.']),
    '',
    '## Controls and errors',
    '',
    ...(summary.controlRecords.length ? summary.controlRecords.map(x => '- ' + x.target + ' ' + x.index + ' ' + x.timestamp + ' ' + x.status + ' ' + x.mime + ' ' + x.url) : ['No control records returned.']),
    ...(summary.errors.length ? summary.errors.map(x => '- ERROR ' + x.index + ' ' + x.target + ': ' + (x.error || x.status)) : ['No request errors.']),
    '',
    'A zero-result response is limited to these Common Crawl snapshots; it does not exclude an uncrawled, onion-only, robots-blocked, or short-lived service.'
  ];
  fs.writeFileSync(path.join(outDir, 'report.md'), lines.join('\n') + '\n');
  console.log(JSON.stringify({
    indexesQueried: summary.indexesQueried,
    requestCount: summary.requestCount,
    totalRecords: summary.totalRecords,
    candidateRecords: summary.candidateRecords,
    alternateRecords: summary.alternateRecords,
    controlRecords: summary.controlRecords,
    errors: summary.errors
  }, null, 2));
})().catch(e => {
  console.error(e.stack || String(e));
  process.exit(1);
});

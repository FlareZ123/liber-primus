#!/usr/bin/env node
'use strict';

// Historical Common Crawl CDX inventory for the exact seven onion services
// in resources/cicada2014-archive-hash-manifest.json, through two documented
// public proxy suffixes and two period-relevant crawl collections.

const ENDPOINT = 'https://index.commoncrawl.org';
const SOURCE_MANIFEST_BLOB_SHA = '5ef51941b5db50b44512be25d782c3c5cd0bdab4';
const TARGET_HASH = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const INDEXES = [
  { id: 'CC-MAIN-2014-23', from: '2014-07-09', to: '2014-08-02', role: 'LP2-era' },
  { id: 'CC-MAIN-2015-22', from: '2015-05-22', to: '2015-06-04', role: 'Wayback-control-era' },
];
const ONIONS = [
  'auqgnxjtvdbll3pv.onion',
  'cu343l33nqaekrnw.onion',
  'fv7lyucmeozzd5j4.onion',
  'avowyfgl5lkzfj3n.onion',
  'q4utgdi2n4m4uim5.onion',
  'ut3qtzbrvs7dtvzp.onion',
  'ky2khlqdf7qdznac.onion',
];
const GATEWAYS = ['onion.to', 'tor2web.org'];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function query(index, pattern, role = 'target') {
  const url = new URL(ENDPOINT + '/' + index.id + '-index');
  url.searchParams.set('url', pattern);
  url.searchParams.set('matchType', 'prefix');
  url.searchParams.set('output', 'json');
  url.searchParams.set('limit', '5000');

  try {
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json,text/plain;q=0.9,*/*;q=0.8',
        'user-agent': 'LiberPrimus-ANEND-CommonCrawlAudit/1.0',
      },
      signal: AbortSignal.timeout(45000),
    });
    const body = await response.text();
    if (response.status === 404 && /no captures found/i.test(body)) {
      return { index: index.id, pattern, role, http_status: 404, record_count: 0, records: [], no_captures: true };
    }
    if (!response.ok) {
      return { index: index.id, pattern, role, http_status: response.status, error: body.slice(0, 1000), records: [] };
    }
    const records = body.trim()
      ? body.trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line))
      : [];
    return { index: index.id, pattern, role, http_status: response.status, record_count: records.length, records };
  } catch (error) {
    return { index: index.id, pattern, role, error: String(error), records: [] };
  }
}

async function runBatch(items, width = 4) {
  const results = [];
  for (let i = 0; i < items.length; i += width) {
    const batch = items.slice(i, i + width);
    results.push(...await Promise.all(batch.map(x => query(x.index, x.pattern, x.role))));
    if (i + width < items.length) await sleep(300);
  }
  return results;
}

async function main() {
  const started = new Date().toISOString();
  const results = [];
  for (const index of INDEXES) {
    const control = await query(index, 'example.com/*', 'positive-control');
    results.push(control);
    const controlPassed = (control.record_count || 0) > 0;
    if (!controlPassed) continue;

    const targets = ONIONS.flatMap(onion => GATEWAYS.map(gateway => ({
      index,
      pattern: onion.replace(/\.onion$/, '') + '.' + gateway + '/*',
      role: 'Cicada-host-proxy',
      onion,
      gateway,
    })));
    results.push(...await runBatch(targets, 4));
  }

  const targetResults = results.filter(r => r.role === 'Cicada-host-proxy');
  const errors = results.filter(r => r.error || (r.http_status && r.http_status >= 500));
  const controls = results.filter(r => r.role === 'positive-control');
  const controlsPassed = controls.length === INDEXES.length && controls.every(r => (r.record_count || 0) > 0);
  const records = targetResults.flatMap(r => r.records || []);
  const urls = [...new Set(records.map(r => r.url).filter(Boolean))].sort();
  const relevant = records.filter(r =>
    /(?:^|\/)(?:59|56)(?:\.|\/|$)|index|an.?end|hash|\.txt(?:$|\?)|\.bin(?:$|\?)/i.test(r.url || '')
  );
  const textRecords = records.filter(r =>
    r.status === '200' && /^(text\/html|text\/plain)/i.test(r.mime || '')
  );

  const summary = {
    schema: 1,
    purpose: 'Search historical Common Crawl URL indexes for archived captures of the seven source-manifested Cicada onion services via onion.to and tor2web.org.',
    target_hash: TARGET_HASH,
    source_manifest: 'resources/cicada2014-archive-hash-manifest.json',
    source_manifest_blob_sha: SOURCE_MANIFEST_BLOB_SHA,
    indexes: INDEXES,
    onion_hosts: ONIONS,
    gateway_suffixes: GATEWAYS,
    query_pattern: '<exact onion label>.<gateway>/*',
    query_mode: 'matchType=prefix, output=json, limit=5000',
    query_started_at: started,
    query_finished_at: new Date().toISOString(),
    controls_passed: controlsPassed,
    controls,
    target_query_count: targetResults.length,
    target_record_count: records.length,
    distinct_urls: urls,
    text_capture_count: textRecords.length,
    relevant_paths: relevant,
    errors,
    results,
    interpretation: !controlsPassed
      ? 'Inconclusive: one or more Common Crawl positive controls failed; no archive negative is claimed.'
      : errors.length || targetResults.length !== INDEXES.length * ONIONS.length * GATEWAYS.length
        ? 'Partial: Common Crawl controls passed, but one or more target queries failed or were skipped.'
        : records.length
          ? 'Common Crawl has archived records for one or more Cicada proxy hosts; inspect text captures and WARC payloads for the AN END page.'
          : 'Common Crawl controls passed; no records were returned for the seven Cicada hosts under onion.to or tor2web.org in these two pinned collections.',
    source_references: [
      'https://index.commoncrawl.org/collinfo.json',
      'https://www.commoncrawl.org/get-started',
      'https://index.commoncrawl.org/',
    ],
  };

  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  if (!controlsPassed || errors.length || targetResults.length !== INDEXES.length * ONIONS.length * GATEWAYS.length) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  process.stderr.write(String(error) + '\n');
  process.exitCode = 1;
});

#!/usr/bin/env node
'use strict';

// Bounded p56 continuation-source probe for the two post-release 2014
// Common Crawl indexes named in Director Issue #786.
//
// IMPORTANT: use CDX matchType=host with a bare host name. The predecessor
// probe used matchType=prefix with "example.com/*" but omitted the scheme;
// its 404 control therefore did not validate the index and it skipped every
// target query. That run was inconclusive, not an archive negative.

const ENDPOINT = 'https://index.commoncrawl.org';
const SOURCE_MANIFEST_BLOB_SHA = '5ef51941b5db50b44512be25d782c3c5cd0bdab4';
const TARGET_HASH = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const INDEXES = [
  { id: 'CC-MAIN-2014-23', from: '2014-07-09', to: '2014-08-02', role: 'July-August 2014' },
  { id: 'CC-MAIN-2014-35', from: '2014-08-20', to: '2014-09-03', role: 'August-September 2014' },
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
const GATEWAYS = ['onion.to', 'onion.link'];
const CONTROLS = ['example.com', 'google.com', 'wikipedia.org'];
const DELAY_MS = 500;
const MAX_ATTEMPTS = 3;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function query(index, host, role, matchType = 'host', limit = 5000) {
  const url = new URL(ENDPOINT + '/' + index.id + '-index');
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
          'user-agent': 'LiberPrimus-p56-CommonCrawl-2014-gate/1.0 (metadata-only research)',
        },
        signal: AbortSignal.timeout(45000),
      });
      const body = await response.text();

      if (response.status === 404 && /no captures found/i.test(body)) {
        return {
          index: index.id, host, role, match_type: matchType,
          http_status: 404, record_count: 0, records: [],
          no_captures: true, attempts: attempt,
        };
      }
      if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS) {
        await sleep(1500 * attempt);
        continue;
      }
      if (!response.ok) {
        return {
          index: index.id, host, role, match_type: matchType,
          http_status: response.status, error: body.slice(0, 1200),
          record_count: 0, records: [], attempts: attempt,
        };
      }

      let records = [];
      try {
        records = body.trim()
          ? body.trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line))
          : [];
      } catch (error) {
        return {
          index: index.id, host, role, match_type: matchType,
          http_status: response.status, error: 'Invalid NDJSON: ' + String(error),
          response_excerpt: body.slice(0, 1200), record_count: 0, records: [],
          attempts: attempt,
        };
      }
      return {
        index: index.id, host, role, match_type: matchType,
        http_status: response.status, record_count: records.length, records,
        attempts: attempt,
      };
    } catch (error) {
      if (attempt < MAX_ATTEMPTS) {
        await sleep(1500 * attempt);
        continue;
      }
      return {
        index: index.id, host, role, match_type: matchType,
        error: String(error), record_count: 0, records: [], attempts: attempt,
      };
    }
  }
}

async function runBatch(items, width = 3) {
  const results = [];
  for (let i = 0; i < items.length; i += width) {
    const batch = items.slice(i, i + width);
    results.push(...await Promise.all(batch.map(item =>
      query(item.index, item.host, item.role, 'host', 5000)
    )));
    if (i + width < items.length) await sleep(DELAY_MS);
  }
  return results;
}

async function main() {
  const started = new Date().toISOString();
  const controls = [];
  const controlPassedByIndex = {};
  const targetResults = [];
  const skippedIndexes = [];

  for (const index of INDEXES) {
    // Domain matching makes the positive control independent of www/scheme.
    const controlResults = await Promise.all(CONTROLS.map(host =>
      query(index, host, 'positive-control', 'domain', 1)
    ));
    controls.push(...controlResults);
    const passed = controlResults.some(r =>
      r.http_status === 200 && (r.record_count || 0) > 0
    );
    controlPassedByIndex[index.id] = passed;
    if (!passed) {
      skippedIndexes.push(index.id);
      continue;
    }

    const targets = ONIONS.flatMap(onion => GATEWAYS.map(gateway => ({
      index,
      host: onion.replace(/\.onion$/, '') + '.' + gateway,
      role: 'Cicada-host-proxy',
      onion,
      gateway,
    })));
    targetResults.push(...await runBatch(targets, 3));
  }

  const errors = [...controls, ...targetResults].filter(r =>
    r.error || (r.http_status && r.http_status !== 200 && r.http_status !== 404)
  );
  const records = targetResults.flatMap(r => r.records || []);
  const urls = [...new Set(records.map(r => r.url).filter(Boolean))].sort();
  const relevant = records.filter(r =>
    /(?:^|\/)(?:59|56)(?:\.|\/|$)|index|an.?end|hash|\.txt(?:$|\?)|\.bin(?:$|\?)/i.test(r.url || '')
  );
  const textRecords = records.filter(r =>
    /^(text\/html|text\/plain)/i.test(r.mime || '')
  );
  const expectedTargets = INDEXES.length * ONIONS.length * GATEWAYS.length;
  const allControlsPassed = INDEXES.every(index => controlPassedByIndex[index.id]);
  const complete = targetResults.length === expectedTargets && errors.length === 0;

  const summary = {
    schema: 2,
    issue: 786,
    purpose: 'Search two post-release 2014 Common Crawl URL indexes for the seven source-manifested Cicada onion services through onion.to and onion.link.',
    target_hash: TARGET_HASH,
    source_manifest: 'resources/cicada2014-archive-hash-manifest.json',
    source_manifest_blob_sha: SOURCE_MANIFEST_BLOB_SHA,
    indexes: INDEXES,
    onion_hosts: ONIONS,
    gateway_suffixes: GATEWAYS,
    target_query: 'bare gateway host with matchType=host; no scheme-dependent prefix or wildcard',
    positive_control_query: 'example.com, google.com, wikipedia.org with matchType=domain; at least one must return records per index',
    query_started_at: started,
    query_finished_at: new Date().toISOString(),
    control_passed_by_index: controlPassedByIndex,
    all_controls_passed: allControlsPassed,
    controls,
    skipped_indexes: skippedIndexes,
    expected_target_queries: expectedTargets,
    completed_target_queries: targetResults.length,
    target_record_count: records.length,
    distinct_urls: urls,
    text_capture_count: textRecords.length,
    relevant_paths: relevant,
    errors,
    target_results: targetResults,
    interpretation: !allControlsPassed
      ? 'Inconclusive: at least one index lacks a successful positive control; skipped target queries are not archive negatives.'
      : !complete
        ? 'Partial/inconclusive: one or more target queries failed or were skipped.'
        : records.length
          ? 'Common Crawl has archived records for one or more Cicada proxy hosts; inspect candidate response records and WARC payloads before any p56 hash claim.'
          : 'Positive controls passed on both indexes; no records were returned for the seven Cicada hosts under onion.to or onion.link in these two pinned collections.',
    source_references: [
      'https://index.commoncrawl.org/collinfo.json',
      'https://index.commoncrawl.org/',
      'https://commoncrawl.org/get-started',
    ],
  };

  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  if (!allControlsPassed || !complete) process.exitCode = 1;
}

main().catch(error => {
  process.stderr.write(String(error) + '\n');
  process.exitCode = 1;
});

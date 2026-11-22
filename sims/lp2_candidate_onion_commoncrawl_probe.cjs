#!/usr/bin/env node
'use strict';

// Bounded historical-capture check for the single provisional Tor v2 host
// produced by the red-13 combinadic branch. This does not search neighboring
// labels or infer page content. It asks whether this exact host was captured
// directly or through the two Tor2web gateways already used by the project.

const ENDPOINT = 'https://index.commoncrawl.org';
const CANDIDATE = 'nz77w2upkfkyj4rh.onion';
const INDEXES = [
  { id: 'CC-MAIN-2014-23', period: 'July-August 2014' },
  { id: 'CC-MAIN-2014-35', period: 'August-September 2014' },
];
const HOSTS = [
  { host: CANDIDATE, route: 'native-onion' },
  { host: CANDIDATE.replace(/\.onion$/, '') + '.onion.to', route: 'onion.to' },
  { host: CANDIDATE.replace(/\.onion$/, '') + '.onion.link', route: 'onion.link' },
];
const CONTROLS = ['example.com', 'google.com', 'wikipedia.org'];
const DELAY_MS = 350;
const MAX_ATTEMPTS = 3;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function query(index, host, role, matchType, limit) {
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
          'user-agent': 'LiberPrimus-candidate-onion-CC-probe/1.0 (bounded metadata query)',
        },
        signal: AbortSignal.timeout(45000),
      });
      const body = await response.text();

      if (response.status === 404 && /no captures found/i.test(body)) {
        return {
          index: index.id, host, role, match_type: matchType,
          http_status: 404, no_captures: true, record_count: 0, records: [],
          attempts: attempt,
        };
      }
      if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS) {
        await sleep(1000 * attempt);
        continue;
      }
      if (!response.ok) {
        return {
          index: index.id, host, role, match_type: matchType,
          http_status: response.status, error: body.slice(0, 1200),
          record_count: 0, records: [], attempts: attempt,
        };
      }

      let records;
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
        await sleep(1000 * attempt);
        continue;
      }
      return {
        index: index.id, host, role, match_type: matchType,
        error: String(error), record_count: 0, records: [], attempts: attempt,
      };
    }
  }
}

async function main() {
  if (process.argv.includes('--selftest')) {
    const expected = [
      'nz77w2upkfkyj4rh.onion',
      'nz77w2upkfkyj4rh.onion.to',
      'nz77w2upkfkyj4rh.onion.link',
    ];
    const actual = HOSTS.map(x => x.host);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error('candidate host construction self-test failed');
    }
    if (INDEXES.length !== 2 || HOSTS.length !== 3) {
      throw new Error('bounded query-count self-test failed');
    }
    process.stdout.write('PASS candidate onion Common Crawl probe self-test\n');
    return;
  }

  const started = new Date().toISOString();
  const controlResults = [];
  const targetResults = [];
  const controlPassedByIndex = {};

  for (const index of INDEXES) {
    const controls = await Promise.all(CONTROLS.map(host =>
      query(index, host, 'positive-control', 'domain', 1)
    ));
    controlResults.push(...controls);
    const passed = controls.some(r => r.http_status === 200 && r.record_count > 0);
    controlPassedByIndex[index.id] = passed;
    if (!passed) continue;

    for (const target of HOSTS) {
      targetResults.push(await query(index, target.host, target.route, 'host', 1000));
      await sleep(DELAY_MS);
    }
  }

  const allControlsPassed = INDEXES.every(index => controlPassedByIndex[index.id]);
  const expectedTargets = INDEXES.length * HOSTS.length;
  const errors = [...controlResults, ...targetResults].filter(r =>
    r.error || (r.http_status && r.http_status !== 200 && r.http_status !== 404)
  );
  const records = targetResults.flatMap(r => r.records || []);
  const complete = allControlsPassed && targetResults.length === expectedTargets && errors.length === 0;

  const summary = {
    schema: 1,
    purpose: 'Check one provisional onion host against two pinned 2014 Common Crawl indexes, directly and through two known Tor2web gateway domains.',
    candidate_host: CANDIDATE,
    target_hash: '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4',
    indexes: INDEXES,
    target_hosts: HOSTS,
    positive_controls: CONTROLS,
    started_at: started,
    finished_at: new Date().toISOString(),
    control_passed_by_index: controlPassedByIndex,
    all_controls_passed: allControlsPassed,
    controls: controlResults,
    expected_target_queries: expectedTargets,
    completed_target_queries: targetResults.length,
    target_record_count: records.length,
    target_records: records,
    errors,
    complete,
    interpretation: !allControlsPassed
      ? 'Inconclusive: at least one index did not pass its positive control.'
      : !complete
        ? 'Partial/inconclusive: one or more target queries failed.'
        : records.length
          ? 'Historical captures exist for the exact candidate host or one of its two proxy forms. Retrieve the WARC records and test the original response body against the manuscript digest before claiming a match.'
          : 'No captures were returned for this exact candidate host or its two proxy forms in these two pinned 2014 indexes. This is not proof the host never existed.',
  };
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  if (!complete) process.exitCode = 1;
}

main().catch(error => {
  process.stderr.write(String(error) + '\n');
  process.exitCode = 1;
});

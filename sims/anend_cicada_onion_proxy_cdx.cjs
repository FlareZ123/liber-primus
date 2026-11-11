#!/usr/bin/env node
'use strict';

// Source-bounded Wayback CDX search for all seven original Cicada 2014
// onion-service hostnames through the two historically documented gateways.

const ENDPOINT = 'https://web.archive.org/cdx/search/cdx';
const TARGET_HASH = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const SOURCE_MANIFEST_BLOB_SHA = '5ef51941b5db50b44512be25d782c3c5cd0bdab4';
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
const CONTROL_HOST = 'ky2khlqdf7qdznac.onion.to';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function hostOf(record) {
  try { return new URL(record.original).hostname.toLowerCase(); }
  catch { return ''; }
}

async function queryHost(host, retry = true) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('url', host + '/*');
  url.searchParams.set('output', 'json');
  url.searchParams.set('fl', 'timestamp,original,statuscode,mimetype,digest,length');
  url.searchParams.set('limit', '5000');

  try {
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json,text/plain;q=0.9,*/*;q=0.8',
        'user-agent': 'LiberPrimus-ANEND-ArchiveAudit/1.0',
      },
      signal: AbortSignal.timeout(45000),
    });
    const body = await response.text();
    if (response.status === 503 && retry) {
      await sleep(5000);
      return queryHost(host, false);
    }
    if (!response.ok) return { host, http_status: response.status, error: body.slice(0, 1000), records: [] };

    let rows;
    try { rows = JSON.parse(body); }
    catch { return { host, http_status: response.status, error: 'CDX response was not JSON', response_prefix: body.slice(0, 1000), records: [] }; }
    if (!Array.isArray(rows)) return { host, http_status: response.status, error: 'CDX JSON was not an array', records: [] };

    const header = Array.isArray(rows[0]) ? rows[0] : [];
    const records = rows.slice(header.length ? 1 : 0).map(row =>
      Array.isArray(row) ? Object.fromEntries(header.map((key, i) => [key, row[i] ?? null])) : row
    );
    return { host, http_status: response.status, record_count: records.length, records };
  } catch (error) {
    if (retry) {
      await sleep(5000);
      return queryHost(host, false);
    }
    return { host, error: String(error), records: [] };
  }
}

async function main() {
  const queryStartedAt = new Date().toISOString();
  const targets = ONIONS.flatMap(onion => GATEWAYS.map(gateway => ({
    onion,
    gateway,
    host: onion.replace(/\.onion$/, '') + '.' + gateway,
  })));
  const controlTarget = targets.find(x => x.host === CONTROL_HOST);
  const control = await queryHost(controlTarget.host);
  const controlPassed = (control.record_count || 0) > 0;
  const results = [control];

  // If the known positive control is unavailable, stop rather than mislabel
  // empty results from a broken CDX service as a negative.
  if (controlPassed) {
    const remaining = targets.filter(x => x.host !== CONTROL_HOST);
    for (let i = 0; i < remaining.length; i += 2) {
      const batch = remaining.slice(i, i + 2);
      results.push(...await Promise.all(batch.map(x => queryHost(x.host))));
      if (i + 2 < remaining.length) await sleep(500);
    }
  }

  const records = results.flatMap(r => r.records || []);
  const discoveredHosts = [...new Set(records.map(hostOf).filter(Boolean))].sort();
  const nonControlRecords = records.filter(r => hostOf(r) !== CONTROL_HOST);
  const failures = results.filter(r => r.error || (r.http_status && r.http_status !== 200));
  const relevant = records.filter(r =>
    /(?:^|\/)(?:59|56)(?:\.|\/|$)|index|an.?end|hash|\.txt(?:$|\?)|\.bin(?:$|\?)/i.test(r.original || '')
  );

  const summary = {
    schema: 1,
    purpose: 'Find archived AN END candidates among the source-manifested Cicada 2014 onion services via the two explicitly tested Tor2web gateways.',
    target_hash: TARGET_HASH,
    source_manifest: 'resources/cicada2014-archive-hash-manifest.json',
    source_manifest_blob_sha: SOURCE_MANIFEST_BLOB_SHA,
    query_started_at: queryStartedAt,
    query_finished_at: new Date().toISOString(),
    source_onion_hosts: ONIONS,
    gateways: GATEWAYS,
    query_endpoint: ENDPOINT,
    query_pattern: '<exact Cicada onion label>.<gateway>/*',
    query_fields: 'timestamp,original,statuscode,mimetype,digest,length',
    source_references: [
      'https://www.tor2web.org/',
      'https://tor.stackexchange.com/questions/3898/what-are-the-best-tor2web-anonymous-gateways',
      'https://www.mitre.org/sites/default/files/2022-08/pr-22-1390-how-to-check-for-dark-web-contraband.pdf',
      'https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/round43/F5-stored/cdx/onion-ky2k-to.json',
    ],
    control_host: CONTROL_HOST,
    control_passed: controlPassed,
    control_record_count: control.record_count || 0,
    all_queries_completed: results.length === targets.length && failures.length === 0,
    discovered_archive_hosts: discoveredHosts,
    non_control_record_count: nonControlRecords.length,
    relevant_paths: relevant,
    results,
    interpretation: !controlPassed
      ? 'Inconclusive: the known onion.to positive control failed; no proxy negative is claimed.'
      : failures.length || results.length !== targets.length
        ? 'Partial: the control works, but one or more source-manifested host/gateway queries failed or were skipped.'
        : nonControlRecords.length
          ? 'Additional Cicada onion proxy captures exist and require page-content/hash inspection; no preimage is inferred.'
          : 'The known control works; no additional captures were returned for the other source-manifested Cicada hosts under onion.to or tor2web.org.',
  };

  process.stdout.write(JSON.stringify(summary, null, 2) + '\\n');
  if (!controlPassed || failures.length || results.length !== targets.length) process.exitCode = 1;
}

main().catch(error => {
  process.stderr.write(String(error) + '\\n');
  process.exitCode = 1;
});

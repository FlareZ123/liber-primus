#!/usr/bin/env node
'use strict';

// Bounded source-led Wayback CDX inventory for the historical Onion7 host.
// This records capture metadata only; it does not guess page URLs or hash inputs.

const ENDPOINT = 'https://web.archive.org/cdx/search/cdx';
const SOURCES = {
  tor2web: [
    'https://www.tor2web.org/',
    'https://tor.stackexchange.com/questions/3898/what-are-the-best-tor2web-anonymous-gateways',
  ],
  mitre: [
    'https://www.mitre.org/sites/default/files/2022-08/pr-22-1390-how-to-check-for-dark-web-contraband.pdf',
  ],
  priorArchive: [
    'https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/round43/F5-stored/cdx/onion-ky2k-to.json',
  ],
};

const HOSTS = [
  { host: 'ky2khlqdf7qdznac.onion.to', role: 'positive-control', note: 'Existing pinned 2015 CDX snapshot reports root and robots.txt captures.' },
  { host: 'ky2khlqdf7qdznac.onion', role: 'direct-onion-control', note: 'Direct v2 hostname; archive may index it independently of a proxy.' },
  { host: 'ky2khlqdf7qdznac.tor2web.org', role: 'documented-proxy' },
  { host: 'ky2khlqdf7qdznac.tor2web.fi', role: 'documented-proxy' },
  { host: 'ky2khlqdf7qdznac.tor2web.blutmagie.de', role: 'documented-proxy' },
  { host: 'ky2khlqdf7qdznac.onion.sh', role: 'documented-proxy' },
  { host: 'ky2khlqdf7qdznac.onion.city', role: 'documented-proxy' },
  { host: 'ky2khlqdf7qdznac.onion.cab', role: 'documented-proxy' },
  { host: 'ky2khlqdf7qdznac.onion.direct', role: 'documented-proxy' },
  { host: 'ky2khlqdf7qdznac.onion.ly', role: 'documented-proxy' },
  { host: 'ky2khlqdf7qdznac.tor2web.onionsearchengine.com', role: 'documented-proxy' },
  { host: 'ky2khlqdf7qdznac.onion.link', role: 'documented-proxy' },
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function queryHost(item, sourcePath = '/*') {
  const url = new URL(ENDPOINT);
  url.searchParams.set('url', item.host + sourcePath);
  url.searchParams.set('output', 'json');
  url.searchParams.set('fl', 'timestamp,original,statuscode,mimetype,digest,length');
  url.searchParams.set('limit', '2000');

  try {
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json,text/plain;q=0.9,*/*;q=0.8',
        'user-agent': 'LiberPrimus-ANEND-ArchiveAudit/1.0',
      },
      signal: AbortSignal.timeout(30000),
    });
    const body = await response.text();
    if (!response.ok) {
      return { ...item, http_status: response.status, error: body.slice(0, 1000), records: [] };
    }

    let rows;
    try { rows = JSON.parse(body); }
    catch { return { ...item, http_status: response.status, error: 'CDX response was not JSON', response_prefix: body.slice(0, 1000), records: [] }; }

    if (!Array.isArray(rows)) {
      return { ...item, http_status: response.status, error: 'CDX JSON was not an array', response: rows, records: [] };
    }

    const header = Array.isArray(rows[0]) ? rows[0] : [];
    const records = rows.slice(header.length ? 1 : 0).map(row => {
      if (Array.isArray(row)) return Object.fromEntries(header.map((key, i) => [key, row[i] ?? null]));
      return row;
    });

    return {
      ...item,
      http_status: response.status,
      record_count: records.length,
      records,
      relevant_paths: records.filter(r => /(?:^|\/)(?:59|56)(?:\.|\/|$)|index|an.?end|hash|\.txt(?:$|\?)|\.bin(?:$|\?)/i.test(r.original || '')),
    };
  } catch (error) {
    return { ...item, error: String(error), records: [] };
  }
}

async function main() {
  const results = [];
  for (let i = 0; i < HOSTS.length; i += 3) {
    const batch = HOSTS.slice(i, i + 3);
    results.push(...await Promise.all(batch.map(queryHost)));
    if (i + 3 < HOSTS.length) await sleep(500);
  }

  // The 11 May 2014 original participant README explicitly mentions
  // "59.txt" and "59.bin", but those bytes were never committed. A full-host
  // CDX prefix can time out even when an exact URL query is cheap. Limit the
  // fresh check to the two currently inconclusive historical Tor2web hosts
  // and four literal filenames; do not invent hashes or URL slug guesses.
  const unresolvedHosts = [
    'ky2khlqdf7qdznac.tor2web.fi',
    'ky2khlqdf7qdznac.onion.direct',
  ];
  const exact59SourcePaths = ['/59.txt', '/59.bin', '/59.jpg', '/59'];
  const missing59Exact = await Promise.all(unresolvedHosts.flatMap(host =>
    exact59SourcePaths.map(sourcePath =>
      queryHost({host, role: 'exact-59-source', sourcePath}, sourcePath))));

  const control = results.find(r => r.role === 'positive-control');
  const controlPassed = !!control && control.http_status === 200 && control.record_count > 0;
  const failedQueries = results.filter(r => r.error || (r.http_status && r.http_status !== 200));
  const proxyRecords = results.filter(r => r.role === 'documented-proxy').reduce((n, r) => n + (r.record_count || 0), 0);

  const summary = {
    schema: 1,
    purpose: 'Check the residual Tor2web-proxy Wayback CDX archive class for the exact historical Onion7 v2 hostname.',
    target_host: 'ky2khlqdf7qdznac.onion',
    target_digest: '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4',
    query_endpoint: ENDPOINT,
    query_pattern: '<host>/*; output=json; fields=timestamp,original,statuscode,mimetype,digest,length; limit=2000',
    sources: SOURCES,
    control_passed: controlPassed,
    control_record_count: control?.record_count ?? 0,
    documented_proxy_host_count: HOSTS.filter(h => h.role === 'documented-proxy').length,
    documented_proxy_record_count: proxyRecords,
    missing59_exact_records: missing59Exact.reduce((n, q) => n + (q.record_count || 0), 0),
    missing59_exact_failed: missing59Exact.filter(q => q.error || q.http_status !== 200).length,
    missing59_exact_results: missing59Exact,
    failed_query_count: failedQueries.length,
    results,
    interpretation: controlPassed
      ? (proxyRecords ? 'Proxy records exist and require source/capture inspection; no hash preimage is inferred.' : 'The positive control works; no records were returned for the documented proxy hostnames.')
      : 'Inconclusive: the known onion.to control was not returned, so empty proxy results cannot be treated as a negative.',
  };
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  if (!controlPassed || failedQueries.length || summary.missing59_exact_failed) process.exitCode = 1;
}

main().catch(error => {
  process.stderr.write(String(error) + '\n');
  process.exitCode = 1;
});

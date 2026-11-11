#!/usr/bin/env node
'use strict';

// Exact-label wildcard search for any Wayback-indexed host suffix/path
// attached to the historical Onion7 v2 onion label.

const ENDPOINT = 'https://web.archive.org/cdx/search/cdx';
const TARGET = 'ky2khlqdf7qdznac';
const CONTROL = TARGET + '.onion.to';
const QUERIES = [
  { name: 'known-onion-to-control', pattern: CONTROL + '/*' },
  { name: 'exact-onion-label-wildcard', pattern: TARGET + '.*/*' },
];

function hostOf(record) {
  try { return new URL(record.original).hostname.toLowerCase(); }
  catch { return ''; }
}

async function query(item) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('url', item.pattern);
  url.searchParams.set('output', 'json');
  url.searchParams.set('fl', 'timestamp,original,statuscode,mimetype,digest,length');
  url.searchParams.set('limit', '5000');
  const response = await fetch(url, {
    headers: {
      'accept': 'application/json,text/plain;q=0.9,*/*;q=0.8',
      'user-agent': 'LiberPrimus-ANEND-ArchiveAudit/1.0',
    },
    signal: AbortSignal.timeout(90000),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(item.name + ': HTTP ' + response.status + ': ' + body.slice(0, 1000));
  const rows = JSON.parse(body);
  if (!Array.isArray(rows)) throw new Error(item.name + ': non-array CDX JSON');
  const header = Array.isArray(rows[0]) ? rows[0] : [];
  const records = rows.slice(header.length ? 1 : 0).map(row =>
    Array.isArray(row) ? Object.fromEntries(header.map((key, i) => [key, row[i] ?? null])) : row
  );
  return { ...item, record_count: records.length, records };
}

async function main() {
  const control = await query(QUERIES[0]);
  const wildcard = await query(QUERIES[1]);
  const controlRows = control.records.filter(r => hostOf(r) === CONTROL);
  const wildcardHosts = [...new Set(wildcard.records.map(hostOf).filter(Boolean))].sort();
  const additionalHosts = wildcardHosts.filter(h => h !== CONTROL && h !== TARGET);
  const wildcardControlRows = wildcard.records.filter(r => hostOf(r) === CONTROL);
  const relevant = wildcard.records.filter(r =>
    /(?:^|\/)(?:59|56)(?:\.|\/|$)|index|an.?end|hash|\.txt(?:$|\?)|\.bin(?:$|\?)/i.test(r.original || '')
  );

  const summary = {
    schema: 1,
    target_host: TARGET + '.onion',
    target_digest: '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4',
    query_endpoint: ENDPOINT,
    query_patterns: QUERIES,
    sources: {
      tor2web: [
        'https://www.tor2web.org/',
        'https://tor.stackexchange.com/questions/3898/what-are-the-best-tor2web-anonymous-gateways',
      ],
      mitre: 'https://www.mitre.org/sites/default/files/2022-08/pr-22-1390-how-to-check-for-dark-web-contraband.pdf',
      prior_archive: 'https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/round43/F5-stored/cdx/onion-ky2k-to.json',
    },
    exact_control_passed: controlRows.length > 0,
    wildcard_includes_control: wildcardControlRows.length > 0,
    exact_control_record_count: controlRows.length,
    wildcard_record_count: wildcard.record_count,
    wildcard_hosts: wildcardHosts,
    additional_hosts: additionalHosts,
    relevant_paths: relevant,
    results: { control, wildcard },
    interpretation: controlRows.length && wildcardControlRows.length
      ? (additionalHosts.length
        ? 'The wildcard includes the known control and additional archived host suffixes; inspect those captures.'
        : 'The wildcard includes the known onion.to control but no additional archived host suffixes for this exact onion label.')
      : 'Inconclusive: the exact control or wildcard coverage check failed.',
  };
  process.stdout.write(JSON.stringify(summary, null, 2) + '\\n');
  if (!controlRows.length || !wildcardControlRows.length) process.exitCode = 1;
}

main().catch(error => {
  process.stderr.write(String(error) + '\\n');
  process.exitCode = 1;
});

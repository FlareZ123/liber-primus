#!/usr/bin/env node
'use strict';

// Source-led Common Crawl delta for the AN END "emerge to the surface" clue.
// Only the two additional proxy hosts explicitly listed as online/transparent
// in the 2017 EURECOM proxy census are queried. The earlier 2013 Tor2web
// domains and onion.to controls are already covered by an earlier CDX probe.

const ENDPOINT = 'https://index.commoncrawl.org';
const INDEXES = [
  'CC-MAIN-2014-10', 'CC-MAIN-2014-15', 'CC-MAIN-2014-23',
  'CC-MAIN-2014-35', 'CC-MAIN-2014-41', 'CC-MAIN-2014-42',
  'CC-MAIN-2014-49', 'CC-MAIN-2014-52',
  'CC-MAIN-2015-06', 'CC-MAIN-2015-11', 'CC-MAIN-2015-14',
  'CC-MAIN-2015-18', 'CC-MAIN-2015-22', 'CC-MAIN-2015-27',
  'CC-MAIN-2015-32', 'CC-MAIN-2015-35', 'CC-MAIN-2015-40',
  'CC-MAIN-2015-48',
  'CC-MAIN-2016-07', 'CC-MAIN-2016-18', 'CC-MAIN-2016-22',
  'CC-MAIN-2016-26', 'CC-MAIN-2016-30', 'CC-MAIN-2016-36',
  'CC-MAIN-2016-40',
];
const TARGETS = [
  { host: 'ky2khlqdf7qdznac.onion.nu', proxy: 'onion.nu', status_in_2017: 'online and transparent' },
  { host: 'ky2khlqdf7qdznac.onion.rip', proxy: 'onion.rip', status_in_2017: 'online and not transparent' },
];
const CONTROL = { host: 'example.com', index: 'CC-MAIN-2014-23' };
const DELAY_MS = 1100;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function query(index, host) {
  const url = new URL(`${ENDPOINT}/${index}-index`);
  url.searchParams.set('url', host);
  url.searchParams.set('matchType', 'host');
  url.searchParams.set('output', 'json');
  url.searchParams.set('filter', 'status:200');
  url.searchParams.set('fl', 'timestamp,url,status,mime,filename,offset,length,digest');

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: 'application/x-ndjson, application/json;q=0.9, text/plain;q=0.8',
          'user-agent': 'LiberPrimus-ANEND-CommonCrawl-Delta/1.0 (metadata-only research)',
        },
        signal: AbortSignal.timeout(45000),
      });
      const body = await response.text();
      if (response.status === 404 && /no captures found/i.test(body)) {
        return { index, host, http_status: 404, record_count: 0, records: [] };
      }
      if (response.status === 404 && !body.trim()) {
        return { index, host, http_status: 404, record_count: 0, records: [] };
      }
      if ((response.status === 429 || response.status >= 500) && attempt < 2) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      if (!response.ok) {
        return { index, host, http_status: response.status, error: body.slice(0, 1200), record_count: 0, records: [] };
      }
      const records = body.trim()
        ? body.trim().split(/\r?\n/).map(line => JSON.parse(line))
        : [];
      return {
        index, host, http_status: response.status, record_count: records.length,
        records,
        relevant_paths: records.filter(r => /(?:^|\/)(?:59|56)(?:\.|\/|$)|index|an.?end|hash|\.txt(?:$|\?)|\.bin(?:$|\?)/i.test(r.url || '')),
      };
    } catch (error) {
      if (attempt < 2) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      return { index, host, error: String(error), record_count: 0, records: [] };
    }
  }
}

async function main() {
  const results = [];
  for (const index of INDEXES) {
    for (const target of TARGETS) {
      results.push({ ...target, ...(await query(index, target.host)) });
      await sleep(DELAY_MS);
    }
  }
  const control = await query(CONTROL.index, CONTROL.host);
  const failures = results.filter(r => r.error || (r.http_status && r.http_status !== 200 && r.http_status !== 404));
  const output = {
    schema: 1,
    purpose: 'Check whether Common Crawl captured the original Stage11 onion host through the two additional proxy domains listed as online in the 2017 EURECOM proxy census.',
    target_onion: 'ky2khlqdf7qdznac.onion',
    target_digest: '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4',
    source: 'https://www.eurecom.org/publication/5389/download/sec-publi-5389.pdf (2017, Table 4.3)',
    indexes: INDEXES,
    target_hosts: TARGETS,
    control,
    control_passed: control.http_status === 200 && control.record_count > 0,
    total_target_records: results.reduce((n, r) => n + (r.record_count || 0), 0),
    relevant_records: results.flatMap(r => (r.relevant_paths || []).map(x => ({ index: r.index, host: r.host, ...x }))),
    failed_queries: failures,
    results,
    interpretation: failures.length
      ? 'Inconclusive for failed index queries; inspect per-query errors before interpreting absence.'
      : 'A clean empty result excludes only these two proxy-host spellings from the queried Common Crawl indexes; it does not establish that the onion page never existed or that no other gateway captured it.',
    limitations: [
      'The 2017 proxy census does not establish that either gateway existed or served this host in 2014.',
      'Common Crawl index metadata is not a raw-byte preimage and a SHA-1 CDX digest is not the Liber Primus 512-bit target.',
      'Only the exact target host through onion.nu and onion.rip was queried; this is a delta, not a complete proxy census.',
    ],
  };
  const fs = await import('node:fs/promises');
  await fs.writeFile(process.argv[2] || 'anend-surface-proxy-commoncrawl.json', JSON.stringify(output, null, 2) + '\n');
  process.stdout.write(JSON.stringify({
    control_passed: output.control_passed,
    control_records: control.record_count,
    indexes: INDEXES.length,
    targets: TARGETS.map(t => t.host),
    target_records: output.total_target_records,
    relevant_records: output.relevant_records.length,
    failures: failures.length,
  }, null, 2) + '\n');
  if (failures.length || !output.control_passed) process.exitCode = 1;
}

main().catch(error => {
  process.stderr.write(String(error) + '\n');
  process.exitCode = 1;
});

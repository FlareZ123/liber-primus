'use strict';

/**
 * Original 2015 Onion.City Common Crawl source-acquisition test.
 *
 * Period-backed clue: Onion.City launched 11 February 2015 and made Tor
 * v2 services available via subdomains of onion.city. This bounded test
 * asks whether five 2015 Common Crawl collections captured any of seven
 * original 2014 Cicada service addresses through that gateway.
 *
 * This is URL-index research; no ciphertext plaintext is inferred.
 * Execute from repository root with Node.js >=22.
 * @typedef {{status:number,records:object[],error?:string,url:string}} QueryResult
 */
const fs = require('node:fs/promises');
const path = require('node:path');

const INDEXES = [
  'CC-MAIN-2015-11', 'CC-MAIN-2015-14', 'CC-MAIN-2015-18',
  'CC-MAIN-2015-22', 'CC-MAIN-2015-27'
];
const ORIGINAL_ONIONS = [
  'auqgnxjtvdbll3pv', 'cu343l33nqaekrnw', 'fv7lyucmeozzd5j4',
  'avowyfgl5lkzfj3n', 'q4utgdi2n4m4uim5', 'ut3qtzbrvs7dtvzp',
  'ky2khlqdf7qdznac'
];
const GATEWAY = 'onion.city';
const USER_AGENT = 'LiberPrimus-2015-OnionCity-original-source/1.0 (bounded URL index)';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {string} collection
 * @param {string} domain
 * @param {'host'|'domain'} matchType
 * @param {number} limit
 * @returns {Promise<QueryResult>}
 */
async function query(collection, domain, matchType = 'host', limit = 500) {
  const u = new URL('https://index.commoncrawl.org/' + collection + '-index');
  u.searchParams.set('url', domain);
  u.searchParams.set('matchType', matchType);
  u.searchParams.set('output', 'json');
  u.searchParams.set('limit', String(limit));
  u.searchParams.set('fl', 'timestamp,url,status,mime,filename,offset,length,digest');
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(u, {
        headers: {accept: 'application/json, text/plain', 'user-agent': USER_AGENT},
        signal: AbortSignal.timeout(25000)
      });
      const body = await res.text();
      if (res.status === 404 && /no captures found/i.test(body)) {
        return {status: 404, records: [], url: u.toString()};
      }
      if (res.status === 404 && body.trim() === '') {
        return {status: 404, records: [], url: u.toString()};
      }
      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < 2) {
          await sleep(1300 * (attempt + 1));
          continue;
        }
        return {status: res.status, records: [], error: body.slice(0, 500), url: u.toString()};
      }
      const records = body.trim() ? body.trim().split(/\r?\n/).map(s => JSON.parse(s)) : [];
      return {status: 200, records, url: u.toString()};
    } catch (error) {
      if (attempt < 2) {
        await sleep(1300 * (attempt + 1));
        continue;
      }
      return {status: 0, records: [], error: String(error), url: u.toString()};
    }
  }
  throw new Error('Unreachable retry exit');
}

/** @param {string} destination @param {string} body */
async function atomicWrite(destination, body) {
  const lock = destination + '.lock';
  const handle = await fs.open(lock, 'wx');
  const temp = destination + '.' + process.pid + '.tmp';
  try {
    await fs.writeFile(temp, body, 'utf8');
    await fs.rename(temp, destination);
  } finally {
    await fs.rm(temp, {force: true});
    await handle.close();
    await fs.rm(lock, {force: true});
  }
}

async function main() {
  const destination = path.resolve(process.argv[2] || 'lp2-2015-onioncity-cdx.json');
  const controls = [];
  const results = [];
  for (const collection of INDEXES) {
    const wikipedia = await query(collection, 'wikipedia.org', 'domain', 1);
    const onioncity = await query(collection, GATEWAY, 'domain', 3);
    const calibrated = wikipedia.status === 200 && wikipedia.records.length > 0;
    controls.push({
      collection, calibrated,
      wikipedia: {status: wikipedia.status, count: wikipedia.records.length, error: wikipedia.error},
      onioncity: {status: onioncity.status, count: onioncity.records.length, error: onioncity.error}
    });
    process.stdout.write(collection + ': wikipedia=' + wikipedia.status + '/' + wikipedia.records.length +
      ' gateway=' + onioncity.status + '/' + onioncity.records.length + '\n');
    if (!calibrated) continue;
    for (const onion of ORIGINAL_ONIONS) {
      const host = onion + '.' + GATEWAY;
      const r = await query(collection, host);
      results.push({
        collection, original_host: onion + '.onion', query_host: host,
        http_status: r.status, record_count: r.records.length, error: r.error,
        records: r.records
      });
      if (r.records.length) {
        process.stdout.write('CAPTURE ' + collection + ' ' + host + ' ' + r.records.length + '\n');
      }
      await sleep(160);
    }
  }
  const failures = results.filter(r => r.error || ![200, 404].includes(r.http_status));
  const records = results.flatMap(r => r.records);
  const summary = {
    schema: 1, date: new Date().toISOString(), source_role: 'historical metadata-only',
    premise: 'Onion.City launched 11 Feb 2015; exact original 2014 Cicada v2 host names may have been captured via its web proxy.',
    index_url: 'https://index.commoncrawl.org/',
    onioncity_launch: 'https://www.digitalnewsasia.com/digital-economy/unpeeling-the-dark-web-with-onioncity',
    indexes: INDEXES, target_onions: ORIGINAL_ONIONS.map(x => x + '.onion'),
    gateway: GATEWAY, controls, attempts: results.length,
    target_records: records.length, failures,
    results,
    interpretation: controls.some(c => !c.calibrated) || failures.length
      ? 'Partial: failed/uncontrolled indexes cannot be interpreted as zero-capture evidence.'
      : records.length
        ? 'Source URL captures exist. Retrieve candidate original WARC byte ranges before assigning any Cicada origin or cryptographic meaning.'
        : 'All five 2015 controls passed; no exact source host indexed through onion.city in the scoped Common Crawl collections.'
  };
  await atomicWrite(destination, JSON.stringify(summary, null, 2) + '\n');
  process.stdout.write('SOURCE SUMMARY ' + JSON.stringify({
    controls: controls.length, controlled: controls.filter(x => x.calibrated).length,
    queries: results.length, captures: records.length, failures: failures.length,
    output: destination
  }) + '\n');
  if (controls.some(c => !c.calibrated) || failures.length) process.exitCode = 1;
}

main().catch(error => {
  process.stderr.write(String(error) + '\n');
  process.exitCode = 1;
});

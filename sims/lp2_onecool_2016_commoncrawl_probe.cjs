'use strict';

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const ID = '0BzOKQofOkvB3YmR1cjJCZGNCdXM';
const CRAWLS = [
  'CC-MAIN-2016-50',
  'CC-MAIN-2017-04','CC-MAIN-2017-09','CC-MAIN-2017-13','CC-MAIN-2017-17',
  'CC-MAIN-2017-22','CC-MAIN-2017-26','CC-MAIN-2017-30','CC-MAIN-2017-34',
  'CC-MAIN-2017-39','CC-MAIN-2017-43','CC-MAIN-2017-47','CC-MAIN-2017-51',
  'CC-MAIN-2018-05','CC-MAIN-2018-09','CC-MAIN-2018-13',
];
const QUERIES = [
  { label: 'drive-open', url: `drive.google.com/open?id=${ID}`, matchType: 'exact' },
  { label: 'drive-file', url: `drive.google.com/file/d/${ID}/`, matchType: 'prefix' },
  { label: 'docs-sheet', url: `docs.google.com/spreadsheets/d/${ID}/`, matchType: 'prefix' },
];
const OUT = path.join('workplace', 'onecool-2016-commoncrawl-probe');
fs.mkdirSync(OUT, { recursive: true });

/** @param {string} url @param {number} ms @param {Record<string,string>} headers */
async function get(url, ms = 15000, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'liber-primus-research/1.0 (+https://github.com/FlareZ123/liber-primus)',
        ...headers,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** @param {string} crawl @param {{label:string,url:string,matchType:string}} query */
async function queryIndex(crawl, query) {
  const endpoint = new URL(`https://index.commoncrawl.org/${crawl}-index`);
  endpoint.searchParams.set('url', query.url);
  endpoint.searchParams.set('output', 'json');
  endpoint.searchParams.set('matchType', query.matchType);
  try {
    const res = await get(endpoint.href, 12000);
    const text = await res.text();
    if (res.status === 404) return { crawl, ...query, hits: [] };
    if (!res.ok) return { crawl, ...query, error: `${res.status} ${text.slice(0,160)}`, hits: [] };
    const hits = text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
    console.log(JSON.stringify({ crawl, query: query.label, hitCount: hits.length }));
    return { crawl, ...query, hits };
  } catch (error) {
    return { crawl, ...query, error: String(error), hits: [] };
  }
}

/** @param {any} hit @param {string} label */
async function recover(hit, label) {
  const filename = hit.filename;
  const offset = Number(hit.offset);
  const length = Number(hit.length);
  if (!filename || !Number.isFinite(offset) || !Number.isFinite(length) || length <= 0 || length > 20_000_000) {
    return { label, error: 'invalid WARC metadata', hit };
  }
  const url = `https://data.commoncrawl.org/${filename}`;
  try {
    const res = await get(url, 20000, { Range: `bytes=${offset}-${offset + length - 1}` });
    const compressed = Buffer.from(await res.arrayBuffer());
    let warc;
    try {
      warc = zlib.gunzipSync(compressed);
    } catch {
      warc = compressed;
    }
    const sha256 = crypto.createHash('sha256').update(warc).digest('hex');
    const name = label.replace(/[^A-Za-z0-9._-]/g, '_');
    fs.writeFileSync(path.join(OUT, `${name}.warc-record.bin`), warc);
    const printable = warc.toString('utf8');
    fs.writeFileSync(path.join(OUT, `${name}.warc-record.txt`), printable);
    const meta = {
      label, url, status: res.status, compressedBytes: compressed.length,
      warcBytes: warc.length, sha256, hit,
    };
    fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(meta, null, 2));
    console.log(JSON.stringify({ recovered: meta }));
    return meta;
  } catch (error) {
    return { label, error: String(error), hit };
  }
}

async function main() {
  const jobs = [];
  for (const crawl of CRAWLS) for (const query of QUERIES) jobs.push(queryIndex(crawl, query));
  const indexResults = await Promise.all(jobs);
  const allHits = indexResults.flatMap((entry) =>
    entry.hits.map((hit, i) => ({ entry, hit, i }))
  );
  const recovered = [];
  for (const item of allHits) {
    recovered.push(await recover(
      item.hit,
      `${item.entry.crawl}_${item.entry.label}_${item.i}`
    ));
  }
  const report = {
    id: ID,
    generatedAt: new Date().toISOString(),
    crawls: CRAWLS,
    queries: QUERIES,
    indexResults,
    recovered,
  };
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    status: 'PASS',
    queryCount: indexResults.length,
    indexErrors: indexResults.filter((x) => x.error).length,
    hitCount: allHits.length,
    recoveredCount: recovered.filter((x) => x.status === 206 || x.status === 200).length,
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

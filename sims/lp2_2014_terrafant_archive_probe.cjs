'use strict';

/**
 * Exact-ID archive acquisition for the source-dated May 2014 participant workpad.
 * No runic key search or semantic inference occurs here.
 * Run with Node.js 22. Writes an atomic, exclusively locked JSON report.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const source = 'terrafant.asia/cicada/';
const outdir = 'terrafant-2014-original-recovery';
fs.mkdirSync(outdir, { recursive: true });
const probes = [];

async function request(name, url) {
  let item;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LiberPrimus historical-source study)' },
      signal: AbortSignal.timeout(20000)
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    item = {
      name, requested_url: url, final_url: response.url,
      status: response.status, length: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
      body: bytes.toString('utf8').slice(0, 140000)
    };
  } catch (error) {
    item = { name, requested_url: url, error: String(error) };
  }
  probes.push(item);
  console.log(JSON.stringify({
    name, status: item.status ?? null, bytes: item.length ?? null,
    sha256: item.sha256 ?? null, error: item.error ?? null,
    preview: item.body ? item.body.slice(0, 240) : null
  }));
  return item;
}

function endpoint(base, params) {
  return base + '?' + new URLSearchParams(params).toString();
}

async function main() {
  const exact = [
    ['live_https', 'https://' + source],
    ['live_http', 'http://' + source],
    ['ia_cdx_exact', endpoint('https://web.archive.org/cdx/search/cdx', {
      url: source, output: 'json', from: '2014', to: '2015',
      filter: 'statuscode:200', collapse: 'digest'
    })],
    ['ia_cdx_prefix', endpoint('https://web.archive.org/cdx/search/cdx', {
      url: source + '*', output: 'json', from: '2014', to: '2015',
      filter: 'statuscode:200', collapse: 'urlkey'
    })],
    ['ia_availability', endpoint('https://archive.org/wayback/available', {
      url: 'http://' + source, timestamp: '20140517'
    })],
    ['arquivo_cdx_exact', endpoint('https://arquivo.pt/wayback/cdx', {
      url: source, output: 'json', from: '2014', to: '2015', limit: '1000'
    })],
    ['arquivo_cdx_prefix', endpoint('https://arquivo.pt/wayback/cdx', {
      url: source, matchType: 'prefix', output: 'json',
      from: '2014', to: '2015', limit: '1000'
    })],
    ['arquivo_history', endpoint('https://arquivo.pt/textsearch', {
      versionHistory: source, maxItems: '100'
    })]
  ];
  for (const [name, url] of exact) await request(name, url);

  const coll = await request('cc_collection_catalog', 'https://index.commoncrawl.org/collinfo.json');
  if (coll.status === 200) {
    try {
      const collections = JSON.parse(coll.body).filter(x => /CC-MAIN-201[45]-/.test(x.id));
      console.log('Common Crawl 2014–2015 collections:', collections.map(x => x.id).join(' '));
      for (const entry of collections) {
        const url = endpoint(entry['cdx-api'] || ('https://index.commoncrawl.org/' + entry.id + '-index'), {
          url: source + '*', output: 'json', filter: 'status:200'
        });
        await request('cc_' + entry.id, url);
      }
    } catch (error) {
      console.log('Common Crawl catalog parsing failed: ' + String(error));
    }
  }

  const report = {
    target: source,
    original_context: '9 May 2014 German LP2 forum, 17 May original URL witness',
    acquisition_window: '2014–2015',
    probes
  };
  const file = path.join(outdir, 'archive-index.json');
  const lock = file + '.lock';
  const fd = fs.openSync(lock, 'wx');
  try {
    const tmp = file + '.tmp-' + process.pid;
    fs.writeFileSync(tmp, JSON.stringify(report, null, 2) + '\n', 'utf8');
    fs.renameSync(tmp, file);
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  console.log('RECORD', file, 'TOTAL_PROBES', probes.length);
}
main().catch(e => { console.error(e); process.exitCode = 1; });

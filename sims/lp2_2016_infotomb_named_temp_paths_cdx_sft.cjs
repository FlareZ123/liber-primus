'use strict';
/**
 * Read-only, bounded Wayback CDX check for the exact three InfoTomb temp-file
 * names recovered before the 2016-01-09 original-host JPEG. These are server
 * filesystem strings, not proven public URL paths or Cicada key material.
 * Node.js 22 CommonJS; original 4gq25.jpg is the positive control.
 */
const assert = require('node:assert/strict');

const host = 'https://infotomb.com';
const paths = [
  '/4gq25.jpg',
  '/tmp/208771',
  '/tmp/208771.thumb.jpg',
  '/tmp/208771_text',
  '/208771',
  '/208771.thumb.jpg',
  '/208771_text',
  '/var/www/infotomb/tmp/208771',
  '/var/www/infotomb/tmp/208771.thumb.jpg',
  '/var/www/infotomb/tmp/208771_text'
];
assert.equal(paths.length, new Set(paths).size);

async function inspect(path) {
  const original = host + path;
  const params = new URLSearchParams({
    url: original,
    output: 'json',
    matchType: 'exact',
    fl: 'timestamp,original,mimetype,statuscode,digest,length'
  });
  const url = 'https://web.archive.org/cdx/search/cdx?' + params.toString();
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    const body = await r.text();
    if (r.status !== 200) {
      return { original, status: r.status, available: false, response_excerpt: body.slice(0, 120) };
    }
    const data = JSON.parse(body);
    const rows = data.slice(1).filter(x => /^2016/.test(x[0]));
    const hits = rows.filter(x => x[3] === '200');
    return {
      original,
      status: 200,
      available: true,
      total_rows: data.length - 1,
      year2016_rows: rows.length,
      year2016_http200: hits.map(x => ({
        timestamp: x[0], captured_url: x[1], mimetype: x[2],
        digest: x[4], length: x[5]
      }))
    };
  } catch (e) {
    return { original, available: false, error: String(e) };
  }
}
(async () => {
  const results = [];
  for (const p of paths) results.push(await inspect(p));
  console.log(JSON.stringify({
    scope: 'Exact recovered InfoTomb server-temporary-path names only',
    positive_control: results[0],
    source_named_paths: results.slice(1)
  }, null, 2));
  const control = results[0];
  if (!control.available || control.year2016_http200.length < 1)
    console.log('Control unavailable: no archival absence claims are warranted.');
  else
    console.log('Original carrier CDX control positive; other paths require their own actual 2016 200 record.');
})().catch(e => { console.error(e); process.exitCode = 1; });

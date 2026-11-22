'use strict';

/**
 * Source-pinned URL existence probes for the May 2014 Cicada stage11 signature.
 * Only probes one exact 11-symbol extraction and its exact 8-symbol prefix.
 * Running on Actions Windows Node 22 permits original public-site HTTP access.
 * This does not establish creator intent from a mere URL-compatible string.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'resources/historical/cicada2014-stage11-message.asc'), 'utf8').replace(/\r\n/g, '\n');
const signed = source.split('Hash: SHA1\n\n')[1].split('-----BEGIN PGP SIGNATURE-----')[0];
const widths = [];
for (const line of signed.split(/\r?\n/)) {
  if (!line.trim() && line.length) widths.push(line.length);
  else if (line.trim()) {
    const left = line.length - line.trimStart().length;
    const right = line.length - line.trimEnd().length;
    if (left) widths.push(left);
    if (right) widths.push(right);
  }
}
assert.deepEqual(widths, [2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37]);
const rows = source.split('-----BEGIN PGP SIGNATURE-----')[1]
  .split('-----END PGP SIGNATURE-----')[0].split(/\r?\n/)
  .filter(line => /^[A-Za-z0-9+/]{20,64}$/.test(line));
const candidate = widths.map((width, i) => rows[i][width]).join('');
assert.equal(candidate, 'I8XwhKTScAn');

/** @param {string} name @param {string} url @returns {Promise<object>} */
async function probe(name, url) {
  try {
    const reply = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LiberPrimusOriginalSourceCheck/1.0)' },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });
    const body = (await reply.text()).slice(0, 6000);
    const meta = {
      name,
      status: reply.status,
      finalUrl: reply.url,
      contentType: reply.headers.get('content-type'),
      sample: body.slice(0, 300).replace(/[\r\n]+/g, ' '),
    };
    if (/^\s*\{/.test(body)) {
      try {
        const json = JSON.parse(body);
        meta.metadata = {
          title: json.title ?? null,
          author_name: json.author_name ?? null,
          error: json.error ?? null,
          archived_snapshots: json.archived_snapshots ?? null,
        };
      } catch (_) { /* Some HTTP error pages begin with a non-JSON brace. */ }
    }
    return meta;
  } catch (error) {
    return { name, error: String(error.message || error) };
  }
}

async function main() {
  const yt = id => 'https://www.youtube.com/oembed?url=' +
    encodeURIComponent('https://www.youtube.com/watch?v=' + id) + '&format=json';
  const wb = u => 'https://archive.org/wayback/available?url=' + encodeURIComponent(u);
  const urls = [
    ['youtube-positive-control', yt('dQw4w9WgXcQ')],
    ['youtube-extracted-11', yt(candidate)],
    ['youtube-noembed-11', 'https://noembed.com/embed?url=' +
      encodeURIComponent('https://www.youtube.com/watch?v=' + candidate)],
    ['pastebin-extracted-first8', 'https://pastebin.com/raw/' + candidate.slice(0, 8)],
    ['pastebin-period-control', 'https://pastebin.com/raw/3T089HUW'],
    ['archive-youtube', wb('https://www.youtube.com/watch?v=' + candidate)],
    ['archive-pastebin', wb('https://pastebin.com/' + candidate.slice(0, 8))],
  ];
  const results = [];
  for (const [name, url] of urls) {
    const result = await probe(name, url);
    results.push(result);
    process.stdout.write(JSON.stringify(result) + '\n');
  }
  const youtubeControl = results[0];
  const youtubeCandidate = results[1];
  console.log(JSON.stringify({
    source: 'resources/historical/cicada2014-stage11-message.asc',
    exactCandidate: candidate,
    exactPastebin8: candidate.slice(0, 8),
    youtubePositiveControlUsable: youtubeControl.status === 200,
    youtubeCandidateExists: youtubeCandidate.status === 200 && Boolean(youtubeCandidate.metadata?.title),
    remoteLookupOnly: true,
    originalLP2PlaintextRecovered: false,
  }));
}

main().catch(error => { console.error(error); process.exitCode = 1; });

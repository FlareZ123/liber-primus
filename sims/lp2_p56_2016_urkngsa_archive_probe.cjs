'use strict';
/**
 * Agent47: source-locked retrieval of the 2016 uRkNsGsa.htm LP2 p56 claim.
 * Tests a short finite list of independently named URL/capture forms.
 * Never executes fetched content or interprets a server's status as plaintext.
 * Usage: node sims/lp2_p56_2016_urkngsa_archive_probe.cjs
 */
const { createHash, getHashes } = require('node:crypto');

const target = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const path = 'pastebin.com/uRkNsGsa';
const enc = encodeURIComponent(path);
const sources = [
  ['pastebin-page', 'https://pastebin.com/uRkNsGsa'],
  ['pastebin-raw', 'https://pastebin.com/raw/uRkNsGsa'],
  ['wayback-cdx', 'https://web.archive.org/cdx/search/cdx?url=' + enc + '&output=json&fl=timestamp,original,statuscode,mimetype,length'],
  ['wayback-availability', 'https://archive.org/wayback/available?url=' + enc],
  ['arquivo-cdx', 'https://arquivo.pt/wayback/cdx?url=' + enc + '&output=json'],
  ['commoncrawl-2016-26', 'https://index.commoncrawl.org/CC-MAIN-2016-26-index?url=' + enc + '&output=json'],
];
const hashes = getHashes();
const methods = ['sha512', 'sha3-512', 'blake2b512', 'whirlpool'].filter((name) => hashes.includes(name));
console.log('source=2016-07-12 Tor Stack Exchange answer user13596; text=uRkNsGsa.htm; URL-ID identification is conjectural');
console.log('digest_methods=' + methods.join(','));
console.log('candidate_urls=' + sources.length);
let valid = 0;
let matched = 0;

/** @param {string} label @param {string} url @returns {Promise<string | undefined>} */
async function check(label, url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'LP2-original-source-candidate-audit/1.0 (public archival lookup)' },
    });
    const data = Buffer.from(await response.arrayBuffer());
    const digests = Object.fromEntries(methods.map((name) => [name, createHash(name).update(data).digest('hex')]));
    const matches = Object.entries(digests).filter(([, digest]) => digest === target).map(([name]) => name);
    const detail = {
      label, status: response.status, final_url: response.url, bytes: data.length,
      sha256: createHash('sha256').update(data).digest('hex'),
      digest_matches: matches,
      prefix: data.subarray(0, 120).toString('utf8').replace(/\s+/g, ' '),
    };
    console.log(JSON.stringify(detail));
    if (response.ok) valid += 1;
    matched += matches.length;
    return response.ok ? data.toString('utf8') : undefined;
  } catch (error) {
    console.log(JSON.stringify({ label, url, transport_error: String(error) }));
    return undefined;
  }
}
(async () => {
  for (const [label, url] of sources) {
    const body = await check(label, url);
    if (label === 'wayback-cdx' && body && body.trimStart().startsWith('[')) {
      const rows = JSON.parse(body);
      const captures = rows.slice(1).filter((row) => row[2] === '200').slice(0, 4);
      console.log('wayback_200_capture_count=' + (rows.length - 1) + ' total indexed; checking up to 4 200 captures');
      for (const row of captures) {
        await check('wayback-raw-' + row[0], 'https://web.archive.org/web/' + row[0] + 'id_/' + row[1]);
      }
    }
  }
  console.log(JSON.stringify({ accessible_sources: valid, verified_preimages: matched, evidence_scope: 'one speculative Pastebin ID and four archive routes; no preimage from missing material can be excluded' }));
  if (matched > 0) process.exitCode = 2;
})().catch((error) => { console.error('parser_failure=' + error.stack); process.exitCode = 1; });

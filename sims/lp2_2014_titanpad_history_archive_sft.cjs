'use strict';
/**
 * Source-constrained original Cicada-era Titanpad revision-history acquisition.
 * This is a historical document search, never a claimed LP2 decryption.
 * Node.js 22, Windows 11: node sims/lp2_2014_titanpad_history_archive_sft.cjs
 * Revisions/export routes: https://docs.etherpad.org/faq.html
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const pad = 'vFCy7T5p0O';
assert.match(pad, /^[A-Za-z0-9]{10}$/);
const api = 'https://web.archive.org/cdx/search/cdx?';
const root = 'https://titanpad.com/' + pad;
const hashes = [];
/** @param {string} s */
function sha(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}
/** @param {string} url @param {number} timeout */
async function request(url, timeout = 25000) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeout),
    headers: { 'user-agent': 'LP2-historical-revision-evidence/1.0' }
  });
  const body = (await response.text()).slice(0, 450000);
  return { status: response.status, body, finalUrl: response.url };
}
/** @param {unknown} parsed */
function records(parsed) {
  if (!Array.isArray(parsed) || !Array.isArray(parsed[0])) return [];
  const keys = parsed[0];
  return parsed.slice(1).filter(Array.isArray).map(row =>
    Object.fromEntries(keys.map((key, index) => [key, row[index] ?? ''])));
}
/** @param {string} label @param {string} target */
async function cdx(label, target) {
  const parameters = new URLSearchParams({
    url: target, matchType: 'prefix', output: 'json', filter: 'statuscode:200',
    from: '2014', to: '2018', collapse: 'urlkey', limit: '100'
  });
  const url = api + parameters.toString();
  try {
    const response = await request(url);
    let hits = [];
    try { hits = records(JSON.parse(response.body)); } catch { /* Non-JSON archive response. */ }
    const relevant = hits.filter(hit =>
      String(hit.original ?? '').toLowerCase().includes(pad.toLowerCase()));
    const out = {
      label, url, http: response.status, responseBytes: Buffer.byteLength(response.body),
      responseSha256: sha(response.body), rows: hits.length,
      relevant: relevant.map(hit => ({
        timestamp: hit.timestamp, original: hit.original,
        mimetype: hit.mimetype, statuscode: hit.statuscode, digest: hit.digest
      })),
      diagnostic: response.status === 200 ? null : response.body.slice(0, 180)
    };
    console.log('CDX ' + JSON.stringify(out));
    return relevant;
  } catch (error) {
    console.log('CDX_ERROR ' + JSON.stringify({ label, url, error: String(error) }));
    return [];
  }
}
/** @param {string} stamp @param {string} url */
async function replay(stamp, url) {
  const target = 'https://web.archive.org/web/' + stamp + 'id_/' + url;
  try {
    const response = await request(target, 28000);
    const snippet = response.body.slice(0, 500);
    const links = [...response.body.matchAll(/(?:href|src)=["']([^"'\s]{1,350})["']/gi)]
      .map(match => match[1])
      .filter(link => /(?:export|timeslider|revision|readOnlyId|padId|titanpad)/i.test(link))
      .slice(0, 30);
    const sourceHints = {
      padIdValues: [...response.body.matchAll(/["']padId["']\s*:\s*["']([^"'\s]{1,100})["']/g)]
        .slice(0, 6).map(m => m[1]),
      revValues: [...response.body.matchAll(/["'](?:rev|head|headRev|revision)["']\s*:\s*(\d+)/g)]
        .slice(0, 10).map(m => Number(m[1])),
      has2014: response.body.includes('2014'),
      hasLP56Hash: response.body.includes('36367763ab73783c7af28444'),
      mentionsTimeslider: /timeslider/i.test(response.body),
      mentionsEtherpadExport: /export\/(?:etherpad|html|txt)/i.test(response.body)
    };
    const out = {
      stamp, original: url, http: response.status, finalUrl: response.finalUrl,
      bytes: Buffer.byteLength(response.body), sha256: sha(response.body),
      sourceHints, links, head: snippet.slice(0, 150)
    };
    console.log('REPLAY ' + JSON.stringify(out));
    if (response.status === 200 && (
      /(?:export\/etherpad|timeslider)/i.test(url) ||
      response.body.includes('clientVars.initialAttributedText'))) {
      hashes.push({ stamp, original: url, sha256: out.sha256 });
    }
  } catch (error) {
    console.log('REPLAY_ERROR ' + JSON.stringify({ stamp, original: url, error: String(error) }));
  }
}
async function main() {
  // Historical positive control, already demonstrated from archived actual pad.
  await replay('20160412033034', root);
  const prefixes = [
    ['historical-flat', 'titanpad.com/' + pad],
    ['historical-etherpad-p', 'titanpad.com/p/' + pad],
    ['historical-www-flat', 'www.titanpad.com/' + pad],
    ['historical-www-p', 'www.titanpad.com/p/' + pad]
  ];
  const all = [];
  for (const [label, target] of prefixes) {
    const hits = await cdx(label, target);
    for (const hit of hits) all.push(hit);
  }
  const historical = [...new Map(all.map(x =>
    [String(x.timestamp) + '|' + String(x.original), x])).values()];
  const likely = historical.filter(x =>
    /(?:timeslider|export|history|revs|revision|\?revs)/i.test(String(x.original)));
  console.log('INDEX_SUMMARY ' + JSON.stringify({
    pad, uniqueRecords: historical.length,
    revisionOrExportRecords: likely.length,
    historicalStatus: likely.length ? 'INDEXED_CANDIDATES' : 'NO_REVISION_ARCHIVE_URL_INDEXED',
    candidateUrls: likely.slice(0, 20).map(x => ({ timestamp: x.timestamp, url: x.original }))
  }));
  for (const hit of likely.slice(0, 8)) {
    await replay(String(hit.timestamp), String(hit.original));
  }
  console.log('END ' + JSON.stringify({
    pad, sourceLocator: 'https://forums.unfiction.com/forums/viewtopic.php%40p%3D1038407.html',
    revisionRouteSource: 'https://docs.etherpad.org/faq.html',
    bodyWitnesses: hashes,
    disclaimer: 'No archived revision is authenticated as a May 2014 author instruction by URL or archive date alone.'
  }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

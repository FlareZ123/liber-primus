'use strict';
// Exact-byte hash test of the complete 75-image Liber Primus archive.
// The Stage11 release's 58 LP2 pages are complete-set images 17.jpg–74.jpg;
// images 00.jpg–16.jpg are the earlier LP1 section. No decoding/canonicalization.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash, getHashes } = require('node:crypto');

const TARGET = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const ROOT = path.join(__dirname, '..', 'resources', 'liber-primus');
const ALGORITHMS = ['sha512', 'sha3-512', 'blake2b512'];
const available = new Set(getHashes());
for (const algorithm of ALGORITHMS) {
  assert(available.has(algorithm), 'Node crypto provider lacks ' + algorithm);
}
const files = Array.from({ length: 75 }, (_, i) => ({
  number: i,
  name: String(i).padStart(2, '0') + '.jpg',
  path: path.join(ROOT, String(i).padStart(2, '0') + '.jpg')
}));
const rows = [];
let totalBytes = 0;
for (const file of files) {
  const bytes = fs.readFileSync(file.path);
  assert(bytes.length > 4, file.name + ' unexpectedly short');
  assert.deepEqual([...bytes.subarray(0, 3)], [0xff, 0xd8, 0xff], file.name + ' is not a JPEG');
  totalBytes += bytes.length;
  const row = { number: file.number, name: file.name, bytes: bytes.length, digests: {} };
  for (const algorithm of ALGORITHMS) {
    const digest = createHash(algorithm).update(bytes).digest('hex');
    row.digests[algorithm] = digest;
    if (digest === TARGET) row.match = algorithm;
  }
  rows.push(row);
}
const matches = rows.filter(row => row.match);
const lp1 = rows.filter(row => row.number < 17);
const lp2 = rows.filter(row => row.number >= 17);
assert.equal(rows.length, 75);
assert.equal(lp1.length, 17);
assert.equal(lp2.length, 58);
assert.equal(matches.length, 0);
const imageComparisons = rows.length * ALGORITHMS.length;
const lp2Comparisons = lp2.length * ALGORITHMS.length;
const lp2NewNonSha512Comparisons = lp2.length * 2;
const p56 = rows.find(row => row.number === 73);
const p57 = rows.find(row => row.number === 74);
console.log(JSON.stringify({
  target: TARGET,
  scope: 'raw JPEG bytes only; no trimming, decoding, pixel serialization, concatenation or other canonicalization',
  algorithms: ALGORITHMS,
  totalImages: rows.length,
  totalBytes,
  lp1Images: lp1.length,
  lp2Images: lp2.length,
  lp2CompleteSetRange: '17.jpg–74.jpg (LP2 logical pages 0–57)',
  priorLp2Sha512WhirlpoolGate: 'SHA-512 and Whirlpool on the 58 LP2 images were already tested in lp2-p56-stage11-release-digest-candidate-gate.md',
  newLp2ComparisonsBeyondPriorSha512: lp2NewNonSha512Comparisons,
  lp2ComparisonsThisRun: lp2Comparisons,
  allImageComparisonsThisRun: imageComparisons,
  matches,
  p56CompleteSetImage73: { bytes: p56.bytes, sha512: p56.digests.sha512 },
  p57CompleteSetImage74: { bytes: p57.bytes, sha512: p57.digests.sha512 },
  lp2PerAlgorithmMatches: Object.fromEntries(ALGORITHMS.map(a => [a, lp2.filter(r => r.digests[a] === TARGET).length])),
  lp1PerAlgorithmMatches: Object.fromEntries(ALGORITHMS.map(a => [a, lp1.filter(r => r.digests[a] === TARGET).length]))
}, null, 2));

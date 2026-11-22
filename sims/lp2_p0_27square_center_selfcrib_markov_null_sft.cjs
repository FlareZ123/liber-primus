'use strict';
/**
 * Original 27x27 center-selfcrib source-node calibration.
 * Prior result: only p0..p2 has one source-matched node across 12,228
 * overlapping 729-rune windows. A within-source uniqueness rank cannot
 * establish that an author deliberately encoded the equality.
 * Node.js 22 CommonJS, repository source-only, deterministic null.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @returns {number} */
function phi(n) {
  let k = 0;
  for (let d = 1; d <= n; d++) {
    let a = d, b = n;
    while (b) [a, b] = [b, a % b];
    if (a === 1) k++;
  }
  return k;
}
/** @param {number} n @returns {number} */
function mu(n) {
  let factors = 0;
  for (let d = 2; d * d <= n; d++) {
    if (n % d) continue;
    factors++;
    n /= d;
    if (n % d === 0) return 0;
  }
  if (n > 1) factors++;
  return factors % 2 ? -1 : 1;
}
const tot = Array.from({length: 29}, (_, i) => i ? phi(i) : 0);
const mob = tot.map((n, i) => i ? mu(n) : 0);
const key = new Int32Array(29 ** 3).fill(-1);
for (let a = 1; a < 29; a++) for (let middle = 1; middle < 29; middle++) {
  for (let c = 1; c < 29; c++) {
    const raw = [a, tot[middle], c];
    const phase = ((raw.map(v => mob[v]).reduce((s, v) => s + v, 0) % 3) + 3) % 3;
    const rotated = raw.slice(phase).concat(raw.slice(0, phase));
    key[841 * a + 29 * middle + c] =
      rotated[0] + 29 * rotated[1] + 841 * rotated[2];
  }
}
assert.equal(key[841 * 14 + 29 * 22 + 14], 14 + 29 * 14 + 841 * 10);

/** @param {number[]} tape @param {number} start @returns {number[][]} */
function sourceHits(tape, start) {
  const diff = [];
  for (let i = 0; i < 3; i++) {
    diff.push((tape[start + 364 + i] - tape[start + 337 + i] + 29) % 29);
  }
  const code = diff[0] + 29 * diff[1] + 841 * diff[2];
  const hits = [];
  for (let left = 1; left <= 13; left++) {
    const a = tape[start + 350 + left];
    const middle = tape[start + 351 + left];
    const c = tape[start + 352 + left];
    if (tot[middle] === 14 - left && key[841 * a + 29 * middle + c] === code) {
      hits.push([left, a === c ? 1 : 0]);
    }
  }
  return hits;
}

// Original 729-cell check, including source palindrome at row14 c4..6.
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
const origHits = [];
for (let offset = 0; offset + 729 <= original.length; offset++) {
  for (const [left, mirror] of sourceHits(original, offset)) {
    origHits.push([offset, left, mirror]);
  }
}
assert.deepEqual(origHits, [[0, 4, 1]]);

/** Reproducible uniform uint32 PRNG; no external dependencies. */
let state = 0x33012014;
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const models = 1000;
const n = original.length;
const windows = n - 729 + 1;
const simulations = {oneOrMore: 0, oneOrMoreMirror: 0,
  totalHits: 0, totalMirrorHits: 0, byHitCount: {}};
for (let book = 0; book < models; book++) {
  const source = new Uint8Array(n);
  source[0] = random32() % 29;
  for (let i = 1; i < n; i++) {
    const shift = (random32() % 12901) < 86 ? 0 : (1 + random32() % 28);
    source[i] = (source[i - 1] + shift) % 29;
  }
  let hits = 0, mirrors = 0;
  for (let start = 0; start < windows; start++) {
    const d0 = (source[start + 364] - source[start + 337] + 29) % 29;
    const d1 = (source[start + 365] - source[start + 338] + 29) % 29;
    const d2 = (source[start + 366] - source[start + 339] + 29) % 29;
    const code = d0 + 29 * d1 + 841 * d2;
    for (let left = 1; left <= 13; left++) {
      const mid = source[start + 351 + left];
      if (tot[mid] !== 14 - left) continue;
      const a = source[start + 350 + left];
      const c = source[start + 352 + left];
      if (key[841 * a + 29 * mid + c] !== code) continue;
      hits++;
      if (a === c) mirrors++;
    }
  }
  simulations.oneOrMore += Number(hits > 0);
  simulations.oneOrMoreMirror += Number(mirrors > 0);
  simulations.totalHits += hits;
  simulations.totalMirrorHits += mirrors;
  simulations.byHitCount[hits] = (simulations.byHitCount[hits] ?? 0) + 1;
}
// iid GP29: 23 center symbols having phi 1..13, 28^2 nonzero
// outer choices, three exact mod29 difference equations.
const expectedHitsPerWindow = 23 * 28 ** 2 / (29 ** 6);
const expectedMirrorPerWindow = 23 * 28 / (29 ** 6);
assert.ok(simulations.oneOrMore > 100 && simulations.oneOrMore < 550);
assert.ok(simulations.oneOrMoreMirror > 0 && simulations.oneOrMoreMirror < 70);
console.log(JSON.stringify({
  originalHits: origHits,
  randomModel: 'GP29 stationary predecessor-chain with P(step=0)=86/12901; nonzero steps uniform1..28',
  seed: '0x33012014', nullBooks: models, slidingWindowsPerBook: windows,
  iidExpectedHitsPerBook: windows * expectedHitsPerWindow,
  iidExpectedMirrorHitsPerBook: windows * expectedMirrorPerWindow,
  simulation: simulations,
  conclusion: '1/12228 within-book rarity alone does not establish authorship; the mirror-constrained event is rarer but was recognized after candidate English.'
}, null, 2));

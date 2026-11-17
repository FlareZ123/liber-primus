'use strict';

/**
 * Key-independent all-29 fixed GP29 plaintext-difference marker gate.
 *
 * If a same-length reversible cipher makes ciphertext equality exactly when
 * (P_i - P_{i-1}) mod 29 == k for one constant k, the 86 observed same-page
 * ciphertext equalities force EXACTLY 86 such plaintext transitions. This
 * invariant holds despite arbitrary keyed permutations of the 28 remaining
 * nonzero ciphertext differences, unknown IVs and pagewise key resets.
 *
 * Enumerate every possible full 12,956-rune contiguous window in three
 * independent pre-existing native-English sources, for each of all 29 k,
 * using the EXACT original 55 rune-bearing physical page lengths. The 54
 * physical page boundary transitions are excluded as in the observed 86.
 *
 * Node22 CommonJS read-only SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const Q = 29;
const expected = [140, 166, 152];
const controls = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
];
const gpTokens = source.translit.map((t, i) => ({t, i}))
  .sort((a, b) => b.t.length - a.t.length);

/**
 * Canonical native-orthography control conversion, corresponding to
 * pre-existing lp2_grid256_allsecret_keyclock_sft.cjs source normalization.
 * @param {string} text
 * @returns {number[]}
 */
function gpNative(text) {
  const words = text.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
  /** @type {number[]} */
  const result = [];
  for (const word of words) {
    for (let p = 0; p < word.length;) {
      if (word.startsWith('ING', p)) { result.push(21); p += 3; continue; }
      if (word.startsWith('IO', p)) { result.push(27); p += 2; continue; }
      const found = gpTokens.find(({t}) => word.startsWith(t, p));
      assert.ok(found, 'Unknown source native GP syllable');
      result.push(found.i);
      p += found.t.length;
    }
  }
  return result;
}

/** @param {number[]} a @param {number} k @returns {number} */
function countMarker(a, k) {
  let count = 0;
  for (let i = 1; i < a.length; i++)
    count += Number((a[i] - a[i - 1] + Q) % Q === k);
  return count;
}

const originals = source.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(originals.length, 55);
const pageLengths = originals.map(p => p.indices.length);
assert.equal(pageLengths.reduce((s, n) => s + n, 0), 12956);
const breaks = [];
let running = 0;
for (const length of pageLengths.slice(0, -1)) {
  running += length;
  breaks.push(running);
}
assert.equal(breaks.length, 54);

const originalEqual = originals.reduce((s, p) => s + countMarker(p.indices, 0), 0);
assert.equal(originalEqual, 86);

const p27 = source.pages.find(p => p.page === 27).indices.slice(79, 91);
assert.deepEqual(p27, [12,4,9,15,3,3,5,24,18,26,18,18]);
assert.deepEqual(p27.flatMap((a, i) =>
  i > 0 && p27[i-1] === a ? [i] : []), [5,11]);

/**
 * Exhaust all original-length starts and all 29 possible fixed plaintext
 * delta markers. Page boundary exclusions are source-fixed and applied to
 * each control window after its beginning is chosen. Every k gets its own
 * exact prefixed difference vector, and no original data tunes a key.
 * @param {number[]} native
 * @returns {{runicLength:number,windows:number,minimums:number[],mean:number[],minAny:number}}
 */
function exhaustive(native) {
  const n = native.length;
  const windows = n - 12956 + 1;
  assert.ok(windows > 0);
  const marker = new Uint8Array(n);
  for (let i = 1; i < n; i++)
    marker[i] = (native[i] - native[i-1] + Q) % Q;
  const minimums = Array(Q).fill(Infinity);
  const means = Array(Q).fill(0);
  for (let k = 0; k < Q; k++) {
    const pref = new Uint32Array(n+1);
    for (let i = 1; i < n; i++)
      pref[i+1] = pref[i] + Number(marker[i] === k);
    for (let start = 0; start < windows; start++) {
      let matched = pref[start+12956] - pref[start+1];
      for (const b of breaks)
        matched -= Number(marker[start+b] === k);
      if (matched < minimums[k]) minimums[k] = matched;
      means[k] += matched;
    }
    means[k] /= windows;
  }
  return {
    runicLength: n, windows, minimums, mean: means,
    minAny: Math.min(...minimums)
  };
}

const reports = controls.map((file, i) => {
  const result = exhaustive(gpNative(read(file)));
  assert.equal(result.minAny, expected[i], 'Native reference result changed');
  assert.ok(result.minimums.every(min => min > originalEqual),
    'A full-length original-shaped native-English window survived');
  return {file, ...result};
});
assert.deepEqual(reports.map(r => r.runicLength), [62492, 217106, 321327]);
assert.deepEqual(reports.map(r => r.windows), [49537, 204151, 308372]);
assert.equal(reports.reduce((s, r) => s + r.windows, 0), 562060);
assert.ok(reports.every(r => r.minimums[13] > originalEqual));

// A 29-to-29 reversible feedback rotor can encode all GP values with no
// information side channel, but it is restricted by this equality invariant.
// For any predecessor plaintext letter, the zero marker is the one with
// fixed GP ordinal difference=13. A source byte can rotate 28 nonzero steps.
/** @param {number} x @param {number} ring @returns {number} */
const mod = (x, ring) => (x % ring + ring) % ring;
/**
 * @param {number[]} plain
 * @param {number} k
 * @returns {number[]}
 */
function encrypt(plain, k) {
  const out = [];
  for (let i = 0; i < plain.length; i++) {
    if (i === 0) {out.push(mod(plain[i] + 1033, Q)); continue;}
    const z = mod(plain[i] - plain[i-1] - k, Q);
    const delta = z === 0 ? 0 : 1+mod(z-1+i*7, Q-1);
    out.push(mod(out[i-1]+delta, Q));
  }
  return out;
}
/**
 * @param {number[]} cipher
 * @param {number} k
 * @returns {number[]}
 */
function decrypt(cipher, k) {
  const out = [];
  for (let i = 0; i < cipher.length; i++) {
    if (i === 0) {out.push(mod(cipher[i]-1033, Q)); continue;}
    const delta = mod(cipher[i]-cipher[i-1], Q);
    const z = delta === 0 ? 0 : 1+mod(delta-1-i*7, Q-1);
    out.push(mod(out[i-1]+k+z, Q));
  }
  return out;
}
const p57 = source.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
for (let k = 0; k < Q; k++) {
  const planted = encrypt(p57, k);
  assert.deepEqual(decrypt(planted, k), p57);
  assert.equal(countMarker(planted, 0), countMarker(p57, k));
}
const output = {
  original: {runes:12956, pages:55, pageBoundariesIgnored:54, samePageEqual:86,
    originalP27DisjointSecondIndices:[5,11]},
  hypothesis:'C[i] == C[i-1] iff (P[i]-P[i-1]) mod 29 == one global k',
  keyIndependence:'All 28 remaining successor symbols may use arbitrary secret per-position permutations',
  controls:reports,
  totalOriginalLengthWindows:562060,
  exactNativeWindowSurvivors:0,
  positiveNativeP57RoundtripTestedMarkers:29,
  scope:'Conditional exclusion for contiguous ordinary GP-English from three pre-existing control texts, intact 55-page original cut schedule; not a universal language impossibility.'
};
if (require.main === module) console.log(JSON.stringify(output, null, 2));
module.exports = {exhaustive, gpNative, encrypt, decrypt};

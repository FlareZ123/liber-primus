'use strict';
/**
 * Exact all-secret physical-page differential alphabet capacity gate.
 * Each of 55 original rune-bearing LP2 pages may use its own unknown
 * 29-symbol bijection of ciphertext differences into GP29 plaintext runes.
 * Node.js 22: node sims/lp2_delta_pagekey_allsecret_capacity_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) { return fs.readFileSync(path.join(root, name), 'utf8'); }
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = db.pages.filter(p => p.page <= 55 && p.indices.length > 0);
assert.equal(pages.length, 55);
const lengths = pages.map(p => p.indices.length);
const total = lengths.reduce((a, b) => a + b, 0);
assert.equal(total, 12956);
const gp = db.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} source @returns {number[]} */
function encodeGP(source) {
  const out = [];
  for (const original of source.match(/[A-Za-z]+/g) || []) {
    const word = original.toUpperCase().replace(/[KVZQ]/g,
      c => ({K:'C', V:'U', Z:'S', Q:'C'})[c]);
    for (let i = 0; i < word.length;) {
      const token = gp.find(x => word.startsWith(x.token, i));
      assert(token, 'Unencodable GP word ' + word);
      out.push(token.index);
      i += token.token.length;
    }
  }
  return out;
}
/** @param {number} n @returns {number} */
function mod(n) { return (n % 29 + 29) % 29; }
/** @param {number[]} data @returns {number[]} */
function histogram(data) {
  const h = Array(29).fill(0);
  for (const v of data) { assert(v >= 0 && v < 29); h[v]++; }
  return h;
}
/** @param {number[]} h @param {number} k @returns {number} */
function top(h, k) { return h.slice().sort((a, b) => b - a).slice(0, k).reduce((a, b) => a + b, 0); }
/** @param {number[]} x @param {number[]} y @returns {number} */
function minEdits(x, y) {
  assert.equal(top(x, 29), top(y, 29));
  const a = x.slice().sort((i, j) => i - j);
  const b = y.slice().sort((i, j) => i - j);
  return a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / 2;
}
const original = pages.map(p =>
  histogram(p.indices.slice(1).map((v, i) => mod(v - p.indices[i]))));
const steps = original.reduce((s, h) => s + top(h, 29), 0);
assert.equal(steps, 12901);
assert.equal(original.reduce((s, h) => s + h[0], 0), 86);
const max1 = original.reduce((s, h) => s + top(h, 1), 0);
const max5 = original.reduce((s, h) => s + top(h, 5), 0);
assert.equal(max1, 801);
assert.equal(max5, 3455);
const sources = [
  {name:'Gibran', data:encodeGP(read('resources/control/gibran_prophet_58585.txt')),
    starts:[1000, 11000, 21000, 31000, 41000]},
  {name:'Shakespeare', data:encodeGP(read('resources/control/shakespeare_first300k.txt')),
    starts:[20000, 56000, 92000, 128000, 164000]}
];
const comparisons = [];
for (const src of sources) {
  for (const start of src.starts) {
    const sample = src.data.slice(start, start + total);
    assert.equal(sample.length, total);
    let offset = 0, edits = 0;
    const destinations = [];
    pages.forEach((page, index) => {
      const rest = sample.slice(offset + 1, offset + page.indices.length);
      const h = histogram(rest);
      edits += minEdits(original[index], h);
      destinations.push(...rest);
      offset += page.indices.length;
    });
    assert.equal(offset, total);
    const h = histogram(destinations);
    const most = top(h, 1), first5 = top(h, 5);
    assert(most > max1 && first5 > max5, 'Native control incompatible with original capacity');
    comparisons.push({source:src.name, start, top1:most, top5:first5,
      minimumPerPageRuneIdentityChanges:edits});
  }
}
assert.equal(comparisons.length, 10);
assert.equal(Math.min(...comparisons.map(x => x.top1)), 1410);
assert.equal(Math.min(...comparisons.map(x => x.top5)), 5235);
// Positive original-layout plant with an independent secret permutation
// on every page. First rune per page is passed through as a free IV.
const plaintext = sources[0].data.slice(1000, 1000 + total);
let seed = 0x17F43C29;
/** @returns {number} */
function rng() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed >>> 0; }
const keys = pages.map(() => {
  const key = Array.from({length:29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = rng() % (i + 1);
    [key[i], key[j]] = [key[j], key[i]];
  }
  return key;
});
const inverse = keys.map(key => key.map((_, i) => key.indexOf(i)));
let offset = 0, recovered = 0, reencryption = 0, wrongKeyMatches = 0;
const planted = [];
for (let p = 0; p < pages.length; p++) {
  const encoded = [plaintext[offset]];
  for (let i = 1; i < lengths[p]; i++) {
    const clear = plaintext[offset + i];
    encoded.push(mod(encoded[i - 1] + keys[p][clear]));
    const step = mod(encoded[i] - encoded[i - 1]);
    const decoded = inverse[p][step];
    assert.equal(decoded, clear);
    assert.equal(mod(encoded[i - 1] + keys[p][decoded]), encoded[i]);
    if (inverse[(p + 1) % pages.length][step] === clear) wrongKeyMatches++;
    recovered++; reencryption++;
  }
  planted.push(encoded);
  recovered++;
  offset += lengths[p];
}
assert.equal(recovered, total);
assert.equal(reencryption, steps);
assert(wrongKeyMatches < 1000);
const plantedCap = planted.map(p =>
  histogram(p.slice(1).map((c, i) => mod(c - p[i]))));
const plantedTrue = plaintext.filter((_, i) => {
  let cursor = 0;
  for (const len of lengths) {
    if (i === cursor) return false;
    cursor += len;
  }
  return true;
});
assert(plantedTrue.length === steps);
assert(top(histogram(plantedTrue), 1) <= plantedCap.reduce((s, h) => s + top(h, 1), 0));
console.log(JSON.stringify({
  model:'55 independent GP29 difference-to-plaintext permutations, one per original physical page',
  original:{pages:pages.length, runes:total, steps, identicalCipherAdjacent:86,
    maximumOnePlaintextRune:max1, maximumFivePlaintextRunes:max5},
  nativeComparisons:comparisons,
  controls:{fullNativePlainRecovered:recovered, exactStepReencryptions:reencryption,
    wrongNextPageKeyMatches:wrongKeyMatches},
  result:'Ten source-calibrated original-length native GP29 controls violate both exact all-secret capacities. No LP2 plaintext or key recovered.'
}, null, 2));
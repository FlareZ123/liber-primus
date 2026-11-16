'use strict';
/**
 * Original LP2 hybrid ciphertext/plaintext feedback, with fixed H/G source
 * coefficient triples and an exhaustive source-native digram-spectrum gate.
 *
 * Windows Node.js 22: node sims/lp2_hg_mixed_cipher_plain_feedback_sft.cjs
 * All files are read-only. Original GP rune order, 2013/2014 coefficients and
 * the three independent historical-orthography controls are pinned in-source.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = source.pages.filter(p => p.page <= 55);
const cipher = pages.flatMap(p => p.indices);
assert.equal(cipher.length, 12956);
assert.equal(pages.length, 56); // includes the empty numeric-table page50
assert.equal(pages.filter(p => p.indices.length > 0).length, 55);
const mod = n => (n % 29 + 29) % 29;
const inverse = n => {
  for (let k = 1; k < 29; k++) if (mod(k * n) === 1) return k;
  throw Error('Nonunit GP coefficient');
};
const tokens = source.translit.map((s, i) => ({ s, i }))
  .concat([{ s: 'ING', i: 21 }, { s: 'IO', i: 27 }])
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} value @returns {number[]} */
function gp(value) {
  const clean = value.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t.s, i));
      assert(token, 'Missing GP token in ' + word);
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
assert.deepEqual(gp('THINGS'), [2, 21, 15]);
assert.deepEqual(gp('FUNCTION'), [0, 1, 9, 5, 16, 27, 9]);

const references = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 62492],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 321327],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 217106]
].map(([name, file, length]) => {
  const sequence = gp(read(file));
  assert.equal(sequence.length, length);
  return { name, sequence };
});

/** @param {number[]} s @returns {number[][]} */
function digrams(s) {
  const matrix = Array.from({ length: 29 }, () => new Float64Array(29));
  for (let i = 1; i < s.length; i++) matrix[s[i-1]][s[i]]++;
  return matrix;
}
/** @param {ArrayLike<number>} s @returns {number[]} */
function differences(s) {
  const h = Array(29).fill(0);
  for (let i = 1; i < s.length; i++) h[mod(s[i] - s[i-1])]++;
  return h;
}
/**
 * Exhaust every reversible a in [1,28], b,c in [0,28].
 * This is an original-output NECESSARY condition for the hypothesis
 * C[i]=C[i-1]+a*P[i]+b*P[i-1]+c (mod29).
 * @param {number[]} observedDelta
 * @param {number[][]} plainPairs
 * @param {number} referenceRunes
 * @returns {{best:object, fixed:object[]}}
 */
function fit(observedDelta, plainPairs, referenceRunes) {
  const n = cipher.length - 1;
  let best = { chi: Infinity };
  const fixed = [];
  for (let a = 1; a < 29; a++) for (let b = 0; b < 29; b++) {
    const histogram = new Float64Array(29);
    for (let x = 0; x < 29; x++) for (let y = 0; y < 29; y++)
      histogram[(a * y + b * x) % 29] += plainPairs[x][y];
    for (let c = 0; c < 29; c++) {
      let chi = 0, zero = 0;
      for (let delta = 0; delta < 29; delta++) {
        const expected = histogram[mod(delta - c)] * n/(referenceRunes - 1);
        chi += (observedDelta[delta] - expected) ** 2 / Math.max(1e-10, expected);
        if (delta === 0) zero = expected;
      }
      const result = { a, b, c, chi, predictedZero: zero };
      if (chi < best.chi) best = result;
      if ((a === 3 && b === 26 && c === 24) ||
          (a === 27 && b === 5 && c === 15)) fixed.push(result);
    }
  }
  return { best, fixed };
}
const observed = differences(cipher);
assert.equal(observed[0], 86);
assert.equal(observed.reduce((x, y) => x + y, 0), 12955);
const spectra = references.map(r => ({
  name: r.name, runes: r.sequence.length,
  ...fit(observed, digrams(r.sequence), r.sequence.length)
}));
assert.deepEqual(spectra.map(r => [r.best.a, r.best.b, r.best.c]),
  [[14, 12, 28], [14, 12, 28], [14, 12, 28]]);
const expectedChi = [501.1764170561152, 497.3158252058383, 482.1364982896717];
for (let i = 0; i < spectra.length; i++)
  assert(Math.abs(spectra[i].best.chi - expectedChi[i]) < 1e-8);

/** @param {ArrayLike<number>} P @returns {number} */
function ioc(P) {
  const h = new Uint32Array(29);
  for (const n of P) h[n]++;
  return h.reduce((a, n) => a + n * (n - 1), 0) /
    (P.length * (P.length - 1));
}
let offset = 0;
const pageStart = new Set();
for (const p of pages) { pageStart.add(offset); offset += p.indices.length; }
assert.equal(offset, cipher.length);
const clocks = [
  ['continuous', new Set([0])],
  ['physicalPage', pageStart],
  ['nineChapter', new Set([0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648])]
];
const sourceTriples = [
  ['H2013', [3, 26, 24]],
  ['G2014', [27, 5, 15]],
  ['H2013-reversed', [24, 26, 3]],
  ['G2014-reversed', [15, 5, 27]]
];
/** Initial GP rune for each reset is an arbitrary explicit seed. */
function decode(input, triple, resets, seed) {
  const [a, b, c] = triple, unit = inverse(a);
  const out = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++)
    out[i] = resets.has(i) ? mod(input[i] + seed) :
      mod(unit * (input[i] - input[i-1] - b * out[i-1] - c));
  return out;
}
function encode(input, triple, resets, seed) {
  const [a, b, c] = triple, out = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++)
    out[i] = resets.has(i) ? mod(input[i] - seed) :
      mod(out[i-1] + a * input[i] + b * input[i-1] + c);
  return out;
}
const native = references[0].sequence.slice(0, cipher.length);
const cases = [];
for (const [clock, resets] of clocks) for (const [name, triple] of sourceTriples) {
  let best = { ioc: -1 }, seed24;
  for (let seed = 0; seed < 29; seed++) {
    const plaintext = decode(cipher, triple, resets, seed);
    const score = ioc(plaintext);
    if (score > best.ioc) best = { seed, ioc: score };
    if (seed === 24) seed24 = score;
    if (seed === 0) assert.deepEqual(
      [...encode(plaintext, triple, resets, seed)], cipher);
  }
  const planted = encode(native, triple, resets, 0);
  assert.deepEqual([...decode(planted, triple, resets, 0)], native);
  cases.push({ clock, name, best, seed24, positiveIoC: ioc(native) });
}
const maxOriginal = Math.max(...cases.map(x => x.best.ioc));
assert(Math.abs(maxOriginal - 0.03454227823793121) < 1e-12);
assert(Math.abs(ioc(native) - 0.060394037402846365) < 1e-12);

/* A complete independent English positive must recover its planted
 * source-selected key from the same full 812*29 hypothesis scan. */
const nativeCipher = encode(native, [3, 26, 24], clocks[0][1], 0);
const positive = fit(differences(nativeCipher),
  digrams(references[0].sequence), references[0].sequence.length).best;
assert.deepEqual([positive.a, positive.b, positive.c], [3, 26, 24]);
assert(Math.abs(positive.chi - 66.60573141008082) < 1e-8);
assert(maxOriginal < 0.035);

console.log(JSON.stringify({
  family: 'C[i]=C[i-1]+a*P[i]+b*P[i-1]+c (mod29), a!=0',
  original: { runes: cipher.length, adjacentRepeats: observed[0],
    bestSourceDerivedInverseIoC: maxOriginal, cases },
  sourceNative: spectra, positive
}, null, 2));

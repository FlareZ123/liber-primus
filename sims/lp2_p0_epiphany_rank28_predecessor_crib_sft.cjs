/**
 * SFT: source-conditional p0 EPIPHANY SEEKS 13-rune crib,
 * predecessor-exclusion GP28 rank-transport, p0–p2 original test.
 * Run: node sims/lp2_p0_epiphany_rank28_predecessor_crib_sft.cjs
 *
 * Read-only: original numeric corpus plus native literary donors, no mocks.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const p = source.pages.slice(0, 3);
assert.deepEqual(p.map((x) => x.indices.length), [262, 266, 201]);
const ciphertext = p.flatMap((x) => x.indices);
assert.equal(ciphertext.length, 729);
const cribWords = ['EPIPHANY', 'SEEKS'];
const index = new Map(source.translit.map((x, i) => [x, i]));
const pairs = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA'];
const mod = (v, m) => (v % m + m) % m;
/** @param {string} text @returns {number[]} */
function gp(text) {
  const s = text.toUpperCase().replaceAll('K', 'C').replaceAll('V', 'U')
    .replaceAll('Z', 'S').replaceAll('Q', 'C').replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < s.length;) {
    const digraph = pairs.find((d) => s.startsWith(d, i));
    const token = digraph || s[i];
    const rune = index.get(token);
    assert.notEqual(rune, undefined);
    out.push(rune);
    i += token.length;
  }
  return out;
}
const crib = gp(cribWords.join(''));
assert.deepEqual(crib, [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15]);
assert.deepEqual(ciphertext.slice(0, 13), [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
/**
 * Candidate frozen from a 13-rune conditional crib.
 * Mode12 treats cipher[0] as a free public IV; initial title rune is
 * supplied as known plaintext. The 12 transitions set a 12-symbol key.
 * Mode13 uses the GP F=0 virtual predecessor and obtains 13 key symbols.
 * In both modes, every equal adjacent ciphertext value is reserved P=EA.
 * @param {number[]} C @param {number[]} K @param {number} period
 * @returns {number[]}
 */
function decrypt(C, K, period) {
  const out = [];
  for (let i = 0; i < C.length; i++) {
    if (period === 12 && i === 0) {
      out.push(crib[0]);
      continue;
    }
    const d = mod(C[i] - (i ? C[i - 1] : 0), 29);
    out.push(d === 0 ? 28 : mod(d - 1 - K[period === 12 ? (i - 1) % 12 : i % 13], 28));
  }
  return out;
}
/** @param {number[]} P @param {number[]} K @param {number} period @returns {number[]} */
function encrypt(P, K, period) {
  const out = [];
  for (let i = 0; i < P.length; i++) {
    if (period === 12 && i === 0) {
      out.push(ciphertext[0]);
      continue;
    }
    const d = P[i] === 28 ? 0 :
      1 + mod(P[i] + K[period === 12 ? (i - 1) % 12 : i % 13], 28);
    out.push(mod((i ? out[i - 1] : 0) + d, 29));
  }
  return out;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const f = Array(29).fill(0);
  for (const n of a) f[n]++;
  return f.reduce((s, x) => s + x * (x - 1), 0) / (a.length * (a.length - 1));
}
const keys = new Map();
for (const mode of [12, 13]) {
  const K = [];
  for (let j = mode === 12 ? 1 : 0; j < 13; j++) {
    const d = mod(ciphertext[j] - (j ? ciphertext[j - 1] : 0), 29);
    assert.notEqual(d, 0, 'an encoded repeat requires the literal escape EA, excluded by crib');
    K.push(mod(d - 1 - crib[j], 28));
  }
  keys.set(mode, K);
}
assert.deepEqual(keys.get(12), [8, 27, 0, 22, 16, 26, 3, 27, 20, 2, 25, 25]);
assert.deepEqual(keys.get(13), [24, 8, 27, 0, 22, 16, 26, 3, 27, 20, 2, 25, 25]);

const view = {
  body0: [13, 262],
  p1: [262, 528],
  p2: [528, 729],
  p1p2: [262, 729]
};
for (const mode of [12, 13]) {
  const K = keys.get(mode);
  const P = decrypt(ciphertext, K, mode);
  assert.deepEqual(P.slice(0, 13), crib);
  assert.deepEqual(encrypt(P, K, mode), ciphertext);
  console.log('MODE', mode, 'SOURCE_SELECTED_CONDITIONAL_K', K.join(','));
  for (const [name, [lo, hi]] of Object.entries(view)) {
    console.log('ORIGINAL', mode, name, 'runes', hi - lo,
      'IOC', ioc(P.slice(lo, hi)).toFixed(10));
  }
  console.log('ORIGINAL P0 BODY 120', P.slice(13, 133).map((x) => source.translit[x]).join(' '));
  assert.ok(ioc(P.slice(13, 262)) < 0.046);
  assert.ok(ioc(P.slice(262, 729)) < 0.046);
  for (const [label, file] of [
    ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
    ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
    ['Emerson', 'resources/control/emerson_essays_2944.txt']
  ]) {
    const donor = gp(read(file)).slice(9000, 9000 + 716);
    assert.equal(donor.length, 716);
    const plain = [...crib, ...donor];
    const fake = encrypt(plain, K, mode);
    assert.deepEqual(decrypt(fake, K, mode), plain);
    assert.deepEqual(encrypt(decrypt(fake, K, mode), K, mode), fake);
    console.log('NATIVE_PLANT', mode, label, 'recovered=729/729',
      'p0 body IOC', ioc(plain.slice(13, 262)).toFixed(10),
      'p1p2 IOC', ioc(plain.slice(262, 729)).toFixed(10));
    assert.ok(ioc(plain.slice(13, 262)) > 0.05);
    assert.ok(ioc(plain.slice(262, 729)) > 0.05);
  }
}
console.log('PASS: original full 729-rune p0–p2 source, two exact crib-derived rank28 inverses, six native GP positive plants');

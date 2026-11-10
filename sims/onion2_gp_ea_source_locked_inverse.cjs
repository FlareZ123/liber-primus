'use strict';

/**
 * Narrow source-fixed original-LP2 inverse: 2014 onion-2 bytes used as
 * modulo-28 exponents in an F29 nonzero-step / transparent-GP-EA cipher.
 *
 * This is a proposed mechanism, not a claim about Cicada's actual cipher.
 * Source: resources/cicada2014-onion2-timing.json (2014 archived 256 bytes)
 * Operation: red-source primitive root 15, transparent GP symbol 28 at zero
 * ciphertext difference; other differences are powers of 15 in F29.
 *
 * Run: node sims/onion2_gp_ea_source_locked_inverse.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sources = JSON.parse(read('resources/cicada-hiddenservice-256-candidates.json'));
const timeSource = JSON.parse(read('resources/cicada2014-onion2-timing.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(pages.flat().length, 12956);
const keys = Object.fromEntries(sources.sourceServices.map(s =>
  [s.id, Array.from(s.hex.match(/../g), v => parseInt(v, 16))]));
keys.grid = grid.byte_rows.flat();
for (const arr of Object.values(keys)) {
  assert.equal(arr.length, 256);
  for (const n of arr) assert(Number.isInteger(n) && n >= 0 && n <= 255);
}
assert.equal(sources.sourceServices[0].hex, timeSource.final_hex);
const mod = (n, m) => ((n % m) + m) % m;
const pow = [];
let value = 1;
for (let i = 0; i < 28; i++) {
  pow.push(value);
  value = value * 15 % 29;
}
assert.equal(new Set(pow).size, 28);
const log15 = Array(29).fill(-1);
pow.forEach((v, i) => { log15[v] = i; });
const alphabet = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} raw @returns {number[]} */
function encodeEnglish(raw) {
  const s = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = alphabet.find(t => s.startsWith(t.s, i));
    assert(token, 'Unsupported GP letter ' + s[i]);
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}
const reference = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split(/\r?\n/)
  .filter(line => line.trim() && !line.startsWith('#') &&
    !line.startsWith('[') && !/^[\d\s]+$/.test(line)).join(' ');
const native = encodeEnglish(reference);
assert(native.length > 3000);
const train = native.slice(0, Math.floor(native.length * 0.8));
const holdout = native.slice(train.length);

/** GP29 trigram model with fixed add-0.3 smoothing. */
const triples = Array.from({length: 29},
  () => Array.from({length: 29}, () => new Uint32Array(29)));
const pairs = Array.from({length: 29}, () => new Uint32Array(29));
for (let i = 2; i < train.length; i++) {
  triples[train[i - 2]][train[i - 1]][train[i]]++;
  pairs[train[i - 2]][train[i - 1]]++;
}
/** @param {number[]} input */
function score(input) {
  let sum = 0;
  for (let i = 2; i < input.length; i++) {
    const a = input[i - 2], b = input[i - 1], c = input[i];
    sum += Math.log((triples[a][b][c] + 0.3) /
      (pairs[a][b] + 29 * 0.3));
  }
  return sum / (input.length - 2);
}
/** @param {number[]} input */
function ioc(input) {
  const freq = Array(29).fill(0);
  for (const n of input) freq[n]++;
  const numer = freq.reduce((s, x) => s + x * (x - 1), 0);
  return numer / (input.length * (input.length - 1));
}
/** @param {number} byte @param {'mod'|'scale'} rule */
function keyDigit(byte, rule) {
  return rule === 'mod' ? byte % 28 : Math.floor(byte * 28 / 256);
}
/**
 * @param {number[][]} input
 * @param {number[]} key 256 archived source bytes
 * @param {'mod'|'scale'} rule
 */
function decrypt(input, key, rule) {
  let global = 0;
  return input.map(page => {
    const out = [page[0]];
    global++;
    for (let i = 1; i < page.length; i++, global++) {
      const delta = mod(page[i] - page[i - 1], 29);
      const k = keyDigit(key[global % 256], rule);
      out.push(delta === 0 ? 28 : mod(log15[delta] - k, 28));
    }
    return out;
  });
}
/**
 * @param {number[][]} input
 * @param {number[]} key
 * @param {'mod'|'scale'} rule
 */
function encrypt(input, key, rule) {
  let global = 0;
  return input.map(page => {
    const out = [page[0]];
    global++;
    for (let i = 1; i < page.length; i++, global++) {
      const k = keyDigit(key[global % 256], rule);
      const p = page[i];
      out.push(p === 28 ? out[i - 1] :
        mod(out[i - 1] + pow[(p + k) % 28], 29));
    }
    return out;
  });
}
// Full original cipher round-trip, an implementation check for every key.
const original = pages.flat();
const candidates = [];
for (const [source, key] of Object.entries(keys)) {
  for (const rule of ['mod', 'scale']) {
    const decoded = decrypt(pages, key, rule);
    const replay = encrypt(decoded, key, rule);
    assert.deepEqual(replay, pages);
    const flat = decoded.flat();
    const markers = decoded.reduce((s, p) =>
      s + p.slice(1).filter(x => x === 28).length, 0);
    assert.equal(markers, 86);
    candidates.push({
      source, rule, originalTrigram: score(flat), originalIoC: ioc(flat),
      repeatedRuneEA: markers,
      first90: flat.slice(0, 90).map(i => corpus.translit[i]).join('')
    });
  }
}
// Blind native text plant with source-locked key and original page lengths.
const slices = [];
let cursor = 0;
for (const page of pages) {
  if (cursor >= native.length) break;
  slices.push(native.slice(cursor, cursor + page.length));
  cursor += page.length;
}
const plant = encrypt(slices, keys.onion2, 'mod');
const recovery = decrypt(plant, keys.onion2, 'mod');
assert.deepEqual(recovery, slices);
assert.deepEqual(encrypt(recovery, keys.onion2, 'mod'), plant);
console.log(JSON.stringify({
  source: '256-byte archived 2014 onion-2 vs three wrong sources',
  cipher: 'F29 primitive-root 15; zero step -> GP-EA; period256 byte%28',
  originalRunes: original.length,
  nativeReferenceRunes: native.length,
  nativeHoldoutLogTrigram: score(holdout),
  nativePlantRecoveredRunes: recovery.flat().length,
  nativePlantExact: true,
  candidates
}, null, 2));

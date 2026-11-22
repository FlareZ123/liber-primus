/**
 * Source-gated exploratory address: omitted Stage11 prime19 -> physical page19,
 * prime ordinal8 -> rune offset19*8=152, at the printed word RIFT.
 * This was noticed after looking at plaintext-like source words; not a decryption.
 * Run: node sims/lp2_stage11_p19_rift_split_sft.cjs
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const index = read('resources/historical/stage11-2014-index.html');
const release = read('resources/historical/cicada2014-stage11-message.asc');
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const runeToIndex = new Map(book.runes.map((r, i) => [r, i]));
const stagePageCount = Array.from(index.matchAll(/<img src="(\d+)\.jpg"/g));
assert.deepEqual(stagePageCount.map(m => Number(m[1])), Array.from({ length: 58 }, (_, i) => i));

/** @param {number} n */
function primes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    if (out.every(p => p * p > x || x % p !== 0)) out.push(x);
  }
  return out;
}
const primeList = primes(58);
assert.equal(primeList[57], 271);
assert.equal(primeList.indexOf(19), 7);

const signedStart = release.indexOf('Hash: SHA1');
const signedEnd = release.indexOf('-----BEGIN PGP SIGNATURE-----');
const source = release.slice(signedStart + 'Hash: SHA1'.length, signedEnd);
const margins = [];
for (const line of source.split(/\r?\n/)) {
  if (/^ +$/.test(line)) margins.push(line.length);
  else {
    const leading = /^ +/.exec(line)?.[0].length || 0;
    const trailing = / +$/.exec(line)?.[0].length || 0;
    if (leading) margins.push(leading);
    if (trailing) margins.push(trailing);
  }
}
assert.deepEqual(margins, [2,3,5,7,11,13,17,23,29,31,37]);
const missing = primeList.slice(0, 12).filter(p => !margins.includes(p));
assert.deepEqual(missing, [19]);
const pageNumber = missing[0];
const ordinal = primeList.indexOf(pageNumber) + 1;
const address = pageNumber * ordinal;
const page = book.pages.find(p => p.page === pageNumber);
assert.equal(page.indices.length, 271);
assert.equal(address, 152);
const marker = page.indices.slice(address, address + 4);
assert.deepEqual(marker.map(x => book.translit[x]), ['R', 'I', 'F', 'T']);
const originalPage = transcription.split('%')[pageNumber];
const runeText = Array.from(originalPage).filter(c => runeToIndex.has(c)).map(c => runeToIndex.get(c));
assert.deepEqual(runeText, page.indices);
const visible = Array.from(originalPage);
const runePositions = visible.flatMap((v, i) => runeToIndex.has(v) ? [i] : []);
assert.equal(visible[runePositions[address] - 1], '.');
assert.equal(visible[runePositions[address + 3] + 1], '-');

// Exactly the source-marked RIFT word bisects the page into unequal passages;
// their 37-rune difference is a deterministic consequence of 271, 152, 4.
const prefix = page.indices.slice(0, address);
const suffix = page.indices.slice(address + 4);
assert.equal(prefix.length, 152);
assert.equal(suffix.length, 115);
assert.equal(prefix.length - suffix.length, 37);
const surplus = prefix.slice(0, 37);
const tail = prefix.slice(37);
assert.equal(tail.length, suffix.length);

/** @param {number[]} xs */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((n, x) => n + x * (x-1), 0) / (xs.length * (xs.length - 1));
}
/** @param {number} n */
const mod = n => ((n % 29) + 29) % 29;

/** @param {number[]} xs @param {number} sign @param {boolean} transparentF */
function riftVigenere(xs, sign, transparentF) {
  let clock = 0;
  return xs.map(x => {
    if (transparentF && x === 0) return x;
    return mod(x + sign * marker[(clock++) % marker.length]);
  });
}
const keyResults = [];
for (const pn of [19, 20]) {
  const ct = book.pages.find(p => p.page === pn).indices;
  for (const sign of [-1, 1]) {
    for (const transparentF of [false, true]) {
      const result = riftVigenere(ct, sign, transparentF);
      keyResults.push({ page: pn, sign, transparentF, ioc: ioc(result) });
      assert.ok(ioc(result) < 0.04);
    }
  }
}

const foldResults = [];
for (const reverse of [false, true]) {
  const right = reverse ? suffix.slice().reverse() : suffix;
  for (const sign of [-1, 1]) {
    for (const surplusSign of [-1, 0, 1]) {
      const pt = tail.map((x, i) => mod(x + sign * right[i] + surplusSign * surplus[i % 37]));
      foldResults.push({
        reverse, sign, surplusSign, ioc: ioc(pt),
        first40: pt.slice(0, 40).map(x => book.translit[x]).join(' ')
      });
      assert.ok(ioc(pt) < 0.055);
    }
  }
}
assert.ok(Math.abs(Math.max(...foldResults.map(x => x.ioc)) - 0.040274599542334096) < 1e-10);

// Exact operation-positive plant, independent of the original unknown plaintext.
const planted = Array.from({ length: 115 }, (_, i) => (i * 7 + 3) % 29);
const encryptedTail = planted.map((x, i) => mod(x + suffix[114-i]));
const recovered = encryptedTail.map((x, i) => mod(x - suffix[114-i]));
assert.deepEqual(recovered, planted);

console.log(JSON.stringify({
  original2014Pages: stagePageCount.length, missingSourcePrime: pageNumber,
  missingPrimeOrdinal: ordinal, selectedOriginalPage: pageNumber,
  selectedOriginalRuneOffset: address, printedWord: 'RIFT',
  pageRuneCount: page.indices.length, countIs58thPrime: true,
  sameLengthPhysicalPages: book.pages.filter(p => p.page < 56 && p.indices.length === 271).map(p => p.page),
  left: prefix.length, marker: marker.length, right: suffix.length, unequalSurplus: 37,
  directRiftKeyResults: keyResults, splitResults: foldResults,
  caveat: 'Prime-space source is unsigned for trailing whitespace; address and operations selected retrospectively; no plaintext',
  recoveredUnknownPlaintext: false
}, null, 2));

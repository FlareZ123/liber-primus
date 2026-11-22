'use strict';

/**
 * SFT: exact F-transparent 13-rune p0 heading-key inverse.
 * node sims/lp2_p0_2016_epiphany_marker13_autokey_sft.cjs
 * Uses repository-local original LP2 rune indices and LP1 native-English text.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const reference = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8');
const translit = corpus.translit;
const seed = [...'EPIPHANYSEECS'].map((ch) => translit.indexOf(ch));
const body = corpus.pages[0].indices.slice(13);
const prime = corpus.prime;
const solved = corpus.pages[57].indices;
assert.equal(seed.length, 13);
assert.equal(body.length, 249);
assert.equal(solved.length, 95);
assert(seed.every((x) => x >= 0));

/** @param {number} x @returns {number} */
function mod(x) { return ((x % 29) + 29) % 29; }

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/** @param {number[]} a @returns {string} */
function spell(a) { return a.map((x) => translit[x]).join(''); }

/** @param {string} s @returns {number[]} */
function normalizeGP(s) {
  s = s.replace(/^#.*$/gm, '').toUpperCase().replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Q/g, 'C').replace(/Z/g, 'S').replace(/[^A-Z]/g, '');
  const a = [];
  for (let i = 0; i < s.length;) {
    let found = false;
    for (const n of [2, 1]) {
      const k = translit.indexOf(s.slice(i, i + n));
      if (k < 0) continue;
      a.push(k);
      i += n;
      found = true;
      break;
    }
    if (!found) i++;
  }
  return a;
}

const train = normalizeGP(reference);
const uni = Array(29).fill(0);
const bi = Array(29 ** 2).fill(0);
const tri = Array(29 ** 3).fill(0);
for (let i = 0; i < train.length; i++) {
  const x = train[i];
  uni[x]++;
  if (i >= 1) bi[train[i - 1] * 29 + x]++;
  if (i >= 2) tri[(train[i - 2] * 29 + train[i - 1]) * 29 + x]++;
}

/** @param {number[]} a @returns {number} */
function logTrigram(a) {
  let sum = 0;
  for (let i = 2; i < a.length; i++) {
    const x = a[i], y = a[i - 1], z = a[i - 2];
    const p = 0.7 * (tri[(z * 29 + y) * 29 + x] + 0.1) / (bi[z * 29 + y] + 2.9)
      + 0.25 * (bi[y * 29 + x] + 0.1) / (uni[y] + 2.9)
      + 0.05 * (uni[x] + 0.1) / (train.length + 2.9);
    sum += Math.log(p);
  }
  return sum / (a.length - 2);
}

/**
 * The 13 GP symbols of EPIPHANY SEECS are a seed fixed at the true marker13.
 * A literal plaintext-F bypass emits ciphertext F and consumes no key.
 * @param {'repeat'|'plainauto'|'cipherauto'} mode
 * @param {-1|1} sign
 * @param {number[]} plain
 * @returns {number[]}
 */
function encode(mode, sign, plain, keyMap) {
  const prevP = [], prevC = [], cipher = [];
  for (const p of plain) {
    if (p === 0) { cipher.push(0); continue; }
    const t = prevP.length;
    const key = mode === 'repeat' ? seed[t % 13]
      : t < 13 ? seed[t]
      : mode === 'plainauto' ? prevP[t - 13] : prevC[t - 13];
    const c = mod(p - sign * keyMap(key));
    prevP.push(p);
    prevC.push(c);
    cipher.push(c);
  }
  return cipher;
}

/**
 * Exhaust every authentic-F-compatible path without a language beam.
 * @param {'repeat'|'plainauto'|'cipherauto'} mode
 * @param {-1|1} sign
 * @param {number[]} cipher
 * @param {number[] | null} target
 */
function enumerate(mode, sign, cipher, keyMap, target = null) {
  const prevP = [], prevC = [], plain = [];
  let paths = 0, maxPrefix = 0, matchedTarget = false;
  /** @type {{score:number,ioc:number,skip:number,head:string,events:string}[]} */
  const best = [];
  /** @param {number} i @param {number} skipped @param {string} events */
  function dfs(i, skipped, events) {
    maxPrefix = Math.max(maxPrefix, i);
    if (i === cipher.length) {
      paths++;
      if (target && plain.every((p, j) => p === target[j])) matchedTarget = true;
      const score = logTrigram(plain);
      if (best.length < 3 || score > best[best.length - 1].score) {
        best.push({ score, ioc: ioc(plain), skip: skipped, head: spell(plain.slice(0, 95)), events });
        best.sort((a, b) => b.score - a.score);
        best.length = Math.min(best.length, 3);
      }
      return;
    }
    const t = prevP.length;
    const key = mode === 'repeat' ? seed[t % 13]
      : t < 13 ? seed[t]
      : mode === 'plainauto' ? prevP[t - 13] : prevC[t - 13];
    const p = mod(cipher[i] + sign * keyMap(key));
    if (p !== 0) {
      plain.push(p);
      prevP.push(p);
      prevC.push(cipher[i]);
      dfs(i + 1, skipped, events);
      prevC.pop();
      prevP.pop();
      plain.pop();
    }
    if (cipher[i] === 0) {
      plain.push(0);
      dfs(i + 1, skipped + 1, events + i + ',');
      plain.pop();
    }
  }
  dfs(0, 0, '');
  return { mode, sign, paths, maxPrefix, matchedTarget, best };
}

console.log('SOURCE p0 physical page0, unmodified GP29 runes offsets13..261:', body.length);
console.log('Seed: EPIPHANY SEECS (GP rune spelling of signed 2016 EPIPHANY SEEKS):', seed);
console.log('p0 body ciphertext F:', body.filter((x) => x === 0).length);
console.log('Training GP reference symbols:', train.length);
console.log('Score native solved p57:', logTrigram(solved), 'IoC:', ioc(solved));
console.log('Score original p0 body:', logTrigram(body), 'IoC:', ioc(body));
for (const [mapName, keyMap] of Object.entries({
  ordinal: (x) => x,
  gpPrime: (x) => prime[x] % 29,
  gpTotient: (x) => (prime[x] - 1) % 29
})) {
  for (const mode of ['repeat', 'plainauto', 'cipherauto']) {
    for (const sign of [-1, 1]) {
      const encoded = encode(mode, sign, solved, keyMap);
      const positive = enumerate(mode, sign, encoded, keyMap, solved);
      assert(positive.matchedTarget);
      assert(encoded.length === solved.length);
      console.log('POSITIVE', mapName, mode, sign, 'source-native p57 matched 95/95; cipherF=',
        encoded.filter((x) => x === 0).length, 'legal_paths=', positive.paths);
      const original = enumerate(mode, sign, body, keyMap);
      console.log('ORIGINAL', mapName, JSON.stringify(original));
    }
  }
}
console.log('SFT PASS. All 18 GP rune/prime/totient key consumers pass p57-native controls; original paths exhaustively determined.');

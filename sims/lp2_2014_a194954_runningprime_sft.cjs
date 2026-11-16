'use strict';

/**
 * Signed-2014 A194954 prime-key transfer against untouched LP2 GP29.
 * Original-input source: resources/liber-primus/lp2-corpus.json.
 * Run on Windows 11 with Node.js: node sims/lp2_2014_a194954_runningprime_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const mod29 = n => ((n % 29) + 29) % 29;
const first35 = [2,3,5,7,11,13,17,23,29,31,37,43,47,53,59,67,71,
  73,79,97,101,107,113,137,139,151,157,173,179,191,199,229,233,239,241];

/** @param {number} x @returns {number} */
function popcount(x) {
  let count = 0;
  for (; x; x >>>= 1) count += x & 1;
  return count;
}

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const limit = 1500000;
  const composite = new Uint8Array(limit);
  for (let p = 2; p * p < limit; p += 1) {
    if (composite[p]) continue;
    for (let multiple = p * p; multiple < limit; multiple += p)
      composite[multiple] = 1;
  }
  const output = [];
  for (let p = 2; p < limit; p += 1) if (!composite[p]) output.push(p);
  assert.ok(output.length > n);
  return output;
}

/**
 * OEIS A194954: a(1)=2; a(n) is the least prime greater than
 * a(n-1) with gap divisible by the binary popcount of n-1.
 * @param {number[]} primes @param {number} count @returns {number[]}
 */
function sourcePrimes(primes, count) {
  const out = [2];
  let candidate = 0;
  for (let n = 2; n <= count; n += 1) {
    const previous = out[n-2];
    const divisor = popcount(n-1);
    while (primes[candidate] <= previous ||
      (primes[candidate] - previous) % divisor !== 0) candidate += 1;
    out.push(primes[candidate]);
  }
  return out;
}

/** @param {number[]} s @returns {number} */
function ioc(s) {
  const freq = new Array(29).fill(0);
  for (const x of s) freq[x] += 1;
  return freq.reduce((total, n) => total + n * (n-1), 0) /
    (s.length * (s.length-1));
}

/**
 * The authentic p56 encoder transparently emits plaintext F=0 without
 * advancing its prime clock. Count the original ciphertext prefix still
 * consistent with at least one such legal transparent-F path.
 * @param {number[]} ciphertext @param {number[]} key @returns {number}
 */
function fTransparentReach(ciphertext, key) {
  let states = [0];
  for (let i = 0; i < ciphertext.length; i += 1) {
    const c = ciphertext[i];
    const next = [];
    const seen = new Uint8Array(i + 2);
    for (const used of states) {
      if (c === 0 && !seen[used]) {
        seen[used] = 1;
        next.push(used);
      }
      if (mod29(c - key[used]) !== 0 && !seen[used+1]) {
        seen[used+1] = 1;
        next.push(used+1);
      }
    }
    if (next.length === 0) return i;
    states = next;
  }
  return ciphertext.length;
}

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const tokens = corpus.translit.map((token, i) => ({token, i}))
    .sort((a,b) => b.token.length - a.token.length);
  const adjusted = word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG')
    .replace(/IO/g,'IA');
  const out = [];
  for (let at = 0; at < adjusted.length;) {
    const t = tokens.find(t => adjusted.startsWith(t.token, at));
    assert.ok(t, 'GP spelling must be encodable');
    out.push(t.i);
    at += t.token.length;
  }
  return out;
}

/** @param {number[]} plain @param {number[]} key @returns {number[]} */
function encryptNative(plain,key) {
  let used = 0;
  return plain.map(p => p === 0 ? 0 : mod29(p + key[used++]));
}

const primes = firstPrimes(13000);
const special = sourcePrimes(primes,13000);
assert.deepEqual(special.slice(0,35),first35);
assert.equal(special[12999],644089);
const knownP56 = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
const p56Key = primes.slice(0,85).map(n => mod29(n-1));
assert.equal(knownP56.length,85);
assert.deepEqual(encryptNative(knownP56,p56Key),corpus.pages[56].indices);
assert.equal(fTransparentReach(corpus.pages[56].indices,p56Key),85);

const mappings = [
  ['phi+',p => p-1], ['prime+',p => p],
  ['phi-',p => 1-p], ['prime-',p => -p]
];
const expectedFReach = [52,83,76,7,0,19,112,88,11];
const results = chapters.map(([first,last],index) => {
  const cipher = corpus.pages.slice(first,last+1).flatMap(p => p.indices);
  const mapped = Object.fromEntries(mappings.map(([name,fn]) => {
    const plain = cipher.map((c,i) => mod29(c-fn(special[i])));
    return [name,Number(ioc(plain).toFixed(7))];
  }));
  const phiKey = special.slice(0,cipher.length).map(p => mod29(p-1));
  const reach = fTransparentReach(cipher,phiKey);
  assert.equal(reach,expectedFReach[index]);
  return {pages:`p${first}–${last}`,runes:cipher.length,
    originalIoC:Number(ioc(cipher).toFixed(7)),
    noSkipDecodedIoC:mapped,transparentPhiPlusReach:reach};
});
assert.equal(results.reduce((sum,x) => sum+x.runes,0),12956);
assert.ok(results.every(x => x.transparentPhiPlusReach < x.runes));
assert.ok(results.every(x => Object.values(x.noSkipDecodedIoC)
  .every(v => v < .04)));

console.log(JSON.stringify({
  source:'2014 signed message.txt.asc 11 prime-whitespace counts; OEIS A194954',
  sourceNumberSequence:first35,
  numberOfTerms:13000, lastTerm:special[12999],
  positive:'85/85 authentic p56 known GP plaintext/F-transparent prime-totient encoder',
  keyReset:'first A194954 term at each of nine source-visible chapters',
  results, decision:'No original LP2 unknown-page prose or legal full-chapter F-transparent inverse under the frozen transferred mode; no unknown key recovered.'
},null,2));

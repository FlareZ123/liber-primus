'use strict';

/**
 * Source-causal word-prime-sum exception transport original-input gate.
 *
 * Current plaintext symbol r(word) = sum(GP primes of the PREVIOUS printed
 * CIPHERTEXT word) mod29, with the full previous ciphertext word visible
 * to a decoder. For word-local j>=1, C[j]=C[j-1] iff P[j]=r(word).
 * Every other output successor can be an arbitrary keyed permutation at
 * each position, making this a key-independent necessary condition.
 *
 * This is a hypothesis; no first-party source specifies that sum/receiver.
 * Windows Node22 read-only SFT:
 * node sims/lp2_previous_cipherword_prime_zero_exception_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const dictionary = read('resources/control/english_wordfreq_textblob.txt');
const nativeFiles = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 62492],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 217106],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 321327]
];
const Q = 29;
const runeMap = new Map(source.runes.map((r, i) => [r, i]));
const tokens = source.translit.map((text, i) => ({text, i}))
  .sort((a, b) => b.text.length - a.text.length);
const primes = [];
for (let n = 2; primes.length < Q; n++) {
  if (primes.every(p => n % p !== 0)) primes.push(n);
}
assert.equal(primes.length, 29);
assert.equal(primes[0], 2);
assert.equal(primes[28], 109);

/** @param {number} n @param {number} base @returns {number} */
function mod(n, base) { return (n % base + base) % base; }

/**
 * @param {string} raw
 * @returns {number[]}
 */
function nativeWord(raw) {
  const word = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) {out.push(21); i += 3; continue;}
    if (word.startsWith('IO', i)) {out.push(27); i += 2; continue;}
    const token = tokens.find(x => word.startsWith(x.text, i));
    assert.ok(token, 'Unknown native GP rune spelling');
    out.push(token.i);
    i += token.text.length;
  }
  return out;
}

/**
 * A parser honoring the original-% page and / printed-line carries.
 * @param {string} text
 * @returns {Array<{g:number[], pages:number[]}>}
 */
function parseWords(text) {
  const words = [];
  let g = [];
  let pages = [];
  let page = 0;
  const finish = () => {
    if (g.length) words.push({g, pages});
    g = [];
    pages = [];
  };
  for (const char of text) {
    if (runeMap.has(char)) {
      g.push(runeMap.get(char));
      pages.push(page);
    } else if (char === '%') {
      page++;
    } else if (char === '/' || /\s/u.test(char)) {
      // Physical page and printed line wraps do not end GP words.
    } else {
      finish();
    }
  }
  finish();
  return words;
}

/** @param {number[]} word @returns {number} */
function gpPrimeSum29(word) {
  return word.reduce((sum, rune) => sum + primes[rune], 0) % Q;
}

const originalWords = parseWords(transcript.split('%').slice(0, 55).join('%'));
assert.equal(originalWords.length, 2896);
assert.equal(originalWords.reduce((sum, w) => sum + w.g.length, 0), 12956);
assert.equal(originalWords.filter(w => new Set(w.pages).size > 1).length, 32);
const originalPages = source.pages.filter(p => p.page <= 55 && p.indices.length);
assert.deepEqual(originalWords.flatMap(w => w.g),
  originalPages.flatMap(p => p.indices));
assert.equal(originalWords[0].g.length, 8);

/**
 * All first-rune-per-word symbols may be encoded under a free IV. From
 * each later same-page rune onwards, a repeat is precisely the occurrence
 * of the preceding word's prime-residue r, regardless of 28-way rotor keys.
 */
const rows = [];
for (let i = 1; i < originalWords.length; i++) {
  const w = originalWords[i];
  const r = gpPrimeSum29(originalWords[i - 1].g);
  const eligible = [];
  for (let j = 1; j < w.g.length; j++)
    if (w.pages[j] === w.pages[j - 1]) eligible.push(j);
  const observed = eligible.reduce((n, j) =>
    n + Number(w.g[j] === w.g[j - 1]), 0);
  rows.push({wordIndex:i, length:w.g.length, r, eligible, observed});
}
assert.equal(rows.length, 2895);
assert.equal(rows.reduce((sum, row) => sum + row.eligible.length, 0), 10021);
assert.equal(rows.reduce((sum, row) => sum + row.observed, 0), 63);
const word1476 = rows.find(row => row.wordIndex === 1476);
assert.equal(word1476.length, 12);
assert.equal(word1476.r, 5);
assert.deepEqual(originalWords[1476].g,
  [12, 4, 9, 15, 3, 3, 5, 24, 18, 26, 18, 18]);

// One first-party GP29 source-word dictionary gate, without a tuned key.
const dictionaryByLength = new Map();
const seenNativeWords = new Set();
for (const match of dictionary.matchAll(/^([a-z]+)\s+\d+$/gm)) {
  const g = nativeWord(match[1]);
  const signature = g.join(',');
  if (seenNativeWords.has(signature)) continue;
  seenNativeWords.add(signature);
  if (!dictionaryByLength.has(g.length)) dictionaryByLength.set(g.length, []);
  dictionaryByLength.get(g.length).push({name:match[1], g});
}
assert.equal([...dictionaryByLength.values()]
  .reduce((sum, words) => sum + words.length, 0), 29060);
const unsupported = [];
let supported = 0;
let p27Possibilities = null;
for (const row of rows) {
  if (new Set(originalWords[row.wordIndex].pages).size > 1) continue;
  const matches = (dictionaryByLength.get(row.length) || []).filter(candidate =>
    row.eligible.every(j => (candidate.g[j] === row.r) ===
      (originalWords[row.wordIndex].g[j] ===
        originalWords[row.wordIndex].g[j - 1])));
  if (matches.length) supported++;
  else unsupported.push({wordIndex:row.wordIndex,
    page:originalWords[row.wordIndex].pages[0],
    length:row.length, zeroRune:source.translit[row.r]});
  if (row.wordIndex === 1476)
    p27Possibilities = matches.map(x => x.name);
}
assert.equal(supported, 2861);
assert.deepEqual(unsupported, [
  {wordIndex:1024, page:19, length:4, zeroRune:'J'},
  {wordIndex:1597, page:29, length:4, zeroRune:'EO'}
]);
assert.deepEqual(p27Possibilities, ['hydrochloric']);

// The positive plant has a self-contained, fully invertible wordwise IV,
// with 28-way rotor changing on every symbol. The first word uses r=0;
// each subsequent word derives its exception from PREVIOUS CIPHERTEXT.
function encryptWords(plainWords) {
  const result = [];
  let previousCipher = [];
  let runeClock = 0;
  for (let index = 0; index < plainWords.length; index++) {
    const p = plainWords[index];
    const r = index === 0 ? 0 : gpPrimeSum29(previousCipher);
    const c = [];
    for (let j = 0; j < p.length; j++, runeClock++) {
      if (j === 0) c.push(mod(p[0] + 17 + index, Q));
      else {
        const z = mod(p[j] - r, Q);
        const delta = z === 0 ? 0 :
          1 + mod(z - 1 + 13 * runeClock + 7, 28);
        c.push(mod(c[j - 1] + delta, Q));
      }
    }
    previousCipher = c;
    result.push(c);
  }
  return result;
}

/** @param {number[][]} cipherWords @returns {number[][]} */
function decryptWords(cipherWords) {
  const result = [];
  let previousCipher = [];
  let runeClock = 0;
  for (let index = 0; index < cipherWords.length; index++) {
    const c = cipherWords[index];
    const r = index === 0 ? 0 : gpPrimeSum29(previousCipher);
    const p = [];
    for (let j = 0; j < c.length; j++, runeClock++) {
      if (j === 0) p.push(mod(c[0] - 17 - index, Q));
      else {
        const delta = mod(c[j] - c[j - 1], Q);
        const z = delta === 0 ? 0 :
          1 + mod(delta - 1 - 13 * runeClock - 7, 28);
        p.push(mod(r + z, Q));
      }
    }
    result.push(p);
    previousCipher = c;
  }
  return result;
}
const p57 = parseWords(transcript.split('%')[56]);
assert.equal(p57.reduce((sum, w) => sum + w.g.length, 0), 95);
assert.equal(p57.length, 20);
const p57Plain = p57.map(w => w.g);
const p57Cipher = encryptWords(p57Plain);
assert.deepEqual(decryptWords(p57Cipher), p57Plain);
assert.deepEqual(encryptWords(decryptWords(p57Cipher)), p57Cipher);

// Sample original-length-matched real GP native words independently at each
// source word position. Freeze its actual PREVIOUS-CIPHERTEXT prime marker,
// true word length and page split mask. Compare how often an ordinary native
// GP plaintext would force the zero-step event.
const pools = new Map();
const controlSizes = [];
for (const [name, filename, expectedLength] of nativeFiles) {
  const text = read(filename);
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  let runes = 0;
  for (const raw of words) {
    const g = nativeWord(raw);
    runes += g.length;
    if (!pools.has(g.length)) pools.set(g.length, []);
    pools.get(g.length).push(g);
  }
  assert.equal(runes, expectedLength);
  controlSizes.push({name, sourceWords:words.length, nativeRunes:runes});
}
assert.deepEqual(controlSizes.map(row => row.sourceWords),
  [15733, 55407, 77932]);
for (const row of rows) assert.ok(pools.get(row.length)?.length > 0);

let seed = 0x3301;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const trials = 10000;
const scores = [];
for (let i = 0; i < trials; i++) {
  let count = 0;
  for (const row of rows) {
    const pool = pools.get(row.length);
    const g = pool[random() % pool.length];
    for (const j of row.eligible)
      count += Number(g[j] === row.r);
  }
  scores.push(count);
}
scores.sort((a,b) => a - b);
const percent = p => scores[Math.floor(p * trials)];
const output = {
  proposedModel:'r_w = sum GP primes(previous ciphertext printed word) mod29; zero current rune',
  original: {
    gpRunes:12956, printedWords:originalWords.length, carriedWords:32,
    testWords:rows.length, eligibleWithinWordSamePageSites:10021,
    repeatedCiphertextRuneEvents:63,
    p27Word1476PrimeMarker:source.translit[word1476.r],
    dictionarySupportedCompleteWords:supported,
    unsupportedCompleteWords:unsupported,
    p27CompatibleTextblobWords:p27Possibilities
  },
  nativeControls:controlSizes,
  bootstrap:{
    seed:'0x3301',trials,min:scores[0],q01:percent(0.01),
    median:percent(0.50),q99:percent(0.99),max:scores.at(-1),
    mean:scores.reduce((sum,x)=>sum+x,0)/trials,
    atOrBelowOriginal:scores.filter(x=>x<=63).length
  },
  clearP57SyntheticCausalForwardInversePositive:95,
  conclusion:'Specified changing current-rune exception fails native word-length matched controls. No original plaintext/key.'
};
assert.equal(output.bootstrap.atOrBelowOriginal,0);
assert.ok(output.bootstrap.min > 200);
if (require.main === module) console.log(JSON.stringify(output,null,2));
module.exports = {parseWords,nativeWord,encryptWords,decryptWords};

'use strict';
/**
 * Original LP2, all-secret previous-cipher-rune emission capacity gate.
 * Windows 11 / Node 22: node sims/lp2_previous_cipher_row_capacity_sft.cjs
 *
 * Hypothesis (inside a printed word, with arbitrary word-initial symbols):
 *   C[i] = F[scope(i), C[i-1]](P[i]).
 * Every F is a completely unknown deterministic GP29 symbol map. It need not
 * be affine, invertible, monotone, injective or shared by different states.
 *
 * For a fixed plaintext rune x, all occurrences in state (scope, previous C)
 * must emit a single ciphertext rune. Its total count can therefore never
 * exceed the sum over states of that state's largest ciphertext bin. For k
 * fixed plaintext runes, sum the largest k bins in every state. The bound is
 * exact for those k symbols if the maps may be chosen independently.
 *
 * This is a native-GP English-register necessary condition, not a universal
 * cryptographic impossibility or a recovered decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const runeRe = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const source = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\n/g, '').replace(/[\n%]/g, '');
const ciphertext = [...source.matchAll(runeRe)]
  .map(m => [...m[0]].map(r => runeIndex.get(r)));
const originalFlat = ciphertext.flat();
const knownPageData = gp.pages.filter(p => p.page <= 55);
const pageOfRune = knownPageData.flatMap(p => Array(p.indices.length).fill(p.page));
const corpusFlat = knownPageData.flatMap(p => p.indices);
assert.equal(ciphertext.length, 2896);
assert.equal(originalFlat.length, 12956);
assert.deepEqual(originalFlat, corpusFlat);
assert.equal(pageOfRune.length, originalFlat.length);

const chapterEnds = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
/** @param {number} i @returns {number} */
function chapterOf(i) {
  const c = chapterEnds.findIndex(end => i < end);
  assert(c >= 0);
  return c;
}
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} value @returns {number[]} */
function native(value) {
  const s = value.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) { out.push(21); i += 3; }
    else if (s.startsWith('IO', i)) { out.push(27); i += 2; }
    else {
      const t = tokens.find(x => s.startsWith(x.s, i));
      assert(t, 'unknown GP-native spelling: ' + s.slice(i));
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}
/** @param {number} seed @returns {() => number} */
function prng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
/**
 * @param {number[][]} words
 * @param {'book'|'chapter'|'page'} scope
 * @returns {{eligible:number,states:number,capacities:number[]}}
 */
function capacity(words, scope) {
  const states = new Map();
  let offset = 0;
  for (const word of words) {
    for (let j = 1; j < word.length; j++) {
      const i = offset + j;
      const segment = scope === 'book' ? 0
        : scope === 'chapter' ? chapterOf(i) : pageOfRune[i];
      const key = segment * 29 + word[j - 1];
      let bins = states.get(key);
      if (!bins) { bins = Array(29).fill(0); states.set(key, bins); }
      bins[word[j]]++;
    }
    offset += word.length;
  }
  assert.equal(offset, originalFlat.length);
  const capacities = [1, 2, 3, 4, 5].map(k => {
    let bound = 0;
    for (const bins of states.values())
      bound += bins.slice().sort((a, b) => b - a)
        .slice(0, k).reduce((a, b) => a + b, 0);
    return bound;
  });
  return {eligible: originalFlat.length - words.length, states: states.size, capacities};
}
/** @param {number[][]} words @returns {{E:number,EO:number,EOA:number}} */
function englishCounts(words) {
  let E = 0, EO = 0, EOA = 0;
  for (const word of words)
    for (let i = 1; i < word.length; i++) {
      const x = word[i];
      if (x === 18) { E++; EO++; EOA++; }
      else if (x === 3) { EO++; EOA++; }
      else if (x === 24) EOA++;
    }
  return {E, EO, EOA};
}
/**
 * @param {number[][]} plaintext
 * @returns {{cipher:number[][], recovered:number[][]}}
 */
function nativePlant(plaintext) {
  const random = prng(0x3301c1c1);
  const maps = Array.from({length: 9}, () => Array.from({length: 29}, () => {
    const row = Array.from({length: 29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = random() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
    return row;
  }));
  let offset = 0;
  const cipher = plaintext.map(word => {
    const out = [word[0]]; // Explicitly grant an unconstrained word initial rune.
    for (let j = 1; j < word.length; j++) {
      const scope = chapterOf(offset + j);
      out.push(maps[scope][out[j - 1]][word[j]]);
    }
    offset += word.length;
    return out;
  });
  offset = 0;
  const recovered = cipher.map(word => {
    const out = [word[0]];
    for (let j = 1; j < word.length; j++) {
      const scope = chapterOf(offset + j);
      const p = maps[scope][word[j - 1]].indexOf(word[j]);
      assert(p >= 0);
      out.push(p);
    }
    offset += word.length;
    return out;
  });
  return {cipher, recovered};
}
const original = {
  book: capacity(ciphertext, 'book'),
  chapter: capacity(ciphertext, 'chapter'),
  page: capacity(ciphertext, 'page')
};
assert.deepEqual(original.book, {eligible:10060,states:29,capacities:[578,1086,1582,2052,2510]});
assert.deepEqual(original.chapter, {eligible:10060,states:261,capacities:[1068,1938,2692,3383,4025]});
assert.equal(original.page.capacities[0], 2401);
assert.equal(original.page.capacities[1], 4140);

const corpora = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt'
];
const expected = [
  {minE:1371,minEO:2234,minEOA:2798},
  {minE:1396,minEO:2107,minEOA:2726},
  {minE:1395,minEO:2296,minEOA:2928}
];
const corpusChecks = corpora.map((file, index) => {
  const bins = Array.from({length: 15}, () => []);
  for (const match of read(file).match(/[A-Za-z]+/g) || []) {
    const x = native(match);
    if (x.length <= 14) bins[x.length].push(x);
  }
  for (const w of ciphertext)
    assert(bins[w.length].length > 0, file + ': missing length ' + w.length);
  const next = prng(0x5eed3301);
  const minima = {minE:Infinity, minEO:Infinity, minEOA:Infinity};
  let planted = null;
  for (let trial = 0; trial < 512; trial++) {
    const sampled = ciphertext.map(w => {
      const bin = bins[w.length];
      return bin[next() % bin.length];
    });
    const counts = englishCounts(sampled);
    minima.minE = Math.min(minima.minE, counts.E);
    minima.minEO = Math.min(minima.minEO, counts.EO);
    minima.minEOA = Math.min(minima.minEOA, counts.EOA);
    if (trial === 0) planted = sampled;
  }
  assert.deepEqual(minima, expected[index]);
  assert(minima.minE > original.chapter.capacities[0]);
  assert(minima.minEO > original.chapter.capacities[1]);
  assert(minima.minEOA > original.chapter.capacities[2]);
  const {cipher, recovered} = nativePlant(planted);
  assert.deepEqual(recovered, planted);
  const bound = capacity(cipher, 'chapter');
  const counts = englishCounts(planted);
  assert(counts.E <= bound.capacities[0]);
  assert(counts.EO <= bound.capacities[1]);
  assert(counts.EOA <= bound.capacities[2]);
  return {file, minima, plantedE:counts.E, plantCapacityE:bound.capacities[0],
    recoveredRunes:recovered.reduce((sum, word) => sum + word.length, 0)};
});
console.log(JSON.stringify({result:'PASS', words:ciphertext.length,
  cipherRunes:originalFlat.length, original, corpusChecks}, null, 2));

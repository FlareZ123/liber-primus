'use strict';

/**
 * Historical 2012 signed Blake chorus as 56 page-local GP28 rank keys.
 *
 * The verified 2012 email says "Let the Chorus be your guide to the depths."
 * Its Blake chorus contains exactly 56 words, matching physical LP2 p0..55.
 * This tests a single source-defined key assignment: one word per page.
 * The rank step excludes the previous ciphertext rune. Repeat outputs
 * represent the reserved GP29 rune EA; no ciphertext symbols are discarded.
 *
 * Node.js 22 CommonJS, read-only single runnable test file.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const message = read('resources/control/cicada2012_blake_chorus.txt');
const text = message.split('BEGIN SOURCE TEXT')[1].split('END SOURCE TEXT')[0];
const sourceWords = text.match(/[A-Za-z]+/g);
assert.equal(sourceWords.length, 56);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.pages[50].indices.length, 0);

const mod = (n, q) => (n % q + q) % q;
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG');
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = tokens.find(x => normalized.startsWith(x.s, i));
    assert.ok(token, 'GP29 encoding token at ' + i + ': ' + normalized);
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}
const keys = sourceWords.map(gp);
assert.ok(keys.every(k => k.length > 0));
const pageLengths = corpus.pages.slice(0, 56).map(p => p.indices.length);
const n = pageLengths.reduce((s, x) => s + x, 0);
assert.equal(n, 12956);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);

/** @param {number} rank @param {number} previous @param {string} order */
function fromRank(rank, previous, order) {
  assert.ok(rank >= 0 && rank < 28);
  if (order === 'sorted') return rank >= previous ? rank + 1 : rank;
  return mod(previous + 1 + rank, 29);
}

/** @param {number} c @param {number} previous @param {string} order */
function toRank(c, previous, order) {
  assert.notEqual(c, previous);
  if (order === 'sorted') return c - Number(c > previous);
  return mod(c - previous - 1, 29);
}

/**
 * @typedef {{order:'sorted'|'cyclic', sign:number, phase:number}} Mode
 * @param {number[][]} pages
 * @param {Mode} mode
 * @returns {number[][]}
 */
function inverse(pages, mode) {
  return pages.map((arr, page) => {
    const key = keys[page];
    if (!arr.length) return [];
    let prior = 0;
    return arr.map((c, pos) => {
      const k = key[(pos + mode.phase) % key.length] % 28;
      const plain = pos === 0
        ? mod(c + mode.sign * key[mode.phase % key.length], 29)
        : c === prior ? 28 : mod(toRank(c, prior, mode.order)
          + mode.sign * k, 28);
      prior = c;
      return plain;
    });
  });
}

/**
 * @param {number[][]} pages
 * @param {Mode} mode
 * @returns {number[][]}
 */
function forward(pages, mode) {
  return pages.map((arr, page) => {
    const key = keys[page];
    if (!arr.length) return [];
    let previous = 0;
    return arr.map((plain, pos) => {
      const k = key[(pos + mode.phase) % key.length] % 28;
      const c = pos === 0
        ? mod(plain - mode.sign * key[mode.phase % key.length], 29)
        : plain === 28 ? previous
          : fromRank(mod(plain - mode.sign * k, 28), previous, mode.order);
      previous = c;
      return c;
    });
  });
}

/** @param {number[]} vals @returns {number} */
function ioc(vals) {
  const h = Array(29).fill(0);
  for (const x of vals) h[x]++;
  return h.reduce((sum, x) => sum + x * (x - 1), 0)
    / (vals.length * (vals.length - 1));
}
const flatten = pages => pages.flat();
const cipher = corpus.pages.slice(0, 56).map(p => p.indices);
const original = flatten(cipher);
assert.equal(original.length, 12956);
let doublets = 0;
for (const arr of cipher) for (let i = 1; i < arr.length; i++)
  if (arr[i] === arr[i - 1]) doublets++;
assert.equal(doublets, 86);

// Independent native-English GP29 control. Preserve original page capacities.
const referenceWords = read('resources/control/shakespeare_first300k.txt')
  .match(/[A-Za-z]+/g);
const native = [];
for (const word of referenceWords) {
  native.push(...gp(word));
  if (native.length >= n) break;
}
assert.ok(native.length >= n);
const plant = native.slice(0, n);
const plantPages = [];
let at = 0;
for (const len of pageLengths) {
  plantPages.push(plant.slice(at, at + len));
  at += len;
}
assert.equal(at, n);

const observed = [];
for (const order of ['sorted', 'cyclic'])
  for (const sign of [-1, +1])
    for (const phase of [0, 1]) {
      const mode = {order, sign, phase};
      const decoded = inverse(cipher, mode);
      const reencoded = forward(decoded, mode);
      assert.deepEqual(reencoded, cipher, 'original GP roundtrip: ' + JSON.stringify(mode));
      const plantedCipher = forward(plantPages, mode);
      const recovered = inverse(plantedCipher, mode);
      assert.deepEqual(recovered, plantPages, 'native-GP plant: ' + JSON.stringify(mode));
      const plain = flatten(decoded);
      observed.push({
        ...mode,
        original_ioc: ioc(plain),
        original_prefix: plain.slice(0, 70).map(i => corpus.translit[i]).join(''),
        plant_ioc: ioc(flatten(recovered))
      });
    }

assert.ok(observed.every(m => m.original_ioc < 0.036));
assert.ok(observed.every(m => m.plant_ioc > 0.055));
const result = {
  source_words: sourceWords.length,
  unknown_original_runes: n,
  physical_pages: 56,
  rune_bearing_pages: cipher.filter(a => a.length).length,
  original_doublets: doublets,
  raw_original_ioc: ioc(original),
  native_plant_ioc: ioc(plant),
  modes: observed
};
console.log(JSON.stringify(result, null, 2));


// Stronger all-secret necessary-condition test. The 56 signed source words
// select the page-local key periods, but arbitrary independent secret
// alphabet permutations are granted to EACH page and key-phase position.
// Equality within such a group survives every bijective substitution key.
// The same test applies to both 28-way predecessor-exclusion ranks.
//
// Only key phase is constrained; the actual signed chorus key letters
// are NOT supplied to the all-secret statistical invariant.
/**
 * @typedef {'raw'|'sorted'|'cyclic'} Observation
 * @param {number[][]} pages
 * @param {Observation} observation
 * @returns {{hits:number,pairs:number,rate:number,groups:number}}
 */
function samePhaseEquality(pages, observation) {
  let hits = 0, pairs = 0, groups = 0;
  pages.forEach((page, pageIndex) => {
    if (!page.length) return;
    const period = keys[pageIndex].length;
    const bins = Array.from({length: period}, () =>
      Array(observation === 'raw' ? 29 : 28).fill(0));
    let previous = -1;
    page.forEach((current, position) => {
      let symbol = current;
      if (observation !== 'raw') {
        if (!position || current === previous) {
          previous = current;
          return;
        }
        symbol = toRank(current, previous, observation);
      }
      bins[position % period][symbol]++;
      previous = current;
    });
    for (const hist of bins) {
      const size = hist.reduce((sum, count) => sum + count, 0);
      if (size < 2) continue;
      hits += hist.reduce((sum, count) => sum + count * (count - 1), 0);
      pairs += size * (size - 1);
      groups++;
    }
  });
  return {hits, pairs, rate: hits / pairs, groups};
}

/** @param {string} source @returns {number[][]} */
function nativePageSource(source) {
  const values = [];
  for (const word of source.match(/[A-Za-z]+/g) || []) {
    values.push(...gp(word));
    if (values.length >= n) break;
  }
  assert.ok(values.length >= n);
  let next = 0;
  return pageLengths.map(length => {
    const page = values.slice(next, next + length);
    next += length;
    return page;
  });
}

/**
 * True page/key-phase dependent unknown 29-symbol alphabets; every
 * map x -> 7*x+b is a bijection over GF(29), even if each phase
 * has a distinct secret b.
 * @param {number[][]} native
 * @returns {number[][]}
 */
function secretRawPlant(native) {
  return native.map((page, index) => page.map((value, pos) => {
    const phase = pos % keys[index].length;
    return mod(7 * value + 11 * index + 5 * phase, 29);
  }));
}

/**
 * Genuine arbitrary-secret 28-way rank cipher, one affine
 * permutation for each page and key-phase, with the original
 * page-doublet sites treated as explicit source-controlled erasures.
 * This is a valid positive control for the nonrepeat lane, and
 * does not assert that LP2's exception sites are recoverable.
 * @param {number[][]} native
 * @param {'sorted'|'cyclic'} order
 * @returns {number[][]}
 */
function secretRankPlant(native, order) {
  return native.map((page, pageIndex) => {
    let previous = mod(7 * pageIndex + 3, 29);
    return page.map((value, pos) => {
      if (!pos) return previous;
      if (cipher[pageIndex][pos] === cipher[pageIndex][pos - 1])
        return previous;
      const phase = pos % keys[pageIndex].length;
      const rank = mod(5 * (value % 28) + 11 * pageIndex + 3 * phase, 28);
      const current = fromRank(rank, previous, order);
      previous = current;
      return current;
    });
  });
}

/**
 * @param {number[][]} source
 * @returns {number[][]}
 */
function sourceRank28(source) {
  return source.map((page, pageIndex) => page.map((value, pos) => {
    // Marked exception sites and page firsts are excluded by
    // samePhaseEquality on rank ciphertext; their symbols are immaterial.
    return value % 28;
  }));
}

const allSecretSources = [
  {name: 'Shakespeare', source: read('resources/control/shakespeare_first300k.txt')},
  {name: 'Gibran', source: read('resources/control/gibran_prophet_58585.txt')},
  {name: 'Emerson', source: read('resources/control/emerson_essays_2944.txt')}
];
const originalAllSecret = {
  raw: samePhaseEquality(cipher, 'raw'),
  sorted: samePhaseEquality(cipher, 'sorted'),
  cyclic: samePhaseEquality(cipher, 'cyclic')
};
assert.deepEqual(originalAllSecret.raw,
  {hits:33568,pairs:976600,rate:33568/976600,groups:218});
assert.deepEqual(originalAllSecret.sorted,
  {hits:33944,pairs:955226,rate:33944/955226,groups:218});
assert.deepEqual(originalAllSecret.cyclic,
  {hits:34518,pairs:955226,rate:34518/955226,groups:218});

const nativeControls = [];
for (const {name, source} of allSecretSources) {
  const native = nativePageSource(source);
  const directNative = samePhaseEquality(native, 'raw');
  const obscured = samePhaseEquality(secretRawPlant(native), 'raw');
  assert.deepEqual(obscured, directNative,
    'secret 29-way page-phase permutation invariant: ' + name);
  const ranks = {};
  for (const order of ['sorted', 'cyclic']) {
    const secret = secretRankPlant(native, order);
    const rankResult = samePhaseEquality(secret, order);
    // Reconstruct exact native 28-symbol values at eligible slots.
    const control = native.map((page, pageIndex) => page.map((v, pos) => {
      if (!pos || cipher[pageIndex][pos] === cipher[pageIndex][pos - 1])
        return -1;
      return v % 28;
    }));
    let directHits=0,directPairs=0;
    control.forEach((page,pageIndex) => {
      const buckets=Array.from({length:keys[pageIndex].length},
        ()=>Array(28).fill(0));
      page.forEach((value,pos)=>{
        if(value>=0)buckets[pos%keys[pageIndex].length][value]++;
      });
      buckets.forEach(hist=>{
        const count=hist.reduce((a,b)=>a+b,0);
        directHits+=hist.reduce((a,b)=>a+b*(b-1),0);
        directPairs+=count*(count-1);
      });
    });
    assert.equal(rankResult.hits,directHits,'secret 28-way ' + name + order);
    assert.equal(rankResult.pairs,directPairs,'phase pairs '+name+order);
    assert.ok(rankResult.rate>0.05,'native-source secret rank result');
    ranks[order]=rankResult;
  }
  assert.ok(directNative.rate>0.05,'native-source secret GP29 result');
  nativeControls.push({name,raw:directNative,sorted:ranks.sorted,
    cyclic:ranks.cyclic});
}
assert.ok(Object.values(originalAllSecret).every(x=>x.rate<0.037));
console.log('ALL_SECRET_56_WORD_PERIODS',
  JSON.stringify({pageKeyPeriods:keys.map(k=>k.length),
    original:originalAllSecret, nativeControls},null,2));

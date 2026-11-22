'use strict';

/**
 * LP2 original-p50 parity as a joint anti-doublet / five-back selector.
 * Fixed chapter holdouts and exact 256 physical clock phases; no key fitting.
 * Test: node sims/lp2_p50_bit0_dualecho_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const table = require('../resources/liber-primus/lp2-grid-256.json');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const A60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const A59 = A60.replace('f', '');
const TOKENS = table.pages.flatMap((p) => p.tokens);
const RAW = fs.readFileSync(path.join(__dirname, '..', 'resources', 'lp2-transcription.txt'), 'utf8');
const PAGES = corpus.pages.filter((p) => p.page <= 55);
const RUNIC = /[\u16A0-\u16FF]/u;
const GLOBAL = PAGES.flatMap((p) => p.indices);

assert.equal(TOKENS.length, 256);
assert.equal(GLOBAL.length, 12956);
assert.equal(table.alphabet, A60);

/** @param {string} alphabet */
function readTable(alphabet) {
  return TOKENS.map((token) => {
    assert.equal(token.length, 2);
    const first = alphabet.indexOf(token[0]);
    const second = alphabet.indexOf(token[1]);
    assert(first >= 0 && second >= 0, 'Unknown table glyph');
    const v = first * alphabet.length + second;
    assert(v >= 0 && v <= 255);
    return v;
  });
}

/** @param {number} page */
function chapterForPage(page) {
  const k = CHAPTERS.findIndex(([first, last]) => first <= page && page <= last);
  assert(k >= 0);
  return k;
}

const PAGE_START = new Map();
let offset = 0;
const DOUBLETS = [];
for (const page of PAGES) {
  PAGE_START.set(page.page, offset);
  const chapter = chapterForPage(page.page);
  for (let i = 0; i + 1 < page.indices.length; ++i) {
    DOUBLETS.push({
      phase: (offset + i) & 255, chapter,
      hit: Number(page.indices[i] === page.indices[i + 1])
    });
  }
  offset += page.indices.length;
}
assert.equal(offset, GLOBAL.length);
assert.equal(DOUBLETS.length, 12901);
assert.equal(DOUBLETS.reduce((n, row) => n + row.hit, 0), 86);

/**
 * Page/line wraps are not word breaks. Punctuation other than slash,
 * percent and whitespace terminates the original printed rune word.
 */
function parseWords() {
  const words = [];
  let active = [];
  let ordinal = 0;
  for (const part of RAW.split('%').slice(0, 55)) {
    for (const ch of part) {
      if (RUNIC.test(ch)) active.push(ordinal++);
      else if (ch === '/' || /\s/u.test(ch)) continue;
      else if (active.length) { words.push(active); active = []; }
    }
  }
  if (active.length) words.push(active);
  assert.equal(ordinal, 12956);
  assert.equal(words.length, 2896);
  return words;
}
const WORDS = parseWords();
const CHAPTER_STARTS = CHAPTERS.map(([start]) => PAGE_START.get(start));
CHAPTER_STARTS.push(GLOBAL.length);

/** @param {number} runePosition */
function chapterForPosition(runePosition) {
  const k = CHAPTER_STARTS.findIndex((start, i) => i < 9 &&
    start <= runePosition && runePosition < CHAPTER_STARTS[i + 1]);
  assert(k >= 0);
  return k;
}
const FIVEBACK = [];
for (const positions of WORDS) {
  for (let j = 5; j < positions.length; j++) {
    const current = positions[j];
    FIVEBACK.push({
      phase: (current - 1) & 255,
      chapter: chapterForPosition(current),
      hit: Number(GLOBAL[current] === GLOBAL[positions[j - 5]])
    });
  }
}
assert.equal(FIVEBACK.length, 2105);
assert.equal(FIVEBACK.reduce((n, row) => n + row.hit, 0), 104);

/**
 * @typedef {{phase: number, chapter: number, hit: number}} Observation
 * @param {Observation[]} observations
 * @param {boolean[]} mask
 * @param {number} shift
 */
function crossValidated(observations, mask, shift) {
  const N = Array.from({length: 9}, () => [0, 0]);
  const H = Array.from({length: 9}, () => [0, 0]);
  for (const o of observations) {
    const branch = Number(mask[(o.phase + shift) & 255]);
    N[o.chapter][branch]++;
    H[o.chapter][branch] += o.hit;
  }
  const totalN = [0, 1].map((branch) => N.reduce((s, row) => s + row[branch], 0));
  const totalH = [0, 1].map((branch) => H.reduce((s, row) => s + row[branch], 0));
  const logBernoulli = (h, n, p) => h * Math.log(p) + (n - h) * Math.log1p(-p);
  const gains = [];
  for (let hold = 0; hold < 9; hold++) {
    const n = totalN.map((x, branch) => x - N[hold][branch]);
    const h = totalH.map((x, branch) => x - H[hold][branch]);
    const rate = n.map((x, branch) => (h[branch] + 0.5) / (x + 1));
    const pooled = (h[0] + h[1] + 0.5) / (n[0] + n[1] + 1);
    gains.push(
      logBernoulli(H[hold][0], N[hold][0], rate[0]) +
      logBernoulli(H[hold][1], N[hold][1], rate[1]) -
      logBernoulli(H[hold][0] + H[hold][1], N[hold][0] + N[hold][1], pooled)
    );
  }
  return {
    n: totalN, h: totalH, gain: gains.reduce((a, b) => a + b, 0),
    gains, positive: gains.filter((x) => x > 0).length
  };
}

/** @param {number[]} values */
function sourceBit0(values) {
  return values.map((b) => (b & 1) === 0);
}

/** @param {number[]} values @param {number[]} plaintext */
function encryptMixedTap(values, plaintext) {
  const output = [];
  for (let i = 0; i < plaintext.length; i++) {
    const b = values[(i + 255) & 255];
    const lag = (b & 1) === 0 ? 1 : 5;
    const prev = i >= lag ? output[i - lag] : 0;
    output.push((plaintext[i] + b + prev) % 29);
  }
  return output;
}

/** @param {number[]} values @param {number[]} ciphertext */
function decryptMixedTap(values, ciphertext) {
  return ciphertext.map((c, i) => {
    const b = values[(i + 255) & 255];
    const lag = (b & 1) === 0 ? 1 : 5;
    const prev = i >= lag ? ciphertext[i - lag] : 0;
    return ((c - b - prev) % 29 + 29) % 29;
  });
}

/** @param {number[]} text */
function coincidence(text) {
  const hist = Array(29).fill(0);
  for (const symbol of text) hist[symbol]++;
  return hist.reduce((s, h) => s + h * (h - 1), 0) / (text.length * (text.length - 1));
}

function main() {
  const family = [];
  for (const [name, alphabet] of [['conventional60', A60], ['dropf59', A59]]) {
    const values = readTable(alphabet);
    const bit0 = sourceBit0(values);

    const rows = Array.from({length: 256}, (_, shift) => {
      const doublet = crossValidated(DOUBLETS, bit0, shift);
      const five = crossValidated(FIVEBACK, bit0, shift);
      return {shift, doublet, five, joint: doublet.gain + five.gain};
    });
    const original = rows[0];
    const doubletRank = rows.filter((row) => row.doublet.gain >= original.doublet.gain).length;
    const fiveRank = rows.filter((row) => row.five.gain >= original.five.gain).length;
    const jointRank = rows.filter((row) => row.joint >= original.joint).length;
    console.log('\n' + name + ' fixed source phase0:');
    console.log(JSON.stringify({
      doublet: original.doublet, fiveBack: original.five,
      jointCompositeGain: original.joint,
      clockRankAmong256: {doublet: doubletRank, fiveBack: fiveRank, joint: jointRank}
    }, null, 2));
    family.push({name, rows});

    // The integrated direct inverse is a concrete, source-only proposed decoder.
    const decoded = decryptMixedTap(values, GLOBAL);
    const ioc = coincidence(decoded);
    console.log('Source-bit0 lag1-even/lag5-odd plus full p50 byte inverse GP29 IoC:', ioc);
    console.log('First original 60 decoded GP values:', decoded.slice(0, 60).join(','));
    const sample = corpus.pages.find((p) => p.page === 57).indices;
    const nativePlant = Array.from({length: GLOBAL.length}, (_, i) => sample[i % sample.length]);
    const encoded = encryptMixedTap(values, nativePlant);
    assert.deepEqual(decryptMixedTap(values, encoded), nativePlant);
    assert(coincidence(nativePlant) > 0.04);
    assert(ioc < 0.04);
    assert.deepEqual(encryptMixedTap(values, decoded), GLOBAL);
    console.log('SYNTHETIC native-GP full inversion PASS 12956/12956; original decoded stream is non-native.');
  }

  const selected = family[0].rows[0];
  assert.deepEqual(selected.doublet.n, [6153, 6748]);
  assert.deepEqual(selected.doublet.h, [25, 61]);
  assert.deepEqual(selected.five.n, [994, 1111]);
  assert.deepEqual(selected.five.h, [61, 43]);
  assert(Math.abs(selected.doublet.gain - 5.240724363830498) < 1e-9);
  assert(Math.abs(selected.five.gain - 2.021339741995524) < 1e-9);
  assert.equal(family[0].rows.filter((x) => x.joint >= selected.joint).length, 1);
  assert.equal(family[0].rows.filter((x) => x.five.gain >= selected.five.gain).length, 2);

  // Retrospective multiple-feature caution: 16 ordinary byte-bit predicates,
  // in both conventional and reduced source alphabets, at every clock phase.
  const masks = [];
  for (const {name, alphabet} of [
    {name: 'conventional60', alphabet: A60}, {name: 'dropf59', alphabet: A59}
  ]) {
    const values = readTable(alphabet);
    for (let bit = 0; bit < 8; bit++) {
      masks.push({name: name + '-bit' + bit,
        mask: values.map((value) => Boolean(value & (1 << bit)))});
    }
  }
  const familyMaximum = Array(256).fill(-Infinity);
  for (const m of masks) for (let shift = 0; shift < 256; shift++) {
    const gain = crossValidated(FIVEBACK, m.mask, shift).gain;
    familyMaximum[shift] = Math.max(familyMaximum[shift], gain);
  }
  const retrospectiveRank = familyMaximum.filter((gain) =>
    gain >= familyMaximum[0]).length;
  assert.equal(retrospectiveRank, 44);
  console.log('\nRetrospective 16-bit predicate / 256-shift family rank for five-back only:',
    retrospectiveRank + '/256 (not significant after this search family)');
  console.log('PASS: exact original source, two first-party phenomena, joint-clock test and mixed-tap inverse');
}

main();

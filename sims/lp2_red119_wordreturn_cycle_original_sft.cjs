'use strict';

/**
 * Source-anchored red119 -> printed-word -> reciprocal-page selector.
 * SFT: node sims/lp2_red119_wordreturn_cycle_original_sft.cjs
 *
 * This is a hypothesis gate, not an authenticated LP2 decipherment.
 * Original pages use zero-based labels, while the proposed word-return
 * explicitly uses one-based physical page ordinals; that asymmetry is
 * an unresolved premise, not a silently repaired indexing convention.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const annotations = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const sections = transcription.split('%');
assert.equal(corpus.runes.length, 29);
const unicodeToIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));

/** @param {number} p @returns {number[]} */
function page(p) {
  const found = corpus.pages.find(record => record.page === p);
  assert.ok(found && Array.isArray(found.indices), 'missing page ' + p);
  return found.indices;
}

/** @param {number[]} indices @returns {string} */
function spell(indices) {
  return indices.map(i => corpus.translit[i]).join('-');
}

/** @param {number[]} indices @returns {number} */
function primeSum(indices) {
  return indices.reduce((acc, i) => acc + corpus.prime[i], 0);
}

/** @param {number} p @param {number} offset @returns {number[]} */
function redAt(p, offset) {
  const pRecord = annotations.pages.find(record => record.page === p);
  const span = pRecord?.red_spans?.find(item => item.start === offset);
  assert.ok(span, 'source-original red span missing: ' + p + ':' + offset);
  const indices = [...span.runes].map(rune => {
    const index = unicodeToIndex.get(rune);
    assert.notEqual(index, undefined);
    return index;
  });
  assert.deepEqual(indices, page(p).slice(offset, offset + span.length));
  return indices;
}

/**
 * Scan only actual source rune identities and physical word punctuation.
 * Printed '/' line breaks are transparent; '-' and '.' close words.
 * @param {number} p
 * @returns {{ start:number, end:number, indices:number[] }[]}
 */
function pageWords(p) {
  const source = sections[p >= 50 ? p - 1 : p];
  assert.equal(typeof source, 'string');
  const words = [];
  let offset = 0, start = 0, current = [];
  for (const rune of source) {
    const i = unicodeToIndex.get(rune);
    if (i !== undefined) {
      if (current.length === 0) start = offset;
      current.push(i);
      offset++;
    } else if ('-.;&:$'.includes(rune) && current.length) {
      words.push({ start, end: offset - 1, indices: current });
      current = [];
    }
  }
  if (current.length) words.push({ start, end: offset - 1, indices: current });
  assert.deepEqual(words.flatMap(word => word.indices), page(p));
  return words;
}

/** @param {number} p @param {number} runeOffset */
function wordAt(p, runeOffset) {
  const match = pageWords(p).filter(word => word.start <= runeOffset && word.end >= runeOffset);
  assert.equal(match.length, 1);
  return match[0];
}

/**
 * Exact source-page-rune-inventory permutation null for the sum of k
 * distinct positions. This accounts for every unordered k-subset without
 * replacement, so no Monte Carlo randomness or model fitting is used.
 *
 * @param {number[]} originalPage
 * @param {number} k
 * @returns {number[]}
 */
function residueCounts(originalPage, k) {
  const dp = Array.from({ length: k + 1 }, () => Array(56).fill(0));
  dp[0][0] = 1;
  let seen = 0;
  for (const rune of originalPage) {
    seen++;
    const weight = corpus.prime[rune] % 56;
    for (let n = Math.min(k, seen); n >= 1; n--) {
      for (let residue = 0; residue < 56; residue++) {
        dp[n][(residue + weight) % 56] += dp[n - 1][residue];
      }
    }
  }
  return dp[k];
}

/**
 * All possible real F-transparent key clocks for ciphertext-minus-key
 * modulo 29. A source plaintext F emits ciphertext F consuming no key;
 * ciphertext F may alternatively represent encrypted plaintext non-F.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @returns {{ failAt:number|null, endClocks:number[] }}
 */
function feasible(cipher, key) {
  let clocks = new Set([0]);
  for (let offset = 0; offset < cipher.length; offset++) {
    const next = new Set();
    for (const clock of clocks) {
      const k = key[clock % key.length];
      if (cipher[offset] === 0) next.add(clock);
      if ((cipher[offset] - k + 29) % 29 !== 0) next.add(clock + 1);
    }
    if (!next.size) return { failAt: offset, endClocks: [] };
    clocks = next;
  }
  return { failAt: null, endClocks: [...clocks].sort((a, b) => a - b) };
}

/** @param {number[]} plain @param {number[]} key */
function plant(plain, key) {
  const encrypted = [];
  let clock = 0;
  for (const p of plain) {
    if (p === 0) encrypted.push(0);
    else encrypted.push((p + key[clock++ % key.length]) % 29);
  }
  return { encrypted, clock };
}

// Independently selected origin objects: p3/p39's only two isolated red119 triads.
const triad3 = redAt(3, 119), triad39 = redAt(39, 119);
assert.deepEqual(triad3, [13, 23, 2]); // P,D,TH
assert.deepEqual(triad39, [27, 5, 15]); // IA,C,S
assert.equal(primeSum(triad3), 137); // the 33rd prime
assert.equal(primeSum(triad39), 173); // the 40th prime

// The same weights are one-based rune offsets on the original addressed pages.
const addressed33 = wordAt(33, 136);
const addressed40 = wordAt(40, 172);
assert.equal(addressed33.start, 136);
assert.equal(addressed40.start, 171); // F precedes the selected D
assert.deepEqual(addressed33.indices, [16, 11]); // T,J
assert.deepEqual(addressed40.indices, [0, 23, 4, 28, 6]); // F,D,R,EA,G
assert.equal(primeSum(addressed33.indices), 96);
assert.equal(primeSum(addressed40.indices), 228);
assert.equal(primeSum(addressed33.indices) % 56, 40); // 40th page, p39
assert.equal(primeSum(addressed40.indices) % 56, 4); // 4th page, p3

// Conditional readout p3 -> p33 -> p39 -> p40 -> p3: 3+2+3+5=13 runes.
// The independently printed p0 red heading has exactly 13 runes.
const key = [...triad3, ...addressed33.indices, ...triad39, ...addressed40.indices];
const p0heading = redAt(0, 0);
assert.equal(key.length, p0heading.length);
assert.equal(key.length, 13);

// Source-fixed direct Vigenere candidate: keys are actual GP29 rune indices.
// The historical plaintext-F key skip is exhaustive; no fitted phase.
const originalP0 = feasible(page(0), key);
assert.equal(originalP0.failAt, 57);
const nativePlant = plant(page(57), key);
const checkedPlant = feasible(nativePlant.encrypted, key);
assert.equal(checkedPlant.failAt, null);
assert.ok(checkedPlant.endClocks.includes(nativePlant.clock));

const p33 = residueCounts(page(33), 2);
const p40 = residueCounts(page(40), 5);
const count33 = p33.reduce((a, b) => a + b, 0);
const count40 = p40.reduce((a, b) => a + b, 0);
assert.equal(count33, 22791);
assert.equal(count40, 5247527901);
assert.equal(p33[40], 583);
assert.equal(p40[4], 35693380);
assert.ok(p33.every(Number.isSafeInteger));
assert.ok(p40.every(Number.isSafeInteger));

console.log(JSON.stringify({
  source: 'resources/liber-primus/{lp2-corpus.json,lp2-transcription.txt,lp2-ink-annotations.json}',
  sourceRedTriads: [
    { page: 3, offset: 119, spell: spell(triad3), primeSum: 137, primeOrdinalPageLabel: 33 },
    { page: 39, offset: 119, spell: spell(triad39), primeSum: 173, primeOrdinalPageLabel: 40 }
  ],
  addressedWords: [
    { page: 33, offset: 136, start: 136, spell: spell(addressed33.indices), primeSum: 96, modulo56: 40, proposedOneBasedPage: 40, zeroBasedDestination: 39 },
    { page: 40, offset: 172, start: 171, spell: spell(addressed40.indices), primeSum: 228, modulo56: 4, proposedOneBasedPage: 4, zeroBasedDestination: 3 }
  ],
  caution: 'Prime ordinals treated as zero-based page labels, word residues as one-based page ordinals: not an authenticated common rule',
  exactInventoryNull: {
    page33: { targetHits: p33[40], all: count33, probability: p33[40] / count33 },
    page40: { targetHits: p40[4], all: count40, probability: p40[4] / count40 },
    conditionalJoint: p33[40] / count33 * p40[4] / count40,
    discoveryWideSignificance: 'not established, route selected retrospectively'
  },
  proposedDirectKey: { spell: spell(key), length: key.length, p0HeadingLength: p0heading.length },
  sourceNativePlant: { runes: 95, recoveredClock: nativePlant.clock },
  originalP0: { runes: page(0).length, exhaustiveStrictFInverseImpossibleAt: originalP0.failAt },
  newUnknownPlaintext: false
}, null, 2));

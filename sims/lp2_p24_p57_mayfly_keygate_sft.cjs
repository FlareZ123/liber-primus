/**
 * Original-source mayfly artwork bridge: LP2 page 24 -> known page 57.
 * Node.js 22, standalone reproducible test, repository-root corpus required.
 * Run with: node sims/lp2_p24_p57_mayfly_keygate_sft.cjs
 *
 * All operations apply to original 29-rune indices; no transcription edits.
 * Outputs are observations and cannot authenticate a new decoder by themselves.
 */
'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const corpus = JSON.parse(readFileSync(resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const page24 = corpus.pages[24];
const page57 = corpus.pages[57];
assert.equal(page24.page, 24);
assert.equal(page24.status, 'unsolved');
assert.equal(page24.runic_count, 270);
assert.equal(page57.page, 57);
assert.equal(page57.status, 'solved');
assert.equal(page57.runic_count, 95);
assert.equal(corpus.translit.length, 29);

/** @param {number} x @param {number} n @returns {number} */
function wrap(x, n) { return ((x % n) + n) % n; }

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const value of symbols) counts[value] += 1;
  return 29 * counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number[]} data @param {number[]} key @param {number} sign @returns {number[]} */
function additive(data, key, sign) {
  return data.map((value, index) => wrap(value + sign * key[index % key.length], 29));
}

/**
 * A known-plaintext crib fixes a full period of a proposed additive pad.
 * The 95-rune crib is therefore excluded from the holdout score.
 * @param {number[]} unknown Original source ciphertext
 * @param {number[]} crib Known solved symbols
 * @param {'start'|'end'} anchor
 * @returns {{recovered:number[],heldout:number[],period:number[],start:number}}
 */
function anchoredPad(unknown, crib, anchor) {
  const start = anchor === 'start' ? 0 : unknown.length - crib.length;
  const period = crib.map((known, i) => wrap(unknown[start + i] - known, 29));
  const recovered = unknown.map((value, i) => wrap(value - period[wrap(i - start, period.length)], 29));
  const heldout = [...recovered.slice(0, start), ...recovered.slice(start + crib.length)];
  assert.deepEqual(recovered.slice(start, start + crib.length), crib);
  return { recovered, heldout, period, start };
}

/** @param {number[]} values @returns {string} */
function transliterate(values) { return values.map(v => corpus.translit[v]).join(''); }

const source = page24.indices;
const solved = page57.indices;
const donors = [
  ['clear GP ordinal', solved],
  ['clear GP prime mod29', solved.map(i => corpus.prime[i] % 29)],
];
console.log('[SOURCE] LP2 p24 physical 41.jpg, 270 unknown runes, paired insect images');
console.log('[SOURCE] LP2 p57 physical 74.jpg, 95 clear runes, mayfly Dissolve artwork');
console.log('[CONTROL] Source ciphertext p24 IoC', ioc(source).toFixed(6));
console.log('[CONTROL] Authentic clear GP p57 IoC', ioc(solved).toFixed(6));

let directMax = 0;
for (const [name, sequence] of donors) {
  for (const direction of ['forward', 'reverse']) {
    const key = direction === 'forward' ? sequence : [...sequence].reverse();
    for (const sign of [-1, 1]) {
      const candidate = additive(source, key, sign);
      const score = ioc(candidate);
      directMax = Math.max(directMax, score);
      console.log('[DIRECT]', name, direction, 'sign', sign,
        'IoC', score.toFixed(6), 'prefix', transliterate(candidate.slice(0, 45)));
    }
  }
}

let cribMax = 0;
for (const direction of ['forward', 'reverse']) {
  const crib = direction === 'forward' ? solved : [...solved].reverse();
  for (const anchor of ['start', 'end']) {
    const experiment = anchoredPad(source, crib, anchor);
    assert.equal(experiment.heldout.length, 175);
    const score = ioc(experiment.heldout);
    cribMax = Math.max(cribMax, score);
    console.log('[KNOWN-CRIB]', direction, anchor, 'crib', crib.length,
      'heldout', experiment.heldout.length, 'heldout IoC', score.toFixed(6),
      'heldout prefix', transliterate(experiment.heldout.slice(0, 45)));
  }
}

/**
 * Exact historical plaintext-F-transparent decoder feasibility:
 * plaintext 0 produces ciphertext 0 without consuming a key.
 * A non-F plaintext consumes one key symbol. A ciphertext F is ambiguous.
 * This DP preserves ALL genuine possibilities; no language model is involved.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} sign
 * @returns {{feasible:boolean, maximumPrefix:number, finalStates:number, peakStates:number}}
 */
function fTransparentFeasibility(ciphertext, key, sign) {
  let positions = new Set([0]);
  let peakStates = 1;
  for (let i = 0; i < ciphertext.length; i += 1) {
    const next = new Set();
    for (const keyPosition of positions) {
      const plain = wrap(ciphertext[i] - sign * key[keyPosition % key.length], 29);
      if (plain !== 0) next.add(keyPosition + 1);
      if (ciphertext[i] === 0) next.add(keyPosition);
    }
    positions = next;
    peakStates = Math.max(peakStates, positions.size);
    if (!positions.size) {
      return { feasible: false, maximumPrefix: i, finalStates: 0, peakStates };
    }
  }
  return { feasible: true, maximumPrefix: ciphertext.length, finalStates: positions.size, peakStates };
}

/**
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function fTransparentEncrypt(plaintext, key, sign) {
  let keyPosition = 0;
  return plaintext.map(plain => {
    if (plain === 0) return 0;
    const cipher = wrap(plain + sign * key[keyPosition % key.length], 29);
    keyPosition += 1;
    return cipher;
  });
}

let longestFTransparentPrefix = 0;
for (const [name, sequence] of donors) {
  for (const direction of ['forward', 'reverse']) {
    const key = direction === 'forward' ? sequence : [...sequence].reverse();
    for (const sign of [-1, 1]) {
      const gate = fTransparentFeasibility(source, key, sign);
      longestFTransparentPrefix = Math.max(longestFTransparentPrefix, gate.maximumPrefix);
      assert.equal(gate.feasible, false);
      console.log('[F-SKIP]', name, direction, 'sign', sign,
        'maximum legal prefix', gate.maximumPrefix, 'of', source.length,
        'peak concurrent histories', gate.peakStates);
    }
  }
}

/**
 * Every cyclic phase of the complete source-defined 95-rune donor is checked.
 * Paths preserve the plaintext and key position separately; histories that
 * merge to the same clock state are not silently discarded.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @param {number} start
 * @returns {number[][]}
 */
function fTransparentFullPaths(cipher, key, sign, start) {
  let histories = [{ clock: start, plain: [] }];
  for (const symbol of cipher) {
    const next = [];
    for (const history of histories) {
      const ordinary = wrap(symbol - sign * key[history.clock % key.length], 29);
      if (ordinary !== 0) {
        next.push({ clock: history.clock + 1, plain: [...history.plain, ordinary] });
      }
      if (symbol === 0) {
        next.push({ clock: history.clock, plain: [...history.plain, 0] });
      }
    }
    histories = next;
    if (!histories.length) break;
  }
  return histories.map(history => history.plain).filter(plain => plain.length === cipher.length);
}

let legalSourceKeyPhases = 0;
let legalSourcePaths = 0;
let maximalLegalPlainIoC = 0;
for (const [name, sequence] of donors) {
  for (const direction of ['forward', 'reverse']) {
    const key = direction === 'forward' ? sequence : [...sequence].reverse();
    for (const sign of [-1, 1]) {
      let viablePhases = 0;
      let viablePaths = 0;
      let high = 0;
      for (let phase = 0; phase < key.length; phase += 1) {
        const paths = fTransparentFullPaths(source, key, sign, phase);
        if (paths.length) viablePhases += 1;
        viablePaths += paths.length;
        for (const plain of paths) high = Math.max(high, ioc(plain));
      }
      legalSourceKeyPhases += viablePhases;
      legalSourcePaths += viablePaths;
      maximalLegalPlainIoC = Math.max(maximalLegalPlainIoC, high);
      console.log('[ALL-PHASE-F-SKIP]', name, direction, 'sign', sign,
        'viable of 95 phases', viablePhases, 'complete histories', viablePaths,
        'maximum normalized IoC', high.toFixed(6));
    }
  }
}
assert.equal(legalSourceKeyPhases, 18);
assert.equal(legalSourcePaths, 89);
assert.ok(maximalLegalPlainIoC < 1.06);
console.log('[ALL-PHASE-F-SKIP] exact full source-p57 donor phases 760,',
  'viable phases', legalSourceKeyPhases, 'complete histories', legalSourcePaths,
  'max normalized IoC', maximalLegalPlainIoC.toFixed(6));

const transparentPlant = fTransparentEncrypt(
  Array.from({ length: source.length }, (_, i) => i % 11 === 0 ? 0 : solved[(i + 17) % solved.length] || 1),
  solved,
  1
);
const transparentPositive = fTransparentFeasibility(transparentPlant, solved, 1);
assert.equal(transparentPositive.feasible, true);
assert.equal(transparentPositive.maximumPrefix, source.length);
assert.equal(longestFTransparentPrefix, 202);
console.log('[PLANT] historical literal-F skip-aware positive 270/270 PASS');

// Deterministic native-GP planted controls exercise both actual inversion paths.
const pad = Array.from({ length: solved.length }, (_, i) => wrap(i * i + 7 * i + 11, 29));
const englishPlant = Array.from({ length: source.length }, (_, i) => solved[(i + 17) % solved.length]);
const ciphertextPlant = englishPlant.map((value, i) => wrap(value + pad[i % pad.length], 29));
assert.deepEqual(additive(ciphertextPlant, pad, -1), englishPlant);
const plantedCrib = anchoredPad(ciphertextPlant, englishPlant.slice(0, solved.length), 'start');
assert.deepEqual(plantedCrib.recovered, englishPlant);
console.log('[PLANT] full 270/270 direct inverse and 175/175 heldout-period recovery PASS');

// This is a scoped native-rune IoC gate, not a universal bound on the plaintext language.
assert.ok(directMax < 1.25);
assert.ok(cribMax < 1.25);
console.log('[VERDICT] All original direct and period95-crib receivers remain near uniform;',
  'no recovered LP2 p24 plaintext, and no source-selected non-additive receiver.');

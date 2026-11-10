'use strict';

/**
 * Original-source ten-dot bridge test for the authentic p56 prime-totient
 * GP29 cipher, with source-sized clock-transfer alternatives.
 *
 * Source-only hypothesis: transfer the independently solved p56 output law
 * to the 66+92 original ciphertext runes on physical LP2 pp49/51, where
 * a ten-dot punctuation marker introduces a 256-byte numerical table.
 * The candidate changes to the prime clock are 0 (solved-page precedent),
 * 10 (printed dot count), and 256 (printed table bytes).
 *
 * Any skipped key step must be literal GP-F: ciphertext and plaintext
 * index zero, preserving the prime cursor. All possible F-skip masks are
 * enumerated. A decoded non-skipped plaintext F is forbidden by this law.
 *
 * Exact original feasibility, not reencryption alone, is the invariant.
 * Training prose is Emerson, evaluated original controls are Gibran.
 * No original LP2 plaintext or authentic key is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} location */
function readJson(location) {
  return JSON.parse(fs.readFileSync(path.join(root, location), 'utf8'));
}
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const ink = readJson('resources/liber-primus/lp2-ink-annotations.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const page = n => corpus.pages.find(p => p.page === n).indices;
const marks = n => ink.pages.find(p => p.page === n).large_punctuation;
const bridge = page(49).concat(page(51));
assert.equal(page(49).length, 66);
assert.equal(page(50).length, 0);
assert.equal(page(51).length, 92);
assert.equal(bridge.length, 158);
assert.equal(grid.bytes.length, 256);
assert.deepEqual(marks(49), [[66, 10, 'red']]);
assert.deepEqual(marks(56), [
  [5, 13, 'red'], [45, 10, 'red'], [85, 13, 'red']
]);
const alphabet = corpus.translit;
const sym = new Map(alphabet.map((s, i) => [s, i]));
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} amount @returns {number[]} */
function firstPrimes(amount) {
  const values = [];
  for (let n = 2; values.length < amount; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) values.push(n);
  }
  return values;
}
const primes = firstPrimes(500);
const key = cursor => (primes[cursor] - 1) % 29;

/**
 * Native GP spelling used in existing corpus tests; multi-letter GP
 * glyphs are single indices and historical V/K spell as U/C.
 * @param {string} text
 * @returns {number[]}
 */
function gpEncode(text) {
  const output = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (sym.has(pair)) {
        output.push(sym.get(pair));
        i += 2;
      } else {
        if (sym.has(word[i])) output.push(sym.get(word[i]));
        i++;
      }
    }
  }
  return output;
}

/**
 * A bridge mask bit is an F-skip decision at the corresponding C=F
 * occurrence, not a free edit at an arbitrary position.
 * @param {number[]} cipher
 * @param {number[]} fSites
 * @param {number} mask
 * @param {number} tableAdvance
 * @returns {{plain:number[], incompatible:number, counter:number}}
 */
function invert(cipher, fSites, mask, tableAdvance) {
  let counter = 0, incompatible = 0;
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    if (i === 66) counter += tableAdvance;
    const fBit = fSites.indexOf(i);
    if (fBit >= 0 && (mask & (1 << fBit))) {
      assert.equal(cipher[i], 0);
      plain.push(0);
    } else {
      const decoded = mod(cipher[i] - key(counter++));
      if (decoded === 0) incompatible++;
      plain.push(decoded);
    }
  }
  return { plain, incompatible, counter };
}

/**
 * @param {number[]} cipher
 * @param {number} advance
 */
function exhaustive(cipher, advance) {
  const fSites = cipher.flatMap((v, i) => v === 0 ? [i] : []);
  const cases = [];
  for (let mask = 0; mask < (1 << fSites.length); mask++) {
    cases.push({ mask, ...invert(cipher, fSites, mask, advance) });
  }
  const min = Math.min(...cases.map(x => x.incompatible));
  return { fSites, min, valid: cases.filter(x => x.incompatible === 0) };
}

/** @param {number[]} input @returns {number} */
function indexOfCoincidence(input) {
  const histogram = Array(29).fill(0);
  for (const v of input) histogram[v]++;
  return histogram.reduce((sum, v) => sum + v * (v - 1), 0)
    / (input.length * (input.length - 1));
}

/**
 * Uses disjoint-source native GP prose to avoid judging a planted-text
 * reference on the same book from which the language model was fitted.
 * @param {number[]} training
 */
function trigramScore(training) {
  const hist = new Uint32Array(29 ** 3);
  for (let i = 2; i < training.length; i++) {
    hist[841 * training[i - 2] + 29 * training[i - 1] + training[i]]++;
  }
  return input => {
    let score = 0;
    for (let i = 2; i < input.length; i++) {
      const index = 841 * input[i - 2] + 29 * input[i - 1] + input[i];
      score += Math.log((hist[index] + 0.1)
        / (training.length - 2 + 0.1 * 29 ** 3));
    }
    return score / (input.length - 2);
  };
}

/**
 * Native GP plant with fixed allowed F semantics.
 * @param {number[]} plain
 * @param {number} advance
 * @returns {number[]}
 */
function encryptNative(plain, advance) {
  let counter = 0;
  return plain.map((p, i) => {
    if (i === 66) counter += advance;
    return p === 0 ? 0 : mod(p + key(counter++));
  });
}

/** @param {number[]} sequence @returns {number} */
function earliestImpossible(sequence) {
  let states = new Set([0]);
  for (let i = 0; i < sequence.length; i++) {
    const next = new Set();
    for (const cursor of states) {
      if (sequence[i] === 0) next.add(cursor);
      if (sequence[i] !== key(cursor)) next.add(cursor + 1);
    }
    if (next.size === 0) return i;
    states = next;
  }
  return -1;
}

function main() {
  const solvedText = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO '
    + 'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
  const expected = gpEncode(solvedText);
  const solved = page(56);
  assert.equal(solved.length, 85);
  assert.equal(expected.length, 85);
  let counter = 0;
  const recovered = solved.map((value, i) =>
    i === 56 ? 0 : mod(value - key(counter++)));
  assert.deepEqual(recovered, expected);
  assert.equal(counter, 84);

  const fSites = bridge.flatMap((v, i) => v === 0 ? [i] : []);
  assert.deepEqual(fSites, [3, 33, 69, 123, 126, 157]);
  const train = gpEncode(fs.readFileSync(path.join(root,
    'resources/control/emerson_essays_2944.txt'), 'utf8'));
  const controls = gpEncode(fs.readFileSync(path.join(root,
    'resources/control/gibran_prophet_58585.txt'), 'utf8'));
  const score = trigramScore(train);
  const nativeScores = [];
  for (let i = 0; i + 158 <= controls.length; i += 158) {
    nativeScores.push(score(controls.slice(i, i + 158)));
  }
  const nativeMinimum = Math.min(...nativeScores);

  const outcome = [];
  for (const advance of [0, 10, 256]) {
    const t = exhaustive(bridge, advance);
    const cases = t.valid.map(x => ({
      mask: x.mask,
      incompatibilities: x.incompatible,
      score: score(x.plain),
      ioc: indexOfCoincidence(x.plain)
    }));
    const plant = controls.slice(0, 158);
    const encoded = encryptNative(plant, advance);
    assert.equal(exhaustive(encoded, advance).min, 0);
    assert.deepEqual(plant, (() => {
      // A seeded positive-plant inverse uses the known genuine F semantics.
      const mask = encoded.flatMap((v, i) =>
        v === 0 && plant[i] === 0 ? [i] : []);
      return invert(encoded, encoded.flatMap((v, i) =>
        v === 0 ? [i] : []),
        encoded.flatMap((v, i) => v === 0 ? [i] : [])
          .reduce((bits, index, j) =>
            bits | (mask.includes(index) ? 1 << j : 0), 0),
        advance).plain;
    })());
    outcome.push({ tableAdvance: advance, minIncompatibleEmissions: t.min,
      zeroCostMasks: cases, nativePlantRecoveredExactly: true });
  }
  assert.equal(outcome[0].minIncompatibleEmissions, 1);
  assert.equal(outcome[0].zeroCostMasks.length, 0);
  assert.deepEqual(outcome[1].zeroCostMasks.map(x => x.mask), [31, 63]);
  assert.deepEqual(outcome[2].zeroCostMasks.map(x => x.mask), [19, 51]);
  assert.equal(earliestImpossible(bridge), 102);
  assert.equal(bridge[102], 18);

  const zeroCostAdvances = [];
  for (let advance = 0; advance <= 256; advance++) {
    if (exhaustive(bridge, advance).min === 0) zeroCostAdvances.push(advance);
  }
  assert.equal(zeroCostAdvances.length, 51);
  const bestOriginal = Math.max(...outcome.flatMap(r =>
    r.zeroCostMasks.map(x => x.score)));
  assert(bestOriginal < nativeMinimum - 1);
  const summary = {
    source: {bridgeRunes: 158, preTable: 66, afterTable: 92,
      tableBytes: 256, sourceTenDots: 10, bookStart: 12048,
      firstAfterTable: 12114, firstZeroAdvanceFailure: {
        bridgeOffset: 102, page: 51, pageLocalOffset: 36,
        cipherGP: 18, keyGP: 18
      }},
    authenticPositiveControl: {solvedP56Runes: 85,
      recoveredExact: true, genuineFSkipAt: 56},
    originalRawTrigramScore: score(bridge),
    nativeGibran158MinTrigramScore: nativeMinimum,
    outcome,
    allAdvancesZeroCost: {
      tested: 257, zeroCost: zeroCostAdvances.length,
      values: zeroCostAdvances
    },
    verdict: 'bounded original-input negative; source-sized shifts survive '
      + 'literal-F feasibility but no original plaintext is recovered'
  };
  console.log(JSON.stringify(summary, null, 2));
}
if (require.main === module) main();
module.exports = { main };

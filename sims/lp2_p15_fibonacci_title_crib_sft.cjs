'use strict';

/**
 * Source-anchored nine-rune FIBONACCI title crib on original LP2 p15.
 * This is a test of an explicit *hypothesis*, not a claimed recovered title.
 * Run: node sims/lp2_p15_fibonacci_title_crib_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const pages = corpus.pages.slice(15, 23);
assert.deepEqual(pages.map(p => p.page), [15, 16, 17, 18, 19, 20, 21, 22]);
assert.deepEqual(pages.map(p => p.indices.length), [159, 267, 273, 260, 271, 269, 273, 131]);

const gp = new Map(corpus.translit.map((glyph, i) => [glyph, i]));
const source = pages[0].indices.slice(0, 9);
assert.deepEqual(source, [0, 1, 20, 19, 24, 28, 26, 22, 24]);
const title = [...'FIBONACCI'].map(glyph => gp.get(glyph));
assert.deepEqual(title, [0, 10, 17, 3, 9, 24, 5, 5, 10]);

const mod29 = n => ((n % 29) + 29) % 29;
const initialKey9 = source.map((c, i) => mod29(c - title[i]));
const fSkippedKey8 = initialKey9.slice(1);
assert.deepEqual(initialKey9, [0, 20, 3, 16, 15, 4, 21, 17, 14]);
assert.deepEqual(fSkippedKey8, [20, 3, 16, 15, 4, 21, 17, 14]);

/**
 * If a plaintext F emits ciphertext F without advancing the key, a
 * non-F ciphertext c must decrypt to a non-F plaintext under K[phase].
 * The set of phases is tracked exactly, including BOTH interpretations
 * of a ciphertext F. Pages are independently restarted only as stated.
 *
 * @param {number[]} ciphertext
 * @param {number[]} startPhases
 * @returns {{failure: number|null, survivors: number[]}}
 */
function fBypassFeasibility(ciphertext, startPhases) {
  let phases = new Set(startPhases);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const next = new Set();
    for (const phase of phases) {
      const k = fSkippedKey8[phase];
      if (c === 0) {
        next.add(phase); // plaintext F, no key consumption
        if (k !== 0) next.add((phase + 1) % 8); // normal non-F plaintext
      } else if (c !== k) {
        next.add((phase + 1) % 8);
      }
    }
    phases = next;
    if (!phases.size) return {failure: i, survivors: []};
  }
  return {failure: null, survivors: [...phases]};
}

/**
 * @param {number[]} runes
 * @returns {number}
 */
function coincidence(runes) {
  const counts = new Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}

/**
 * @param {number[]} ciphertext
 * @param {'plain'|'cipher'} mode
 * @returns {number[]}
 */
function autokeyDecode(ciphertext, mode) {
  const output = title.slice();
  for (let i = 9; i < ciphertext.length; i++) {
    const keyRune = mode === 'plain' ? output[i - 9] : ciphertext[i - 9];
    output.push(mod29(ciphertext[i] - keyRune));
  }
  return output;
}

/**
 * @param {number[]} plain
 * @param {'plain'|'cipher'} mode
 * @returns {number[]}
 */
function autokeyEncode(plain, mode) {
  const output = source.slice();
  for (let i = 9; i < plain.length; i++) {
    const keyRune = mode === 'plain' ? plain[i - 9] : output[i - 9];
    output.push(mod29(plain[i] + keyRune));
  }
  return output;
}

const original = pages.flatMap(page => page.indices);
assert.equal(original.length, 1903);
assert.deepEqual(autokeyEncode(autokeyDecode(original, 'plain'), 'plain'), original);
assert.deepEqual(autokeyEncode(autokeyDecode(original, 'cipher'), 'cipher'), original);

const p15Continuation = fBypassFeasibility(pages[0].indices.slice(9), [0]);
assert.equal(p15Continuation.failure, 0);
assert.equal(pages[0].indices[9], fSkippedKey8[0]);

const pageFailures = pages.slice(1).map(page => {
  const afterIV = fBypassFeasibility(page.indices.slice(1), [0,1,2,3,4,5,6,7]);
  assert.notEqual(afterIV.failure, null);
  return {page: page.page, firstImpossibleRune: afterIV.failure + 1};
});
assert.deepEqual(pageFailures.map(x => x.firstImpossibleRune),
  [66, 96, 161, 92, 156, 192, 108]);

// Positive synthetic control: encode the exact solved p57 GP29 runes under
// the derived eight-rune key, honoring transparent plaintext F.
const native = corpus.pages[57].indices;
let phase = 0;
const planted = [];
for (const p of native) {
  if (p === 0) planted.push(0);
  else {
    planted.push(mod29(p + fSkippedKey8[phase]));
    phase = (phase + 1) % 8;
  }
}
assert.equal(fBypassFeasibility(planted, [0]).failure, null);
for (const mode of ['plain', 'cipher']) {
  const plantPlain = title.concat(native);
  const plantCipher = autokeyEncode(plantPlain, mode);
  assert.deepEqual(autokeyDecode(plantCipher, mode), plantPlain);
}

const statistics = {
  candidateTitle: 'FIBONACCI',
  originalNineRunes: source.map(i => corpus.translit[i]).join(' '),
  inferredNineKey: initialKey9.map(i => corpus.translit[i]).join(' '),
  inferredPostFKey: fSkippedKey8.map(i => corpus.translit[i]).join(' '),
  originalRemainderIoC: coincidence(original.slice(9)),
  plaintextAutokeyIoC: coincidence(autokeyDecode(original, 'plain').slice(9)),
  ciphertextAutokeyIoC: coincidence(autokeyDecode(original, 'cipher').slice(9)),
  solvedP57NativeIoC: coincidence(native),
  p15FirstImpossibleRune: p15Continuation.failure + 9,
  pageFailures
};
assert(Math.abs(statistics.originalRemainderIoC - 0.034494896163322776) < 1e-12);
assert(Math.abs(statistics.plaintextAutokeyIoC - 0.03450326356593039) < 1e-12);
assert(Math.abs(statistics.ciphertextAutokeyIoC - 0.03446923612865942) < 1e-12);
console.log(JSON.stringify(statistics, null, 2));

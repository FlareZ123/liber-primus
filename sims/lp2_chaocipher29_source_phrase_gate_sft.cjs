'use strict';
// Pre-May-2014 Chaocipher mechanism gate, extended experimentally to 29 symbols.
// Historical source: Moshe Rubin, Chaocipher Revealed (2010);
// 26-letter reference implementation: kanaka/chaocipher (2010), LGPL-3.0.
// This is a clean, independently written CJS implementation.
// The n=29 midpoint at index 14 and the two solved-p57 phrase keys
// are explicit, TESTED CONJECTURES, not authenticated LP2 instructions.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
/** @param {string} name Relative repository file. */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}
/** @param {string} content UTF-8 source content. */
function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}
const corpusText = read('resources/liber-primus/lp2-corpus.json');
const controlText = read('resources/control/shakespeare_first300k.txt');
const corpus = JSON.parse(corpusText);
const pages = corpus.pages.filter(p => p.page <= 55);
const original = pages.flatMap(p => p.indices);
assert.equal(pages.length, 56);
assert.equal(original.length, 12956);
const GP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const letterIndex = {
  A: 24, B: 17, C: 5, D: 23, E: 18, F: 0, G: 6, H: 8,
  I: 10, J: 11, K: 5, L: 20, M: 19, N: 9, O: 3, P: 13,
  Q: 5, R: 4, S: 15, T: 16, U: 1, V: 1, W: 7, X: 14,
  Y: 26, Z: 15
};
const digraph = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28 };

/** GP29-normalize ordinary English; aliases are explicitly declared above.
 * @param {string} text English text.
 * @returns {number[]} GP29 rune indices.
 */
function encodeEnglish(text) {
  const chars = text.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < chars.length; i++) {
    const pair = digraph[chars.slice(i, i + 2)];
    if (pair !== undefined) {
      out.push(pair);
      i++;
    } else {
      out.push(letterIndex[chars[i]]);
    }
  }
  return out;
}

/** A keyed alphabet: unique letters of the phrase then remaining GP indices.
 * @param {string} phrase Original solved p57 phrase.
 * @returns {number[]} A 29-index permutation.
 */
function phraseAlphabet(phrase) {
  const head = [...phrase.toUpperCase()].map(letter => letterIndex[letter]);
  assert.ok(head.every(i => Number.isInteger(i)));
  return [...new Set([...head, ...Array.from({ length: 29 }, (_, i) => i)])];
}

/**
 * Apply the actual Chaocipher disk permutation rule with an explicitly
 * experimental n=29 midpoint, or the historical n=26 midpoint.
 * Symbols must be 0..n-1 and each alphabet an n-symbol permutation.
 * @param {number[]} source Cipher or plaintext sequence.
 * @param {number[]} initialLeft Cipher disk.
 * @param {number[]} initialRight Plain disk.
 * @param {boolean} decrypt True to decrypt.
 * @param {number} nadir 13 for original 26; 14 for experimental 29.
 * @returns {number[]} Complete lossless transform.
 */
function chaocipher(source, initialLeft, initialRight, decrypt, nadir) {
  const n = initialLeft.length;
  assert.equal(initialRight.length, n);
  assert.equal(new Set(initialLeft).size, n);
  assert.equal(new Set(initialRight).size, n);
  let left = initialLeft.slice();
  let right = initialRight.slice();
  const output = [];
  for (let j = 0; j < source.length; j++) {
    const i = (decrypt ? left : right).indexOf(source[j]);
    assert.ok(i >= 0, 'Input alphabet miss');
    output.push((decrypt ? right : left)[i]);

    left = left.slice(i).concat(left.slice(0, i));
    const leftExtract = left.splice(1, 1)[0];
    left.splice(nadir, 0, leftExtract);
    right = right.slice(i + 1).concat(right.slice(0, i + 1));
    const rightExtract = right.splice(2, 1)[0];
    right.splice(nadir, 0, rightExtract);
  }
  return output;
}
/** @param {number[]} xs A sequence of symbols. */
function indexOfCoincidence(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((acc, count) => acc + count * (count - 1), 0) /
    (xs.length * (xs.length - 1));
}
/** @param {number[]} xs A sequence of symbols. */
function adjacentRepeats(xs) {
  let n = 0;
  for (let i = 1; i < xs.length; i++) if (xs[i] === xs[i - 1]) n++;
  return n;
}
/** A smoothed GP29 quadgram model; train is fully distinct from holdout.
 * @param {number[]} training Training symbols.
 */
function scorer(training) {
  const counts = new Map();
  const encode = (a, b, c, d) => ((a * 29 + b) * 29 + c) * 29 + d;
  for (let i = 3; i < training.length; i++) {
    const key = encode(training[i - 3], training[i - 2], training[i - 1], training[i]);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const alpha = 0.1;
  const logDenom = Math.log(training.length - 3 + 29 ** 4 * alpha);
  return (xs) => {
    let score = 0;
    for (let i = 3; i < xs.length; i++) {
      const key = encode(xs[i - 3], xs[i - 2], xs[i - 1], xs[i]);
      score += Math.log((counts.get(key) || 0) + alpha) - logDenom;
    }
    return score / (xs.length - 3);
  };
}

// Historical n=26 published regression, not a made-up 29-symbol regression.
const AZ = [...GP];
const n26 = text => [...text].map(letter => GP.indexOf(letter));
const expected26 = 'OAHQHCNYNXTSZJRRHJBYHQKSOUJY';
const got26 = chaocipher(n26('WELLDONEISBETTERTHANWELLSAID'),
  n26('HXUCZVAMDSLKPEFJRIGTWOBNYQ'),
  n26('PTLNBQDEOYSFAVZKGJRIHWXUMC'), false, 13)
  .map(i => AZ[i]).join('');
assert.equal(got26, expected26);

// Frozen experimental LP2 candidate:
// left/outer disk = CIRCUMFERENCES, right/inner disk = DIVINITY,
// preserving GP29 order for all unsupplied rune indices; GP V -> U alias.
// The original publication does NOT specify a GP29 disk adaptation.
const left = phraseAlphabet('CIRCUMFERENCES');
const right = phraseAlphabet('DIVINITY');
assert.equal(left.length, 29);
assert.equal(right.length, 29);
const candidate = chaocipher(original, left, right, true, 14);
const candidateReset = pages.flatMap(p => chaocipher(p.indices, left, right, true, 14));
assert.deepEqual(chaocipher(candidate, left, right, false, 14), original);
for (const p of pages) {
  const restored = chaocipher(chaocipher(p.indices, left, right, true, 14),
    left, right, false, 14);
  assert.deepEqual(restored, p.indices);
}

// Authentically English plaintext planted through the complete 29 disk rule.
// A wrong initial wheel pair must NOT recover the planted plaintext.
const english = encodeEnglish(controlText);
assert.equal(english.length, 216874);
const plant = english.slice(0, 529);
const plantedCipher = chaocipher(plant, left, right, false, 14);
assert.deepEqual(chaocipher(plantedCipher, left, right, true, 14), plant);
const wrongLeft = right.slice();
const wrongRight = left.slice();
assert.notDeepEqual(chaocipher(plantedCipher, wrongLeft, wrongRight, true, 14), plant);

// Seventeen fixed, disjoint Shakespeare windows, no key fitting.
const controls = [];
for (let start = 0; start + original.length <= english.length; start += original.length) {
  const ct = chaocipher(english.slice(start, start + original.length),
    left, right, false, 14);
  controls.push({ start, repeats: adjacentRepeats(ct), ioc: indexOfCoincidence(ct) });
}
assert.equal(controls.length, 16);
const repeatMin = Math.min(...controls.map(c => c.repeats));
const repeatMax = Math.max(...controls.map(c => c.repeats));
assert.equal(repeatMin, 400);
assert.equal(repeatMax, 474);

const totalWithin = pages.reduce((count, p) => count + adjacentRepeats(p.indices), 0);
const transitions = pages.reduce((count, p) => count + Math.max(0, p.indices.length - 1), 0);
assert.equal(totalWithin, 86);
assert.equal(transitions, 12901);
const score4 = scorer(english.slice(0, 120000));
const hold = english.slice(122000, 122000 + original.length);
const comparison = {
  heldoutEnglish: score4(hold),
  originalCipher: score4(original),
  candidateContinuous: score4(candidate),
  candidatePageReset: score4(candidateReset),
  wrongSwappedDisks: score4(chaocipher(original, wrongLeft, wrongRight, true, 14)),
  wrongIdentityDisks: score4(chaocipher(original,
    Array.from({ length: 29 }, (_, i) => i),
    Array.from({ length: 29 }, (_, i) => i), true, 14))
};
assert.ok(comparison.heldoutEnglish > comparison.candidateContinuous + 3);
assert.ok(Math.abs(comparison.candidateContinuous - comparison.originalCipher) < 0.1);
console.log(JSON.stringify({
  source: {
    original: 'resources/liber-primus/lp2-corpus.json', originalSha256: sha256(corpusText),
    control: 'resources/control/shakespeare_first300k.txt',
    controlSha256: sha256(controlText),
    Chaocipher26Reference:
      'https://www.chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf'
  },
  historical26PublishedTest: { expected: expected26, actual: got26, pass: true },
  extension29: {
    provenance: 'EXPERIMENTAL 29-rune midpoint; no original Cicada instruction selects this adaptation',
    leftPhrase: 'CIRCUMFERENCES', rightPhrase: 'DIVINITY',
    left, right, nadirZeroBased: 14, reset: 'book-continuous and page-local independently'
  },
  original: {
    physicalPages: pages.length, runeBearingPages: pages.filter(p => p.indices.length).length,
    runes: original.length, withinPageTransitions: transitions,
    withinPageRepeats: totalWithin, originalIoC: indexOfCoincidence(original)
  },
  controls: {
    count: controls.length, repeatsRange: [repeatMin, repeatMax],
    startPositions: controls.map(x => x.start),
    repeatCounts: controls.map(x => x.repeats)
  },
  inversion: {
    continuousIoc: indexOfCoincidence(candidate),
    pageResetIoc: indexOfCoincidence(candidateReset),
    sourceCipherRoundTrip: true,
    syntheticCorrectKeyRecovery: true,
    wrongKeyPlaintextDiffers: true,
    first50DecodedGpIndices: candidate.slice(0, 50),
    first50DecodedGpTokens: candidate.slice(0, 50).map(i => corpus.translit[i])
  },
  quadgram: {
    trainSymbols: 120000, testSymbols: hold.length, laplaceAlpha: 0.1,
    averageNaturalLogPer4Gram: comparison
  },
  conclusion: 'One frozen Chaocipher-like GP29 source-phrase extension is negative. The named historical cipher uses 26 letters; neither the 29-rune extension nor wheel seeds are source-selected. Reencryption validates implementation, not a key.'
}, null, 2));

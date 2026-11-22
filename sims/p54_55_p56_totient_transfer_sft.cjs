#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const quadgramText = fs.readFileSync(path.join(root, 'resources/control/duko_round27_english_quadgrams.txt'), 'utf8');
const alphabet = corpus.translit;
const page = n => corpus.pages.find(item => item.page === n);
const p54 = page(54).indices, p55 = page(55).indices, p56 = page(56).indices;
const chapter = p54.concat(p55);
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);
assert.equal(chapter.length, 308);
assert.equal(p56.length, 85);
assert.equal(corpus.pages.slice(0, 54).reduce((sum, item) => sum + item.indices.length, 0), 12648);
assert.equal(12648 + p54.length, 12880);
assert.equal(12648 + chapter.length, 12956);
function toIndices(text) {
  const tokens = alphabet.map((token, index) => ({ token, index })).sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of text.split(' ')) for (let i = 0; i < word.length;) {
    const match = tokens.find(item => word.startsWith(item.token, i));
    assert.ok(match, 'no GP29 token at ' + word.slice(i));
    out.push(match.index); i += match.token.length;
  }
  return out;
}
function firstPrimes(n) {
  const out = [];
  for (let candidate = 2; out.length < n; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) if (candidate % divisor === 0) { prime = false; break; }
    if (prime) out.push(candidate);
  }
  return out;
}
const primes = firstPrimes(400);
function transform(input, mode, literalSkipPosition = null, direction = -1) {
  let keyIndex = 0;
  return input.map((rune, position) => {
    if (position === literalSkipPosition) return rune;
    const prime = primes[keyIndex++];
    const shift = mode === 'phi' ? prime - 1 : prime;
    return (rune + direction * shift + 29 * 100) % 29;
  });
}
function sha256(indices) { return crypto.createHash('sha256').update(Buffer.from(indices)).digest('hex'); }
const expectedWords = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const expected = toIndices(expectedWords);
const p56FPositions = p56.map((rune, i) => rune === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(p56FPositions, [35, 47, 51, 56, 74]);
assert.deepEqual(transform(p56, 'phi', 56, -1), expected, 'authentic solved-p56 positive control');
assert.deepEqual(transform(expected, 'phi', 56, 1), p56, 'p56 exact forward replay');
const chapterFPositions = chapter.map((rune, i) => rune === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(chapterFPositions, [41, 65, 195, 247, 257, 273]);
const phiOutput = transform(chapter, 'phi', null, -1);
const wrongPrimeOutput = transform(chapter, 'prime', null, -1);
assert.deepEqual(transform(phiOutput, 'phi', null, 1), chapter, 'p54–55 phi-prime forward replay');
assert.deepEqual(transform(wrongPrimeOutput, 'prime', null, 1), chapter, 'wrong-prime forward replay');
const quadgrams = new Map(); let total = 0;
for (const line of quadgramText.trim().split(/\r?\n/)) {
  const parts = line.trim().split(/\s+/); if (parts.length < 2) continue;
  const count = Number(parts[1]); quadgrams.set(parts[0], count); total += count;
}
function letters(indices) { return indices.map(index => alphabet[index]).join('').replace(/[^A-Z]/g, ''); }
function score(indices) {
  const text = letters(indices); let sum = 0, count = 0;
  for (let i = 0; i <= text.length - 4; i++) { sum += Math.log10((quadgrams.get(text.slice(i, i + 4)) || 0.01) / total); count++; }
  return { letters: text.length, quadgrams: count, mean_log10_per_quadgram: sum / count };
}
const rawScore = score(chapter), phiScore = score(phiOutput), wrongPrimeScore = score(wrongPrimeOutput), positiveScore = score(expected);
assert.ok(Math.abs(rawScore.mean_log10_per_quadgram - (-7.369764664465699)) < 1e-9);
assert.ok(Math.abs(phiScore.mean_log10_per_quadgram - (-7.429926327185952)) < 1e-9);
assert.ok(Math.abs(wrongPrimeScore.mean_log10_per_quadgram - (-7.383391129511332)) < 1e-9);
assert.ok(Math.abs(positiveScore.mean_log10_per_quadgram - (-4.461648582243903)) < 1e-9);
/**
 * Enumerate the strongest direct transfer of p56's one literal-F exception:
 * every subset of existing ciphertext F positions may be literal (no prime advance).
 * This grants unknown pages arbitrary F masks, without fitting key phases/signs.
 * @param {number[]} input @param {number[]} fPositions
 * @param {number} mask @param {-1|1} direction @returns {number[]}
 */
function transformWithFMask(input, fPositions, mask, direction) {
  let keyIndex = 0;
  return input.map((rune, position) => {
    const bit = fPositions.indexOf(position);
    if (bit !== -1 && (mask & (1 << bit))) {
      assert.equal(rune, 0, 'literal-F must remain F in both cipher and plaintext');
      return 0;
    }
    const shift = primes[keyIndex++] - 1;
    return (rune + direction * shift + 29 * 100) % 29;
  });
}
/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const frequencies = Array(29).fill(0);
  for (const rune of runes) frequencies[rune]++;
  return frequencies.reduce((acc, count) => acc + count * (count - 1), 0)
    / (runes.length * (runes.length - 1));
}
/** @param {number[]} input @param {number[]} fPositions */
function exhaustiveFMasks(input, fPositions) {
  const outcomes = [];
  for (let mask = 0; mask < 2 ** fPositions.length; mask++) {
    const decoded = transformWithFMask(input, fPositions, mask, -1);
    assert.deepEqual(transformWithFMask(decoded, fPositions, mask, 1), input,
      'original ciphertext must be exactly recoverable');
    outcomes.push({
      mask, literal_f_positions: fPositions.filter((_, bit) => mask & (1 << bit)),
      ioc: ioc(decoded),
      mean_log10_quadgram: score(decoded).mean_log10_per_quadgram
    });
  }
  return {
    models: outcomes.length,
    best_quadgram: outcomes.reduce((best, next) =>
      next.mean_log10_quadgram > best.mean_log10_quadgram ? next : best),
    best_ioc: outcomes.reduce((best, next) => next.ioc > best.ioc ? next : best)
  };
}
const p55FPositions = p55.map((rune, i) => rune === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(p55FPositions, [15, 25, 41]);
assert.deepEqual(transformWithFMask(p56, p56FPositions, 8, -1), expected,
  'one literal F among five must reconstruct every authentic solved p56 rune');
const chapterFMaskSweep = exhaustiveFMasks(chapter, chapterFPositions);
const p55FMaskSweep = exhaustiveFMasks(p55, p55FPositions);
assert.equal(chapterFMaskSweep.models, 64);
assert.equal(p55FMaskSweep.models, 8);
assert.equal(chapterFMaskSweep.best_quadgram.mask, 7);
assert.ok(Math.abs(chapterFMaskSweep.best_quadgram.mean_log10_quadgram
  - (-7.265646469961701)) < 1e-9);
assert.equal(chapterFMaskSweep.best_ioc.mask, 36);
assert.ok(Math.abs(chapterFMaskSweep.best_ioc.ioc - 0.037163162570328694) < 1e-12);
assert.equal(p55FMaskSweep.best_quadgram.mask, 0);
assert.ok(Math.abs(p55FMaskSweep.best_quadgram.mean_log10_quadgram
  - (-7.03622304333842)) < 1e-9);
assert.equal(p55FMaskSweep.best_ioc.mask, 2);
assert.ok(Math.abs(p55FMaskSweep.best_ioc.ioc - 0.03859649122807018) < 1e-12);
assert.ok(chapterFMaskSweep.best_quadgram.mean_log10_quadgram < -7.26);
assert.ok(p55FMaskSweep.best_quadgram.mean_log10_quadgram < -7.03);

console.log(JSON.stringify({
  source: 'original LP2 pp54–55, p54 local0 through p55 end',
  page_lengths: { p54: p54.length, p55: p55.length, p56_positive_control: p56.length },
  global_offsets: { p54_start: 12648, p55_start: 12880, p56_start: 12956 },
  chapter_runes: chapter.length, chapter_literal_F_positions: chapterFPositions,
  operation: 'P[i] = C[i] - (prime[i] - 1) mod 29; prime clock starts at 2 at p54 local0 and runs continuously across p55; no F skips',
  input_sha256: sha256(chapter), phi_output_sha256: sha256(phiOutput),
  raw_score: rawScore, phi_prime_subtraction_score: phiScore,
  wrong_prime_subtraction_control: wrongPrimeScore, authentic_p56_positive_control: positiveScore,
  phi_output_prefix: letters(phiOutput).slice(0, 120),
  original_f_mask_gates: {
    complete_p54_p55_visual_chapter: chapterFMaskSweep,
    p55_page_local: p55FMaskSweep,
    authentic_p56_plaintext_ioc: ioc(expected),
    p55_cipher_f_positions: p55FPositions
  },
  status: 'NEGATIVE: fixed p56 phi(prime) transfer does not produce readable plaintext'
}, null, 2));

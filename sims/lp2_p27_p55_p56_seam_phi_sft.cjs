#!/usr/bin/env node
'use strict';
/**
 * SFT: original LP2 p27 / p55→p56 seven-rune seam and two frozen p56-key transfers.
 * All inputs come from the canonical source corpus and existing quadgram control.
 * Node.js 22 CommonJS. No network, no randomness, no phase/key search.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const quadgramText = fs.readFileSync(
  path.join(root, 'resources/control/duko_round27_english_quadgrams.txt'), 'utf8');
const alphabet = corpus.translit;
const page = n => corpus.pages.find(item => item.page === n).indices;
const p27 = page(27), p55 = page(55), p56 = page(56), p57 = page(57);
const all = corpus.pages.filter(item => item.page <= 56).flatMap(item => item.indices);
const unknown = corpus.pages.filter(item => item.page <= 55).flatMap(item => item.indices);

assert.equal(unknown.length, 12956);
assert.equal(p27.length, 234);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.deepEqual(p27.slice(28, 35), p55.slice(70).concat(p56[0]));
assert.deepEqual(p27.slice(28, 34), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(p56.slice(0, 1), [25]);

/** @param {number} n @returns {Map<string, number[]>} */
function duplicateNgrams(n) {
  const positions = new Map();
  for (let i = 0; i + n <= all.length; i++) {
    const key = all.slice(i, i + n).join(',');
    const found = positions.get(key);
    if (found) found.push(i);
    else positions.set(key, [i]);
  }
  return new Map([...positions].filter(([, pos]) => pos.length > 1));
}
const repeats6 = duplicateNgrams(6);
const repeats7 = duplicateNgrams(7);
const repeats8 = duplicateNgrams(8);
assert.equal(repeats6.size, 2);  // two overlapping 6-gram windows of same 7-gram
assert.equal(repeats7.size, 1);
assert.equal(repeats8.size, 0);
assert.deepEqual([...repeats7.values()][0], [6555, 12950]);

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let number = 2; primes.length < count; number++) {
    let prime = true;
    for (let d = 2; d * d <= number; d++) {
      if (number % d === 0) { prime = false; break; }
    }
    if (prime) primes.push(number);
  }
  return primes;
}
const primes = firstPrimes(200);

/** @param {string} text @returns {number[]} */
function gpIndices(text) {
  const tokens = alphabet.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const result = [];
  for (const word of text.split(' ')) {
    for (let i = 0; i < word.length;) {
      const hit = tokens.find(token => word.startsWith(token.token, i));
      assert.ok(hit, 'Unknown source-orthography token: ' + word.slice(i));
      result.push(hit.index);
      i += hit.token.length;
    }
  }
  return result;
}

/**
 * Solved p56 prime-totient clock, with optional authentic plaintext-F bypass.
 * @param {number[]} input @param {Set<number>} skips @param {-1|1} direction
 * @returns {number[]}
 */
function totientTransform(input, skips, direction) {
  let consumed = 0;
  return input.map((value, index) => {
    if (skips.has(index)) {
      assert.equal(value, 0, 'a literal-F bypass has an F rune');
      return 0;
    }
    const shift = primes[consumed++] - 1;
    return (value + direction * shift + 2900) % 29;
  });
}

/** @param {number[]} x @returns {number} */
function ioc(x) {
  const h = Array(29).fill(0);
  for (const v of x) h[v]++;
  return h.reduce((sum, n) => sum + n * (n - 1), 0) / (x.length * (x.length - 1));
}

/** @param {number[]} x @returns {string} */
function translit(x) { return x.map(index => alphabet[index]).join(''); }

const gram = new Map();
let total = 0;
for (const line of quadgramText.trim().split(/\r?\n/)) {
  const pieces = line.trim().split(/\s+/);
  if (pieces.length < 2) continue;
  const count = Number(pieces[1]);
  if (!Number.isFinite(count)) continue;
  gram.set(pieces[0], count);
  total += count;
}
assert.equal(gram.size, 79495);

/** @param {number[]} x @returns {number} */
function quadgramScore(x) {
  const text = translit(x);
  let score = 0;
  for (let i = 0; i + 4 <= text.length; i++) {
    score += Math.log10((gram.get(text.slice(i, i + 4)) || 0.01) / total);
  }
  return score / (text.length - 3);
}

// First independently reproduce the authentic page-56 solved key and F bypass.
const p56Plain = totientTransform(p56, new Set([56]), -1);
const expected = gpIndices('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.deepEqual(p56Plain, expected);
assert.deepEqual(totientTransform(p56Plain, new Set([56]), 1), p56);
assert.ok(Math.abs(quadgramScore(p56Plain) - (-4.461648582243903)) < 1e-11);

// The seven-rune seam maps p27 local34 AE to solved p56 local0 AE.
// Freeze the p56 prime-totient clock at this single source-selected p27 start.
// As on authentic p56, any input ciphertext F could be literal plaintext F.
const original = p27.slice(34, 119);
assert.equal(original.length, p56.length);
assert.equal(original[0], p56[0]);
const fSites = original.flatMap((rune, i) => rune === 0 ? [i] : []);
assert.deepEqual(fSites, [1, 20, 27, 34, 77]);
const variants = [];
for (let mask = 0; mask < 2 ** fSites.length; mask++) {
  const skips = new Set(fSites.filter((_, i) => mask & (1 << i)));
  const plaintext = totientTransform(original, skips, -1);
  assert.deepEqual(totientTransform(plaintext, skips, 1), original);
  variants.push({
    mask,
    skipped: [...skips],
    ioc: ioc(plaintext),
    quadgram: quadgramScore(plaintext),
    transliteration: translit(plaintext)
  });
}
const bestLanguage = variants.reduce((a, b) => a.quadgram >= b.quadgram ? a : b);
const bestIoc = variants.reduce((a, b) => a.ioc >= b.ioc ? a : b);
assert.equal(variants.length, 32);
assert.equal(bestLanguage.mask, 14);
assert.ok(Math.abs(bestLanguage.quadgram - (-6.919735197744155)) < 1e-10);
assert.ok(Math.abs(bestIoc.ioc - 0.0453781512605042) < 1e-11);
assert.ok(bestLanguage.quadgram < -6.9);
assert.ok(bestIoc.ioc < 0.046);


// Second, freeze a backwards *cyclic* use of the exact 84 prime-totient
// steps consumed by authentic p56 (85 ciphertext runes, one literal F bypass).
// The seven-rune seam selects the p55 ending; key phase83 must meet the final
// p55 nonbypassed rune immediately before solved p56 begins at phase0.
// The circular-wrap premise is speculative, motivated by solved p57's
// "circumferences" language; no original instruction authenticates key wrap.
const phiCycle = primes.slice(0, 84).map(value => value - 1);
assert.equal(phiCycle.length, 84);

/**
 * Source-anchored backward p55 circular-prime clock.
 * @param {number[]} input @param {Set<number>} skips @param {-1|1} direction
 * @returns {number[]}
 */
function backwardPhiCycle(input, skips, direction) {
  const output = Array(input.length);
  let phase = phiCycle.length - 1;
  for (let i = input.length - 1; i >= 0; i--) {
    if (skips.has(i)) {
      assert.equal(input[i], 0);
      output[i] = 0;
      continue;
    }
    output[i] = (input[i] + direction * phiCycle[phase] + 2900) % 29;
    phase = (phase - 1 + phiCycle.length) % phiCycle.length;
  }
  return output;
}
const p55Fsites = p55.flatMap((rune, i) => rune === 0 ? [i] : []);
assert.deepEqual(p55Fsites, [15, 25, 41]);
const backwardVariants = [];
for (let mask = 0; mask < 2 ** p55Fsites.length; mask++) {
  const skips = new Set(p55Fsites.filter((_, i) => mask & (1 << i)));
  const candidate = backwardPhiCycle(p55, skips, -1);
  assert.deepEqual(backwardPhiCycle(candidate, skips, 1), p55);
  backwardVariants.push({
    mask,
    skipped: [...skips],
    ioc: ioc(candidate),
    quadgram: quadgramScore(candidate),
    ending: translit(candidate.slice(-6))
  });
}
const cyclicBestLanguage = backwardVariants.reduce(
  (a, b) => a.quadgram >= b.quadgram ? a : b);
const cyclicBestIoc = backwardVariants.reduce(
  (a, b) => a.ioc >= b.ioc ? a : b);
assert.equal(cyclicBestLanguage.mask, 6);
assert.ok(Math.abs(cyclicBestLanguage.quadgram - (-7.278849467029805)) < 1e-10);
assert.equal(cyclicBestIoc.mask, 4);
assert.ok(Math.abs(cyclicBestIoc.ioc - 0.03614035087719298) < 1e-11);
assert.ok(backwardVariants.every(x => x.ending === 'FNEODP'));
// Independently plant genuine solved p57 source plaintext under this exact
// backward cyclic transform and recover every original-formatted rune.
const p57Plant = p57.slice(0, p55.length);
const p57PlantCipher = backwardPhiCycle(p57Plant, new Set(), 1);
assert.deepEqual(backwardPhiCycle(p57PlantCipher, new Set(), -1), p57Plant);

console.log(JSON.stringify({
  source: 'original LP2 corpus, p27 local28-34 and p55 local70 to p56 local0',
  seven_rune_pattern: translit(p27.slice(28, 35)),
  seven_rune_occurrences_global_zero_based: [...repeats7.values()][0],
  repeated_six_grams: repeats6.size,
  repeated_eight_grams: repeats8.size,
  seam: { p27_start: 28, p27_ae: 34, p55_start: 70, p56_ae: 0 },
  original_p27_test_start: 34,
  original_p27_test_length: original.length,
  f_sites: fSites,
  variants: variants.length,
  authentic_p56: { ioc: ioc(p56Plain), quadgram: quadgramScore(p56Plain) },
  solved_p57: { ioc: ioc(p57), quadgram: quadgramScore(p57) },
  p27_raw: { ioc: ioc(original), quadgram: quadgramScore(original) },
  p27_best_quadgram: bestLanguage,
  p27_best_ioc: { mask: bestIoc.mask, skipped: bestIoc.skipped, ioc: bestIoc.ioc },
  p55_backward_cyclic_phi: {
    source_key: 'genuine 84 p56 consumed phi(prime) values, cyclic phase83 at p55 local75',
    literal_f_sites: p55Fsites, masks_tested: backwardVariants.length,
    best_quadgram: cyclicBestLanguage, best_ioc: cyclicBestIoc,
    synthetic_p57_plant_recovered: p57Plant.length
  },
  interpretation: 'Unique 7-gram extends known six-rune bookend; both fixed original p56-phi transfers fail to recover language. No new plaintext/key.'
}, null, 2));
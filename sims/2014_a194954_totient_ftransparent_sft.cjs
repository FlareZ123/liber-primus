'use strict';

/**
 * Standalone original-input test of A194954 as a GP29 running key.
 * A194954 continues the eleven prime-sized whitespace runs recorded from
 * the May 2014 reply, but the runs are not all PGP-authenticated.
 * Source: https://oeis.org/A194954
 * Reproduce on Windows 11: node sims/2014_a194954_totient_ftransparent_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const full = pages.flatMap((p) => p.indices);
const clearP57 = corpus.pages.find((p) => p.page === 57).indices;
/** @param {number} x @returns {boolean} */
function prime(x) {
  if (x < 2) return false;
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false;
  return true;
}
/** @param {number} x @returns {number} */
function bits(x) {
  let n = 0;
  while (x) { n += x % 2; x = Math.floor(x / 2); }
  return n;
}
/** @param {number} n @returns {number[]} */
function a194954(n) {
  const a = [2];
  for (let i = 2; i <= n; i++) {
    const step = bits(i - 1);
    let candidate = a[a.length - 1] + step;
    while (!prime(candidate)) candidate += step;
    a.push(candidate);
  }
  return a;
}
/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const count = Array(29).fill(0);
  for (const x of data) count[x]++;
  return count.reduce((s, v) => s + v * (v - 1), 0)
    / (data.length * (data.length - 1));
}
/**
 * Invert a fixed running key with the known p56 PLAINTEXT-F bypass. All
 * ciphertext Fs may be literal Fs (skip key) or enciphered non-Fs (consume).
 * When ciphertext is non-F, decoded plaintext F is forbidden. This exact
 * set-DP tests all bypass masks, rather than assuming ciphertext F means F.
 * @param {number[]} cipher
 * @param {number[]} sequence
 * @param {'prime'|'phi'} mode
 * @param {-1|1} sign
 * @returns {{reached:number,length:number,maxStates:number}}
 */
function reach(cipher, sequence, mode, sign) {
  let possible = new Set([0]), maxStates = 1;
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i], next = new Set();
    for (const keyCursor of possible) {
      const shift = sequence[keyCursor] - (mode === 'phi' ? 1 : 0);
      const p = mod(c + sign * shift);
      if (p !== 0) next.add(keyCursor + 1);
      if (c === 0) next.add(keyCursor);
    }
    maxStates = Math.max(maxStates, next.size);
    if (next.size === 0) return {reached:i,length:cipher.length,maxStates};
    possible = next;
  }
  return {reached:cipher.length,length:cipher.length,maxStates};
}
/**
 * Positive plant from original, already-clear p57 plaintext; carries
 * plaintext F through unchanged and advances key on other runes.
 * @param {number[]} plain
 * @param {number[]} sequence
 * @param {'prime'|'phi'} mode
 * @param {-1|1} sign
 * @returns {number[]}
 */
function plant(plain, sequence, mode, sign) {
  let j = 0;
  return plain.map((p) => p === 0 ? 0
    : mod(p - sign * (sequence[j++] - (mode === 'phi' ? 1 : 0))));
}
assert.equal(full.length, 12956);
assert.equal(pages.length, 55);
const a = a194954(full.length + 1);
assert.deepEqual(a.slice(0, 12),
  [2,3,5,7,11,13,17,23,29,31,37,43]);
assert.equal(a[full.length - 1], 641197);
const expected = {'prime,-1':37,'prime,1':30,'phi,-1':52,'phi,1':27};
const variants = [];
for (const mode of /** @type {const} */ (['prime','phi'])) {
  for (const sign of /** @type {const} */ ([-1,1])) {
    const result = reach(full, a, mode, sign);
    assert.equal(result.reached, expected[mode + ',' + sign]);
    const controls = reach(plant(clearP57, a, mode, sign), a, mode, sign);
    assert.equal(controls.reached, clearP57.length);
    const originalResetFailures = pages.filter((p) => {
      const r = reach(p.indices, a, mode, sign);
      return r.reached < r.length;
    }).length;
    const direct = full.map((c, i) => mod(c + sign
      * (a[i] - (mode === 'phi' ? 1 : 0))));
    assert.ok(ioc(direct) < 0.036);
    variants.push({
      mode,sign,firstImpossibleRuneZeroBased:result.reached,
      originalPageResetFailures:originalResetFailures,
      noBypassIoC:ioc(direct),p57PlantRuneCount:controls.reached
    });
  }
}
console.log(JSON.stringify({
  sequence:'A194954',unknownCipherRunes:full.length,
  sequenceLastTerm:a[full.length - 1],
  sourceIoC:ioc(full),clearP57IoC:ioc(clearP57),variants,
  status:'PASS (fixed-key F-bypass and direct-key negative)'
},null,2));
